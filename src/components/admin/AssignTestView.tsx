/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  User, 
  ChevronRight, 
  ArrowLeft,
  X,
  FileCheck
} from 'lucide-react';
import { apiService } from '../../services/apiService';

interface AssignTestViewProps {
  initialCourse?: 'CD-IELTS Academic' | 'CD-IELTS General Training' | 'PTE Academic' | 'CD-IELTS';
}

export const AssignTestView: React.FC<AssignTestViewProps> = ({
  initialCourse = 'CD-IELTS Academic'
}) => {
  const resolvedInitialCourse = initialCourse === 'CD-IELTS' ? 'CD-IELTS Academic' : initialCourse;
  const [courseProgram, setCourseProgram] = useState<'CD-IELTS Academic' | 'CD-IELTS General Training' | 'PTE Academic'>(resolvedInitialCourse as any);
  const [assignMode, setAssignMode] = useState<'student' | 'batch'>('student');
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Data
  const [students, setStudents] = useState<any[]>([]);
  const [testLibrary, setTestLibrary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Step 1 Selections
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string>(
    courseProgram === 'CD-IELTS General Training' ? 'CD-IELTS_General_Training_default' :
    courseProgram === 'PTE Academic' ? 'PTE_Target_79_default' : 'CD-IELTS_Academic_default'
  );

  // Step 2 Test Details
  const [selectedTestType, setSelectedTestType] = useState<'practice' | 'mock'>('practice');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [availability, setAvailability] = useState<'Immediate' | 'Scheduled'>('Immediate');
  const [allowDuplicate, setAllowDuplicate] = useState(false);

  // Status message
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isIeltsProgram = courseProgram.includes('IELTS');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [studentData, testsData] = await Promise.all([
          apiService.getStudents(),
          apiService.getTests({ courseType: isIeltsProgram ? 'CD-IELTS' : 'PTE Academic' })
        ]);
        const safeStudents = Array.isArray(studentData) ? studentData : [];
        const safeTests = Array.isArray(testsData) ? testsData : [];
        setStudents(safeStudents);
        setTestLibrary(safeTests);
        if (safeTests.length > 0) {
          setSelectedTestId(safeTests[0].id);
        }
        setIsLoading(false);
      } catch (err: any) {
        console.warn('Notice loading data:', err);
        setIsLoading(false);
      }
    }
    loadData();
  }, [courseProgram]);

  // Dynamic counts for Practice and Mock categories
  const practiceCount = testLibrary.filter(t => 
    (isIeltsProgram ? t.courseType.includes('IELTS') : t.courseType.toLowerCase() === courseProgram.toLowerCase()) && 
    t.testType === 'practice'
  ).length;
  const mockCount = testLibrary.filter(t => 
    (isIeltsProgram ? t.courseType.includes('IELTS') : t.courseType.toLowerCase() === courseProgram.toLowerCase()) && 
    t.testType === 'mock'
  ).length;

  // Filter tests by selected course, test type, and module
  const availableTests = testLibrary.filter(t => 
    (isIeltsProgram ? t.courseType.includes('IELTS') : t.courseType.toLowerCase() === courseProgram.toLowerCase()) &&
    t.testType === selectedTestType &&
    (selectedModuleFilter === 'all' || t.module.toLowerCase() === selectedModuleFilter.toLowerCase())
  );

  // Filter students matching search query and exact exam category
  const eligibleStudents = students.filter(s => {
    let matchesCourse = false;
    if (courseProgram === 'CD-IELTS Academic') {
      matchesCourse = s.courseType === 'ielts_academic' || 
                      s.course === 'CD-IELTS Academic' || 
                      (s.course === 'CD-IELTS' && (!s.courseType || s.courseType === 'ielts_academic'));
    } else if (courseProgram === 'CD-IELTS General Training') {
      matchesCourse = s.courseType === 'ielts_general' || 
                      s.course === 'CD-IELTS General Training' || 
                      Boolean(s.course && s.course.toLowerCase().includes('general'));
    } else {
      matchesCourse = s.courseType === 'pte_academic' || 
                      Boolean(s.course && s.course.toLowerCase().includes('pte'));
    }

    const matchesSearch = !searchQuery.trim() ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.studentId && s.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.username && s.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.batch && s.batch.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCourse && matchesSearch;
  });

  const handleProceedToTestDetails = () => {
    setStatusMessage(null);
    if (assignMode === 'student' && !selectedStudent) {
      setStatusMessage({ type: 'error', text: 'Please select a candidate before proceeding to test details.' });
      return;
    }
    setCurrentStep(2);
  };

  const handleExecuteAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      const payload: any = {
        targetType: assignMode,
        testId: selectedTestId,
        courseType: courseProgram,
        dueDate,
        availability,
        allowDuplicate
      };

      if (assignMode === 'student') {
        payload.studentId = selectedStudent.studentId || selectedStudent.id;
      } else {
        payload.batchName = selectedBatch;
      }

      const res = await apiService.assignTest(payload);
      setIsSubmitting(false);
      setStatusMessage({ type: 'success', text: res.message || 'Test assigned successfully!' });
      
      // Auto return to step 1 after delay
      setTimeout(() => {
        setCurrentStep(1);
        setStatusMessage(null);
      }, 2500);
    } catch (err: any) {
      setIsSubmitting(false);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to assign test.' });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header matching Screenshot 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Assign Test</h1>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
            <span>Home</span>
            <span>/</span>
            <span>Programs</span>
            <span>/</span>
            <span className="text-amber-700 font-semibold">{courseProgram} Assign Test</span>
          </div>
        </div>

        {/* Course Switcher (CD-IELTS Academic vs CD-IELTS General Training vs PTE) */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => { 
              setCourseProgram('CD-IELTS Academic'); 
              setSelectedBatch('CD-IELTS_Academic_default');
              setSelectedStudent(null); 
              setCurrentStep(1); 
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              courseProgram === 'CD-IELTS Academic' ? 'bg-[#1c2431] text-white shadow-sm' : 'text-slate-600 hover:text-black'
            }`}
          >
            Programs &gt; CD-IELTS Academic
          </button>
          <button
            onClick={() => { 
              setCourseProgram('CD-IELTS General Training'); 
              setSelectedBatch('CD-IELTS_General_Training_default');
              setSelectedStudent(null); 
              setCurrentStep(1); 
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              courseProgram === 'CD-IELTS General Training' ? 'bg-[#1c2431] text-white shadow-sm' : 'text-slate-600 hover:text-black'
            }`}
          >
            Programs &gt; CD-IELTS General Training
          </button>
          <button
            onClick={() => { 
              setCourseProgram('PTE Academic'); 
              setSelectedBatch('PTE_Target_79_default');
              setSelectedStudent(null); 
              setCurrentStep(1); 
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              courseProgram === 'PTE Academic' ? 'bg-[#1c2431] text-white shadow-sm' : 'text-slate-600 hover:text-black'
            }`}
          >
            Programs &gt; PTE Academic
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Target Mode Toggle matching Screenshot 5 (Batch vs Student) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setAssignMode('batch'); setCurrentStep(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            assignMode === 'batch'
              ? 'bg-[#1c2431] text-white shadow-md'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Batch</span>
        </button>
        <button
          onClick={() => { setAssignMode('student'); setCurrentStep(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            assignMode === 'student'
              ? 'bg-[#1c2431] text-white shadow-md'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Student</span>
        </button>
      </div>

      {/* Steps Pill Bar matching Screenshot 5 */}
      <div className="grid grid-cols-2 gap-2 bg-slate-200 p-1 rounded-2xl text-xs font-bold select-none max-w-md">
        <button
          onClick={() => setCurrentStep(1)}
          className={`py-2.5 px-4 rounded-xl transition text-center ${
            currentStep === 1 ? 'bg-[#1c2431] text-white shadow' : 'text-slate-600 hover:bg-white/60'
          }`}
        >
          {assignMode === 'student' ? '1. Select Student' : '1. Select Batch'}
        </button>
        <button
          onClick={() => (selectedStudent || assignMode === 'batch') && setCurrentStep(2)}
          className={`py-2.5 px-4 rounded-xl transition text-center ${
            currentStep === 2 ? 'bg-[#1c2431] text-white shadow' : 'text-slate-600 hover:bg-white/60'
          }`}
        >
          2. Test Details
        </button>
      </div>

      {/* STEP 1: SELECT STUDENT OR BATCH */}
      {currentStep === 1 && (
        <div className="bg-[#1c2431] text-white p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4">
          
          {assignMode === 'student' ? (
            <>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                SELECT STUDENT
              </div>

              {/* Search input matching Screenshot 5 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type student name, student ID (e.g. CR38), or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 pl-10 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>

              {/* Students Selection Table matching Screenshot 5 */}
              <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/60 mt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Sr No</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Student Id</th>
                      <th className="py-2.5 px-3">Username</th>
                      <th className="py-2.5 px-3">DOB</th>
                      <th className="py-2.5 px-3">Program</th>
                      <th className="py-2.5 px-3">Batch</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {eligibleStudents.map((st, i) => {
                      const isSelected = selectedStudent?.id === st.id;
                      return (
                        <tr 
                          key={st.id} 
                          onClick={() => setSelectedStudent(st)}
                          className={`cursor-pointer transition ${
                            isSelected ? 'bg-amber-500/20 text-white font-bold' : 'hover:bg-slate-800/80 text-slate-300'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <input
                              type="radio"
                              name="student_select_radio"
                              checked={isSelected}
                              onChange={() => setSelectedStudent(st)}
                              className="accent-amber-500"
                            />
                          </td>
                          <td className="py-3 px-3 font-semibold text-white">{st.name}</td>
                          <td className="py-3 px-3 font-mono text-amber-400 font-bold">{st.studentId || 'N/A'}</td>
                          <td className="py-3 px-3 font-mono text-slate-300">{st.username}</td>
                          <td className="py-3 px-3 font-mono text-slate-400">{st.dob || '01/01/1970'}</td>
                          <td className="py-3 px-3">{st.course || courseProgram}</td>
                          <td className="py-3 px-3 font-mono text-slate-300">{st.batch || 'Default'}</td>
                          <td className="py-3 px-3 text-center">
                            {isSelected && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setSelectedStudent(null); }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {eligibleStudents.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-6 text-slate-400 text-xs">
                          No candidates found matching search "{searchQuery}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {selectedStudent && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    Selected Candidate: <strong className="text-amber-400">{selectedStudent.name}</strong> (ID: {selectedStudent.studentId}, User: {selectedStudent.username})
                  </div>
                  <button
                    onClick={handleProceedToTestDetails}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow"
                  >
                    <span>Proceed to Test Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Batch Mode */
            <div className="space-y-4 max-w-lg">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                SELECT TARGET BATCH
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Select Batch</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 font-medium"
                >
                  <option value="CD-IELTS_Academic_default">CD-IELTS_Academic_default</option>
                  <option value="Morning IELTS Master 7.5+">Morning IELTS Master 7.5+</option>
                  <option value="CD-IELTS_General_Training_default">CD-IELTS_General_Training_default</option>
                  <option value="General Training Fast-track">General Training Fast-track</option>
                  <option value="PTE_Target_79_default">PTE_Target_79_default</option>
                  <option value="Evening PTE Intensive">Evening PTE Intensive</option>
                  <option value="Weekend Fast-track">Weekend Fast-track</option>
                  <option value="ALL_ACTIVE">All Active Enrolled Students</option>
                </select>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-amber-400">Batch Assignment Info:</span>
                <p>
                  This test will be automatically assigned to all eligible active students currently enrolled in batch <strong>{selectedBatch}</strong>.
                </p>
              </div>

              <button
                onClick={handleProceedToTestDetails}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow"
              >
                <span>Proceed to Test Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      )}

      {/* STEP 2: TEST DETAILS (CHOOSE FROM 10 PRACTICE & 10 MOCK TESTS) */}
      {currentStep === 2 && (
        <form onSubmit={handleExecuteAssignment} className="bg-[#1c2431] text-white p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-xl space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Step 2: Test Details</span>
              <h2 className="text-base font-bold text-white mt-0.5">Configure Test & Due Dates</h2>
              <div className="text-xs text-slate-400 mt-1">
                Target: {assignMode === 'student' ? (
                  <span>Student <strong className="text-amber-400">{selectedStudent?.name}</strong> ({selectedStudent?.studentId})</span>
                ) : (
                  <span>Batch <strong className="text-amber-400">{selectedBatch}</strong></span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Target</span>
            </button>
          </div>

          {/* Test Type Selector (Dynamic Practice Tests vs Mock Tests) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-300">Select Test Category</label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => {
                  setSelectedTestType('practice');
                  const firstP = testLibrary.find(t => 
                    t.courseType.toLowerCase() === courseProgram.toLowerCase() && 
                    t.testType === 'practice' &&
                    (selectedModuleFilter === 'all' || t.module.toLowerCase() === selectedModuleFilter.toLowerCase())
                  );
                  if (firstP) setSelectedTestId(firstP.id);
                }}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition ${
                  selectedTestType === 'practice'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Practice Tests ({practiceCount})
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTestType('mock');
                  const firstM = testLibrary.find(t => 
                    t.courseType.toLowerCase() === courseProgram.toLowerCase() && 
                    t.testType === 'mock' &&
                    (selectedModuleFilter === 'all' || t.module.toLowerCase() === selectedModuleFilter.toLowerCase())
                  );
                  if (firstM) setSelectedTestId(firstM.id);
                }}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition ${
                  selectedTestType === 'mock'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Official Mock Tests ({mockCount})
              </button>
            </div>
          </div>

          {/* Module Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase text-slate-300">Filter By Module</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'Reading', 'Listening', 'Writing', 'Speaking', 'Full Mock'].map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => {
                    setSelectedModuleFilter(mod);
                    const matched = testLibrary.find(t => 
                      t.courseType.toLowerCase() === courseProgram.toLowerCase() &&
                      t.testType === selectedTestType &&
                      (mod === 'all' || t.module.toLowerCase() === mod.toLowerCase())
                    );
                    if (matched) setSelectedTestId(matched.id);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    selectedModuleFilter.toLowerCase() === mod.toLowerCase()
                      ? 'bg-slate-200 text-slate-900 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {mod === 'all' ? 'All Modules' : mod}
                </button>
              ))}
            </div>
          </div>

          {/* Test Dropdown Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-300">
              Choose Test From Library ({availableTests.length} Available)
            </label>
            <select
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs px-4 py-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-amber-500"
            >
              {availableTests.map(t => (
                <option key={t.id} value={t.id}>
                  [{t.module.toUpperCase()}] {t.title} ({t.durationMinutes} mins • {t.totalQuestions} questions)
                </option>
              ))}
            </select>
          </div>

          {/* Due Date & Availability Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Availability Window</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as any)}
                className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 font-medium"
              >
                <option value="Immediate">Immediate (Available right now)</option>
                <option value="Scheduled">Scheduled (On designated exam slot)</option>
              </select>
            </div>
          </div>

          {/* Duplicate Prevention Switch */}
          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-white">Duplicate Assignment Prevention</div>
              <div className="text-[11px] text-slate-400">
                Default: Prevent assigning the same test twice to avoid redundant submissions.
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={allowDuplicate}
                onChange={(e) => setAllowDuplicate(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500"
              />
              <span className="text-amber-400 font-bold">Allow Duplicate</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold text-white transition"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition flex items-center gap-1.5 shadow-lg disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Assigning...' : `Confirm & Assign ${selectedTestType.toUpperCase()}`}</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
