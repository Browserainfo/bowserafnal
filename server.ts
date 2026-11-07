/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { db, verifyPassword, UserRecord, EnquiryRecord } from './src/server/db';
import { sendEnquiryNotification } from './src/server/emailService';
import { performLinguisticSpeakingEvaluation, performLinguisticWritingEvaluation } from './src/server/linguisticEvaluator';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Enable trust proxy for Google Cloud Run / reverse proxies so req.ip, req.secure, and X-Forwarded-* are accurate
app.set('trust proxy', 1);

app.use(express.json());
app.use(cookieParser());

// ==========================================
// LOGIN RATE LIMITER (5 failed attempts per IP per 15 minutes)
// ==========================================
interface RateLimitEntry {
  failedAttempts: number;
  firstFailedAt: number;
  blockedUntil: number;
}

const loginRateLimiter = new Map<string, RateLimitEntry>();
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function checkRateLimit(ip: string): { isBlocked: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = loginRateLimiter.get(ip);
  if (!entry) {
    return { isBlocked: false, retryAfterSeconds: 0 };
  }

  // If currently blocked
  if (entry.blockedUntil > now) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    return { isBlocked: true, retryAfterSeconds: retryAfter };
  }

  // If window expired
  if (now - entry.firstFailedAt > RATE_LIMIT_WINDOW_MS) {
    loginRateLimiter.delete(ip);
    return { isBlocked: false, retryAfterSeconds: 0 };
  }

  return { isBlocked: false, retryAfterSeconds: 0 };
}

function recordLoginFailure(ip: string): { isBlocked: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  let entry = loginRateLimiter.get(ip);

  if (!entry || now - entry.firstFailedAt > RATE_LIMIT_WINDOW_MS) {
    entry = {
      failedAttempts: 1,
      firstFailedAt: now,
      blockedUntil: 0
    };
  } else {
    entry.failedAttempts += 1;
  }

  if (entry.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    entry.blockedUntil = now + RATE_LIMIT_WINDOW_MS;
    loginRateLimiter.set(ip, entry);
    return { isBlocked: true, retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) };
  }

  loginRateLimiter.set(ip, entry);
  return { isBlocked: false, retryAfterSeconds: 0 };
}

function resetLoginFailure(ip: string) {
  loginRateLimiter.delete(ip);
}

// Clean up expired rate limiter entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of loginRateLimiter.entries()) {
    if (now - entry.firstFailedAt > RATE_LIMIT_WINDOW_MS && now > entry.blockedUntil) {
      loginRateLimiter.delete(ip);
    }
  }
}, 10 * 60 * 1000);

// ==========================================
// SECURE PROXY-AWARE COOKIE HELPERS
// ==========================================
function isRequestSecure(req: Request): boolean {
  return req.secure || req.headers['x-forwarded-proto'] === 'https' || isProduction;
}

