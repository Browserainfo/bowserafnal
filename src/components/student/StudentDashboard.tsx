/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Play, 
  Clock, 
  Award, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Headphones, 
  BookOpen, 
  Edit3, 
  Mic, 
  Monitor, 
  ChevronRight, 
  Calendar,
  AlertCircle,
  Eye,
  Keyboard,
  Target
} from 'lucide-react';
import { User, TestSubmission, DailyAssignment, ExamModule } from '../../types';
import { DataService } from '../../services/dataService';
import { ComputerCoursesView } from './ComputerCoursesView';
import { SpokenEnglishView } from './SpokenEnglishView';
import { apiService } from '../../services/apiService';

interface StudentDashboardProps {
  currentUser: User;
  onLaunchCdIelts: (module?: ExamModule, testId?: string) => void;
  onLaunchPte: (testId?: string) => void;
  onOpenMistakeAnalysis: (submission: TestSubmission) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  onLaunchCdIelts,
  onLaunchPte,
  onOpenMistakeAnalysis
}) => {
  const [activeTab, setActiveTab] = useState<'practice' | 'assignments' | 'history' | 'computer' | 'spoken'>('practice');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudentData = async () => {
    setIsLoading(true);
    try {
      // Server-side enforcement: /api/assignments and /api/submissions return ONLY this student's records!
      const [asgData, subData] = await Promise.all([
        apiService.getAssignments(),
        apiService.getSubmissions()
      ]);
      setAssignments(Array.isArray(asgData) ? asgData : []);
      setSubmissions(Array.isArray(subData) ? subData : []);
      setIsLoading(false);
    } catch (e) {
      console.warn('Notice fetching student portal data:', e);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [activeTab]);

  const mySubmissions = submissions;

  // Target vs Current Band calculation
  const targetBand = currentUser.targetBand || 7.5;
  const currentBand = currentUser.currentBand || 6.5;
  const progressPercent = Math.min(100, Math.round((currentBand / targetBand) * 100));

  // Determine student's exact enrolled exam category
  const userCourseType = (currentUser as any).courseType || 
    ((currentUser as any).course && (currentUser as any).course.toLowerCase().includes('general') ? 'ielts_general' : 
     (currentUser as any).course === 'PTE Academic' ? 'pte_academic' : 'ielts_academic');

  const isGeneralTraining = userCourseType === 'ielts_general';
  const isPte = userCourseType === 'pte_academic';
  const isAcademic = !isGeneralTraining && !isPte;

  return (
    <div className="min-h-screen bg-slate-100/70 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Student Profile & Goal Tracker Banner */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>Candidate Portal • Batch: {(currentUser as any).batch || currentUser.batchName || (isGeneralTraining ? 'CD-IELTS_General_Training_default' : 'CD-IELTS_Academic_default')}</span>
              </div>
              <h1 className="text-2xl font-bold text-white mt-0.5">{currentUser.name}</h1>
              <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                <span className="font-mono text-slate-300">ID: {(currentUser as any).studentId || currentUser.candidateNumber || 'CR41'}</span>
                <span>•</span>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                  isGeneralTraining 
                    ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30'
                    : isPte
                      ? 'bg-sky-400/10 text-sky-300 border-sky-400/30'
                      : 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                }`}>
                  {isGeneralTraining ? 'CD-IELTS General Training' : isPte ? 'PTE Academic' : 'CD-IELTS Academic'}
                </span>
                <span>•</span>
                <span>Official Exam Date: <strong className="text-white">{currentUser.targetExamDate || 'Nov 20, 2026'}</strong></span>
              </div>
            </div>
          </div>

          {/* Band Score Progress Meter */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-w-[280px]">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-500" />
                <span>Target Band Goal</span>
              </span>
              <span className="text-xs font-bold text-slate-200">
                <span className="text-amber-400 text-base">{currentBand}</span> / {targetBand} Band
              </span>
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 mt-2">
              <span>Listening: 7.5</span>
              <span>Reading: 7.0</span>
              <span>Writing: 6.0</span>
              <span>Speaking: 6.5</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'practice' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Official Exam Simulators</span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'assignments' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Daily Assigned Tests ({assignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Test History & Mistake Analysis ({mySubmissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('spoken')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'spoken' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Spoken English Drills</span>
          </button>

          <button
            onClick={() => setActiveTab('computer')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'computer' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Computer Courses & Typing Test</span>
          </button>
        </div>

        {/* TAB 1: OFFICIAL EXAM SIMULATORS */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            
            {/* CD-IELTS Module Suite (Academic or General Training) */}
            {!isPte && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                      isGeneralTraining 
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                        : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}>
                      Official Computer-Delivered IELTS Lab • {isGeneralTraining ? 'General Training' : 'Academic'}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">
                      {isGeneralTraining ? 'CD-IELTS General Training Exam Suite' : 'CD-IELTS Academic Exam Suite'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isGeneralTraining 
                        ? 'Practice under authentic British Council / IDP screen conditions for General Training candidates.' 
                        : 'Practice under authentic British Council / IDP screen conditions for Academic candidates.'}
                    </p>
                  </div>

                  <button
                    onClick={() => onLaunchCdIelts('reading')}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch Full CD-IELTS Mock</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Reading Card */}
                  <div className="border border-slate-200 rounded-xl p-4 hover:border-amber-400 transition bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                        <BookOpen className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {isGeneralTraining ? 'General Training Reading' : 'Academic Reading'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {isGeneralTraining 
                          ? '3 Sections • 40 Questions • Social Survival, Workplace Context & General Articles' 
                          : '3 Passages • 40 Questions • Academic Research, Empirical Studies & Epistemology'}
                      </p>
                    </div>
                    <button
                      onClick={() => onLaunchCdIelts('reading')}
                      className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition"
                    >
                      {isGeneralTraining ? 'Start GT Reading Test (60m)' : 'Start Academic Reading Test (60m)'}
                    </button>
                  </div>

                  {/* Listening Card (Shared) */}
                  <div className="border border-slate-200 rounded-xl p-4 hover:border-sky-400 transition bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mb-3">
                        <Headphones className="w-5 h-5 text-sky-600" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">IELTS Listening</h3>
                      <p className="text-xs text-slate-500 mt-1">4 Sections • 40 Questions • Simulated audio player with note completion (Shared standard)</p>
                    </div>
                    <button
                      onClick={() => onLaunchCdIelts('listening')}
                      className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition"
                    >
                      Start Listening Test (30m)
                    </button>
                  </div>

                  {/* Writing Card (Academic Report vs GT Letter) */}
                  <div className="border border-slate-200 rounded-xl p-4 hover:border-rose-400 transition bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-3">
                        <Edit3 className="w-5 h-5 text-rose-600" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {isGeneralTraining ? 'GT Writing (Letter & Essay)' : 'Academic Writing (Task 1 & 2)'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {isGeneralTraining 
                          ? 'Task 1 Formal/Semi-formal Letter & Task 2 250-word Discursive Essay' 
                          : 'Task 1 Data/Chart/Process Report & Task 2 250-word Academic Discursive Essay'}
                      </p>
                    </div>
                    <button
                      onClick={() => onLaunchCdIelts('writing')}
                      className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition"
                    >
                      {isGeneralTraining ? 'Start GT Writing Test (60m)' : 'Start Academic Writing Test (60m)'}
                    </button>
                  </div>

                  {/* Speaking Card (Shared) */}
                  <div className="border border-slate-200 rounded-xl p-4 hover:border-emerald-400 transition bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                        <Mic className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">IELTS Speaking Part 1, 2, 3</h3>
                      <p className="text-xs text-slate-500 mt-1">1-min cue card preparation timer • Mic waveform • Speech transcription (Shared standard)</p>
                    </div>
                    <button
                      onClick={() => onLaunchCdIelts('speaking')}
                      className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition"
                    >
                      Start Speaking Test (15m)
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* PTE Suite (Shown for PTE students) */}
            {isPte && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#002d62] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      Official Pearson PTE Simulation Engine • Academic, UKVI & Core
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">
                      Pearson PTE Examination & Diagnostic Suite
                    </h2>
                    <p className="text-xs text-slate-500">
                      Practice under authentic Pearson timed conditions. Listening tests require audio playback confirmation only (no microphone needed).
                    </p>
                  </div>

                  <button
                    onClick={() => onLaunchPte('pte_listening_academic_1')}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch PTE Simulator</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Category 1: PTE Academic Listening */}
                  <div className="border border-slate-200 rounded-xl p-4 hover:border-sky-400 transition bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mb-3">
                        <Headphones className="w-5 h-5 text-sky-600" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        No Mic Required
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">PTE Academic Listening</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Summarize Spoken Text (50-70 words), Highlight Correct Summary & Write from Dictation.
                      </p>
                    </div>
                    <button
                      onClick={() => onLaunchPte('pte_listening_academic_1')}
                      className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <span>Start Listening (30m)</span>
                    </button>
                  </div>

                  {/* Category 2: PTE Academic UKVI Listening */}
                  <div className="border border-slate-200 rounded-xl p-4 hover:border-indigo-400 transition bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3">
                        <Headphones className="w-5 h-5 text-indigo-600" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        No Mic Required
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">PTE Academic UKVI Listening</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        UK Visa compliance briefings, university induction transcripts & passport dictations.
                      </p>
                    </div>
                    <button
                      onClick={() => onLaunchPte('pte_listening_ukvi_1')}
                      className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <span>Start UKVI Listening (30m)</span>
                    </button>
                  </div>

                  {/* Category 3: PTE Core Listening */}
                  <div className="border border-slate-200 rounded-xl p-4 hover:border-teal-400 transition bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-3">
                        <Headphones className="w-5 h-5 text-teal-600" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        No Mic Required
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">PTE Core Listening</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Canadian immigration & vocational communication: workplace voice messages, safety notices & notes.
                      </p>
                    </div>
                    <button
                      onClick={() => onLaunchPte('pte_listening_core_1')}
                      className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <span>Start Core Listening (30m)</span>
                    </button>
                  </div>

                  {/* Category 4: PTE Speaking Lab (Requires Mic) */}
                  <div className="border border-slate-200 rounded-xl p-4 hover:border-amber-400 transition bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                        <Mic className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Microphone Required
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">PTE Speaking Lab</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Read Aloud (35s prep), Describe Image with chart graphs & live acoustic transcription.
                      </p>
                    </div>
                    <button
                      onClick={() => onLaunchPte('pte_practice_1')}
                      className="mt-4 w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <span>Start Speaking (15m)</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: DAILY ASSIGNED TESTS */}
        {activeTab === 'assignments' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Today's Assigned Practice Modules</h2>
              <p className="text-xs text-slate-500">Scheduled by your master trainers for your enrolled batch.</p>
            </div>

            <div className="space-y-3">
              {assignments.map(assign => (
                <div key={assign.id} className="p-4 border border-slate-200 rounded-xl hover:border-amber-400 transition bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100/70 px-2 py-0.5 rounded">
                        {assign.courseType.replace(/_/g, ' ')} • {assign.module}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Assigned by {assign.teacherName}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mt-1">{assign.title}</h3>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                      <span>Duration: {assign.durationMinutes} minutes</span>
                      <span>•</span>
                      <span>Due Date: <strong className="text-slate-700">{assign.dueDate}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                      assign.status === 'reviewed' ? 'bg-emerald-100 text-emerald-800' :
                      assign.status === 'submitted' ? 'bg-sky-100 text-sky-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {assign.status}
                    </span>

                    <button
                      onClick={() => {
                        if (assign.courseType?.toLowerCase().includes('pte')) {
                          onLaunchPte(assign.testId);
                        } else {
                          const mod = assign.module ? (assign.module.toLowerCase() as ExamModule) : 'reading';
                          onLaunchCdIelts(mod, assign.testId);
                        }
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1"
                    >
                      <span>Start Test</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TEST HISTORY & MISTAKE ANALYSIS */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Completed Test History & Diagnostics</h2>
                <p className="text-xs text-slate-500">Click any attempt to inspect question-by-question mistakes, correct answers, and teacher remarks.</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Test Title</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">Band Score</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4">Teacher Review</th>
                    <th className="py-3 px-4 text-right">Mistake Analysis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mySubmissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{sub.testTitle}</td>
                      <td className="py-3.5 px-4 uppercase text-[10px] font-bold text-slate-600">{sub.module}</td>
                      <td className="py-3.5 px-4 font-extrabold text-amber-600">
                        {typeof sub.teacherAdjustedBand === 'number' ? `Band ${sub.teacherAdjustedBand}` :
                         typeof sub.rawBandScore === 'number' ? `Band ${sub.rawBandScore}` :
                         typeof sub.aiReport?.overallBand === 'number' ? `Band ${sub.aiReport.overallBand}` : 'Pending'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{sub.submittedAt}</td>
                      <td className="py-3.5 px-4">
                        {sub.teacherReviewed ? (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified by {sub.teacherName?.split(' ')[1] || 'Teacher'}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-700 font-medium">
                            Provisional AI Score
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onOpenMistakeAnalysis(sub)}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Analysis</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {mySubmissions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                        No tests completed yet. Start an exam from the Official Exam Simulators tab!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SPOKEN ENGLISH */}
        {activeTab === 'spoken' && (
          <SpokenEnglishView />
        )}

        {/* TAB 5: COMPUTER COURSES & TYPING SPEED */}
        {activeTab === 'computer' && (
          <ComputerCoursesView />
        )}

      </div>
    </div>
  );
};
