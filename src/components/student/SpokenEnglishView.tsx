/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  CheckCircle, 
  Sparkles, 
  BookOpen, 
  Award, 
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { SpokenTopicLesson } from '../../types';
import { DataService } from '../../services/dataService';
import { speechService } from '../../services/speechService';
import { evaluateSpeakingSubmission } from '../../services/aiEvaluationService';

export const SpokenEnglishView: React.FC = () => {
  const [lessons] = useState<SpokenTopicLesson[]>(() => DataService.getSpokenLessons());
  const [activeLesson, setActiveLesson] = useState<SpokenTopicLesson>(lessons[0]);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedTranscript, setRecordedTranscript] = useState('');
  const [audioVolume, setAudioVolume] = useState(0);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [feedbackReport, setFeedbackReport] = useState<any | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const timerRef = React.useRef<any>(null);

  const startDrillRecording = async () => {
    setFeedbackReport(null);
    setRecordedTranscript('');
    setRecordSeconds(0);

    const micSuccess = await speechService.startAudioRecording((volume) => {
      setAudioVolume(volume);
    });

    if (micSuccess) {
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);

      speechService.startListening((payload) => {
        setRecordedTranscript(payload.transcript);
      });
    } else {
      alert('Microphone access is required for spoken practice. If not available, simulation mode is active.');
      // Fallback transcript simulation for instant preview
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
      setRecordedTranscript('In my previous position, I organized the university tech festival with an eight-member committee. We successfully coordinated five events.');
    }
  };

  const stopDrillRecording = async () => {
    setIsRecording(false);
    clearInterval(timerRef.current);
    speechService.stopListening();
    await speechService.stopAudioRecording();

    // Auto trigger evaluation
    setIsEvaluating(true);
    const report = await evaluateSpeakingSubmission(
      activeLesson.drillPrompt,
      recordedTranscript || 'Sample candidate response delivered clearly.',
      recordSeconds || 25
    );
    setFeedbackReport(report);
    setIsEvaluating(false);
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
            Spoken English & Fluency Lab
          </span>
          <h2 className="text-xl font-bold mt-1 text-white">Daily Speech & Accent Neutralization Practice</h2>
          <p className="text-xs text-slate-400 mt-1">
            Practice real situational dialogues, master phonetic stress patterns, and record spoken drills with instant feedback.
          </p>
        </div>

        <div className="flex gap-2">
          {lessons.map(lesson => (
            <button
              key={lesson.id}
              onClick={() => { setActiveLesson(lesson); setFeedbackReport(null); setRecordedTranscript(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeLesson.id === lesson.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {lesson.category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Dialogue & Vocabulary Bank (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase">{activeLesson.category}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{activeLesson.title}</h3>
              </div>
            </div>

            {/* Dialogue Conversation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Model Native Dialogue</h4>
              {activeLesson.dialogue.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.speaker}</span>
                    <button
                      onClick={() => speakText(item.text)}
                      className="text-slate-500 hover:text-amber-600 flex items-center gap-1 text-[11px] font-medium transition"
                      title="Listen to native pronunciation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-serif">"{item.text}"</p>
                  {item.phoneticTips && (
                    <div className="text-[10px] text-amber-700 font-medium bg-amber-50/80 p-1.5 rounded-md mt-1">
                      💡 Phonetic Tip: {item.phoneticTips}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Key Vocabulary Bank */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Key Academic Vocabulary & Phonetics</h4>
              <div className="grid grid-cols-1 gap-2">
                {activeLesson.keyVocab.map((vocab, i) => (
                  <div key={i} className="p-3 bg-slate-50/60 rounded-xl border border-slate-200 text-xs flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{vocab.word}</span>
                        <span className="text-[11px] font-mono text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded">
                          {vocab.pronunciation}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{vocab.meaning}</p>
                      <p className="text-[10px] text-slate-400 italic mt-0.5">Example: "{vocab.example}"</p>
                    </div>
                    <button
                      onClick={() => speakText(vocab.word)}
                      className="p-1 text-slate-400 hover:text-amber-600 rounded"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right: Live Microphone Speech Drill & Evaluation (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Interactive Spoken Drill</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Record Your Spoken Answer</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-amber-50/60 p-3 rounded-xl border border-amber-200 font-medium text-amber-950">
                Prompt: {activeLesson.drillPrompt}
              </p>
            </div>

            {/* Audio Recording Interface */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white text-center space-y-4 border border-slate-800">
              
              <div className="flex items-center justify-center">
                <button
                  onClick={isRecording ? stopDrillRecording : startDrillRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-105' 
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {isRecording ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-slate-950" />}
                </button>
              </div>

              <div>
                <div className="text-sm font-bold text-white">
                  {isRecording ? `Recording Response... (00:${recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds})` : 'Click Microphone to Start'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {isRecording ? 'Speak clearly into your microphone' : 'Microphone speech recognition active'}
                </div>
              </div>

              {/* Live Audio Meter Waveform */}
              {isRecording && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 px-2 font-mono">
                    <span>MIC SENSITIVITY</span>
                    <span>{audioVolume}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 transition-all duration-75"
                      style={{ width: `${Math.max(8, audioVolume)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Live Speech to Text transcript */}
              <div className="text-left bg-slate-950 p-3.5 rounded-xl border border-slate-800 min-h-20 max-h-36 overflow-y-auto">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Live Speech Transcript</div>
                <p className="text-xs text-slate-200 mt-1 font-sans">
                  {recordedTranscript || (isRecording ? 'Listening for speech...' : 'Press the mic button and begin speaking...')}
                </p>
              </div>

            </div>

            {/* Evaluation Results Card */}
            {isEvaluating && (
              <div className="p-4 bg-slate-100 rounded-xl text-center text-xs font-semibold text-slate-700 animate-pulse">
                Analyzing acoustic fluency, rhythm, and lexical diversity...
              </div>
            )}

            {feedbackReport && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Fluency Diagnostic Breakdown</span>
                  </span>
                  <span className="font-extrabold text-amber-700 text-sm">
                    Band {feedbackReport.overallBand}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {feedbackReport.criteriaScores.map((c: any, i: number) => (
                    <div key={i} className="bg-white p-2 rounded-lg border border-slate-200">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{c.name}</span>
                        <span className="text-amber-600">{c.score}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{c.description}</p>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-slate-700 font-medium italic bg-white p-2.5 rounded-lg border border-slate-200">
                  "{feedbackReport.detailedFeedback}"
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
