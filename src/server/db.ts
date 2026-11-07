/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ALL_TESTS, findTestById } from '../data/tests/index';
import { TestItem } from '../types';

export interface UserRecord {
  id: string;
  studentId?: string; // e.g. CR38, CR39
  name: string;
  username: string; // e.g. phone number like 7087970906 or admin
  aliasUsername?: string; // e.g. cdi703665 (legacy or secondary ID alias)
  contact: string; // phone number e.g. 8054284657
  email: string;
  role: 'admin' | 'teacher' | 'student';
  passwordHash: string;
  salt: string;
  rawPassword?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  qualification?: string;
  source?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  course?: 'CD-IELTS' | 'CD-IELTS Academic' | 'CD-IELTS General Training' | 'PTE Academic' | 'CELPIP' | 'Spoken English' | 'Computer Courses' | string;
  courseType?: 'ielts_academic' | 'ielts_general' | 'pte_academic' | 'spoken_english' | 'computer_courses';
  pack?: string;
  batch?: string;
  fee?: number;
  discount?: number;
  paymentStatus?: 'Paid' | 'Partial' | 'Pending';
  paymentMode?: 'Cash' | 'UPI' | 'Card' | 'Net Banking';
  enrolmentDate: string;
  courseStartDate?: string;
  courseEndDate?: string;
  accountStatus: 'Active' | 'Inactive';
  createdAt: string;
}

export type { TestItem };

export interface AssignmentRecord {
  id: string;
  testId: string;
  testTitle: string;
  courseType: string;
  module: string;
  testType: 'practice' | 'mock';
  targetType: 'student' | 'batch';
  studentId?: string;
  studentName?: string;
  batchName?: string;
  assignedBy: string;
  assignedDate: string;
  dueDate: string;
  availability: 'Immediate' | 'Scheduled';
  allowDuplicate: boolean;
  status: 'pending' | 'completed';
}

export interface SubmissionRecord {
  id: string;
  assignmentId?: string;
  testId: string;
  testTitle: string;
  studentId: string;
  studentName: string;
  candidateNumber: string;
  courseType: string;
  module: string;
  submittedAt: string;
  timeSpentSeconds: number;
  score?: number;
  totalQuestions?: number;
  rawBandScore?: number;
  overallBand?: number;
  questionAnalysis?: any[];
  writtenText?: string;
  speechTranscript?: string;
  feedbackNotes?: string;
  aiReport?: any;
  teacherReviewed?: boolean;
}

export interface SessionRecord {
  token: string;
  userId: string;
  role: 'admin' | 'teacher' | 'student';
  expiresAt: number;
}

export interface EnquiryRecord {
  id: string;
  formType: 'assessment' | 'student_portal' | 'general';
  formName: string;
  name: string;
  phone: string;
  email?: string;
  course: string;
  message?: string;
  createdAt: string;
  clientIp?: string;
  emailDeliveryStatus: 'delivered' | 'failed' | 'queued_or_simulated';
  emailDeliveryDetails?: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  test_library: TestItem[];
  assignments: AssignmentRecord[];
  submissions: SubmissionRecord[];
  sessions: SessionRecord[];
  enquiries: EnquiryRecord[];
  nextStudentNumber: number;
}

const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.resolve(process.cwd(), 'data');
const DB_FILE = process.env.DB_FILE ? path.resolve(process.env.DB_FILE) : path.join(DATA_DIR, 'browsera_db.json');

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { hash, salt: actualSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(checkHash, 'hex'), Buffer.from(hash, 'hex'));
}

// Generate the 250 curated, module-specific tests for CD-IELTS and PTE
function generateTestLibrary(): TestItem[] {
  return ALL_TESTS;
}

