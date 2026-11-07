/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, Mail, Shield, GraduationCap, UserCheck, CheckCircle2 } from 'lucide-react';
import { User, UserRole } from '../../types';
import { DataService } from '../../services/dataService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const users = DataService.getUsers();
  const demoUsersForRole = users.filter(u => u.role === selectedRole);

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const matched = users.find(
      u => u.role === selectedRole && (u.email.toLowerCase() === email.toLowerCase() || email === '')
    );

    if (matched) {
      onLoginSuccess(matched);
      onClose();
    } else {
      // Default to first user in role if test login
      const fallback = users.find(u => u.role === selectedRole);
      if (fallback) {
        onLoginSuccess(fallback);
        onClose();
      } else {
        setError('Invalid credentials or no profile found for this role.');
      }
    }
  };

  const handleQuickDemoLogin = (user: User) => {
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Browsera Infotech Portal</span>
          </div>
          <h2 className="text-xl font-bold text-white">Sign In to BrowseraIELTS</h2>
          <p className="text-xs text-slate-400 mt-1">Select your account profile or enter institutional credentials</p>

          {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-xl mt-4 border border-slate-700">
            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                selectedRole === 'student'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('teacher')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                selectedRole === 'teacher'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Teacher
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                selectedRole === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>
        </div>

        {/* Content & Quick demo login list */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Instant Demo Access ({selectedRole.toUpperCase()} Profiles)
            </label>
            <div className="space-y-2">
              {demoUsersForRole.map(user => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(user)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 group-hover:border-amber-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800">{user.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {user.candidateNumber || user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                    <span>Login</span>
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-medium uppercase">Or Custom Sign-In</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-3">
            {error && (
              <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Institutional Email or Candidate ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={`e.g. ${demoUsersForRole[0]?.email || 'user@browsera.com'}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs shadow transition flex items-center justify-center gap-1.5"
            >
              <span>Continue to {selectedRole.toUpperCase()} Dashboard</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
