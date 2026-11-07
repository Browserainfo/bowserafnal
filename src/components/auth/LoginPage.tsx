/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Eye, EyeOff, ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBackToHome
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoNotice(null);
    setIsLoading(true);

    try {
      const response = await apiService.login(username, password);
      setIsLoading(false);
      onLoginSuccess(response.user);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1b2432] relative flex flex-col justify-center items-center p-4 overflow-hidden select-none">
      
      {/* Background patterned watermark SVG icons as seen in screenshot */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none grid grid-cols-6 sm:grid-cols-10 gap-12 p-8 text-white">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {i % 4 === 0 && (
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            )}
            {i % 4 === 1 && (
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            )}
            {i % 4 === 2 && (
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            )}
            {i % 4 === 3 && (
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Top back button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={onBackToHome}
          className="text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1.5 rounded-lg border border-slate-700 backdrop-blur transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Institute Homepage</span>
        </button>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Logo Badge matching Screenshot_1 & User Request */}
        <div className="flex justify-center">
          <div className="bg-white px-6 py-2.5 rounded-md shadow-lg flex items-center justify-center min-w-[220px]">
            <img 
              src="/assets/aistudio/logo_f5d6d4f3.webp" 
              alt="Browsera" 
              className="h-11 sm:h-12 w-auto object-contain"
            />
          </div>
        </div>

        {/* Login White Card matching Screenshot_1 */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-100">
          
          <h2 className="text-center text-xl font-black text-slate-900 tracking-wide mb-6 uppercase">
            SIGN IN
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoNotice && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{infoNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username / Contact Field */}
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                placeholder="Mobile Number (e.g. 7087970906) or Student ID"
                className="w-full bg-[#fefce8] border border-amber-300/80 rounded-full px-5 py-3 text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
              <div className="absolute right-4 top-3.5 text-slate-500 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Password (e.g. cdi70906)"
                className="w-full bg-[#fefce8] border border-amber-300/80 rounded-full px-5 py-3 text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-800 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 accent-slate-900"
                />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => setInfoNotice('Please contact Browsera Administration (support@browsera.com) to reset your student or faculty credentials.')}
                className="text-slate-600 hover:text-slate-900 font-medium hover:underline"
              >
                Forgot Password
              </button>
            </div>

            {/* Sign In Button matching screenshot */}
            <div className="pt-3 flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="w-36 py-2.5 rounded-full border-2 border-slate-900 bg-white hover:bg-slate-900 text-slate-900 hover:text-white font-extrabold text-xs uppercase tracking-wider transition active:scale-95 shadow-sm disabled:opacity-50"
              >
                {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>
            </div>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-500 font-medium">
                💡 <span className="font-semibold text-slate-700">Student Sign In:</span> Enter your 10-digit mobile number as username and your course PIN (e.g. <span className="font-mono font-bold text-amber-700">cdi70906</span>).
              </p>
            </div>

          </form>

        </div>

      </div>

      {/* Footer watermark as seen in screenshot */}
      <div className="absolute bottom-4 right-6 text-[11px] text-slate-500 font-mono">
        BrowseraIELTS v2.4 • Browsera Infotech
      </div>

    </div>
  );
};
