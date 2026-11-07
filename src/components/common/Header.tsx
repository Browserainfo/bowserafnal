/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  GraduationCap, 
  Shield, 
  UserCheck, 
  Award, 
  LogOut, 
  LogIn, 
  Menu, 
  X,
  Play,
  Home,
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  currentUser: any | null;
  currentRole: string;
  onNavigateHome: () => void;
  onOpenLoginPage: () => void;
  onNavigateDashboard: () => void;
  onLogout: () => void;
  onLaunchCdIelts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentRole,
  onNavigateHome,
  onOpenLoginPage,
  onNavigateDashboard,
  onLogout,
  onLaunchCdIelts
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={onNavigateHome} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">Browsera<span className="text-amber-400">IELTS</span></span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded border border-amber-400/30">Official Lab</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 -mt-0.5 font-medium">Browsera Infotech</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={onNavigateHome}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentRole === 'landing' 
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Institute Home</span>
            </button>

            {currentUser && (
              <button
                onClick={onNavigateDashboard}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  currentRole !== 'landing' 
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {currentUser.role === 'admin' && <Shield className="w-3.5 h-3.5" />}
                {currentUser.role === 'teacher' && <UserCheck className="w-3.5 h-3.5" />}
                {currentUser.role === 'student' && <GraduationCap className="w-3.5 h-3.5" />}
                <span className="capitalize">{currentUser.role} Portal</span>
              </button>
            )}
          </nav>

          {/* Action buttons & User profile (Desktop & Tablet) */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <button
              onClick={onLaunchCdIelts}
              className="flex items-center gap-1.5 lg:gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3 lg:px-3.5 py-2 rounded-lg text-xs shadow-md transition-all active:scale-95 whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span><span className="hidden xl:inline">Launch </span>CD-IELTS Exam</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-3 border-l border-slate-700">
                <img 
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-full border border-amber-500/40 object-cover"
                />
                <div className="text-left text-xs hidden sm:block">
                  <div className="font-semibold text-slate-100 line-clamp-1 max-w-[120px]">{currentUser.name}</div>
                  <div className="text-[10px] text-amber-400 font-medium capitalize flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {currentUser.role} {currentUser.studentId ? `(${currentUser.studentId})` : ''}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginPage}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 px-3.5 lg:px-4 py-2 rounded-lg text-xs font-bold border border-slate-700 transition whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>SIGN IN</span>
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onLaunchCdIelts}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm"
            >
              CD-IELTS
            </button>
            {!currentUser && (
              <button
                onClick={onOpenLoginPage}
                className="bg-slate-800 text-amber-400 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-3 pb-5 space-y-2 text-xs">
          <button
            onClick={() => { onNavigateHome(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-slate-200 hover:bg-slate-800 flex items-center gap-2 font-medium"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>Institute Homepage</span>
          </button>

          <button
            onClick={() => { onLaunchCdIelts(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-slate-200 hover:bg-slate-800 flex items-center gap-2 font-medium"
          >
            <Play className="w-4 h-4 text-amber-400" />
            <span>Launch CD-IELTS Mock Simulator</span>
          </button>
          
          {currentUser ? (
            <>
              <button
                onClick={() => { onNavigateDashboard(); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded-lg text-amber-400 font-bold bg-slate-800/60 flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>Go to {currentUser.role.toUpperCase()} Dashboard</span>
              </button>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Signed in as {currentUser.name}</span>
                <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="text-red-400 font-bold hover:underline">
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => { onOpenLoginPage(); setMobileMenuOpen(false); }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-2.5 rounded-xl font-bold text-center mt-2 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>SIGN IN TO STUDENT / FACULTY PORTAL</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
