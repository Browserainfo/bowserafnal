/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserCheck, 
  Users, 
  FileCheck, 
  Sparkles, 
  Award, 
  Clock, 
  CheckCircle, 
  Edit3, 
  Send, 
  MessageSquare, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  Filter,
  Plus
} from 'lucide-react';
import { User, TestSubmission, DailyAssignment, ExamModule } from '../../types';
import { DataService } from '../../services/dataService';

interface TeacherDashboardProps {
  currentTeacher: User;
  onOpenSubmissionModal: (sub: TestSubmission) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentTeacher,
  onOpenSubmissionModal
}) => {
  const [submissions, setSubmissions] = useState<TestSubmission[]>(() => DataService.getSubmissions());
  const [users] = useState<User[]>(() => DataService.getUsers());
  const [selectedSubForReview, setSelectedSubForReview] = useState<TestSubmission | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Teacher Review inputs
  const [adjustedBand, setAdjustedBand] = useState<number>(7.0);
  const [teacherNotes, setTeacherNotes] = useState<string>('');

  // Quick Assign inputs
  const [assignTitle, setAssignTitle] = useState('');
  const [assignModule, setAssignModule] = useState<ExamModule>('writing');
  const [assignBatch, setAssignBatch] = useState(currentTeacher.assignedBatches?.[0] || 'Morning IELTS Master 7.5+');
  const [assignDueDate, setAssignDueDate] = useState('2026-11-02');

  const assignedStudents = users.filter(u => u.role === 'student');
  const pendingSubmissions = submissions.filter(s => !s.teacherReviewed);

  const handleOpenReview = (sub: TestSubmission) => {
    setSelectedSubForReview(sub);
    const initialBand = sub.teacherAdjustedBand ?? sub.rawBandScore ?? sub.aiReport?.overallBand ?? 6.5;
    setAdjustedBand(initialBand);
    setTeacherNotes(sub.teacherFeedbackNotes || 'Commendable effort. Review the grammar upgrades and maintain structured paragraphing.');
  };

  const handleSaveTeacherReview = () => {
    if (!selectedSubForReview) return;

    DataService.updateTeacherReview(selectedSubForReview.id, {
      teacherId: currentTeacher.id,
      teacherName: currentTeacher.name,
      adjustedBand: adjustedBand,
      feedbackNotes: teacherNotes
    });

    setSubmissions(DataService.getSubmissions());
    setSelectedSubForReview(null);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle) return;

    const newAssignment: DailyAssignment = {
      id: `assign_${Date.now()}`,
      title: assignTitle,
      courseType: 'ielts_academic',
      module: assignModule,
      assignedByTeacherId: currentTeacher.id,
      teacherName: currentTeacher.name,
      batchName: assignBatch,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: assignDueDate,
      durationMinutes: 40,
      testReferenceId: 'write_task_2',
      status: 'pending'
    };

    DataService.saveAssignment(newAssignment);
    setIsAssignModalOpen(false);
    setAssignTitle('');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Teacher Profile Banner */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentTeacher.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'}
              alt={currentTeacher.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-amber-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <UserCheck className="w-4 h-4" />
                <span>Certified Master Trainer</span>
              </div>
              <h1 className="text-xl font-bold text-white mt-0.5">{currentTeacher.name}</h1>
              <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                <span>{currentTeacher.email}</span>
                <span>•</span>
                <span className="text-amber-300 font-medium">
                  {currentTeacher.specialization?.join(' | ') || 'IELTS Specialist'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Practice Test</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Assigned Students</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{assignedStudents.length}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Across active batches</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Submissions Awaiting Review</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{pendingSubmissions.length}</div>
            <div className="text-[10px] text-amber-700 font-semibold mt-0.5">AI pre-scored pending check</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Average Student Band</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">7.1 Band</div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Target: 7.5+ Band</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Assigned Batches</div>
            <div className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">
              {currentTeacher.assignedBatches?.[0] || 'Morning Master 7.5+'}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Daily Attendance: 96%</div>
          </div>
        </div>

        {/* Main Content: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Assigned Students Roster (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Assigned Student Cohort</h2>
                <p className="text-xs text-slate-500">Monitor individual band targets vs actual performance trajectory.</p>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                {assignedStudents.length} Students
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {assignedStudents.map(student => (
                <div key={student.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{student.candidateNumber || student.email}</div>
                      <div className="text-[10px] text-amber-700 font-medium">{student.batchName}</div>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="text-xs font-bold text-slate-900">
                      Current: <span className="text-amber-600">{student.currentBand || 6.5} Band</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Target: <span className="font-bold text-slate-700">{student.targetBand || 7.5} Band</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Exam: {student.targetExamDate || 'Dec 2026'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Submissions & AI Feedback Review (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Submissions & AI Reviews</h2>
                <p className="text-xs text-slate-500">Review provisional AI rubrics and provide faculty remarks.</p>
              </div>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg">
                {submissions.length} Total
              </span>
            </div>

            <div className="space-y-3">
              {submissions.map(sub => (
                <div 
                  key={sub.id} 
                  className={`p-3.5 rounded-xl border transition ${
                    sub.teacherReviewed 
                      ? 'border-slate-200 bg-slate-50/50' 
                      : 'border-amber-300 bg-amber-50/30 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {sub.courseType.replace(/_/g, ' ')} • {sub.module}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5">{sub.testTitle}</h4>
                      <div className="text-[11px] text-slate-600 font-medium mt-0.5">Candidate: {sub.studentName}</div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-amber-600">
                        {typeof sub.teacherAdjustedBand === 'number' ? `Band ${sub.teacherAdjustedBand}` :
                         typeof sub.rawBandScore === 'number' ? `Band ${sub.rawBandScore}` :
                         typeof sub.aiReport?.overallBand === 'number' ? `Band ${sub.aiReport.overallBand}` : 'Pending'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{sub.submittedAt.split(' ')[0]}</div>
                    </div>
                  </div>

                  {sub.aiReport && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                      <div className="font-semibold text-slate-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>AI Diagnostic: {sub.aiReport.modelUsed}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 italic mt-0.5">
                        "{sub.aiReport.detailedFeedback}"
                      </p>
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    {sub.teacherReviewed ? (
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Reviewed by {sub.teacherName?.split(' ')[1] || 'You'}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Needs Teacher Approval</span>
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenReview(sub)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                    >
                      <span>{sub.teacherReviewed ? 'Inspect / Edit' : 'Review AI Feedback'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL: TEACHER REVIEW & BAND OVERRIDE */}
      {selectedSubForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 my-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Teacher Review & AI Override
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedSubForReview.testTitle}</h3>
                <p className="text-xs text-slate-500">Student: {selectedSubForReview.studentName} ({selectedSubForReview.candidateNumber})</p>
              </div>
              <button
                onClick={() => setSelectedSubForReview(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Candidate Submission Text */}
            {selectedSubForReview.writtenText && (
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-600">Candidate Written Essay</label>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line font-serif">
                  {selectedSubForReview.writtenText}
                </div>
              </div>
            )}

            {/* AI Evaluation Criteria Breakdown */}
            {selectedSubForReview.aiReport && (
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>AI Provisional Evaluation ({selectedSubForReview.aiReport.modelUsed})</span>
                  </span>
                  <span className="font-extrabold text-amber-700 text-sm">
                    Band {selectedSubForReview.aiReport.overallBand}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selectedSubForReview.aiReport.criteriaScores.map((c, i) => (
                    <div key={i} className="bg-white p-2 rounded-lg border border-amber-200/50">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{c.name}</span>
                        <span className="text-amber-600">{c.score}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{c.description}</p>
                    </div>
                  ))}
                </div>

                {selectedSubForReview.aiReport.grammarFixes && selectedSubForReview.aiReport.grammarFixes.length > 0 && (
                  <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-amber-200/50 space-y-1">
                    <span className="font-bold text-slate-900">Grammar Recommendation:</span>
                    <div className="text-slate-600">
                      Suggestion: <span className="font-medium text-emerald-700">{selectedSubForReview.aiReport.grammarFixes[0].suggestion}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Teacher Override Controls */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teacher Certified Band (Score Override)
                  </label>
                  <select
                    value={adjustedBand}
                    onChange={(e) => setAdjustedBand(parseFloat(e.target.value))}
                    className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="5.5">Band 5.5 (Modest User)</option>
                    <option value="6.0">Band 6.0 (Competent User)</option>
                    <option value="6.5">Band 6.5 (Competent Plus)</option>
                    <option value="7.0">Band 7.0 (Good User)</option>
                    <option value="7.5">Band 7.5 (Good User Plus)</option>
                    <option value="8.0">Band 8.0 (Very Good User)</option>
                    <option value="8.5">Band 8.5 (Expert User)</option>
                    <option value="9.0">Band 9.0 (Master User)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Examiner Verification
                  </label>
                  <div className="text-xs text-slate-600 bg-slate-100 p-2 rounded-lg font-medium">
                    Verified by {currentTeacher.name}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Personalized Feedback & Study Guidance for Candidate
                </label>
                <textarea
                  rows={3}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="Provide targeted advice on vocabulary, sentence length or paragraph flow..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSubForReview(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTeacherReview}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm"
              >
                Approve & Publish to Student Report Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN PRACTICE TEST */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Assign Practice Test to Batch</h3>
            
            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Test Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CD-IELTS Academic Writing Task 2 Mock"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Batch</label>
                <input
                  type="text"
                  value={assignBatch}
                  onChange={(e) => setAssignBatch(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Module</label>
                  <select
                    value={assignModule}
                    onChange={(e) => setAssignModule(e.target.value as ExamModule)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="reading">Reading</option>
                    <option value="listening">Listening</option>
                    <option value="writing">Writing</option>
                    <option value="speaking">Speaking</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
                >
                  Assign to Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