export class Database {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.test_library) {
          // If the test library is not yet upgraded to latest tests with 40 questions, update it while preserving all users, assignments, and submissions!
          const needsUpgrade = parsed.test_library.length < ALL_TESTS.length || 
            !parsed.test_library.some((t: any) => t.id === 'pte_listening_academic_1') ||
            (parsed.test_library.find((t: any) => t.module === 'Reading')?.readingData?.questions?.length ?? 0) < 40;

          if (needsUpgrade) {
            console.log(`Upgrading database test library to full tests (${ALL_TESTS.length} tests)...`);
            parsed.test_library = ALL_TESTS;
            try {
              fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
              console.log('Database test library upgraded to full 40-question tests successfully.');
            } catch (err) {
              console.error('Failed to write upgraded database:', err);
            }
          }
          if (!parsed.enquiries) {
            parsed.enquiries = [];
          }
          return parsed;
        }
      } catch (err) {
        console.error('Error reading db file, re-initializing:', err);
      }
    }

    // Initialize Default Seed
    const adminPass = hashPassword('admin123');
    const teacherPass = hashPassword('teacher123');
    const studentPass = hashPassword('12345');

    const initialUsers: UserRecord[] = [
      {
        id: 'user_admin_1',
        name: 'Browsera Administrator',
        username: 'admin',
        contact: '8054284657',
        email: 'director@browsera.com',
        role: 'admin',
        passwordHash: adminPass.hash,
        salt: adminPass.salt,
        city: 'Banur',
        state: 'Punjab',
        enrolmentDate: '2026-10-01',
        accountStatus: 'Active',
        createdAt: '2026-10-01'
      },
      {
        id: 'user_teacher_1',
        name: 'Dr. Vikramaditya Sharma',
        username: 'vikram.trainer',
        contact: '9872111223',
        email: 'vikram.ielts@browsera.com',
        role: 'teacher',
        passwordHash: teacherPass.hash,
        salt: teacherPass.salt,
        course: 'CD-IELTS',
        batch: 'CD-IELTS_Academic_default',
        enrolmentDate: '2026-10-01',
        accountStatus: 'Active',
        createdAt: '2026-10-01'
      },
      {
        id: 'user_student_1',
        studentId: 'CR38',
        name: 'cd ielts two',
        username: 'cdi579663',
        contact: '983180138',
        email: 'cdielts2@student.browsera.com',
        role: 'student',
        passwordHash: studentPass.hash,
        salt: studentPass.salt,
        rawPassword: '12345',
        gender: 'Male',
        dob: '1998-05-14',
        qualification: 'Graduate',
        source: 'Walk-in',
        address: 'Main Road, Near Bus Stand',
        city: 'Banur',
        state: 'Punjab',
        pincode: '140601',
        course: 'CD-IELTS',
        courseType: 'ielts_academic',
        pack: 'CD-IELTS AC Pay Per Use 30 Mock & 150 Practice Tests(Demo)',
        batch: 'CD-IELTS_Academic_default',
        fee: 1,
        discount: 0,
        paymentStatus: 'Paid',
        paymentMode: 'Cash',
        enrolmentDate: '2026-10-28',
        courseStartDate: '2026-10-28',
        courseEndDate: '2026-11-28',
        accountStatus: 'Active',
        createdAt: '2026-10-28'
      },
      {
        id: 'user_student_2',
        studentId: 'CR39',
        name: 'cd ielts three',
        username: 'cdi579664',
        contact: '983180139',
        email: 'cdielts3@student.browsera.com',
        role: 'student',
        passwordHash: studentPass.hash,
        salt: studentPass.salt,
        rawPassword: '12345',
        gender: 'Female',
        dob: '1999-08-22',
        qualification: 'Post Graduate',
        source: 'Social Media',
        address: 'Sector 4, Phase 2',
        city: 'Banur',
        state: 'Punjab',
        pincode: '140601',
        course: 'CD-IELTS',
        courseType: 'ielts_academic',
        pack: 'CD-IELTS AC Pay Per Use 30 Mock & 150 Practice Tests(Demo)',
        batch: 'CD-IELTS_Academic_default',
        fee: 1,
        discount: 0,
        paymentStatus: 'Paid',
        paymentMode: 'UPI',
        enrolmentDate: '2026-10-28',
        courseStartDate: '2026-10-28',
        courseEndDate: '2026-11-28',
        accountStatus: 'Active',
        createdAt: '2026-10-28'
      },
      {
        id: 'user_student_3',
        studentId: 'CR40',
        name: 'Harpreet Kaur Sandhu',
        username: 'pte109281',
        contact: '9815099887',
        email: 'harpreet.pte@student.browsera.com',
        role: 'student',
        passwordHash: studentPass.hash,
        salt: studentPass.salt,
        rawPassword: '12345',
        gender: 'Female',
        dob: '2001-02-19',
        qualification: 'Graduate',
        source: 'Referral',
        address: 'House #84, Ward 5',
        city: 'Mohali',
        state: 'Punjab',
        pincode: '160055',
        course: 'PTE Academic',
        courseType: 'pte_academic',
        pack: 'PTE Academic 79+ Intensive Full Pack',
        batch: 'PTE_Target_79_default',
        fee: 12500,
        discount: 1000,
        paymentStatus: 'Paid',
        paymentMode: 'Net Banking',
        enrolmentDate: '2026-10-27',
        courseStartDate: '2026-10-27',
        courseEndDate: '2026-12-27',
        accountStatus: 'Active',
        createdAt: '2026-10-27'
      }
    ];

    const initialAssignments: AssignmentRecord[] = [
      {
        id: 'asg_1',
        testId: 'cd_practice_1',
        testTitle: 'CD-IELTS Practice 1: Roman Engineering & Aqueducts',
        courseType: 'CD-IELTS',
        module: 'Reading',
        testType: 'practice',
        targetType: 'student',
        studentId: 'CR38',
        studentName: 'cd ielts two',
        batchName: 'CD-IELTS_Academic_default',
        assignedBy: 'Browsera Administrator',
        assignedDate: '2026-10-28',
        dueDate: '2026-10-31',
        availability: 'Immediate',
        allowDuplicate: false,
        status: 'pending'
      },
      {
        id: 'asg_2',
        testId: 'cd_practice_7',
        testTitle: 'CD-IELTS Practice 7: Academic Task 2 Free Public Transit Essay',
        courseType: 'CD-IELTS',
        module: 'Writing',
        testType: 'practice',
        targetType: 'student',
        studentId: 'CR38',
        studentName: 'cd ielts two',
        batchName: 'CD-IELTS_Academic_default',
        assignedBy: 'Dr. Vikramaditya Sharma',
        assignedDate: '2026-10-28',
        dueDate: '2026-11-02',
        availability: 'Immediate',
        allowDuplicate: false,
        status: 'pending'
      },
      {
        id: 'asg_3',
        testId: 'pte_practice_1',
        testTitle: 'PTE Practice 1: Read Aloud - Synthetic Polymers & Nanotech',
        courseType: 'PTE Academic',
        module: 'Speaking',
        testType: 'practice',
        targetType: 'student',
        studentId: 'CR40',
        studentName: 'Harpreet Kaur Sandhu',
        batchName: 'PTE_Target_79_default',
        assignedBy: 'Browsera Administrator',
        assignedDate: '2026-10-28',
        dueDate: '2026-10-30',
        availability: 'Immediate',
        allowDuplicate: false,
        status: 'pending'
      }
    ];

    const initialSubmissions: SubmissionRecord[] = [
      {
        id: 'sub_seed_1',
        assignmentId: 'asg_1',
        testId: 'cd_practice_1',
        testTitle: 'CD-IELTS Practice 1: Roman Engineering & Aqueducts',
        studentId: 'CR39',
        studentName: 'cd ielts three',
        candidateNumber: 'CR39',
        courseType: 'CD-IELTS',
        module: 'Reading',
        submittedAt: '2026-10-28 11:30 AM',
        timeSpentSeconds: 1120,
        score: 6,
        totalQuestions: 8,
        rawBandScore: 7.0,
        overallBand: 7.0,
        questionAnalysis: [
          { questionNumber: 1, userAnswer: 'FALSE', correctAnswer: 'FALSE', isCorrect: true, explanation: 'Tunnels had civilian & military uses.', category: 'True/False' },
          { questionNumber: 2, userAnswer: 'FALSE', correctAnswer: 'FALSE', isCorrect: true, explanation: 'Counter-excavation had high error risk.', category: 'True/False' },
          { questionNumber: 3, userAnswer: 'TRUE', correctAnswer: 'NOT GIVEN', isCorrect: false, explanation: 'Career total aqueducts never stated.', category: 'Not Given Distractor' },
          { questionNumber: 4, userAnswer: 'TRUE', correctAnswer: 'TRUE', isCorrect: true, explanation: 'Shafts allowed simultaneous digging.', category: 'Paraphrase' },
          { questionNumber: 5, userAnswer: 'TRUE', correctAnswer: 'TRUE', isCorrect: true, explanation: 'Smoke posed breathing hazards.', category: 'Inference' },
          { questionNumber: 6, userAnswer: 'fire-setting', correctAnswer: 'fire-setting', isCorrect: true, explanation: 'Thermal shock method.', category: 'Fill Blank' },
          { questionNumber: 7, userAnswer: 'water levels', correctAnswer: 'chorobates', isCorrect: false, explanation: 'Technical term chorobates required.', category: 'Technical Term' },
          { questionNumber: 8, userAnswer: 'B', correctAnswer: 'B', isCorrect: true, explanation: 'Multiple choice correctly identified.', category: 'Multiple Choice' }
        ],
        feedbackNotes: 'Good time management. Pay attention to NOT GIVEN questions.'
      }
    ];

    const initialSchema: DatabaseSchema = {
      users: initialUsers,
      test_library: generateTestLibrary(),
      assignments: initialAssignments,
      submissions: initialSubmissions,
      sessions: [],
      nextStudentNumber: 41,
      enquiries: []
    };

    this.save(initialSchema);
    return initialSchema;
  }

  private save(dataToSave?: DatabaseSchema) {
    const payload = dataToSave || this.data;
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (e) {
      console.error('Error saving db file:', e);
    }
  }

  public flush(): void {
    this.save();
  }

  // User queries
  public getUsers(): UserRecord[] {
    return this.data.users;
  }

  public findUserByLogin(loginIdentifier: string): UserRecord | undefined {
    if (!loginIdentifier) return undefined;
    const clean = loginIdentifier.trim().toLowerCase();
    const cleanDigits = clean.replace(/\D/g, '');

    return this.data.users.find(u => {
      // 1. Direct username match (case insensitive)
      if (u.username && u.username.toLowerCase() === clean) return true;
      // 2. Direct alias username match (e.g. cdi703665)
      if (u.aliasUsername && u.aliasUsername.toLowerCase() === clean) return true;
      // 3. Student ID match (e.g. CR41, cr41)
      if (u.studentId && u.studentId.toLowerCase() === clean) return true;
      // 4. Email match
      if (u.email && u.email.toLowerCase() === clean) return true;
      // 5. Contact / phone number match:
      if (u.contact) {
        // Direct string match
        if (u.contact.toLowerCase() === clean) return true;
        // Clean digits match (e.g. "70879 70906" vs "7087970906" or "+917087970906")
        const uDigits = u.contact.replace(/\D/g, '');
        if (cleanDigits.length >= 7 && uDigits.length >= 7) {
          if (uDigits === cleanDigits || uDigits.endsWith(cleanDigits) || cleanDigits.endsWith(uDigits)) {
            return true;
          }
        }
      }
      return false;
    });
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findStudentByStudentId(studentId: string): UserRecord | undefined {
    return this.data.users.find(u => u.studentId === studentId);
  }

  public createStudent(studentData: Omit<UserRecord, 'id' | 'role' | 'passwordHash' | 'salt' | 'createdAt' | 'studentId' | 'username'> & { initialPassword?: string }): { student: UserRecord } {
    const nextNum = this.data.nextStudentNumber || 41;
    this.data.nextStudentNumber = nextNum + 1;
    const studentId = `CR${nextNum}`;

    const isGt = studentData.course === 'CD-IELTS General Training' || 
                 studentData.course === 'General Training' || 
                 (studentData as any).courseType === 'ielts_general';
    const isPte = studentData.course === 'PTE Academic' || 
                  (studentData as any).courseType === 'pte_academic';
    const courseType = isGt ? 'ielts_general' : isPte ? 'pte_academic' : 'ielts_academic';
    const course = studentData.course || (isGt ? 'CD-IELTS General Training' : isPte ? 'PTE Academic' : 'CD-IELTS Academic');
    const prefix = isPte ? 'pte' : 'cdi';
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const legacyCode = `${prefix}${randomSuffix}`;

    // Extract clean 10-digit mobile number if available
    const rawContact = studentData.contact && studentData.contact !== 'N/A' ? studentData.contact.trim() : '';
    const cleanDigits = rawContact.replace(/\D/g, '').slice(-10);

    // Primary username should be the phone number (or legacy code if no phone)
    const username = cleanDigits.length >= 7 ? cleanDigits : legacyCode;
    const aliasUsername = legacyCode;

    // Password generation:
    // Course prefix + last 5 digits of mobile (e.g. cdi70906), or custom password entered by admin
    let initialPlainPass: string;
    if (studentData.initialPassword && studentData.initialPassword.trim()) {
      initialPlainPass = studentData.initialPassword.trim();
    } else if (cleanDigits.length >= 5) {
      const lastDigits = cleanDigits.slice(-5);
      initialPlainPass = `${prefix}${lastDigits}`;
    } else {
      initialPlainPass = `${prefix}${nextNum}`;
    }

    const { hash, salt } = hashPassword(initialPlainPass);

    const cleanData = { ...studentData };
    delete (cleanData as any).initialPassword;

    const newStudent: UserRecord = {
      ...cleanData,
      course,
      courseType,
      id: `user_student_${Date.now()}_${randomSuffix}`,
      studentId,
      username,
      aliasUsername,
      role: 'student',
      passwordHash: hash,
      salt,
      rawPassword: initialPlainPass,
      createdAt: new Date().toISOString()
    };

    this.data.users.unshift(newStudent);
    this.save();
    return { student: newStudent };
  }

  public updateStudentStatus(idOrStudentId: string, accountStatus: 'Active' | 'Inactive'): UserRecord | null {
    const student = this.data.users.find(u => u.id === idOrStudentId || u.studentId === idOrStudentId);
    if (!student) return null;
    student.accountStatus = accountStatus;
    this.save();
    return student;
  }

  public resetStudentPassword(idOrStudentId: string, customNewPassword?: string): { student: UserRecord } | null {
    const student = this.data.users.find(u => u.id === idOrStudentId || u.studentId === idOrStudentId);
    if (!student) return null;

    const prefix = student.course === 'PTE Academic' ? 'pte' : 'cdi';
    const cleanDigits = student.contact ? student.contact.replace(/\D/g, '').slice(-10) : '';

    let newPass: string;
    if (customNewPassword && customNewPassword.trim()) {
      newPass = customNewPassword.trim();
    } else if (cleanDigits.length >= 5) {
      newPass = `${prefix}${cleanDigits.slice(-5)}`;
    } else {
      newPass = `${prefix}12345`;
    }

    const { hash, salt } = hashPassword(newPass);
    student.passwordHash = hash;
    student.salt = salt;
    student.rawPassword = newPass;
    delete (student as any).tempPasswordPlain;
    this.save();
    return { student };
  }

  public updateStudent(id: string, updates: Partial<UserRecord>): UserRecord | null {
    const idx = this.data.users.findIndex(u => u.id === id || u.studentId === id);
    if (idx === -1) return null;

    // Automatically synchronize course and courseType
    if (updates.course && !updates.courseType) {
      if (updates.course === 'CD-IELTS General Training' || updates.course.includes('General')) {
        updates.courseType = 'ielts_general';
      } else if (updates.course === 'PTE Academic') {
        updates.courseType = 'pte_academic';
      } else if (updates.course === 'CD-IELTS Academic' || updates.course === 'CD-IELTS') {
        updates.courseType = 'ielts_academic';
      }
    } else if (updates.courseType && !updates.course) {
      if (updates.courseType === 'ielts_general') {
        updates.course = 'CD-IELTS General Training';
      } else if (updates.courseType === 'ielts_academic') {
        updates.course = 'CD-IELTS Academic';
      } else if (updates.courseType === 'pte_academic') {
        updates.course = 'PTE Academic';
      }
    }

    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // Test Library
  public getTestLibrary(filter?: { courseType?: string; testType?: string; module?: string }): TestItem[] {
    let result = this.data.test_library;
    if (filter?.courseType) {
      const cType = filter.courseType.toLowerCase();
      result = result.filter(t => {
        const itemCourse = t.courseType.toLowerCase();
        if (cType.includes('ielts')) {
          return itemCourse.includes('ielts');
        }
        if (cType.includes('pte')) {
          if (cType.includes('ukvi')) return itemCourse.includes('ukvi');
          if (cType.includes('core')) return itemCourse.includes('core');
          return itemCourse.includes('pte');
        }
        return itemCourse === cType;
      });
    }
    if (filter?.testType) {
      result = result.filter(t => t.testType.toLowerCase() === filter.testType?.toLowerCase());
    }
    if (filter?.module) {
      result = result.filter(t => t.module.toLowerCase() === filter.module?.toLowerCase());
    }
    return result;
  }

  public getTestById(testId: string): TestItem | undefined {
    return findTestById(testId) || this.data.test_library.find(t => t.id === testId);
  }

  // Assignments
  public getAssignments(studentId?: string, batchName?: string): AssignmentRecord[] {
    if (!studentId && !batchName) return this.data.assignments;
    return this.data.assignments.filter(a => {
      if (studentId && a.studentId === studentId) return true;
      if (batchName && a.batchName === batchName) return true;
      return false;
    });
  }

  public assignTestToStudent(payload: {
    testId: string;
    studentId: string;
    assignedBy: string;
    dueDate: string;
    availability?: 'Immediate' | 'Scheduled';
    allowDuplicate?: boolean;
  }): { success: boolean; message: string; assignment?: AssignmentRecord } {
    const test = this.getTestById(payload.testId);
    if (!test) return { success: false, message: 'Test not found' };

    const student = this.findStudentByStudentId(payload.studentId) || this.findUserById(payload.studentId);
    if (!student) return { success: false, message: 'Student not found' };

    // Duplicate check
    if (!payload.allowDuplicate) {
      const existing = this.data.assignments.find(a => 
        a.testId === payload.testId && 
        a.studentId === (student.studentId || student.id)
      );
      if (existing) {
        return { 
          success: false, 
          message: `This test is already assigned to student ${student.name} (${student.studentId}). Enable 'Allow Duplicate' to assign again.` 
        };
      }
    }

    const newAssignment: AssignmentRecord = {
      id: `asg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      testId: test.id,
      testTitle: test.title,
      courseType: test.courseType,
      module: test.module,
      testType: test.testType,
      targetType: 'student',
      studentId: student.studentId || student.id,
      studentName: student.name,
      batchName: student.batch || 'Default',
      assignedBy: payload.assignedBy,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: payload.dueDate,
      availability: payload.availability || 'Immediate',
      allowDuplicate: Boolean(payload.allowDuplicate),
      status: 'pending'
    };

    this.data.assignments.unshift(newAssignment);
    this.save();
    return { success: true, message: 'Test assigned successfully to student', assignment: newAssignment };
  }

  public assignTestToBatch(payload: {
    testId: string;
    batchName: string;
    courseType?: string;
    assignedBy: string;
    dueDate: string;
    availability?: 'Immediate' | 'Scheduled';
    allowDuplicate?: boolean;
  }): { success: boolean; count: number; message: string } {
    const test = this.getTestById(payload.testId);
    if (!test) return { success: false, count: 0, message: 'Test not found' };

    // Find all active students in batch
    const eligibleStudents = this.data.users.filter(u => 
      u.role === 'student' && 
      u.accountStatus === 'Active' &&
      (u.batch === payload.batchName || payload.batchName === 'ALL_ACTIVE')
    );

    let assignedCount = 0;
    for (const student of eligibleStudents) {
      if (!payload.allowDuplicate) {
        const hasIt = this.data.assignments.some(a => 
          a.testId === test.id && a.studentId === (student.studentId || student.id)
        );
        if (hasIt) continue;
      }

      this.data.assignments.unshift({
        id: `asg_${Date.now()}_${Math.floor(Math.random() * 1000)}_${assignedCount}`,
        testId: test.id,
        testTitle: test.title,
        courseType: test.courseType,
        module: test.module,
        testType: test.testType,
        targetType: 'batch',
        studentId: student.studentId || student.id,
        studentName: student.name,
        batchName: payload.batchName,
        assignedBy: payload.assignedBy,
        assignedDate: new Date().toISOString().split('T')[0],
        dueDate: payload.dueDate,
        availability: payload.availability || 'Immediate',
        allowDuplicate: Boolean(payload.allowDuplicate),
        status: 'pending'
      });
      assignedCount++;
    }

    this.save();
    return { 
      success: true, 
      count: assignedCount, 
      message: `Assigned test to ${assignedCount} students in batch ${payload.batchName}` 
    };
  }

  // Submissions
  public createSubmission(submissionData: Omit<SubmissionRecord, 'id' | 'submittedAt'>): SubmissionRecord {
    const newSub: SubmissionRecord = {
      ...submissionData,
      id: `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    this.data.submissions.unshift(newSub);

    // Update assignment status if provided
    if (submissionData.assignmentId) {
      const asg = this.data.assignments.find(a => a.id === submissionData.assignmentId);
      if (asg) asg.status = 'completed';
    }

    this.save();
    return newSub;
  }

  public getSubmissions(studentId?: string): SubmissionRecord[] {
    if (!studentId) return this.data.submissions;
    return this.data.submissions.filter(s => s.studentId === studentId || s.candidateNumber === studentId);
  }

  // Sessions
  public createSession(userId: string, role: 'admin' | 'teacher' | 'student'): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    this.data.sessions = this.data.sessions.filter(s => s.userId !== userId); // Replace old session
    this.data.sessions.push({ token, userId, role, expiresAt });
    this.save();
    return token;
  }

  public verifySession(token: string): { user: UserRecord; role: string } | null {
    const session = this.data.sessions.find(s => s.token === token && s.expiresAt > Date.now());
    if (!session) return null;
    const user = this.findUserById(session.userId);
    if (!user || user.accountStatus === 'Inactive') return null;
    return { user, role: session.role };
  }

  public deleteSession(token: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.save();
  }

  // Enquiries
  public addEnquiry(enquiry: EnquiryRecord): void {
    if (!this.data.enquiries) {
      this.data.enquiries = [];
    }
    this.data.enquiries.unshift(enquiry);
    this.save();
  }

  public getEnquiries(): EnquiryRecord[] {
    return this.data.enquiries || [];
  }
}

export const db = new Database();
