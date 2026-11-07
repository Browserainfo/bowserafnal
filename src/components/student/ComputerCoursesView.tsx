/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Laptop, 
  Keyboard, 
  CheckCircle, 
  Clock, 
  Award, 
  RotateCcw, 
  Play, 
  BookOpen, 
  FileCheck 
} from 'lucide-react';
import { ComputerCourseModule } from '../../types';
import { DataService } from '../../services/dataService';

export const ComputerCoursesView: React.FC = () => {
  const [courses] = useState<ComputerCourseModule[]>(() => DataService.getComputerCourses());
  const [selectedCourse, setSelectedCourse] = useState<ComputerCourseModule>(courses[0]);

  // Typing Test Simulator State
  const sampleText = "The computer is an electronic device that manipulates information and data. It has the ability to store, retrieve, and process data with high precision. Modern computer applications in office management and financial accounting demand rigorous accuracy and rapid keyboard transcription skills.";
  
  const [typedText, setTypedText] = useState('');
  const [isTestActive, setIsTestActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds speed drill
  const [testFinished, setTestFinished] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let timer: any = null;
    if (isTestActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTestActive) {
      setIsTestActive(false);
      setTestFinished(true);
    }
    return () => clearInterval(timer);
  }, [isTestActive, timeLeft]);

  const handleStartTyping = () => {
    setTypedText('');
    setTimeLeft(60);
    setIsTestActive(true);
    setTestFinished(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleResetTyping = () => {
    setTypedText('');
    setTimeLeft(60);
    setIsTestActive(false);
    setTestFinished(false);
  };

  // Calculations
  const wordsTyped = typedText.trim().split(/\s+/).filter(Boolean).length;
  const timeElapsed = 60 - timeLeft;
  const wpm = timeElapsed > 0 ? Math.round((wordsTyped / timeElapsed) * 60) : 0;

  let correctChars = 0;
  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === sampleText[i]) correctChars++;
  }
  const accuracy = typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 100;

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
            Vocational IT & Office Training Division
          </span>
          <h2 className="text-xl font-bold mt-1 text-white">Browsera Computer Academy & Typing Center</h2>
          <p className="text-xs text-slate-400 mt-1">
            Diploma in Computer Applications (DCA), Advanced MS Office 365, and Government Standard Speed Typing.
          </p>
        </div>

        <div className="flex gap-2">
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCourse.id === course.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {course.courseCode}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Course Syllabus & Outline (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-amber-600 uppercase">{selectedCourse.courseCode} Curriculum</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedCourse.title}</h3>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
              {selectedCourse.durationWeeks} Weeks
            </span>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Module Syllabus Checklist</h4>
            {selectedCourse.syllabus.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle className={`w-4 h-4 mt-0.5 ${item.completed ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <div>
                    <div className="font-semibold text-slate-900">{item.topic}</div>
                    <div className="text-[10px] text-slate-500">{item.hours} Practical Lab Hours</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  item.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {item.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-amber-600" />
              <span>{selectedCourse.practicalTestTitle}</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              {selectedCourse.practicalTaskDescription}
            </p>
          </div>
        </div>

        {/* Interactive Typing Speed Simulator (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Interactive Pro Typing Speed Simulator</h3>
                <p className="text-xs text-slate-500">Government exam threshold: 35 WPM / 95% Accuracy</p>
              </div>
            </div>

            {/* Timer Badge */}
            <div className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 ${
              timeLeft <= 10 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-800'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
            </div>
          </div>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Speed (WPM)</div>
              <div className="text-2xl font-black text-amber-600 mt-0.5">{wpm}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Accuracy</div>
              <div className="text-2xl font-black text-emerald-600 mt-0.5">{accuracy}%</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Words Typed</div>
              <div className="text-2xl font-black text-slate-800 mt-0.5">{wordsTyped}</div>
            </div>
          </div>

          {/* Reference Text Display */}
          <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs font-mono leading-relaxed select-none border border-slate-800">
            {sampleText.split('').map((char, index) => {
              let colorClass = 'text-slate-400';
              if (index < typedText.length) {
                colorClass = typedText[index] === char ? 'text-emerald-400 font-bold' : 'text-red-400 bg-red-950 font-bold';
              } else if (index === typedText.length) {
                colorClass = 'text-amber-300 bg-amber-900/60 underline';
              }
              return (
                <span key={index} className={colorClass}>
                  {char}
                </span>
              );
            })}
          </div>

          {/* Typing Input */}
          <div className="space-y-2">
            <textarea
              ref={inputRef}
              disabled={!isTestActive && !testFinished}
              rows={3}
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={isTestActive ? "Start typing the text above exactly as shown..." : "Click 'Start Typing Test' below to begin..."}
              className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
            />

            <div className="flex items-center justify-between">
              {!isTestActive && !testFinished ? (
                <button
                  onClick={handleStartTyping}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start 60-Second Typing Test</span>
                </button>
              ) : (
                <button
                  onClick={handleResetTyping}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Test</span>
                </button>
              )}

              {testFinished && (
                <div className="text-xs font-bold flex items-center gap-1.5">
                  {wpm >= 35 && accuracy >= 95 ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Award className="w-4 h-4" /> Qualified! (Exceeds 35 WPM / 95% Accuracy)
                    </span>
                  ) : (
                    <span className="text-amber-700">
                      Practice needed: Aim for 35+ WPM with 95%+ accuracy.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
