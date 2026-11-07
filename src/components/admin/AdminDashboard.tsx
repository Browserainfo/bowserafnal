/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  BookOpen, 
  UserCheck, 
  BarChart3, 
  HelpCircle, 
  Bell, 
  Headphones, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Search, 
  Wallet, 
  Megaphone, 
  PieChart, 
  Calendar,
  Layers,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { StudentManagementView } from './StudentManagementView';
import { StudentEnrolmentForm } from './StudentEnrolmentForm';
import { AssignTestView } from './AssignTestView';
import { apiService } from '../../services/apiService';

interface AdminDashboardProps {
  currentUser?: any;
  onOpenSubmissionAnalysis?: (submission: any) => void;
  onLaunchCdIelts?: (module?: any, testId?: string) => void;
  onLaunchPte?: (testId?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onOpenSubmissionAnalysis,
  onLaunchCdIelts,
  onLaunchPte
}) => {
  // Navigation sidebar route
  const [activeRoute, setActiveRoute] = useState<
    'dashboard' | 'view_students' | 'enrol_student' | 'assign_cd_ielts' | 'assign_pte' | 'test_library' | 'reports' | 'system'
  >('dashboard');

  // Sidebar expanded sections
  const [studentsMenuOpen, setStudentsMenuOpen] = useState(true);
  const [programsMenuOpen, setProgramsMenuOpen] = useState(true);

  // Test Library Filters
  const [testFilterCourse, setTestFilterCourse] = useState<'all' | 'CD-IELTS' | 'PTE Academic'>('all');
  const [testFilterType, setTestFilterType] = useState<'all' | 'practice' | 'mock'>('all');
  const [testFilterModule, setTestFilterModule] = useState<string>('all');
  const [testSearchQuery, setTestSearchQuery] = useState<string>('');

  // Live data stats
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [stData, asgData, subData, tData] = await Promise.all([
        apiService.getStudents(),
        apiService.getAssignments(),
        apiService.getSubmissions(),
        apiService.getTests()
      ]);
      setStudents(Array.isArray(stData) ? stData : []);
      setAssignments(Array.isArray(asgData) ? asgData : []);
      setSubmissions(Array.isArray(subData) ? subData : []);
      setTests(Array.isArray(tData) ? tData : []);
      setIsLoading(false);
    } catch (e) {
      console.warn('Notice loading admin data:', e);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeRoute]);

  const activeStudentsCount = students.filter(s => s.accountStatus === 'Active').length;
  const totalFeesCollected = students.reduce((acc, curr) => acc + (Number(curr.fee) || 0) - (Number(curr.discount) || 0), 0);

  return (
    <div className="min-h-screen bg-[#151b26] text-white flex flex-col font-sans">
      
      {/* Top Header matching Screenshot 2 */}
      <header className="bg-[#1c2431] border-b border-slate-700/80 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow sticky top-0 z-30">
        
        {/* Left: Institute Lab Identifier */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/20">
            Official CD-IELTS & PTE Lab • Banur Campus
          </span>
        </div>

        {/* Center / Right Toolbar matching Screenshot 2 */}
        <div className="flex items-center gap-4 text-xs">
          
          {/* Branch Dropdown */}
          <div className="hidden md:flex items-center bg-white text-slate-800 rounded-full px-4 py-1.5 border border-slate-300 font-semibold shadow-inner">
            <span>Browsera Ielts,Banur</span>
            <ChevronDown className="w-3.5 h-3.5 ml-2 text-slate-500" />
          </div>

          {/* Support Headset */}
          <button 
            title="Help Desk & Support"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-sky-400 transition"
          >
            <Headphones className="w-4 h-4" />
          </button>

          {/* Notification Bell with Badge 0 */}
          <button 
            title="Notifications"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 relative transition"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-500 text-white font-bold text-[9px] flex items-center justify-center">
              0
            </span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
              alt="Admin"
              className="w-8 h-8 rounded-full object-cover border border-amber-400"
            />
            <div className="hidden lg:block text-left text-xs leading-tight">
              <div className="font-bold text-white">{currentUser?.name || 'Administrator'}</div>
              <div className="text-[10px] text-amber-400 font-semibold">Head Administrator</div>
            </div>
          </div>

        </div>
      </header>

      {/* Yellow Notification Ticker Bar matching Screenshot 2 */}
      <div className="bg-[#facc15] text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center gap-2 overflow-hidden shadow-inner">
        <span className="bg-slate-950 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">Update</span>
        <span className="truncate">Dear Partner, we're pleased to inform you that our CD-IELTS & PTE test engines and student portals are fully operational.</span>
      </div>

      {/* Main Layout: Sidebar (Left) + Body Content (Right) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar Navigation matching Screenshot 2 */}
        <aside className="w-64 bg-[#111722] border-r border-slate-800 flex flex-col justify-between overflow-y-auto select-none py-3 text-xs font-medium">
          <div className="space-y-1 px-3">
            
            {/* DEMO section label */}
            <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              MAIN NAVIGATION
            </div>

            {/* Dashboard Link */}
            <button
              onClick={() => setActiveRoute('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeRoute === 'dashboard'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* Students Expandable Menu matching Screenshot 2 & 3 */}
            <div className="space-y-0.5">
              <button
                onClick={() => setStudentsMenuOpen(!studentsMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold">Students</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${studentsMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {studentsMenuOpen && (
                <div className="pl-9 space-y-1 pt-0.5 text-[11px]">
                  <button
                    onClick={() => setActiveRoute('view_students')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                      activeRoute === 'view_students' ? 'text-amber-400 font-bold bg-slate-800' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ● View Students ({students.length})
                  </button>
                  <button
                    onClick={() => setActiveRoute('enrol_student')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                      activeRoute === 'enrol_student' ? 'text-amber-400 font-bold bg-slate-800' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ● Enrolment Form (+)
                  </button>
                </div>
              )}
            </div>

            {/* Programs Expandable Menu matching Screenshot 2 & 5 */}
            <div className="space-y-0.5">
              <button
                onClick={() => setProgramsMenuOpen(!programsMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">Programs</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${programsMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {programsMenuOpen && (
                <div className="pl-9 space-y-1 pt-0.5 text-[11px]">
                  <button
                    onClick={() => setActiveRoute('assign_cd_ielts')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                      activeRoute === 'assign_cd_ielts' ? 'text-amber-400 font-bold bg-slate-800' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ● CD-IELTS &gt; Assign Test
                  </button>
                  <button
                    onClick={() => setActiveRoute('assign_pte')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                      activeRoute === 'assign_pte' ? 'text-amber-400 font-bold bg-slate-800' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ● PTE Academic &gt; Assign Test
                  </button>
                  <button
                    onClick={() => setActiveRoute('test_library')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg transition ${
                      activeRoute === 'test_library' ? 'text-amber-400 font-bold bg-slate-800' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ● Test Library ({tests.length || 250} Tests)
                  </button>
                </div>
              )}
            </div>

            {/* Reports */}
            <button
              onClick={() => setActiveRoute('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeRoute === 'reports' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Results & Reports</span>
            </button>

            {/* System Architecture */}
            <button
              onClick={() => setActiveRoute('system')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeRoute === 'system' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 text-purple-400" />
              <span>Backend & Database DB</span>
            </button>

          </div>

          {/* Quick Launch CD-IELTS Exam link */}
          <div className="p-3">
            <button
              onClick={() => onLaunchCdIelts && onLaunchCdIelts('reading')}
              className="w-full bg-[#1c2431] hover:bg-slate-800 border border-amber-400/30 text-amber-400 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
            >
              <span>Test Simulator Lab</span>
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#151b26]">
          
          {/* VIEW: DASHBOARD (matching Screenshot 2) */}
          {activeRoute === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Top Row Cards matching Screenshot 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Today's Follow Ups */}
                <div className="bg-[#1c2431] p-4 rounded-2xl border border-slate-700/80 shadow relative flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-black text-white">0</div>
                    <div className="text-xs text-slate-400 font-bold mt-1">Today's Follow Ups</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Megaphone className="w-6 h-6" />
                  </div>
                </div>

                {/* Today's Fee Due */}
                <div className="bg-[#1c2431] p-4 rounded-2xl border border-slate-700/80 shadow relative flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-black text-white">₹0</div>
                    <div className="text-xs text-slate-400 font-bold mt-1">Today's Fee Due</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <Wallet className="w-6 h-6" />
                  </div>
                </div>

                {/* Active Student */}
                <div className="bg-[#1c2431] p-4 rounded-2xl border border-slate-700/80 shadow relative flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-black text-amber-400">{activeStudentsCount}</div>
                    <div className="text-xs text-slate-400 font-bold mt-1">Active Students</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                {/* Centre Performance */}
                <div className="bg-[#1c2431] p-4 rounded-2xl border border-slate-700/80 shadow relative flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-black text-emerald-400">96%</div>
                    <div className="text-xs text-slate-400 font-bold mt-1">Centre Performance</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <PieChart className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Second Row: Enrolment Chart & Metrics matching Screenshot 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Mini Widgets (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-[#1c2431] p-4 rounded-2xl border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">{students.length}</div>
                      <div className="text-xs text-slate-400">Total Registered Enrolments</div>
                    </div>
                    <Users className="w-5 h-5 text-amber-400" />
                  </div>

                  <div className="bg-[#1c2431] p-4 rounded-2xl border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-emerald-400">₹{totalFeesCollected.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">Total Net Fee Realization</div>
                    </div>
                    <Wallet className="w-5 h-5 text-emerald-400" />
                  </div>

                  <div className="bg-[#1c2431] p-4 rounded-2xl border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-sky-400">{assignments.length}</div>
                      <div className="text-xs text-slate-400">Tests Assigned in Last 7 Days</div>
                    </div>
                    <BookOpen className="w-5 h-5 text-sky-400" />
                  </div>
                </div>

                {/* Center / Right: TARGET V/S ENROLMENT CHART matching Screenshot 2 (8 cols) */}
                <div className="lg:col-span-8 bg-[#1c2431] p-6 rounded-2xl border border-slate-700/80 shadow space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      TARGET V/S ENROLMENT CHART
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Center: Banur Branch</span>
                  </div>

                  {/* Simulated Line Graphic from screenshot */}
                  <div className="h-48 flex flex-col justify-between py-2 text-xs font-mono text-slate-400 relative">
                    <div className="flex justify-between border-b border-slate-700/60 pb-1"><span>Target: 15</span><span>15</span></div>
                    <div className="flex justify-between border-b border-slate-700/60 pb-1"><span>Target: 10</span><span>10</span></div>
                    <div className="flex justify-between border-b border-slate-700/60 pb-1"><span>Target: 5</span><span>5</span></div>
                    
                    {/* Data Line */}
                    <div className="absolute inset-x-8 top-12 bottom-8 flex items-center">
                      <div className="w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-sky-400 rounded-full relative">
                        <div className="absolute left-1/4 -top-1.5 w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20"></div>
                        <div className="absolute left-2/4 -top-1.5 w-4 h-4 rounded-full bg-amber-400 ring-4 ring-amber-400/20"></div>
                        <div className="absolute left-3/4 -top-1.5 w-4 h-4 rounded-full bg-sky-400 ring-4 ring-sky-400/20"></div>
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-700">
                      <span>5th Oct</span>
                      <span>12th Oct</span>
                      <span>19th Oct</span>
                      <span>26th Oct</span>
                      <span>Current Date</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/80">
                    <span className="text-slate-400">Active Month: <strong className="text-white">Oct 2026</strong></span>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Target: 15
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Enrolled: {students.length}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Quick Actions Bar */}
              <div className="bg-[#1c2431] p-5 rounded-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs">
                  <div className="font-bold text-white">Direct Management Actions</div>
                  <div className="text-slate-400">Quickly enroll candidates or assign mock exams across batches</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveRoute('enrol_student')}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Enrol Student</span>
                  </button>
                  <button
                    onClick={() => setActiveRoute('assign_cd_ielts')}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                  >
                    <span>Assign CD-IELTS Test</span>
                  </button>
                  <button
                    onClick={() => setActiveRoute('assign_pte')}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                  >
                    <span>Assign PTE Test</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* VIEW: VIEW STUDENTS (Screenshot 3) */}
          {activeRoute === 'view_students' && (
            <StudentManagementView
              onOpenEnrolmentForm={() => setActiveRoute('enrol_student')}
              onViewStudentSubmissions={(studentId) => {
                setActiveRoute('reports');
              }}
            />
          )}

          {/* VIEW: ENROL STUDENT (Screenshot 4) */}
          {activeRoute === 'enrol_student' && (
            <StudentEnrolmentForm
              onSuccess={() => {
                setActiveRoute('view_students');
                loadData();
              }}
              onCancel={() => setActiveRoute('view_students')}
            />
          )}

          {/* VIEW: ASSIGN CD-IELTS TEST (Screenshot 5) */}
          {activeRoute === 'assign_cd_ielts' && (
            <AssignTestView initialCourse="CD-IELTS" />
          )}

          {/* VIEW: ASSIGN PTE TEST (Screenshot 5) */}
          {activeRoute === 'assign_pte' && (
            <AssignTestView initialCourse="PTE Academic" />
          )}

          {/* VIEW: TEST LIBRARY (250 Tests: 30 Practice + 20 Mock across IELTS & PTE) */}
          {activeRoute === 'test_library' && (() => {
            const filteredTests = tests.filter(t => {
              const matchesCourse = testFilterCourse === 'all' || t.courseType === testFilterCourse;
              const matchesType = testFilterType === 'all' || t.testType === testFilterType;
              const matchesModule = testFilterModule === 'all' || t.module.toLowerCase() === testFilterModule.toLowerCase();
              const matchesSearch = !testSearchQuery.trim() || 
                t.title.toLowerCase().includes(testSearchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(testSearchQuery.toLowerCase()) ||
                t.module.toLowerCase().includes(testSearchQuery.toLowerCase());
              return matchesCourse && matchesType && matchesModule && matchesSearch;
            });

            return (
              <div className="space-y-6">
                <div className="bg-white text-slate-900 p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Total {tests.length || 250} Curated Tests
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        Showing {filteredTests.length}
                      </span>
                    </div>
                    <h1 className="text-xl font-bold mt-1">Curated Test Library ({tests.length || 250} Complete Tests)</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      CD-IELTS (30 Practice + 20 Mock per module across Listening, Reading, Writing, Speaking) + PTE Academic (30 Practice + 20 Mock).
                    </p>
                  </div>

                  {/* Search input */}
                  <div className="w-full md:w-64">
                    <input
                      type="text"
                      placeholder="Search tests..."
                      value={testSearchQuery}
                      onChange={(e) => setTestSearchQuery(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-[#1c2431] border border-slate-700 p-4 rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">Course:</span>
                    {(['all', 'CD-IELTS', 'PTE Academic'] as const).map(c => (
                      <button
                        key={c}
                        onClick={() => setTestFilterCourse(c)}
                        className={`px-3 py-1 rounded-lg font-bold transition ${
                          testFilterCourse === c ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {c === 'all' ? 'All Courses' : c}
                      </button>
                    ))}

                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-4 mr-2">Category:</span>
                    {(['all', 'practice', 'mock'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setTestFilterType(type)}
                        className={`px-3 py-1 rounded-lg font-bold capitalize transition ${
                          testFilterType === type ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {type === 'all' ? 'All Types' : `${type} Tests`}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">Module:</span>
                    {['all', 'Reading', 'Listening', 'Writing', 'Speaking', 'Full Mock'].map(mod => (
                      <button
                        key={mod}
                        onClick={() => setTestFilterModule(mod)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                          testFilterModule.toLowerCase() === mod.toLowerCase()
                            ? 'bg-slate-200 text-slate-900 font-bold'
                            : 'bg-slate-800/80 text-slate-400 hover:text-white'
                        }`}
                      >
                        {mod === 'all' ? 'All Modules' : mod}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tests Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTests.map(test => (
                    <div key={test.id} className="bg-[#1c2431] border border-slate-700 p-4 rounded-xl space-y-2 text-xs hover:border-slate-500 transition">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          {test.courseType} • {test.module} • {test.testType.toUpperCase()}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">{test.durationMinutes} mins</span>
                      </div>
                      <h3 className="font-bold text-white text-sm">{test.title}</h3>
                      <p className="text-slate-400 text-[11px] line-clamp-2">{test.description}</p>
                      <div className="pt-2 flex justify-between items-center text-slate-400 border-t border-slate-800">
                        <span>Total Questions: {test.totalQuestions}</span>
                        <button
                          onClick={() => {
                            if (test.courseType === 'CD-IELTS' && onLaunchCdIelts) {
                              const mod = test.module.toLowerCase() === 'writing' ? 'writing'
                                : test.module.toLowerCase() === 'listening' ? 'listening'
                                : test.module.toLowerCase() === 'speaking' ? 'speaking'
                                : 'reading';
                              onLaunchCdIelts(mod, test.id);
                            } else if (test.courseType.includes('PTE') && onLaunchPte) {
                              onLaunchPte(test.id);
                            }
                          }}
                          className="text-amber-400 font-bold hover:underline"
                        >
                          Preview Test Interface &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredTests.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs bg-[#1c2431] rounded-xl border border-slate-700">
                    No tests match your selected filters. Adjust your criteria above.
                  </div>
                )}
              </div>
            );
          })()}

          {/* VIEW: REPORTS & TEST SUBMISSIONS */}
          {activeRoute === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white text-slate-900 p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h1 className="text-xl font-bold">Candidate Submissions & Mistake Analytics</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed exam attempts with question-by-question mistake breakdown and band calculations.
                </p>
              </div>

              <div className="bg-[#1c2431] rounded-2xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Test Title</th>
                      <th className="py-3 px-4">Module</th>
                      <th className="py-3 px-4">Score / Band</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4 text-right">Mistake Analysis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {submissions.map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-800/60">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{sub.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{sub.candidateNumber}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-200">{sub.testTitle}</td>
                        <td className="py-3 px-4 uppercase text-[10px] text-amber-400 font-bold">{sub.module}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">
                          {sub.overallBand ? `Band ${sub.overallBand}` : 'Scored'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{sub.submittedAt}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onOpenSubmissionAnalysis && onOpenSubmissionAnalysis(sub)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs"
                          >
                            Inspect Analysis
                          </button>
                        </td>
                      </tr>
                    ))}
                    {submissions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          No submissions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: SYSTEM & DATABASE ARCHITECTURE */}
          {activeRoute === 'system' && (
            <div className="bg-[#1c2431] p-6 rounded-2xl border border-slate-700 space-y-4 text-xs">
              <h2 className="text-base font-bold text-amber-400 uppercase">Persistent Database Architecture & Security Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-white">Database Engine:</span>
                  <div className="text-emerald-400 font-mono">Persistent JSON /data/browsera_db.json (ACID atomic write)</div>
                  <div className="text-slate-400">Survives server restarts, hot reloads, and browser refreshes completely.</div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-white">Credential Protection:</span>
                  <div className="text-emerald-400 font-mono">Scrypt 64-byte salt hashing (Zero plaintext password storage)</div>
                  <div className="text-slate-400">Session tokens verified with HTTP-only cookies on backend.</div>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
};
