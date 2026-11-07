/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Award, 
  BookOpen, 
  Play, 
  CheckCircle, 
  Mic, 
  Monitor, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Users, 
  Send, 
  ArrowRight, 
  Headphones, 
  Laptop, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';
import { UserRole } from '../../types';
import { apiService } from '../../services/apiService';

interface LandingPageProps {
  onNavigateRole: (role: UserRole) => void;
  onLaunchCdIelts: () => void;
  onLaunchPte: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateRole,
  onLaunchCdIelts,
  onLaunchPte
}) => {
  // Form 1: Book Free Band Assessment
  const [assessmentName, setAssessmentName] = useState('');
  const [assessmentPhone, setAssessmentPhone] = useState('');
  const [assessmentCourse, setAssessmentCourse] = useState('CD-IELTS Academic');
  const [assessmentHp, setAssessmentHp] = useState('');
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const [assessmentSuccess, setAssessmentSuccess] = useState<string | null>(null);

  // Form 2: Get Your Student Portal
  const [portalName, setPortalName] = useState('');
  const [portalPhone, setPortalPhone] = useState('');
  const [portalEmail, setPortalEmail] = useState('');
  const [portalCourse, setPortalCourse] = useState('CD-IELTS Academic');
  const [portalMessage, setPortalMessage] = useState('');
  const [portalHp, setPortalHp] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [portalSuccess, setPortalSuccess] = useState<string | null>(null);

  const handleAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssessmentError(null);
    setAssessmentSuccess(null);
    setAssessmentLoading(true);

    try {
      const res = await apiService.submitEnquiry({
        formName: 'Book Free Band Assessment Form',
        formType: 'assessment',
        name: assessmentName,
        phone: assessmentPhone,
        course: assessmentCourse,
        _hp: assessmentHp
      });

      setAssessmentLoading(false);
      setAssessmentSuccess(res.message || 'Your request has been received and sent to our admissions team!');
      setAssessmentName('');
      setAssessmentPhone('');
    } catch (err: any) {
      setAssessmentLoading(false);
      setAssessmentError(err.message || 'Failed to submit request. Please verify your details or call us directly.');
    }
  };

  const handlePortalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPortalError(null);
    setPortalSuccess(null);
    setPortalLoading(true);

    try {
      const res = await apiService.submitEnquiry({
        formName: 'Get Your Student Portal Enquiry',
        formType: 'student_portal',
        name: portalName,
        phone: portalPhone,
        email: portalEmail,
        course: portalCourse,
        message: portalMessage,
        _hp: portalHp
      });

      setPortalLoading(false);
      setPortalSuccess(res.message || 'Your student portal enquiry has been sent to our admissions desk!');
      setPortalName('');
      setPortalPhone('');
      setPortalEmail('');
      setPortalMessage('');
    } catch (err: any) {
      setPortalLoading(false);
      setPortalError(err.message || 'Failed to submit enquiry. Please check your network or call +91 97801 59515.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      
      {/* SECTION 1: HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-10 sm:pt-14 pb-16 sm:pb-24 border-b border-slate-800">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-500/10 blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-400 mb-6 backdrop-blur-sm shadow-inner">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Browsera Infotech • Official CD-IELTS & PTE Training Center</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                Achieve Your Dream <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">Band 7.5+ & PTE 79</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">
                BrowseraIELTS delivers genuine computer-delivered exam simulations, 250 complete practice & mock tests, instant AI diagnostic band feedback, certified master faculty, and accredited IT diploma programs.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={onLaunchCdIelts}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-5 sm:px-6 py-3.5 rounded-xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2.5 transition active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Launch CD-IELTS Simulator</span>
                </button>

                <button
                  onClick={onLaunchPte}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 sm:px-5 py-3.5 rounded-xl text-xs sm:text-sm border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-amber-400" />
                  <span>Try PTE Speaking Lab</span>
                </button>

                <button
                  onClick={() => onNavigateRole('student')}
                  className="bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white font-medium px-4 py-3 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Student Portal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Key Trust Badges */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-slate-800/80">
                <div className="bg-slate-900/60 p-2 sm:p-3 rounded-xl border border-slate-800">
                  <div className="text-xl sm:text-2xl font-extrabold text-white">9,850+</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Students Enrolled</div>
                </div>
                <div className="bg-slate-900/60 p-2 sm:p-3 rounded-xl border border-slate-800">
                  <div className="text-xl sm:text-2xl font-extrabold text-amber-400">7.8 Band</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Center Average Band</div>
                </div>
                <div className="bg-slate-900/60 p-2 sm:p-3 rounded-xl border border-slate-800">
                  <div className="text-xl sm:text-2xl font-extrabold text-white">100%</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Official Exam Layout</div>
                </div>
              </div>

            </div>

            {/* Hero Interactive Terminal Card Preview */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                    <span className="text-[11px] sm:text-xs font-mono text-slate-400 pl-1">CD-IELTS Terminal #04</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">LIVE ENGINE</span>
                </div>

                <div className="py-4 space-y-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-bold text-white text-[11px] sm:text-xs">Writing Task 2 AI Diagnostic</span>
                      <span className="text-amber-400 font-mono text-[11px] sm:text-xs">Band 7.5 (TR: 8.0, CC: 7.5)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full w-[82%] rounded-full"></div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 italic">
                      "Sophisticated thesis statement with induced demand arguments. Ready for master review."
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Speaking Waveform</div>
                      <div className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5 text-xs">
                        <Mic className="w-3.5 h-3.5" />
                        <span>Oral Fluency: 7.0</span>
                      </div>
                    </div>
                    <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">PTE Read Aloud</div>
                      <div className="text-sky-400 font-bold flex items-center gap-1 mt-0.5 text-xs">
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Score: 78/90</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-amber-400">Authentic Computer Lab Terminals</div>
                      <div className="text-[11px] text-slate-300">Practice under authentic test-day pressure</div>
                    </div>
                    <button 
                      onClick={onLaunchCdIelts}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg transition text-center"
                    >
                      Enter Test
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Browsera Infotech Institute Campus</span>
                  <span className="text-emerald-400 font-medium">● 25 Terminals Active</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 2: COURSE PROGRAMS (IELTS & PTE PREPARATION) */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            Comprehensive Academics
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-3">
            Choose Your Target Preparation Program
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm md:text-base mt-2">
            Tailored curriculum for study visas, PR immigration, corporate careers, and vocational IT diplomas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          
          {/* Card 1: CD-IELTS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 sm:p-6 flex flex-col justify-between group hover:border-amber-400">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Laptop className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-xs font-bold text-amber-600 uppercase">Academic & General</div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">CD-IELTS Exam Lab</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Full authentic computer-delivered IELTS simulation. 200 module tests, official timer, passage highlighter, and AI diagnostic band feedback.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> 50 Reading & 50 Listening Tests</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Writing Task 1 & 2 Live Scorer</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Speaking Cue Cards & Timer</li>
              </ul>
            </div>
            <button
              onClick={onLaunchCdIelts}
              className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
            >
              <span>Practice CD-IELTS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: PTE Academic */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 sm:p-6 flex flex-col justify-between group hover:border-sky-400">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Headphones className="w-6 h-6 text-sky-600" />
              </div>
              <div className="text-xs font-bold text-sky-600 uppercase">Pearson Exam Prep</div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">PTE Academic 79+</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Specialized Pearson PTE simulation covering Read Aloud, Describe Image, Repeat Sentence, and Summarize Written Text with phonetic meters.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> 50 Full PTE Academic Tests</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Real-time Speech Transcription</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Pearson Scoring Guidelines</li>
              </ul>
            </div>
            <button
              onClick={onLaunchPte}
              className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
            >
              <span>Practice PTE Modules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Spoken English */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 sm:p-6 flex flex-col justify-between group hover:border-emerald-400">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Mic className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-xs font-bold text-emerald-600 uppercase">Fluency & Confidence</div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Spoken English Pro</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Accent neutralization, daily conversation modules, embassy visa interview drills, and corporate presentation masterclasses.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Daily Situational Role-plays</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Phonetic Intonation Drills</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Embassy Interview Training</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigateRole('student')}
              className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
            >
              <span>Explore Spoken Drills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Computer Courses */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 sm:p-6 flex flex-col justify-between group hover:border-purple-400">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Monitor className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-xs font-bold text-purple-600 uppercase">Vocational IT Diploma</div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Computer Courses & DCA</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Diploma in Computer Applications (DCA), PGDCA, MS Office 365, Pro Speed Typing tests, and fundamental Web Development.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Government Recognized DCA</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Interactive Typing Speed Test</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Advanced Excel & Accounting</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigateRole('student')}
              className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
            >
              <span>View IT Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 3: ROLE-BASED DASHBOARDS */}
      <section className="bg-slate-900 text-white py-14 sm:py-20 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Institutional Role-Based Dashboards
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Select your persona below to experience the specialized workflows built for candidates, faculty and administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Student Dashboard Preview */}
            <div 
              onClick={() => onNavigateRole('student')}
              className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-amber-400 transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Laptop className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider group-hover:translate-x-1 transition flex items-center gap-1">
                    Enter Portal &rarr;
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">Candidate Learning Portal</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Track target vs current band score, launch timed CD-IELTS and PTE exams, access daily assigned homework, and review detailed mistake analyses.
                </p>
              </div>
            </div>

            {/* Teacher Dashboard Preview */}
            <div 
              onClick={() => onNavigateRole('teacher')}
              className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-amber-400 transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Users className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider group-hover:translate-x-1 transition flex items-center gap-1">
                    Enter Portal &rarr;
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">Faculty & Evaluator Portal</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Monitor assigned student cohorts, schedule practice tests, review AI diagnostic scores, override bands, and provide personalized feedback notes.
                </p>
              </div>
            </div>

            {/* Admin Dashboard Preview */}
            <div 
              onClick={() => onNavigateRole('admin')}
              className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-amber-400 transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Award className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider group-hover:translate-x-1 transition flex items-center gap-1">
                    Enter Portal &rarr;
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition">Admin Control Center</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Manage student records, teachers, curriculum, question banks, daily batch assignments, 250 full mock exam schedules, and performance analytics.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: BOOK ASSESSMENT FORM (DELIVERED TO apppreet89@gmail.com) */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 md:p-12 text-white border border-slate-800 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 inline-block">
                Book Free Band Assessment
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                Need Guidance on Target Band or Visa Requirements?
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                Visit the Browsera Infotech campus or schedule a free 1-on-1 diagnostic test with our head examiner to identify your current band level and receive a personalized 30-day study roadmap.
              </p>
              
              <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Free Speaking Evaluation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Personalized 30-Day Study Plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Computer Lab Access</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white text-slate-900 p-6 sm:p-7 rounded-2xl shadow-xl border border-slate-100">
              {assessmentSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Assessment Request Received!</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {assessmentSuccess}
                  </p>
                  <button
                    type="button"
                    onClick={() => setAssessmentSuccess(null)}
                    className="text-xs text-amber-600 hover:text-amber-700 font-bold underline pt-2"
                  >
                    Submit another assessment request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAssessmentSubmit} className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Request Call Back & Free Mock Slot</h3>
                  
                  {/* Honeypot for spam protection */}
                  <input
                    type="text"
                    name="_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    value={assessmentHp}
                    onChange={(e) => setAssessmentHp(e.target.value)}
                    className="hidden"
                    aria-hidden="true"
                  />

                  {assessmentError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>{assessmentError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jaspreet Singh"
                      value={assessmentName}
                      onChange={(e) => {
                        setAssessmentName(e.target.value);
                        setAssessmentError(null);
                      }}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 97..."
                        value={assessmentPhone}
                        onChange={(e) => {
                          setAssessmentPhone(e.target.value);
                          setAssessmentError(null);
                        }}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Course of Interest</label>
                      <select
                        value={assessmentCourse}
                        onChange={(e) => setAssessmentCourse(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                      >
                        <option value="CD-IELTS Academic">CD-IELTS Academic</option>
                        <option value="CD-IELTS General">CD-IELTS General</option>
                        <option value="PTE Academic">PTE Academic 79+</option>
                        <option value="Spoken English">Spoken English</option>
                        <option value="Computer Courses (DCA)">DCA & IT Diploma</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={assessmentLoading}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {assessmentLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending to Admissions...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Free Assessment Request</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 text-center pt-1">
                    Submissions are transmitted directly to our admissions team at <span className="font-mono text-slate-700">info@browsera.co.uk</span>
                  </p>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5: NEW STUDENT PORTAL ENQUIRY SECTION (RESPONSIVE TWO-COLUMN LAYOUT) */}
      <section id="get-portal" className="py-14 sm:py-20 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Immediate Enrolment & Lab Credentials
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-3">
              Get Your Student Portal
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base mt-2">
              Request official candidate credentials to access the 250-test preparation engine, daily batch assignments, and personalized teacher reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Side: Enquiry Form (7 cols on desktop) */}
            <div className="lg:col-span-7 bg-[#1c2431] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Laptop className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Student Portal Registration Enquiry</h3>
              </div>

              {portalSuccess ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Portal Enquiry Sent!</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    {portalSuccess}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPortalSuccess(null)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold underline pt-2"
                  >
                    Submit another registration request
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePortalSubmit} className="space-y-4 text-xs">
                  
                  {/* Honeypot field */}
                  <input
                    type="text"
                    name="_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    value={portalHp}
                    onChange={(e) => setPortalHp(e.target.value)}
                    className="hidden"
                    aria-hidden="true"
                  />

                  {portalError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{portalError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5">
                        Full Name <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Gurpreet Kaur"
                        value={portalName}
                        onChange={(e) => {
                          setPortalName(e.target.value);
                          setPortalError(null);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5">
                        Phone Number <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 97801..."
                        value={portalPhone}
                        onChange={(e) => {
                          setPortalPhone(e.target.value);
                          setPortalError(null);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5">
                        Email Address <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="candidate@example.com"
                        value={portalEmail}
                        onChange={(e) => {
                          setPortalEmail(e.target.value);
                          setPortalError(null);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5">
                        Interested Course <span className="text-amber-400">*</span>
                      </label>
                      <select
                        value={portalCourse}
                        onChange={(e) => setPortalCourse(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                      >
                        <option value="CD-IELTS Academic">CD-IELTS Academic (7.5+ Target)</option>
                        <option value="CD-IELTS General">CD-IELTS General Training</option>
                        <option value="PTE Academic">PTE Academic (79+ Target)</option>
                        <option value="Spoken English">Spoken English & Fluency</option>
                        <option value="Computer Courses (DCA)">DCA & IT Diploma</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5">
                      Message / Current Target Score
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell us about your target band/score, preferred exam date, or batch timing (e.g. morning/evening)..."
                      value={portalMessage}
                      onChange={(e) => setPortalMessage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={portalLoading}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {portalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Enquiry to Admissions...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Enquiry</span>
                      </>
                    )}
                  </button>

                  <div className="text-[11px] text-slate-400 text-center pt-1">
                    All enquiries are transmitted directly to admissions at <strong className="text-amber-400">info@browsera.co.uk</strong>
                  </div>

                </form>
              )}
            </div>

            {/* Right Side: Contact Details (5 cols on desktop) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-[#1c2431] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Direct Institute Contacts</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Connect with our certified faculty and admissions coordinators directly.
                  </p>
                </div>

                {/* Call Us */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <Phone className="w-4 h-4" />
                    <span>Call Us</span>
                  </div>
                  <div className="space-y-2">
                    <a
                      href="tel:+919780159515"
                      className="block p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white font-mono text-sm font-bold transition hover:border-amber-400"
                    >
                      +91 97801 59515
                    </a>
                    <a
                      href="tel:+918054284657"
                      className="block p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white font-mono text-sm font-bold transition hover:border-amber-400"
                    >
                      +91 80542 84657
                    </a>
                  </div>
                </div>

                {/* Email Us */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <Mail className="w-4 h-4" />
                    <span>Email Us</span>
                  </div>
                  <a
                    href="mailto:info@browsera.co.uk"
                    className="block p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-amber-400 font-mono text-xs font-bold transition hover:border-amber-400"
                  >
                    info@browsera.co.uk
                  </a>
                </div>

                {/* Campus Location & Hours */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>Institute Campus Location</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Browsera Institute of English & Computing<br />
                    Goyal Market, Backside Bank of India, Near Bus Stand, Banur, Punjab.
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
                  </div>
                </div>

              </div>

              {/* Lab Highlights Card */}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-5 rounded-2xl text-xs text-slate-300 space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Certified Pearson & British Council Examination Facility</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Equipped with 25 dedicated computer terminals, certified audio headsets, noise-dampening partitions, and live examiner debriefs.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
                B
              </div>
              <div>
                <div className="font-bold text-white text-sm">Browsera<span className="text-amber-400">IELTS</span></div>
                <div className="text-[11px] text-slate-500">Browsera Institute of English & Computing</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
              <a href="#get-portal" className="hover:text-amber-400 transition">Get Student Portal</a>
              <span>•</span>
              <a href="tel:+919780159515" className="hover:text-amber-400 transition">+91 97801 59515</a>
              <span>•</span>
              <a href="mailto:info@browsera.co.uk" className="hover:text-amber-400 transition">info@browsera.co.uk</a>
              <span>•</span>
              <button onClick={() => onNavigateRole('student')} className="hover:text-amber-400 transition">Portal Login</button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
            <div>
              &copy; 2026 Browsera Infotech. All rights reserved. CD-IELTS & PTE Academic Test Prep Platform.
            </div>
            <div className="text-center sm:text-right">
              Goyal Market, Backside Bank of India, Near Bus Stand, Banur, Punjab • Admissions: <a href="mailto:info@browsera.co.uk" className="hover:text-amber-400 transition">info@browsera.co.uk</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