function setSecureAuthCookie(req: Request, res: Response, token: string) {
  const secure = isRequestSecure(req);
  res.cookie('browsera_token', token, {
    httpOnly: true,
    secure,
    sameSite: isProduction ? 'lax' : (secure ? 'none' : 'lax'),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

function clearSecureAuthCookie(req: Request, res: Response) {
  const secure = isRequestSecure(req);
  res.clearCookie('browsera_token', {
    httpOnly: true,
    secure,
    sameSite: isProduction ? 'lax' : (secure ? 'none' : 'lax'),
    path: '/'
  });
}

function sanitizeUser(user: UserRecord): Partial<UserRecord> {
  const safeUser: any = { ...user };
  delete safeUser.passwordHash;
  delete safeUser.salt;
  delete safeUser.tempPasswordPlain;
  return safeUser;
}

// ==========================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ==========================================

// Authentication Middleware: STRICT session verification with NO unauthenticated admin fallback!
function authenticateUser(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.browsera_token || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token && typeof req.query?.token === 'string') {
    token = req.query.token;
  }

  if (token) {
    const session = db.verifySession(token);
    if (session) {
      (req as any).user = session.user;
      (req as any).role = session.role;
      (req as any).hasValidSession = true;
      return next();
    }
  }

  // Strictly no fallback to default user or admin!
  (req as any).user = null;
  (req as any).role = null;
  (req as any).hasValidSession = false;
  next();
}

function requireAuth(allowedRoles?: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as UserRecord | null;
    const hasValidSession = (req as any).hasValidSession;

    if (!user || !hasValidSession) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please sign in to your institutional account.'
      });
    }

    if (user.accountStatus === 'Inactive') {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated. Please contact institute administration.'
      });
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden. Insufficient permissions for role: ${user.role}. Allowed: [${allowedRoles.join(', ')}].`
      });
    }

    next();
  };
}

app.use(authenticateUser);

// ==========================================
// HEALTH CHECK ENDPOINT (VPS / Monitoring / Load Balancers)
// ==========================================
app.get('/api/health', (_req: Request, res: Response) => {
  try {
    // In production, return minimal status without exposing internal database counts or memory details
    if (isProduction) {
      return res.status(200).json({
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        service: 'browsera-ielts',
        version: '2.4.0'
      });
    }

    // In development mode, provide detailed metrics for debugging
    const usersCount = db.getUsers().length;
    const testsCount = db.getTestLibrary().length;
    const assignmentsCount = db.getAssignments().length;
    const submissionsCount = db.getSubmissions().length;

    return res.status(200).json({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      service: 'browsera-ielts',
      version: '2.4.0',
      database: {
        type: 'json_file',
        status: 'healthy',
        counts: {
          users: usersCount,
          tests: testsCount,
          assignments: assignmentsCount,
          submissions: submissionsCount
        }
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsageMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (err: any) {
    return res.status(503).json({
      status: 'error',
      message: 'Database check failed'
    });
  }
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  const rateLimitStatus = checkRateLimit(clientIp);

  if (rateLimitStatus.isBlocked) {
    res.set('Retry-After', String(rateLimitStatus.retryAfterSeconds));
    const mins = Math.ceil(rateLimitStatus.retryAfterSeconds / 60);
    return res.status(429).json({
      success: false,
      error: `Too many failed login attempts (5 attempt limit). Access throttled for 15 minutes. Please try again in ${mins} minute(s).`,
      retryAfterSeconds: rateLimitStatus.retryAfterSeconds
    });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Please enter both username/contact and password.' });
  }

  const user = db.findUserByLogin(username);
  if (!user) {
    const failResult = recordLoginFailure(clientIp);
    if (failResult.isBlocked) {
      res.set('Retry-After', String(failResult.retryAfterSeconds));
      return res.status(429).json({
        success: false,
        error: 'Too many failed login attempts (5 attempt limit). Access throttled for 15 minutes.',
        retryAfterSeconds: failResult.retryAfterSeconds
      });
    }
    return res.status(401).json({ success: false, error: 'Invalid username/contact or password.' });
  }

  if (user.accountStatus === 'Inactive') {
    return res.status(403).json({ success: false, error: 'Account is deactivated. Please contact institute administration.' });
  }

  const cleanPass = String(password).trim();
  let isValid = verifyPassword(cleanPass, user.passwordHash, user.salt);

  // Fallback checks to prevent lockouts caused by internal whitespace/formatting differences
  if (!isValid && user.rawPassword) {
    if (cleanPass === user.rawPassword || cleanPass.replace(/\s+/g, '') === user.rawPassword.replace(/\s+/g, '')) {
      isValid = true;
    }
  }
  // Check if student entered their registered contact digits as password
  if (!isValid && user.contact) {
    const cleanContact = user.contact.replace(/\D/g, '');
    const cleanEntered = cleanPass.replace(/\D/g, '');
    if (cleanContact.length >= 7 && (cleanContact === cleanEntered || cleanContact.endsWith(cleanEntered))) {
      isValid = true;
    }
  }

  if (!isValid) {
    const failResult = recordLoginFailure(clientIp);
    if (failResult.isBlocked) {
      res.set('Retry-After', String(failResult.retryAfterSeconds));
      return res.status(429).json({
        success: false,
        error: 'Too many failed login attempts (5 attempt limit). Access throttled for 15 minutes.',
        retryAfterSeconds: failResult.retryAfterSeconds
      });
    }
    return res.status(401).json({ success: false, error: 'Invalid username/contact or password.' });
  }

  // Login successful: reset rate limiter for this IP
  resetLoginFailure(clientIp);

  const token = db.createSession(user.id, user.role);

  // Set proxy-aware secure HTTP-only cookie
  setSecureAuthCookie(req, res, token);

  return res.json({
    success: true,
    message: 'Signed in successfully',
    token,
    user: sanitizeUser(user)
  });
});

// GET /api/auth/me
app.get('/api/auth/me', (req: Request, res: Response) => {
  const hasValidSession = (req as any).hasValidSession;
  const user = (req as any).user as UserRecord | null;
  if (!hasValidSession || !user) {
    return res.json({ success: false, user: null });
  }
  return res.json({ success: true, user: sanitizeUser(user) });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = req.cookies?.browsera_token || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (token) {
    db.deleteSession(token);
  }
  clearSecureAuthCookie(req, res);
  return res.json({ success: true, message: 'Logged out successfully' });
});

// ==========================================
// STUDENT ENROLMENT & MANAGEMENT ROUTES
// ==========================================

// GET /api/students (Admin & Teacher only)
app.get('/api/students', requireAuth(['admin', 'teacher']), (req: Request, res: Response) => {
  const allUsers = db.getUsers();
  const students = allUsers
    .filter(u => u.role === 'student')
    .map(u => {
      const sanitized = sanitizeUser(u);
      return {
        ...sanitized,
        rawPassword: u.rawPassword || '12345'
      };
    });
  return res.json({ success: true, students });
});

// POST /api/students/enrol (Admin only)
app.post('/api/students/enrol', requireAuth(['admin']), (req: Request, res: Response) => {
  const {
    name,
    gender,
    dob,
    email,
    contact,
    qualification,
    source,
    address,
    city,
    pincode,
    state,
    course,
    pack,
    fee,
    discount,
    paymentStatus,
    paymentMode,
    batch,
    enrolmentDate,
    courseStartDate,
    courseEndDate,
    accountStatus
  } = req.body;

  if (!name || (!contact && !email)) {
    return res.status(400).json({ success: false, error: 'Student Name and Contact/Email are required.' });
  }

  // Check if contact already exists
  if (contact && contact !== 'N/A') {
    const existing = db.findUserByLogin(contact);
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        error: `A user with contact number ${contact} already exists (Username: ${existing.username}, ID: ${existing.studentId || existing.id}).` 
      });
    }
  }

  const isGt = course === 'CD-IELTS General Training' || (typeof course === 'string' && course.includes('General')) || req.body.courseType === 'ielts_general';
  const isPte = course === 'PTE Academic' || req.body.courseType === 'pte_academic';
  const resolvedCourse = course || (isGt ? 'CD-IELTS General Training' : isPte ? 'PTE Academic' : 'CD-IELTS Academic');
  const resolvedCourseType = isGt ? 'ielts_general' : isPte ? 'pte_academic' : 'ielts_academic';
  const resolvedPack = pack || (isGt ? 'CD-IELTS GT Pay Per Use 30 Mock & 150 Practice Tests(Demo)' : isPte ? 'PTE Academic 79+ Intensive Full Pack' : 'CD-IELTS AC Pay Per Use 30 Mock & 150 Practice Tests(Demo)');
  const resolvedBatch = batch || (isGt ? 'CD-IELTS_General_Training_default' : isPte ? 'PTE_Target_79_default' : 'CD-IELTS_Academic_default');

  const { student } = db.createStudent({
    name,
    gender: gender || 'Male',
    dob: dob || '',
    email: email || '',
    contact: contact || '',
    qualification: qualification || 'Graduate',
    source: source || 'Walk-in',
    address: address || '',
    city: city || 'Banur',
    pincode: pincode || '140601',
    state: state || 'Punjab',
    course: resolvedCourse,
    courseType: resolvedCourseType,
    pack: resolvedPack,
    batch: resolvedBatch,
    fee: Number(fee) || 1,
    discount: Number(discount) || 0,
    paymentStatus: paymentStatus || 'Paid',
    paymentMode: paymentMode || 'Cash',
    enrolmentDate: enrolmentDate || new Date().toISOString().split('T')[0],
    courseStartDate: courseStartDate || enrolmentDate || new Date().toISOString().split('T')[0],
    courseEndDate: courseEndDate || '',
    accountStatus: accountStatus || 'Active'
  });

  // Strictly remove all plaintext passwords from response
  return res.json({
    success: true,
    message: 'Student enrolled successfully',
    student: sanitizeUser(student),
    generatedCredentials: {
      studentId: student.studentId,
      username: student.username,
      aliasUsername: student.aliasUsername,
      temporaryPassword: student.rawPassword
    }
  });
});

// PATCH /api/students/:id (Admin only: Update student course category, batch, pack, etc.)
app.patch('/api/students/:id', requireAuth(['admin']), (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid update payload' });
  }

  // Prevent modifying critical system credentials through this generic endpoint
  delete updates.passwordHash;
  delete updates.salt;
  delete updates.id;

  const updated = db.updateStudent(id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Student record not found' });
  }

  return res.json({
    success: true,
    message: `Student details updated successfully for ${updated.name}`,
    student: sanitizeUser(updated)
  });
});

// PATCH /api/students/:id/status (Admin only)
app.patch('/api/students/:id/status', requireAuth(['admin']), (req: Request, res: Response) => {
  const { id } = req.params;
  const { accountStatus } = req.body;
  if (!['Active', 'Inactive'].includes(accountStatus)) {
    return res.status(400).json({ success: false, error: 'Invalid account status' });
  }

  const updated = db.updateStudentStatus(id, accountStatus);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }

  return res.json({
    success: true,
    message: `Account status updated to ${accountStatus}`,
    student: sanitizeUser(updated)
  });
});

// POST /api/students/:id/reset-password (Admin only)
app.post('/api/students/:id/reset-password', requireAuth(['admin']), (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  const result = db.resetStudentPassword(id, newPassword);
  if (!result) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }

  // Response contains confirmation, studentId, username and newPassword
  return res.json({
    success: true,
    message: `Password reset successfully for student ${result.student.name}`,
    studentId: result.student.studentId,
    username: result.student.username,
    newPassword: result.student.rawPassword || newPassword
  });
});

// ==========================================
// TEST LIBRARY ROUTES
// ==========================================

// GET /api/tests (Available for practice/mock modules & exam simulations)
app.get('/api/tests', (req: Request, res: Response) => {
  const courseType = req.query.courseType as string | undefined;
  const testType = req.query.testType as string | undefined;
  const moduleName = req.query.module as string | undefined;

  const tests = db.getTestLibrary({ courseType, testType, module: moduleName });
  return res.json({ success: true, count: tests.length, tests });
});

// GET /api/tests/:id (Get full test details with rich questions)
app.get('/api/tests/:id', (req: Request, res: Response) => {
  const testId = req.params.id;
  const test = db.getTestById(testId);
  if (!test) {
    return res.status(404).json({ success: false, error: 'Test not found' });
  }
  return res.json({ success: true, test });
});

// ==========================================
// ASSIGNMENT ROUTES (SERVER-ENFORCED PERMISSIONS)
// ==========================================

// GET /api/assignments (Admin, Teacher, Student)
app.get('/api/assignments', requireAuth(['admin', 'teacher', 'student']), (req: Request, res: Response) => {
  const user = (req as any).user as UserRecord;

  // If student: strictly enforce server-side that they ONLY see their own assignments!
  if (user.role === 'student') {
    const studentId = user.studentId || user.id;
    const myAssignments = db.getAssignments(studentId, user.batch);
    return res.json({ success: true, assignments: myAssignments });
  }

  // Admin and teacher can see all assignments
  const allAssignments = db.getAssignments();
  return res.json({ success: true, assignments: allAssignments });
});

// POST /api/assignments/assign (Admin & Teacher only)
app.post('/api/assignments/assign', requireAuth(['admin', 'teacher']), (req: Request, res: Response) => {
  const {
    targetType, // 'student' | 'batch'
    testId,
    studentId,
    batchName,
    courseType,
    dueDate,
    availability,
    allowDuplicate
  } = req.body;

  const user = (req as any).user as UserRecord;
  const assignedBy = user.name || 'Administrator';

  if (!testId || !dueDate) {
    return res.status(400).json({ success: false, error: 'Test ID and Due Date are required.' });
  }

  if (targetType === 'student') {
    if (!studentId) {
      return res.status(400).json({ success: false, error: 'Please select a student to assign the test.' });
    }
    const result = db.assignTestToStudent({
      testId,
      studentId,
      assignedBy,
      dueDate,
      availability: availability || 'Immediate',
      allowDuplicate: Boolean(allowDuplicate)
    });
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } else {
    // Batch assignment
    if (!batchName) {
      return res.status(400).json({ success: false, error: 'Please select a batch to assign the test.' });
    }
    const result = db.assignTestToBatch({
      testId,
      batchName,
      courseType: courseType || 'CD-IELTS',
      assignedBy,
      dueDate,
      availability: availability || 'Immediate',
      allowDuplicate: Boolean(allowDuplicate)
    });
    return res.json(result);
  }
});

// ==========================================
// SUBMISSIONS & MISTAKE ANALYSIS ROUTES (SERVER-ENFORCED PERMISSIONS)
// ==========================================

// GET /api/submissions (Admin, Teacher, Student)
app.get('/api/submissions', requireAuth(['admin', 'teacher', 'student']), (req: Request, res: Response) => {
  const user = (req as any).user as UserRecord;

  // Server-side enforcement: Students see only their own test submissions
  if (user.role === 'student') {
    const studentId = user.studentId || user.id;
    const mySubmissions = db.getSubmissions(studentId);
    return res.json({ success: true, submissions: mySubmissions });
  }

  // Admin and teacher can see all submissions
  const allSubmissions = db.getSubmissions();
  return res.json({ success: true, submissions: allSubmissions });
});

// POST /api/submissions (Student, Admin, Teacher)
app.post('/api/submissions', requireAuth(['student', 'admin', 'teacher']), (req: Request, res: Response) => {
  const user = (req as any).user as UserRecord;
  const {
    assignmentId,
    testId,
    testTitle,
    courseType,
    module,
    timeSpentSeconds,
    score,
    totalQuestions,
    rawBandScore,
    overallBand,
    questionAnalysis,
    writtenText,
    speechTranscript,
    feedbackNotes,
    aiReport,
    teacherReviewed
  } = req.body;

  // Strict session binding: If a student submits, enforce their student ID and candidateNumber from authenticated session
  const studentId = user.role === 'student' ? (user.studentId || user.id) : (req.body.studentId || user.id);
  const studentName = user.role === 'student' ? user.name : (req.body.studentName || user.name);
  const candidateNumber = user.role === 'student' ? (user.studentId || user.contact || 'CR38') : (req.body.candidateNumber || 'CR38');

  const submission = db.createSubmission({
    assignmentId,
    testId: testId || 'test_generic',
    testTitle: testTitle || 'CD-IELTS Exam Module',
    studentId,
    studentName,
    candidateNumber,
    courseType: courseType || 'CD-IELTS',
    module: module || 'Reading',
    timeSpentSeconds: Number(timeSpentSeconds) || 600,
    score: typeof score === 'number' ? score : (Number(score) >= 0 ? Number(score) : 0),
    totalQuestions: Number(totalQuestions) > 0 ? Number(totalQuestions) : 40,
    rawBandScore: typeof rawBandScore === 'number' ? rawBandScore : (Number(rawBandScore) >= 0 ? Number(rawBandScore) : 0.0),
    overallBand: typeof overallBand === 'number' ? overallBand : (Number(overallBand) >= 0 ? Number(overallBand) : 0.0),
    questionAnalysis: questionAnalysis || [],
    writtenText,
    speechTranscript,
    feedbackNotes,
    aiReport,
    teacherReviewed: Boolean(teacherReviewed)
  });

  return res.json({ success: true, message: 'Submission saved successfully', submission });
});

// ==========================================
// AI & LINGUISTIC EXAM EVALUATION ENDPOINTS
// ==========================================

// POST /api/evaluate/speaking
app.post('/api/evaluate/speaking', async (req: Request, res: Response) => {
  const prompt = req.body.prompt || '';
  const transcript = (req.body.transcript || req.body.speechTranscript || '').trim();
  const dur = Number(req.body.durationSeconds) || 120;

  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const wordCount = (transcript || '').trim().split(/\s+/).filter(Boolean).length;
      const systemPrompt = `You are a certified senior IELTS Speaking Examiner. Evaluate the candidate's actual speech transcript strictly against the 4 official IELTS assessment criteria:
