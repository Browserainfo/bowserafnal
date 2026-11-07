/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserRole, User } from '../../types';
import { Shield, GraduationCap, UserCheck, RefreshCw, Sparkles, Home } from 'lucide-react';
import { DataService } from '../../services/dataService';

interface RoleSwitcherBannerProps {
  currentRole: UserRole | 'landing';
  currentUser: User | null;
  onSelectRole: (role: UserRole | 'landing', userOverride?: User) => void;
  onResetData: () => void;
}

export const RoleSwitcherBanner: React.FC<RoleSwitcherBannerProps> = ({
  currentRole,
  currentUser,
  onSelectRole,
  onResetData
}) => {
  const users = DataService.getUsers();
  const student = users.find(u => u.role === 'student');
  const teacher = users.find(u => u.role === 'teacher');
  const admin = users.find(u => u.role === 'admin');

  return (
    <aside aria-label="Demo Role Switcher" className="bg-slate-950 text-slate-300 py-1.5 px-4 text-xs border-b border-slate-800 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-semibold text-slate-200">Interactive Persona Preview:</span>
          <span className="text-slate-400 hidden sm:inline">Switch role instant view:</span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          <button
            onClick={() => onSelectRole('landing')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition ${
              currentRole === 'landing'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Home className="w-3 h-3" />
            Landing
          </button>

          <button
            onClick={() => onSelectRole('student', student)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition ${
              currentRole === 'student'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3 h-3 text-sky-400" />
            Student ({student?.name.split(' ')[0]})
          </button>

          <button
            onClick={() => onSelectRole('teacher', teacher)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition ${
              currentRole === 'teacher'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <UserCheck className="w-3 h-3 text-emerald-400" />
            Teacher ({teacher?.name.split(' ')[0]})
          </button>

          <button
            onClick={() => onSelectRole('admin', admin)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition ${
              currentRole === 'admin'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Shield className="w-3 h-3 text-amber-400" />
            Admin ({admin?.name.split(' ')[0]})
          </button>

          <button
            onClick={onResetData}
            title="Reset to fresh demo seeds"
            className="px-2 py-1 text-[11px] text-slate-400 hover:text-amber-400 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 transition flex items-center gap-1 ml-1"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span className="hidden md:inline">Reset Data</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
