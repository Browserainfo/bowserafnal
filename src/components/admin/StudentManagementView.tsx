/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Key, 
  CheckCircle, 
  XCircle, 
  Edit2, 
  Eye, 
  EyeOff,
  Copy, 
  Check, 
  RefreshCw,
  UserCheck,
  Shield,
  Clock
} from 'lucide-react';
import { apiService } from '../../services/apiService';

interface StudentManagementViewProps {
  onOpenEnrolmentForm: () => void;
  onViewStudentSubmissions?: (studentId: string) => void;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  onOpenEnrolmentForm,
  onViewStudentSubmissions
}) => {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state matching Screenshot 3
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Inactive' | 'All'>('Active');
  const [programFilter, setProgramFilter] = useState<string>('All');
  const [batchFilter, setBatchFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Password visibility states
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [visiblePasswordMap, setVisiblePasswordMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Password Reset Modal State
  const [resetModalStudent, setResetModalStudent] = useState<any | null>(null);
  const [newTempPassword, setNewTempPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  // Edit Course Category & Assignment Modal State
  const [editCourseModalStudent, setEditCourseModalStudent] = useState<any | null>(null);
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState<string>('CD-IELTS Academic');
  const [selectedBatchForEdit, setSelectedBatchForEdit] = useState<string>('CD-IELTS_Academic_default');
  const [selectedPackForEdit, setSelectedPackForEdit] = useState<string>('');
  const [isSavingCourseEdit, setIsSavingCourseEdit] = useState(false);
  const [courseEditSuccessMessage, setCourseEditSuccessMessage] = useState<string | null>(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getStudents();
      setStudents(Array.isArray(data) ? data : []);
      setIsLoading(false);
    } catch (err: any) {
      console.warn('Notice fetching student directory:', err);
      setError(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleStatus = async (student: any) => {
    const newStatus = student.accountStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await apiService.updateStudentStatus(student.id, newStatus);
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, accountStatus: newStatus } : s));
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const isPasswordVisible = (studentId: string) => {
    return showAllPasswords || !!visiblePasswordMap[studentId];
  };

  const togglePasswordVisibility = (studentId: string) => {
    setVisiblePasswordMap(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const copyPassword = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenResetPassword = (student: any) => {
    setResetModalStudent(student);
    // Pre-populate with student's current password so admin can easily edit, or generate a fresh PIN
    setNewTempPassword(student.rawPassword || '12345');
    setResetSuccessMessage(null);
  };

  const handleExecuteResetPassword = async () => {
    if (!resetModalStudent) return;
    const passToSet = newTempPassword.trim();
    if (!passToSet) {
      alert('Please enter a password.');
      return;
    }
    setIsResetting(true);
    try {
      const res = await apiService.resetPassword(resetModalStudent.id, passToSet);
      setIsResetting(false);
      setResetSuccessMessage(res.message || 'Password updated successfully!');
      // Update in local state immediately with new password
      setStudents(prev => prev.map(s => 
        (s.id === resetModalStudent.id || s.studentId === resetModalStudent.studentId)
          ? { ...s, rawPassword: passToSet } 
          : s
      ));
      // Auto-reveal for this student so admin sees the updated password right away
      setVisiblePasswordMap(prev => ({ ...prev, [resetModalStudent.id]: true }));
    } catch (err: any) {
      setIsResetting(false);
      alert(`Error resetting password: ${err.message}`);
    }
  };

  const handleOpenEditCourse = (student: any) => {
    setEditCourseModalStudent(student);
    const isGt = student.courseType === 'ielts_general' || Boolean(student.course && student.course.toLowerCase().includes('general'));
    const isPte = student.courseType === 'pte_academic' || Boolean(student.course && student.course.toLowerCase().includes('pte'));
    const initialCourse = isGt ? 'CD-IELTS General Training' : isPte ? 'PTE Academic' : 'CD-IELTS Academic';
    
    setSelectedCourseForEdit(initialCourse);
    setSelectedBatchForEdit(student.batch || (isGt ? 'CD-IELTS_General_Training_default' : isPte ? 'PTE_Target_79_default' : 'CD-IELTS_Academic_default'));
    setSelectedPackForEdit(student.pack || '');
    setCourseEditSuccessMessage(null);
  };

  const handleExecuteSaveCourseEdit = async () => {
    if (!editCourseModalStudent) return;
    setIsSavingCourseEdit(true);
    try {
      const isGt = selectedCourseForEdit === 'CD-IELTS General Training';
      const isPte = selectedCourseForEdit === 'PTE Academic';
      const courseType = isGt ? 'ielts_general' : isPte ? 'pte_academic' : 'ielts_academic';
      const defaultPack = isGt 
        ? 'CD-IELTS GT Pay Per Use 30 Mock & 150 Practice Tests(Demo)' 
        : isPte 
          ? 'PTE Academic 79+ Intensive Full Pack' 
          : 'CD-IELTS AC Pay Per Use 30 Mock & 150 Practice Tests(Demo)';
      const finalPack = selectedPackForEdit.trim() || defaultPack;

      await apiService.updateStudent(editCourseModalStudent.id, {
        course: selectedCourseForEdit,
        courseType,
        batch: selectedBatchForEdit,
        pack: finalPack
      });

      setStudents(prev => prev.map(s => {
        if (s.id === editCourseModalStudent.id || s.studentId === editCourseModalStudent.studentId) {
          return {
            ...s,
            course: selectedCourseForEdit,
            courseType,
            batch: selectedBatchForEdit,
            pack: finalPack
          };
        }
        return s;
      }));

      setIsSavingCourseEdit(false);
      setCourseEditSuccessMessage(`Candidate exam category successfully updated to ${selectedCourseForEdit}!`);
      setTimeout(() => {
        setEditCourseModalStudent(null);
        setCourseEditSuccessMessage(null);
      }, 1600);
    } catch (err: any) {
      setIsSavingCourseEdit(false);
      alert(`Error updating student course category: ${err.message}`);
    }
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesStatus = statusFilter === 'All' || s.accountStatus === statusFilter;
    
    let matchesProgram = true;
    if (programFilter === 'All') {
      matchesProgram = true;
    } else if (programFilter === 'CD-IELTS Academic') {
      matchesProgram = s.courseType === 'ielts_academic' || s.course === 'CD-IELTS Academic' || (s.course === 'CD-IELTS' && (!s.courseType || s.courseType === 'ielts_academic'));
    } else if (programFilter === 'CD-IELTS General Training') {
      matchesProgram = s.courseType === 'ielts_general' || s.course === 'CD-IELTS General Training' || Boolean(s.course && s.course.toLowerCase().includes('general'));
    } else if (programFilter === 'PTE') {
      matchesProgram = s.courseType === 'pte_academic' || Boolean(s.course && s.course.toLowerCase().includes('pte'));
    } else {
      matchesProgram = (s.course && s.course.toLowerCase().includes(programFilter.toLowerCase())) ||
        (s.courseType && s.courseType.toLowerCase().includes(programFilter.toLowerCase()));
    }

    const matchesBatch = batchFilter === 'All' || s.batch === batchFilter;
    const matchesSearch = !searchQuery.trim() || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.studentId && s.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.username && s.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.contact && s.contact.includes(searchQuery));

    return matchesStatus && matchesProgram && matchesBatch && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header matching Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">View Students</h1>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-amber-700 font-semibold">View Students</span>
          </div>
        </div>

        <button
          onClick={onOpenEnrolmentForm}
          className="bg-[#1c2431] hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>ENROL STUDENT</span>
        </button>
      </div>

      {/* Filters Box matching Screenshot 3 */}
      <div className="bg-[#1c2431] text-white p-5 rounded-2xl border border-slate-700 shadow space-y-4 text-xs">
        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          <span>FILTERS:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          
          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">STATUS</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-white text-slate-900 text-xs px-3 py-2 rounded-full border border-slate-300 font-medium"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="All">All</option>
            </select>
          </div>

          {/* Program */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">PROGRAM</label>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs px-3 py-2 rounded-full border border-slate-300 font-medium"
            >
              <option value="All">--All Programs--</option>
              <option value="CD-IELTS Academic">CD-IELTS Academic</option>
              <option value="CD-IELTS General Training">CD-IELTS General Training</option>
              <option value="PTE">PTE Academic</option>
              <option value="CELPIP">CELPIP</option>
              <option value="Spoken">Spoken English</option>
              <option value="Computer">Computer Courses</option>
            </select>
          </div>

          {/* Batch */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">BATCH</label>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs px-3 py-2 rounded-full border border-slate-300 font-medium"
            >
              <option value="All">--All Batches--</option>
              <option value="CD-IELTS_Academic_default">CD-IELTS_Academic_default</option>
              <option value="CD-IELTS_General_Training_default">CD-IELTS_General_Training_default</option>
              <option value="Morning IELTS Master 7.5+">Morning IELTS Master 7.5+</option>
              <option value="General Training Fast-track">General Training Fast-track</option>
              <option value="PTE_Target_79_default">PTE_Target_79_default</option>
              <option value="Evening PTE Intensive">Evening PTE Intensive</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">SEARCH CANDIDATES</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by student name, ID (e.g. CR39), username or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-slate-900 text-xs px-4 py-2 pl-9 rounded-full border border-slate-300 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

        </div>
      </div>

      {/* Students Data Table matching Screenshot 3 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#1c2431] text-white font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Enrolled Date<br /><span className="text-[10px] font-normal text-slate-400">Course Start Date</span></th>
                <th className="py-3 px-3">Student ID</th>
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">
                  Contact<br />
                  <div className="flex items-center gap-1.5 text-[10px] font-normal text-slate-400 normal-case">
                    <span>Username / Pass</span>
                    <button
                      type="button"
                      onClick={() => setShowAllPasswords(prev => !prev)}
                      title={showAllPasswords ? "Hide all passwords" : "Show all passwords"}
                      className="text-amber-400 hover:text-white underline font-semibold flex items-center gap-0.5 ml-1"
                    >
                      {showAllPasswords ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                      <span>{showAllPasswords ? 'Hide All' : 'Show All'}</span>
                    </button>
                  </div>
                </th>
                <th className="py-3 px-3">Course & Pack</th>
                <th className="py-3 px-3">Batch</th>
                <th className="py-3 px-3">Fee</th>
                <th className="py-3 px-3">Discount</th>
                <th className="py-3 px-3 text-center">Status / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                  
                  {/* Dates */}
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                    <div className="font-semibold text-slate-800">{student.enrolmentDate}</div>
                    <div className="text-[10px] text-slate-400">{student.courseStartDate || student.enrolmentDate}</div>
                  </td>

                  {/* Student ID */}
                  <td className="py-3 px-3">
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono text-xs">
                      {student.studentId || 'N/A'}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{student.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{student.gender} • {student.dob || ''}</div>
                  </td>

                  {/* Contact / Username / Password */}
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div className="text-slate-800 font-semibold">{student.contact}</div>
                    <div className="text-sky-700 font-bold flex items-center gap-1">
                      <span>{student.username}</span>
                      {student.aliasUsername && student.aliasUsername !== student.username && (
                        <span className="text-[10px] text-slate-400 font-normal">({student.aliasUsername})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 select-text">
                      <span className="text-slate-400 text-[10px] font-sans">Pass:</span>
                      <span className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded border ${
                        isPasswordVisible(student.id) 
                          ? 'bg-amber-50 text-amber-900 border-amber-300' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {isPasswordVisible(student.id) ? (student.rawPassword || '12345') : '••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(student.id)}
                        title={isPasswordVisible(student.id) ? "Hide Password" : "Show Password"}
                        className="text-slate-400 hover:text-slate-800 p-0.5 rounded transition"
                      >
                        {isPasswordVisible(student.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyPassword(student.rawPassword || '12345', student.id)}
                        title="Copy Password"
                        className="text-slate-400 hover:text-slate-800 p-0.5 rounded transition"
                      >
                        {copiedId === student.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>

                  {/* Course & Pack */}
                  <td className="py-3 px-3 max-w-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        student.courseType === 'ielts_general' || (student.course && student.course.includes('General'))
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : student.courseType === 'pte_academic' || (student.course && student.course.includes('PTE'))
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        {student.courseType === 'ielts_general' || (student.course && student.course.includes('General'))
                          ? 'CD-IELTS General Training'
                          : student.courseType === 'pte_academic' || (student.course && student.course.includes('PTE'))
                            ? 'PTE Academic'
                            : 'CD-IELTS Academic'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-2 leading-tight mt-1">
                      {student.pack || 'CD-IELTS Standard Pack'}
                    </div>
                  </td>

                  {/* Batch */}
                  <td className="py-3 px-3">
                    <span className="text-[11px] text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {student.batch || 'Default'}
                    </span>
                  </td>

                  {/* Fee */}
                  <td className="py-3 px-3 font-bold text-slate-900">
                    ₹{student.fee !== undefined ? student.fee : 1}
                  </td>

                  {/* Discount */}
                  <td className="py-3 px-3 text-slate-500">
                    ₹{student.discount || 0}
                  </td>

                  {/* Status Toggle & Actions matching Screenshot 3 */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Active / Inactive Toggle Switch */}
                      <button
                        onClick={() => handleToggleStatus(student)}
                        title={student.accountStatus === 'Active' ? 'Click to Deactivate' : 'Click to Activate'}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          student.accountStatus === 'Active' ? 'bg-sky-500' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                          student.accountStatus === 'Active' ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>

                      {/* Edit Exam Category / Course */}
                      <button
                        onClick={() => handleOpenEditCourse(student)}
                        title="Edit Student Exam Category (Academic vs General Training)"
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Reset Credentials button */}
                      <button
                        onClick={() => handleOpenResetPassword(student)}
                        title="Reset Student Password"
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>

                      {/* View Student Tests */}
                      {onViewStudentSubmissions && (
                        <button
                          onClick={() => onViewStudentSubmissions(student.studentId || student.id)}
                          title="View Test Attempts"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="text-[9px] font-bold uppercase mt-1 text-slate-400">
                      {student.accountStatus}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-400 text-xs">
                    No enrolled students found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESET PASSWORD MODAL */}
      {resetModalStudent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-auto"
          onClick={() => {
            if (!isResetting) setResetModalStudent(null);
          }}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 select-text"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 text-sm">Change Student Password</h3>
                <p className="text-xs text-slate-500 truncate">
                  {resetModalStudent.name} (ID: {resetModalStudent.studentId || resetModalStudent.id})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetModalStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {resetSuccessMessage ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Password Changed Successfully!</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 font-mono space-y-1.5">
                  <div className="text-slate-600 text-[11px]">Candidate: <strong className="text-slate-900">{resetModalStudent.name}</strong></div>
                  <div className="text-slate-600 text-[11px]">Username: <strong className="text-sky-700">{resetModalStudent.username}</strong></div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                    <span className="text-[11px] text-slate-700">New Password: <strong className="text-emerald-700 font-bold text-sm ml-1">{newTempPassword}</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(newTempPassword);
                        setCopiedPass(true);
                        setTimeout(() => setCopiedPass(false), 2000);
                      }}
                      className="text-slate-600 hover:text-black p-1 px-2 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 text-[11px] font-sans font-medium transition"
                    >
                      {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setResetModalStudent(null)}
                  className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs transition"
                >
                  Close & Done
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="student-password-input" className="block text-slate-800 font-bold">
                      New Password
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Current: <strong>{resetModalStudent.rawPassword || '12345'}</strong>
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="student-password-input"
                      name="newPassword"
                      type="text"
                      autoFocus
                      value={newTempPassword}
                      onChange={(e) => setNewTempPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleExecuteResetPassword();
                        }
                      }}
                      placeholder="Type custom password here..."
                      className="w-full text-sm font-mono px-3.5 py-2.5 bg-white text-slate-900 border-2 border-amber-300 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none font-bold select-text"
                    />
                    {newTempPassword && (
                      <button
                        type="button"
                        onClick={() => setNewTempPassword('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 text-xs px-1.5 py-0.5 rounded bg-slate-100"
                        title="Clear"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Click the box above to type any password, or pick one of the quick options below:
                  </p>
                </div>

                {/* Quick preset chips */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Quick Options:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {resetModalStudent.contact && resetModalStudent.contact !== 'N/A' && (
                      <button
                        type="button"
                        onClick={() => {
                          const prefix = resetModalStudent.course === 'PTE Academic' ? 'pte' : 'cdi';
                          const cleanDigits = resetModalStudent.contact.replace(/\D/g, '').slice(-5);
                          setNewTempPassword(`${prefix}${cleanDigits || '70906'}`);
                        }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                      >
                        ⚡ Course PIN: {resetModalStudent.course === 'PTE Academic' ? 'pte' : 'cdi'}{resetModalStudent.contact.replace(/\D/g, '').slice(-5) || '70906'}
                      </button>
                    )}
                    {resetModalStudent.contact && resetModalStudent.contact !== 'N/A' && (
                      <button
                        type="button"
                        onClick={() => setNewTempPassword(resetModalStudent.contact.replace(/\D/g, '').slice(-10))}
                        className="px-2.5 py-1 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-800 border border-slate-300 rounded-lg text-[11px] font-medium transition"
                      >
                        📱 Clean Mobile ({resetModalStudent.contact.replace(/\D/g, '').slice(-10)})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setNewTempPassword(String(Math.floor(10000 + Math.random() * 90000)))}
                      className="px-2.5 py-1 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-800 border border-slate-300 rounded-lg text-[11px] font-medium transition"
                    >
                      🎲 Random 5-Digit PIN
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTempPassword('12345')}
                      className="px-2.5 py-1 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-800 border border-slate-300 rounded-lg text-[11px] font-medium transition"
                    >
                      🔑 Default: 12345
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setResetModalStudent(null)}
                    disabled={isResetting}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteResetPassword}
                    disabled={isResetting || !newTempPassword.trim()}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow transition flex items-center gap-1.5 active:scale-95"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{isResetting ? 'Saving...' : 'Save & Update Password'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Edit Student Course & Exam Category Modal (Academic vs General Training) */}
      {editCourseModalStudent && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Correct Student Exam Category</h3>
                  <p className="text-[11px] text-slate-500">
                    Switch student between IELTS Academic, General Training (GT) or PTE
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditCourseModalStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {courseEditSuccessMessage ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{courseEditSuccessMessage}</span>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Candidate Info Box */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-slate-800">
                    <span className="font-bold text-sm text-slate-900">{editCourseModalStudent.name}</span>
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      ID: {editCourseModalStudent.studentId || editCourseModalStudent.id}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Username: <span className="text-slate-800 font-bold">{editCourseModalStudent.username}</span> • Contact: {editCourseModalStudent.contact}
                  </div>
                </div>

                {/* Course Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Target Exam Category & Course:
                  </label>
                  <div className="space-y-2">
                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      selectedCourseForEdit === 'CD-IELTS Academic' 
                        ? 'bg-amber-500/10 border-amber-500 text-slate-900 ring-1 ring-amber-400' 
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}>
                      <input 
                        type="radio" 
                        name="edit_course" 
                        value="CD-IELTS Academic"
                        checked={selectedCourseForEdit === 'CD-IELTS Academic'}
                        onChange={() => {
                          setSelectedCourseForEdit('CD-IELTS Academic');
                          setSelectedBatchForEdit('CD-IELTS_Academic_default');
                          setSelectedPackForEdit('CD-IELTS AC Pay Per Use 30 Mock & 150 Practice Tests(Demo)');
                        }}
                        className="mt-0.5 accent-amber-500"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900">CD-IELTS Academic</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Student sees <strong>Academic Reading</strong> (3 Academic Passages) & <strong>Academic Writing</strong> (Task 1 Report & Task 2 Essay).
                        </p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      selectedCourseForEdit === 'CD-IELTS General Training' 
                        ? 'bg-emerald-500/10 border-emerald-500 text-slate-900 ring-1 ring-emerald-400' 
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}>
                      <input 
                        type="radio" 
                        name="edit_course" 
                        value="CD-IELTS General Training"
                        checked={selectedCourseForEdit === 'CD-IELTS General Training'}
                        onChange={() => {
                          setSelectedCourseForEdit('CD-IELTS General Training');
                          setSelectedBatchForEdit('CD-IELTS_General_Training_default');
                          setSelectedPackForEdit('CD-IELTS GT Pay Per Use 30 Mock & 150 Practice Tests(Demo)');
                        }}
                        className="mt-0.5 accent-emerald-600"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900">CD-IELTS General Training (GT)</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Student sees <strong>General Training Reading</strong> (Sections 1, 2, 3) & <strong>GT Writing</strong> (Task 1 Letter & Task 2 Essay). Band calculated with General Training formula.
                        </p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      selectedCourseForEdit === 'PTE Academic' 
                        ? 'bg-purple-500/10 border-purple-500 text-slate-900 ring-1 ring-purple-400' 
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}>
                      <input 
                        type="radio" 
                        name="edit_course" 
                        value="PTE Academic"
                        checked={selectedCourseForEdit === 'PTE Academic'}
                        onChange={() => {
                          setSelectedCourseForEdit('PTE Academic');
                          setSelectedBatchForEdit('PTE_Target_79_default');
                          setSelectedPackForEdit('PTE Academic 79+ Intensive Full Pack');
                        }}
                        className="mt-0.5 accent-purple-600"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900">PTE Academic</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Student sees Pearson PTE Simulation Engine & AI Scored PTE modules.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Batch Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Assigned Batch:</label>
                  <select
                    value={selectedBatchForEdit}
                    onChange={(e) => setSelectedBatchForEdit(e.target.value)}
                    className="w-full bg-white text-slate-900 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="CD-IELTS_Academic_default">CD-IELTS_Academic_default</option>
                    <option value="CD-IELTS_General_Training_default">CD-IELTS_General_Training_default</option>
                    <option value="Morning IELTS Master 7.5+">Morning IELTS Master 7.5+</option>
                    <option value="General Training Fast-track">General Training Fast-track</option>
                    <option value="PTE_Target_79_default">PTE_Target_79_default</option>
                    <option value="Evening PTE Intensive">Evening PTE Intensive</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditCourseModalStudent(null)}
                    disabled={isSavingCourseEdit}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteSaveCourseEdit}
                    disabled={isSavingCourseEdit}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isSavingCourseEdit ? 'Updating Category...' : 'Save Category Changes'}</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