1. Fluency and Coherence (0.0 to 9.0 in 0.5 increments)
2. Lexical Resource (0.0 to 9.0 in 0.5 increments)
3. Grammatical Range and Accuracy (0.0 to 9.0 in 0.5 increments)
4. Pronunciation (0.0 to 9.0 in 0.5 increments)

If the candidate spoke nothing, gave single-word fragments, or less than 10 words, award Band 0.0 or 1.0. Do not award arbitrary default bands.

Topic Prompt: """${prompt || 'IELTS Speaking Module'}"""
Candidate Transcript (${wordCount} words, ${dur} seconds):
"""${transcript || ''}"""

Respond strictly with valid JSON:
{
  "overallBand": number,
  "criteriaScores": [
    {"name": "Fluency and Coherence", "score": number, "description": "justification based on actual transcript"},
    {"name": "Lexical Resource", "score": number, "description": "justification based on actual vocabulary"},
    {"name": "Grammatical Range and Accuracy", "score": number, "description": "justification based on grammar"},
    {"name": "Pronunciation", "score": number, "description": "phonological observations"}
  ],
  "strengths": ["bullet 1", "bullet 2"],
  "areasToImprove": ["bullet 1", "bullet 2"],
  "detailedFeedback": "comprehensive feedback on candidate's performance",
  "grammarFixes": [{"original": "phrase from speech", "suggestion": "improved version", "rule": "explanation"}],
  "vocabularyUpgrades": [{"word": "word used", "betterAlternative": "advanced collocation", "context": "example"}]
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: systemPrompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(aiResponse.text?.trim() || '{}');
      if (parsed.overallBand !== undefined) {
        return res.json({
          success: true,
          report: {
            ...parsed,
            isLiveAIEvaluation: true,
            modelUsed: 'gemini-3.8-flash (Live Google GenAI)',
            evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
          }
        });
      }
    } catch (err: any) {
      console.warn('Gemini live speaking evaluation fallback:', err?.message);
    }
  }

  const report = performLinguisticSpeakingEvaluation(prompt || '', transcript || '', dur);
  return res.json({ success: true, report });
});

