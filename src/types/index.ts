/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'teacher' | 'student';

export type CourseType = 
  | 'ielts_academic'
  | 'ielts_general'
  | 'pte_academic'
  | 'spoken_english'
  | 'computer_courses';

export type ExamModule = 'listening' | 'reading' | 'writing' | 'speaking';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  // Student specific
  candidateNumber?: string;
  enrolledCourses?: CourseType[];
  batchName?: string;
  targetBand?: number;
  currentBand?: number;
  targetExamDate?: string;
  assignedTeacherId?: string;
  // Teacher specific
  specialization?: string[];
  assignedBatches?: string[];
  rating?: number;
  // Admin specific
  adminLevel?: 'super_admin' | 'center_manager';
}

export interface QuestionItem {
  id: string;
  number: number;
  type: 'multiple_choice' | 'true_false_not_given' | 'matching_headings' | 'fill_blank' | 'short_answer';
  questionText: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  userAnswer?: string;
  isFlagged?: boolean;
}

export interface ReadingPassage {
  passageNumber: 1 | 2 | 3;
  title: string;
  subtitle?: string;
  text: string;
  questions: QuestionItem[];
}

export interface ReadingTest {
  id: string;
  title: string;
  courseType: 'ielts_academic' | 'ielts_general';
  passageTitle: string;
  passageSubtitle?: string;
  passageText: string;
  passages?: ReadingPassage[];
  durationMinutes: number;
  questions: QuestionItem[];
}

export interface ListeningSection {
  sectionNumber: number;
  title: string;
  audioScenario: string;
  audioDurationSeconds: number;
  transcript: string;
  questions: QuestionItem[];
}

export interface ListeningTest {
  id: string;
  title: string;
  courseType: 'ielts_academic' | 'ielts_general';
  durationMinutes: number;
  audioSimulatedUrl?: string;
  sections: ListeningSection[];
}

export interface WritingTask {
  id: string;
  taskNumber: 1 | 2;
  title: string;
  courseType: 'ielts_academic' | 'ielts_general';
  prompt: string;
  chartType?: 'bar_chart' | 'line_graph' | 'pie_chart' | 'process_diagram' | 'map';
  chartDataSummary?: string;
  minWords: number;
  suggestedMinutes: number;
  modelAnswer?: string;
}

export interface SpeakingTest {
  id: string;
  title: string;
  part1Prompts: { topic: string; questions: string[] }[];
  part2CueCard: {
    topic: string;
    bulletPoints: string[];
    prepTimeSeconds: number;
    speakTimeSeconds: number;
  };
  part3Discussion: {
    topic: string;
    questions: string[];
  };
}

export type PteItemType = 
  | 'read_aloud' 
  | 'repeat_sentence' 
  | 'describe_image' 
  | 'summarize_written_text' 
  | 'write_essay'
  | 'summarize_spoken_text'
  | 'write_from_dictation'
  | 'highlight_correct_summary'
  | 'listening_multiple_choice';

export interface PteTestItem {
  id: string;
  type: PteItemType;
  title: string;
  prompt: string;
  imageDescription?: string;
  prepTimeSeconds: number;
  responseTimeSeconds: number;
  sampleAudioTranscript?: string;
  audioSimulatedUrl?: string;
  options?: string[];
  correctAnswer?: string;
  scoringGuide: string;
}

export interface ComputerCourseModule {
  id: string;
  courseCode: 'DCA' | 'PGDCA' | 'MS_OFFICE' | 'WEB_BASICS' | 'TYPING_PRO';
  title: string;
  durationWeeks: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  syllabus: { topic: string; hours: number; completed: boolean }[];
  practicalTestTitle: string;
  practicalTaskDescription: string;
}

export interface SpokenTopicLesson {
  id: string;
  category: 'Daily Conversation' | 'Job Interview' | 'Travel & Airport' | 'Presentation Skills';
  title: string;
  dialogue: { speaker: string; text: string; phoneticTips?: string }[];
  keyVocab: { word: string; meaning: string; pronunciation: string; example: string }[];
  drillPrompt: string;
}

export interface DailyAssignment {
  id: string;
  title: string;
  courseType: CourseType;
  module: ExamModule | 'computer_practical' | 'spoken_drill';
  assignedByTeacherId: string;
  teacherName: string;
  batchName: string;
  assignedDate: string;
  dueDate: string;
  durationMinutes: number;
  testReferenceId: string;
  status: 'pending' | 'submitted' | 'reviewed';
}

export interface MockTestSchedule {
  id: string;
  title: string;
  testType: 'CD_IELTS_FULL' | 'PTE_ACADEMIC_FULL' | 'IELTS_ACADEMIC_MOCK';
  date: string;
  startTime: string;
  hallName: string;
  totalSeats: number;
  bookedSeats: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface AiEvaluationReport {
  isLiveAIEvaluation: boolean;
  modelUsed?: string;
  evaluatedAt: string;
  overallBand: number; // 0 - 9 for IELTS, or 10-90 for PTE
  wordCount?: number;
  minRequiredWords?: number;
  isUnderLength?: boolean;
  shortfallWords?: number;
  criteriaScores: {
    name: string; // e.g. "Task Achievement" or "Fluency"
    score: number;
    description: string;
  }[];
  strengths: string[];
  areasToImprove: string[];
  detailedFeedback: string;
  grammarFixes?: {
    original: string;
    suggestion: string;
    rule: string;
  }[];
  vocabularyUpgrades?: {
    word: string;
    betterAlternative: string;
    context: string;
  }[];
}

export interface TestSubmission {
  id: string;
  studentId: string;
  studentName: string;
  candidateNumber: string;
  testTitle: string;
  courseType: CourseType;
  module: ExamModule;
  submittedAt: string;
  timeSpentSeconds: number;
  
  // Objective answers (Reading / Listening)
  totalQuestions?: number;
  correctCount?: number;
  rawBandScore?: number;
  overallBand?: number;
  questionAnalysis?: {
    questionNumber: number;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    category: string;
  }[];

  // Subjective answers (Writing / Speaking)
  writtenText?: string;
  audioUrl?: string;
  speechTranscript?: string;

  // AI Evaluation report
  aiReport?: AiEvaluationReport;

  // Teacher Review & Override
  teacherReviewed: boolean;
  reviewedByTeacherId?: string;
  teacherName?: string;
  teacherAdjustedBand?: number;
  teacherFeedbackNotes?: string;
  teacherReviewedAt?: string;
}

export interface SystemIntegrationStatus {
  backendApiStatus: 'ready_configured' | 'offline_standalone';
  databaseStatus: 'indexed_db_ready' | 'firestore_ready';
  geminiAiStatus: 'active' | 'standby_key_needed';
  speechToTextStatus: 'web_speech_api_ready' | 'transcribe_api_hook_ready';
}

export interface TestItem {
  id: string;
  testNumber: number;
  courseType: 'CD-IELTS' | 'PTE Academic' | 'PTE Academic UKVI' | 'PTE Core' | string;
  testType: 'practice' | 'mock';
  module: 'Reading' | 'Listening' | 'Writing' | 'Speaking' | 'Full Mock';
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  minWords?: number;
  readingData?: ReadingTest;
  readingTest?: ReadingTest;
  listeningData?: ListeningTest;
  listeningTest?: ListeningTest;
  writingData?: WritingTask;
  writingTask?: WritingTask;
  speakingData?: SpeakingTest;
  speakingTest?: SpeakingTest;
  pteData?: PteTestItem[] | PteTestItem;
}

