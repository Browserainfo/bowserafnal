/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserRole, TestSubmission, ExamModule } from './types';
import { apiService } from './services/apiService';
import { Header } from './components/common/Header';
import { LoginPage } from './components/auth/LoginPage';
import { LandingPage } from './components/landing/LandingPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { CdIeltsExamSimulator } from './components/exam/CdIeltsExamSimulator';
import { PteExamSimulator } from './components/exam/PteExamSimulator';
import { MistakeAnalysisModal } from './components/student/MistakeAnalysisModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Full-screen Exam Modes
  const [activeExamView, setActiveExamView] = useState<'none' | 'cd_ielts' | 'pte'>('none');
  const [examInitialModule, setExamInitialModule] = useState<ExamModule>('reading');
  const [examActiveTestId, setExamActiveTestId] = useState<string | undefined>(undefined);

  // Active Mistake Analysis Modal
  const [activeAnalysisSubmission, setActiveAnalysisSubmission] = useState<any | null>(null);

  // Check persistent authentication on initial mount
  useEffect(() => {
    async function verifyAuth() {
      try {
        const user = await apiService.getMe();
        if (user) {
          setCurrentUser(user);
          // Auto open dashboard if already authenticated
          setCurrentView('dashboard');
        }
      } catch (err) {
        console.warn('Session check notice:', err);
      } finally {
        setIsAuthChecking(false);
      }
    }
    verifyAuth();
  }, []);

  // Dynamic SEO Title and Robots noindex management for private/public views
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }

    if (activeExamView !== 'none') {
      document.title = 'Live Exam Session – BrowseraIELTS Official Simulator';
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else if (currentView === 'login') {
      document.title = 'Candidate & Faculty Sign In – BrowseraIELTS';
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else if (currentView === 'dashboard' && currentUser) {
      const roleName = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
      document.title = `${roleName} Portal – BrowseraIELTS Administration`;
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else {
      document.title = 'BrowseraIELTS – Computer-Delivered IELTS & PTE Academic Exam Preparation Lab';
      robotsMeta.setAttribute('content', 'index, follow');
    }
  }, [currentView, activeExamView, currentUser]);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    await apiService.logout();
    setCurrentUser(null);
    setCurrentView('landing');
    setActiveExamView('none');
  };

  const handleLaunchCdIelts = (module: ExamModule = 'reading', testId?: string) => {
    setExamInitialModule(module);
    setExamActiveTestId(testId);
    setActiveExamView('cd_ielts');
  };

  const handleLaunchPte = (testId?: string) => {
    setExamActiveTestId(testId);
    setActiveExamView('pte');
  };

  const handleTestCompleted = (submission: any) => {
    setActiveExamView('none');
    setActiveAnalysisSubmission(submission);
  };

  // If user is accessing full-screen exam mode
  if (activeExamView === 'cd_ielts') {
    return (
      <CdIeltsExamSimulator
        currentUser={currentUser || { name: 'Demo Candidate', candidateNumber: 'CR38', id: 'CR38' }}
        initialModule={examInitialModule}
        testId={examActiveTestId}
        onExit={() => setActiveExamView('none')}
        onTestCompleted={handleTestCompleted}
      />
    );
  }

  if (activeExamView === 'pte') {
    return (
      <PteExamSimulator
        currentUser={currentUser || { name: 'Demo Candidate', candidateNumber: 'CR38', id: 'CR38' }}
        testId={examActiveTestId}
        onExit={() => setActiveExamView('none')}
        onCompleted={handleTestCompleted}
      />
    );
  }

  // If user is on the dedicated Shared Login Page matching Screenshot 1
  if (currentView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onBackToHome={() => setCurrentView('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Navigation Header */}
      <Header
        currentUser={currentUser}
        currentRole={currentView === 'landing' ? 'landing' : (currentUser ? currentUser.role : 'landing')}
        onNavigateHome={() => setCurrentView('landing')}
        onOpenLoginPage={() => setCurrentView('login')}
        onNavigateDashboard={() => setCurrentView('dashboard')}
        onLogout={handleLogout}
        onLaunchCdIelts={() => handleLaunchCdIelts('reading')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Landing Page (Public View) */}
        {currentView === 'landing' && (
          <LandingPage
            onNavigateRole={(role) => {
              if (currentUser) {
                setCurrentView('dashboard');
              } else {
                setCurrentView('login');
              }
            }}
            onLaunchCdIelts={() => handleLaunchCdIelts('reading')}
            onLaunchPte={handleLaunchPte}
          />
        )}

        {/* Authenticated Dashboard View (Enforces Server-Side Access Control) */}
        {currentView === 'dashboard' && currentUser && (
          <>
            {currentUser.role === 'admin' && (
              <AdminDashboard
                currentUser={currentUser}
                onOpenSubmissionAnalysis={(sub) => setActiveAnalysisSubmission(sub)}
                onLaunchCdIelts={handleLaunchCdIelts}
                onLaunchPte={handleLaunchPte}
              />
            )}

            {currentUser.role === 'teacher' && (
              <TeacherDashboard
                currentTeacher={currentUser}
                onOpenSubmissionModal={(sub) => setActiveAnalysisSubmission(sub)}
              />
            )}

            {currentUser.role === 'student' && (
              <StudentDashboard
                currentUser={currentUser}
                onLaunchCdIelts={handleLaunchCdIelts}
                onLaunchPte={handleLaunchPte}
                onOpenMistakeAnalysis={(sub) => setActiveAnalysisSubmission(sub)}
              />
            )}
          </>
        )}

        {/* If user clicked dashboard but not logged in, prompt sign in */}
        {currentView === 'dashboard' && !currentUser && (
          <div className="p-8 text-center max-w-md mx-auto space-y-4 my-12">
            <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
            <p className="text-xs text-slate-600">Please sign in to access your institutional dashboard.</p>
            <button
              onClick={() => setCurrentView('login')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow"
            >
              Go to Sign In
            </button>
          </div>
        )}

      </main>

      {/* Detailed Mistake Analysis Modal */}
      <MistakeAnalysisModal
        submission={activeAnalysisSubmission}
        onClose={() => setActiveAnalysisSubmission(null)}
      />

    </div>
  );
}