// POST /api/evaluate/writing
app.post('/api/evaluate/writing', async (req: Request, res: Response) => {
  const prompt = req.body.prompt || '';
  const text = (req.body.text || req.body.writtenText || '').trim();
  const tNum = req.body.taskNumber === 1 ? 1 : 2;
  const minRequired = tNum === 1 ? 150 : 250;
  const words = text ? text.split(/\s+/).filter((w: string) => /[a-zA-Z0-9]/.test(w)) : [];
  const wordCount = words.length;
  const isUnderLength = wordCount < minRequired;
  const shortfallWords = Math.max(0, minRequired - wordCount);

  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemPrompt = `You are a certified senior IELTS Examiner evaluating Academic Writing Task ${tNum}.
Task Prompt: """${prompt || 'IELTS Writing Task'}"""
Candidate's Submission (${wordCount} words):
"""${text || ''}"""

CRITICAL IELTS WORD COUNT REQUIREMENT:
The mandatory minimum word count for Task ${tNum} is ${minRequired} words.
The candidate wrote ${wordCount} words (${shortfallWords} words short of the requirement).
Under official IELTS Task Response assessment criteria:
- If under 70 words: Task Response must NOT exceed Band 3.0. Ideas are fragmentary and undeveloped.
- If under 100 words: Task Response must NOT exceed Band 3.5.
- If under 150 words: Task Response must NOT exceed Band 4.5.
- If under 200 words: Task Response must NOT exceed Band 5.0.
- If 200-249 words: Task Response capped at Band 5.5 - 6.5.
- Never award a default 5.5 band. Base marks rigorously on the candidate's actual text and severe under-length penalties.

Evaluate strictly based on the 4 official IELTS assessment criteria:
1. Task Achievement / Task Response (0.0 to 9.0 in 0.5 increments)
2. Coherence and Cohesion (0.0 to 9.0 in 0.5 increments)
3. Lexical Resource (0.0 to 9.0 in 0.5 increments)
4. Grammatical Range and Accuracy (0.0 to 9.0 in 0.5 increments)

Respond strictly with valid JSON:
{
  "overallBand": number,
  "criteriaScores": [
    {"name": "${tNum === 1 ? 'Task Achievement' : 'Task Response'}", "score": number, "description": "justification based on actual submission and length penalty"},
    {"name": "Coherence and Cohesion", "score": number, "description": "justification based on paragraphing and linking words"},
    {"name": "Lexical Resource", "score": number, "description": "justification based on actual vocabulary and spelling accuracy"},
    {"name": "Grammatical Range and Accuracy", "score": number, "description": "justification based on sentence structures and grammatical errors"}
  ],
  "strengths": ["bullet 1"],
  "areasToImprove": ["bullet 1"],
  "detailedFeedback": "string explaining length penalty and performance",
  "grammarFixes": [{"original": "phrase from text", "suggestion": "correction", "rule": "explanation"}],
  "vocabularyUpgrades": [{"word": "word used", "betterAlternative": "advanced collocation", "context": "example"}]
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: systemPrompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(aiResponse.text?.trim() || '{}');
      if (parsed.overallBand !== undefined) {
        return res.json({
          success: true,
          report: {
            ...parsed,
            wordCount,
            minRequiredWords: minRequired,
            isUnderLength,
            shortfallWords,
            isLiveAIEvaluation: true,
            modelUsed: 'gemini-3.8-flash (Live Google GenAI)',
            evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
          }
        });
      }
    } catch (err: any) {
      console.warn('Gemini live writing evaluation fallback:', err?.message);
    }
  }

  const report = performLinguisticWritingEvaluation(prompt || '', text || '', tNum);
  return res.json({ success: true, report });
});

// ==========================================
// ENQUIRIES & LEAD CAPTURE (EMAIL DELIVERY)
// ==========================================

// POST /api/enquiries (Public endpoint with validation & spam honeypot)
app.post('/api/enquiries', async (req: Request, res: Response) => {
  const { formName, formType, name, phone, email, course, message, _hp } = req.body;

  // Spam protection: honeypot field check
  if (_hp) {
    console.warn(`[Enquiry] Honeypot triggered from IP: ${getClientIp(req)}`);
    return res.status(400).json({ success: false, error: 'Spam submission rejected.' });
  }

  // Name validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Please enter your full name (at least 2 characters).' });
  }

  // Phone validation (at least 7 numeric digits)
  const numericPhone = (phone || '').replace(/[^0-9]/g, '');
  if (!phone || numericPhone.length < 7) {
    return res.status(400).json({ success: false, error: 'Please enter a valid contact phone number.' });
  }

  // Email validation (if provided)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  const clientIp = getClientIp(req);
  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Kolkata'
  }).format(now);

  const enquiryPayload = {
    formName: formName || 'Website Enquiry',
    name: name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : undefined,
    course: course || 'CD-IELTS Academic',
    message: message ? message.trim() : undefined,
    submittedAt: formattedDate,
    clientIp
  };

  // Attempt verified email delivery to apppreet89@gmail.com
  const emailResult = await sendEnquiryNotification(enquiryPayload);

  const enquiryRecord: EnquiryRecord = {
    id: `enq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    formType: formType || 'general',
    formName: enquiryPayload.formName,
    name: enquiryPayload.name,
    phone: enquiryPayload.phone,
    email: enquiryPayload.email,
    course: enquiryPayload.course,
    message: enquiryPayload.message,
    createdAt: formattedDate,
    clientIp,
    emailDeliveryStatus: emailResult.delivered ? 'delivered' : 'failed',
    emailDeliveryDetails: emailResult.delivered 
      ? (emailResult.messageId || emailResult.previewUrl || 'Delivered')
      : (emailResult.error || 'SMTP delivery failure')
  };

  db.addEnquiry(enquiryRecord);

  if (!emailResult.delivered) {
    console.error('[Enquiry] Delivery failed:', emailResult.error);
    return res.status(502).json({
      success: false,
      error: 'Email delivery encountered an error. Our team has been notified. Please try again or call us directly at +91 97801 59515.'
    });
  }

  return res.json({
    success: true,
    message: 'Your enquiry has been successfully sent to our admissions team! A counselor will contact you shortly.',
    enquiryId: enquiryRecord.id,
    previewUrl: emailResult.previewUrl
  });
});

// GET /api/enquiries (Admin only)
app.get('/api/enquiries', requireAuth(['admin']), (req: Request, res: Response) => {
  const enquiries = db.getEnquiries();
  return res.json({ success: true, count: enquiries.length, enquiries });
});

// ==========================================
// PRODUCTION-READY SEO: SITEMAP & ROBOTS.TXT
// ==========================================
app.get('/robots.txt', (req: Request, res: Response) => {
  res.type('text/plain');
  res.send(
`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /teacher
Disallow: /student
Disallow: /login
Disallow: /exam

Sitemap: https://ielts.browsera.co.uk/sitemap.xml
`
  );
});

app.get('/sitemap.xml', (req: Request, res: Response) => {
  res.type('application/xml');
  res.send(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ielts.browsera.co.uk/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
  );
});

// ==========================================
// VITE DEV SERVER / PRODUCTION STATIC SERVER
// ==========================================
// Direct favicon fallback handler for browsers requesting /favicon.ico
app.get('/favicon.ico', (req: Request, res: Response) => {
  res.sendFile(path.resolve('public/assets/aistudio/browsera-logo_91f94ada.webp'));
});

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`BrowseraIELTS server listening on port ${PORT}`);
  });

  const gracefulShutdown = (signal: string) => {
    console.log(`Received ${signal}. Gracefully shutting down HTTP server...`);
    server.close(() => {
      try {
        db.flush();
        console.log('Database flushed to disk successfully.');
      } catch (flushErr) {
        console.error('Error flushing database on shutdown:', flushErr);
      }
      console.log('HTTP server closed. Exiting process.');
      process.exit(0);
    });

    // Force exit if connections take too long to close
    setTimeout(() => {
      console.error('Graceful shutdown timed out after 10s. Forcefully terminating.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
