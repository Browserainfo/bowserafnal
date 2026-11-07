/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  HelpCircle, 
  Volume2, 
  Play, 
  Pause, 
  Mic, 
  MicOff, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Sparkles,
  Maximize2,
  X,
  BookOpen,
  Headphones,
  FileEdit,
  Radio,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  User, 
  ReadingTest, 
  ListeningTest, 
  WritingTask, 
  SpeakingTest, 
  ExamModule, 
  TestSubmission,
  QuestionItem
} from '../../types';
import { DataService } from '../../services/dataService';
import { apiService } from '../../services/apiService';
import { evaluateWritingSubmission, evaluateSpeakingSubmission } from '../../services/aiEvaluationService';
import { speechService } from '../../services/speechService';
import { PreTestAudioCheckModal } from '../common/PreTestAudioCheckModal';
import { findTestById } from '../../data/tests';
import { 
  getAcademicReadingBand, 
  getGeneralReadingBand, 
  getListeningBand, 
  evaluateAnswer 
} from '../../utils/ieltsScoring';

interface CdIeltsExamSimulatorProps {
  currentUser: User;
  initialModule?: ExamModule;
  testId?: string;
  onExit: () => void;
  onTestCompleted: (submission: TestSubmission) => void;
}

export const CdIeltsExamSimulator: React.FC<CdIeltsExamSimulatorProps> = ({
  currentUser,
  initialModule = 'reading',
  testId,
  onExit,
  onTestCompleted
}) => {
  const specificTest = testId ? findTestById(testId) : undefined;
  const initialResolvedModule: ExamModule = specificTest?.module && ['reading', 'listening', 'writing', 'speaking'].includes(specificTest.module.toLowerCase())
    ? (specificTest.module.toLowerCase() as ExamModule)
    : initialModule;

  const [activeModule, setActiveModule] = useState<ExamModule>(initialResolvedModule);

  // Exam Category Determination (Academic vs General Training)
  const isGeneralTraining = (currentUser as any).courseType === 'ielts_general' ||
    Boolean((currentUser as any).course && (currentUser as any).course.toLowerCase().includes('general')) ||
    (specificTest as any)?.courseType === 'ielts_general';

  // Appearance & Accessibility (Official CD-IELTS settings)
  const [fontSize, setFontSize] = useState<'standard' | 'large' | 'extralarge'>('standard');
  const [contrastTheme, setContrastTheme] = useState<'standard' | 'yellow_black' | 'blue_black'>('standard');

  // Test data sources
  const readingTests = DataService.getReadingTests();
  const currentReadingTest: ReadingTest = (specificTest && (specificTest.readingData || specificTest.readingTest)) || readingTests[0];

  const listeningTests = DataService.getListeningTests();
  const currentListeningTest: ListeningTest = (specificTest && (specificTest.listeningData || specificTest.listeningTest)) || listeningTests[0];

  const writingTasks = DataService.getWritingTasks();
  const currentWritingTask: WritingTask = (specificTest && (specificTest.writingData || specificTest.writingTask)) || writingTasks[1]; // Task 2 Essay

  const speakingTest: SpeakingTest = (specificTest && (specificTest.speakingData || specificTest.speakingTest)) || DataService.getSpeakingTest();

  // Test Execution State
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [activeQuestionNumber, setActiveQuestionNumber] = useState(1);
  const [writingEssay, setWritingEssay] = useState('');
  
  // Official IELTS Timers (60m for Reading/Writing, 30m for Listening, 15m for Speaking)
  const initialDuration = initialResolvedModule === 'listening' ? 30 * 60 : initialResolvedModule === 'speaking' ? 15 * 60 : 60 * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(initialDuration);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Passage / Section / Speaking Part Navigation
  const [activeReadingPassageIndex, setActiveReadingPassageIndex] = useState<number>(0);
  const [activeListeningSectionIndex, setActiveListeningSectionIndex] = useState<number>(0);
  const [activeSpeakingPart, setActiveSpeakingPart] = useState<1 | 2 | 3>(1);

  // Pre-test Audio Device Check State
  const [pendingAudioCheckModule, setPendingAudioCheckModule] = useState<'listening' | 'speaking' | null>(
    initialResolvedModule === 'listening' ? 'listening' : initialResolvedModule === 'speaking' ? 'speaking' : null
  );
  const [verifiedAudioModules, setVerifiedAudioModules] = useState<{ listening: boolean; speaking: boolean }>({
    listening: false,
    speaking: false,
  });

  // Audio / Speaking specific state
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [speakingPrepTime, setSpeakingPrepTime] = useState(60);
  const [speakingPrepActive, setSpeakingPrepActive] = useState(false);
  const [speakingRecording, setSpeakingRecording] = useState(false);
  const [part1Transcript, setPart1Transcript] = useState('');
  const [part2Transcript, setPart2Transcript] = useState('');
  const [part3Transcript, setPart3Transcript] = useState('');
  const [speakingVolume, setSpeakingVolume] = useState(0);

  // Dedicated container refs for isolated question scrolling
  const readingQuestionsRef = useRef<HTMLDivElement>(null);
  const listeningQuestionsRef = useRef<HTMLDivElement>(null);

  const scrollToQuestion = (qNum: number, explicitModule?: ExamModule) => {
    setActiveQuestionNumber(qNum);
    const mod = explicitModule || activeModule;
    const container = mod === 'reading' ? readingQuestionsRef.current : listeningQuestionsRef.current;
    const anchorId = mod === 'reading' ? `q_anchor_${qNum}` : `lq_anchor_${qNum}`;
    const target = document.getElementById(anchorId);
    if (container && target) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const targetScrollTop = container.scrollTop + (targetRect.top - containerRect.top) - 16;
      container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
    }
  };

  // Countdown timer (pauses while pre-test hardware check is active)
  useEffect(() => {
    if (secondsRemaining <= 0 || isTestSubmitted || pendingAudioCheckModule !== null) return;
    const timer = setInterval(() => {
      setSecondsRemaining(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining, isTestSubmitted, pendingAudioCheckModule]);

  // Synchronize active passage/section when activeQuestionNumber changes
  useEffect(() => {
    if (activeModule === 'reading') {
      if (activeQuestionNumber <= 13) {
        setActiveReadingPassageIndex(0);
      } else if (activeQuestionNumber <= 26) {
        setActiveReadingPassageIndex(1);
      } else {
        setActiveReadingPassageIndex(2);
      }
    } else if (activeModule === 'listening') {
      const sectionIdx = Math.min(3, Math.floor((activeQuestionNumber - 1) / 10));
      setActiveListeningSectionIndex(sectionIdx);
    }
  }, [activeQuestionNumber, activeModule]);

  // Handle module switching with hardware check gating
  const handleSelectModule = (mod: ExamModule) => {
    if (mod === 'listening' && !verifiedAudioModules.listening) {
      setPendingAudioCheckModule('listening');
      return;
    }
    if (mod === 'speaking' && !verifiedAudioModules.speaking) {
      setPendingAudioCheckModule('speaking');
      return;
    }
    setActiveModule(mod);
    setActiveQuestionNumber(1);
  };

  const handleAudioCheckPassed = () => {
    if (pendingAudioCheckModule === 'listening') {
      setVerifiedAudioModules(prev => ({ ...prev, listening: true }));
      setActiveModule('listening');
    } else if (pendingAudioCheckModule === 'speaking') {
      setVerifiedAudioModules(prev => ({ ...prev, speaking: true }));
      setActiveModule('speaking');
    }
    setPendingAudioCheckModule(null);
  };

  const handleAudioCheckCancelled = () => {
    if ((initialModule === 'listening' || initialModule === 'speaking') && !verifiedAudioModules[initialModule]) {
      onExit();
    } else {
      setPendingAudioCheckModule(null);
    }
  };

  // Speaking prep countdown (Part 2)
  useEffect(() => {
    let prepTimer: any = null;
    if (speakingPrepActive && speakingPrepTime > 0) {
      prepTimer = setInterval(() => {
        setSpeakingPrepTime(prev => prev - 1);
      }, 1000);
    } else if (speakingPrepTime === 0 && speakingPrepActive) {
      setSpeakingPrepActive(false);
      handleStartSpeakingRecording();
    }
    return () => clearInterval(prepTimer);
  }, [speakingPrepActive, speakingPrepTime]);

  const handleStartSpeakingPrep = () => {
    setSpeakingPrepTime(60);
    setSpeakingPrepActive(true);
  };

  const handleStartSpeakingRecording = async () => {
    setSpeakingPrepActive(false);
    setSpeakingRecording(true);

    const started = await speechService.startAudioRecording((vol) => {
      setSpeakingVolume(vol);
    });

    if (started) {
      speechService.startListening((payload) => {
        if (activeSpeakingPart === 1) {
          setPart1Transcript(prev => (prev ? `${prev} ${payload.transcript}` : payload.transcript));
        } else if (activeSpeakingPart === 2) {
          setPart2Transcript(prev => (prev ? `${prev} ${payload.transcript}` : payload.transcript));
        } else {
          setPart3Transcript(prev => (prev ? `${prev} ${payload.transcript}` : payload.transcript));
        }
      });
    } else {
      // Offline fallback simulation
      const fallbackText = activeSpeakingPart === 1
        ? "I am currently preparing for my master's degree in engineering and I have lived in this city for four years."
        : activeSpeakingPart === 2
        ? "I would like to describe an ambitious project I completed, which involved coordinating an environmental conservation initiative for our regional community."
        : "In my opinion, technological modernization must be balanced with robust environmental standards so that future generations retain sustainable biomes.";

      if (activeSpeakingPart === 1) setPart1Transcript(fallbackText);
      else if (activeSpeakingPart === 2) setPart2Transcript(fallbackText);
      else setPart3Transcript(fallbackText);
    }
  };

  const handleStopSpeakingRecording = async () => {
    setSpeakingRecording(false);
    speechService.stopListening();
    await speechService.stopAudioRecording();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleFlag = (qNum: number) => {
    setFlaggedQuestions(prev => ({ ...prev, [qNum]: !prev[qNum] }));
  };

  const handleSelectAnswer = (qNum: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [qNum]: answer }));
  };

  // Submit test and calculate exact score / AI evaluation
  const handleSubmitTest = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const submissionId = `sub_${Date.now()}`;
    const totalAllowedTime = initialDuration;
    const timeSpent = Math.max(1, totalAllowedTime - secondsRemaining);

    let newSubmission: TestSubmission;

    if (activeModule === 'reading') {
      const questions = currentReadingTest.questions;
      let correct = 0;
      const analysis = questions.map(q => {
        const userAns = (userAnswers[q.number] || '').trim();
        const isCorrect = evaluateAnswer(userAns, q.correctAnswer);
        if (isCorrect) correct++;
        const displayCorrect = Array.isArray(q.correctAnswer) ? q.correctAnswer.join(' / ') : q.correctAnswer;
        return {
          questionNumber: q.number,
          userAnswer: userAns || '(Blank / Not answered)',
          correctAnswer: displayCorrect,
          isCorrect,
          explanation: q.explanation,
          category: q.type.replace(/_/g, ' ')
        };
      });

      const isGt = isGeneralTraining || currentReadingTest.courseType === 'ielts_general';
      const band = isGt
        ? getGeneralReadingBand(correct, questions.length)
        : getAcademicReadingBand(correct, questions.length);

      newSubmission = {
        id: submissionId,
        studentId: currentUser.id,
        studentName: currentUser.name,
        candidateNumber: currentUser.candidateNumber || 'CD-2026-9042',
        testTitle: isGt && !currentReadingTest.title.includes('General Training')
          ? currentReadingTest.title.replace('Academic', 'General Training')
          : currentReadingTest.title,
        courseType: isGt ? 'ielts_general' : 'ielts_academic',
        module: 'reading',
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        timeSpentSeconds: timeSpent,
        totalQuestions: questions.length,
        correctCount: correct,
        rawBandScore: band,
        overallBand: band,
        questionAnalysis: analysis,
        teacherReviewed: false
      };
    } else if (activeModule === 'listening') {
      // Gather all questions across all 4 listening sections (total 40 questions)
      const allListeningQuestions: QuestionItem[] = currentListeningTest.sections.flatMap(s => s.questions);
      let correct = 0;
      const analysis = allListeningQuestions.map(q => {
        const userAns = (userAnswers[q.number] || '').trim();
        const isCorrect = evaluateAnswer(userAns, q.correctAnswer);
        if (isCorrect) correct++;
        const displayCorrect = Array.isArray(q.correctAnswer) ? q.correctAnswer.join(' / ') : q.correctAnswer;
        return {
          questionNumber: q.number,
          userAnswer: userAns || '(Blank / Not answered)',
          correctAnswer: displayCorrect,
          isCorrect,
          explanation: q.explanation,
          category: 'Listening Comprehension'
        };
      });

      const band = getListeningBand(correct, allListeningQuestions.length);

      newSubmission = {
        id: submissionId,
        studentId: currentUser.id,
        studentName: currentUser.name,
        candidateNumber: currentUser.candidateNumber || 'CD-2026-9042',
        testTitle: currentListeningTest.title,
        courseType: currentListeningTest.courseType,
        module: 'listening',
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        timeSpentSeconds: timeSpent,
        totalQuestions: allListeningQuestions.length,
        correctCount: correct,
        rawBandScore: band,
        overallBand: band,
        questionAnalysis: analysis,
        teacherReviewed: false
      };
    } else if (activeModule === 'writing') {
      const aiReport = await evaluateWritingSubmission(
        currentWritingTask.prompt,
        writingEssay || '',
        currentWritingTask.taskNumber || 2
      );

      newSubmission = {
        id: submissionId,
        studentId: currentUser.id,
        studentName: currentUser.name,
        candidateNumber: currentUser.candidateNumber || 'CD-2026-9042',
        testTitle: currentWritingTask.title,
        courseType: currentWritingTask.courseType,
        module: 'writing',
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        timeSpentSeconds: timeSpent,
        writtenText: writingEssay,
        rawBandScore: aiReport.overallBand,
        overallBand: aiReport.overallBand,
        aiReport: aiReport,
        teacherReviewed: false
      };
    } else {
      // Speaking Module (Consolidated Part 1, Part 2, and Part 3 Transcripts)
      const consolidatedTranscript = [
        part1Transcript ? `[Part 1 Interview]: ${part1Transcript}` : '',
        part2Transcript ? `[Part 2 Cue Card]: ${part2Transcript}` : '',
        part3Transcript ? `[Part 3 Discussion]: ${part3Transcript}` : ''
      ].filter(Boolean).join('\n\n');

      const finalSpeech = consolidatedTranscript || (part2Transcript || '');
      const aiReport = await evaluateSpeakingSubmission(
        speakingTest.part2CueCard.topic,
        finalSpeech,
        180
      );

      newSubmission = {
        id: submissionId,
        studentId: currentUser.id,
        studentName: currentUser.name,
        candidateNumber: currentUser.candidateNumber || 'CD-2026-9042',
        testTitle: speakingTest.title,
        courseType: 'ielts_academic',
        module: 'speaking',
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        timeSpentSeconds: 180,
        speechTranscript: finalSpeech,
        rawBandScore: aiReport.overallBand,
        overallBand: aiReport.overallBand,
        aiReport: aiReport,
        teacherReviewed: false
      };
    }

    DataService.saveSubmission(newSubmission);
    apiService.submitTest(newSubmission).catch(err => console.warn('Could not post submission to backend:', err));
    setIsTestSubmitted(true);
    setIsSubmitting(false);
    onTestCompleted(newSubmission);
  };

  // Determine container styling based on accessibility choices
  const getContainerStyles = () => {
    let classes = 'fixed inset-0 z-50 h-screen w-screen overflow-hidden flex flex-col select-none ';
    if (contrastTheme === 'yellow_black') {
      classes += 'bg-black text-yellow-300 ';
    } else if (contrastTheme === 'blue_black') {
      classes += 'bg-[#0f172a] text-sky-200 ';
    } else {
      classes += 'bg-[#f4f6f8] text-[#1e293b] ';
    }

    if (fontSize === 'large') {
      classes += 'text-base ';
    } else if (fontSize === 'extralarge') {
      classes += 'text-lg ';
    } else {
      classes += 'text-sm ';
    }
    return classes;
  };

  const wordsInEssay = writingEssay.trim().split(/\s+/).filter(Boolean).length;
  
  // Total 40 questions list for objective modules
  const allListeningQuestions = currentListeningTest.sections.flatMap(s => s.questions);
  const questionsList = activeModule === 'reading' 
    ? currentReadingTest.questions 
    : allListeningQuestions;

  // Active Passage in Reading (Passage 1: 1–13, Passage 2: 14–26, Passage 3: 27–40)
  const currentPassages = currentReadingTest.passages || [
    {
      passageNumber: 1,
      title: currentReadingTest.passageTitle,
      subtitle: currentReadingTest.passageSubtitle,
      text: currentReadingTest.passageText,
      questions: currentReadingTest.questions
    }
  ];
  const activePassage = currentPassages[activeReadingPassageIndex] || currentPassages[0];

  // Active Section in Listening (Section 1: 1–10, Section 2: 11–20, Section 3: 21–30, Section 4: 31–40)
  const activeListeningSection = currentListeningTest.sections[activeListeningSectionIndex] || currentListeningTest.sections[0];

  return (
    <div className={getContainerStyles()}>
      
      {/* AUTHENTIC OFFICIAL CD-IELTS HEADER */}
      <header className="h-14 flex-shrink-0 bg-[#1f2937] text-white px-4 py-2 flex items-center justify-between border-b border-slate-700 shadow select-none">
        
        {/* Candidate & Test ID */}
        <div className="flex items-center gap-4">
          <div className="border-r border-slate-600 pr-4">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Candidate Name</span>
            <span className="font-bold text-xs text-white">{currentUser.name}</span>
          </div>

          <div className="border-r border-slate-600 pr-4 hidden sm:block">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Candidate Number</span>
            <span className="font-mono text-xs text-amber-400 font-bold">{currentUser.candidateNumber || 'CD-2026-9042'}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Exam Simulator</span>
            <span className="font-bold text-xs text-slate-200 uppercase">
              {isGeneralTraining ? 'CD-IELTS • GENERAL TRAINING ' : 'CD-IELTS • ACADEMIC '}{activeModule} ({questionsList.length > 0 ? `${questionsList.length} Questions` : 'Assessment'})
            </span>
          </div>
        </div>

        {/* Accessibility & Timer Controls */}
        <div className="flex items-center gap-3">
          
          {/* Module Switcher in exam mode */}
          <div className="hidden lg:flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => handleSelectModule('reading')}
              className={`px-2.5 py-1 rounded transition ${activeModule === 'reading' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              Reading
            </button>
            <button
              onClick={() => handleSelectModule('listening')}
              className={`px-2.5 py-1 rounded transition ${activeModule === 'listening' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              Listening
            </button>
            <button
              onClick={() => handleSelectModule('writing')}
              className={`px-2.5 py-1 rounded transition ${activeModule === 'writing' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              Writing
            </button>
            <button
              onClick={() => handleSelectModule('speaking')}
              className={`px-2.5 py-1 rounded transition ${activeModule === 'speaking' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              Speaking
            </button>
          </div>

          {/* Text Size (A, A+) */}
          <div className="hidden sm:flex items-center bg-slate-800 rounded border border-slate-700 text-[11px] font-bold">
            <button 
              onClick={() => setFontSize('standard')} 
              className={`px-2 py-1 ${fontSize === 'standard' ? 'bg-slate-700 text-amber-400' : 'text-slate-300'}`}
              title="Standard Font Size"
            >
              A
            </button>
            <button 
              onClick={() => setFontSize('large')} 
              className={`px-2 py-1 ${fontSize === 'large' ? 'bg-slate-700 text-amber-400' : 'text-slate-300'}`}
              title="Large Font Size"
            >
              A+
            </button>
          </div>

          {/* Contrast Mode */}
          <div className="hidden md:flex items-center bg-slate-800 rounded border border-slate-700 text-[11px] font-bold">
            <button
              onClick={() => setContrastTheme('standard')}
              className={`px-2 py-1 ${contrastTheme === 'standard' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              title="Standard Contrast"
            >
              Standard
            </button>
            <button
              onClick={() => setContrastTheme('yellow_black')}
              className={`px-2 py-1 ${contrastTheme === 'yellow_black' ? 'bg-black text-yellow-300 border border-yellow-400' : 'text-slate-400'}`}
              title="High Contrast (Yellow on Black)"
            >
              Yellow
            </button>
          </div>

          {/* Countdown Clock */}
          <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono font-bold text-xs ${
            secondsRemaining < 300 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-amber-400 border border-slate-700'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(secondsRemaining)} remaining</span>
          </div>

          {/* Finish Test Button */}
          <button
            onClick={handleSubmitTest}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow transition active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Evaluating Marks & Bands...' : 'Finish Test'}</span>
          </button>

          <button
            onClick={onExit}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            title="Exit Exam Simulator"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      </header>

      {/* MAIN SPLIT-SCREEN EXAM BODY */}
      <main className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden relative">

        {/* ================= READING MODULE (40 QUESTIONS ACROSS 3 PASSAGES) ================= */}
        {activeModule === 'reading' && (
          <>
            {/* Left Column: Authentic Passage with Passage 1 / 2 / 3 Navigation */}
            <div className="w-full lg:w-1/2 h-full min-h-0 p-6 overflow-y-auto border-r border-slate-300 bg-white cd-ielts-font leading-relaxed">
              <div className="max-w-2xl mx-auto space-y-4 pb-12">
                
                {/* Passage Switcher Tabs (Passage 1, Passage 2, Passage 3) */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 sticky top-0 bg-white z-10">
                  {currentPassages.map((p, idx) => {
                    const isSelected = activeReadingPassageIndex === idx;
                    const qRange = idx === 0 ? '1–13' : idx === 1 ? '14–26' : '27–40';
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveReadingPassageIndex(idx);
                          const targetQ = idx === 0 ? 1 : idx === 1 ? 14 : 27;
                          scrollToQuestion(targetQ, 'reading');
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected 
                            ? 'bg-amber-500 text-slate-950 shadow-sm' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{isGeneralTraining ? `Section ${idx + 1}` : `Passage ${idx + 1}`} (Q {qRange})</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {isGeneralTraining ? `GENERAL TRAINING READING SECTION ${activeReadingPassageIndex + 1}` : `READING PASSAGE ${activeReadingPassageIndex + 1}`}
                  </span>
                  <h1 className="text-xl font-bold text-slate-900 mt-1">
                    {activePassage.title}
                  </h1>
                  {activePassage.subtitle && (
                    <p className="text-xs text-slate-600 italic mt-1">
                      {activePassage.subtitle}
                    </p>
                  )}
                </div>

                <div className="text-xs text-slate-800 whitespace-pre-line space-y-3 leading-loose select-text">
                  {activePassage.text}
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Questions 1–40 */}
            <div ref={readingQuestionsRef} className="w-full lg:w-1/2 h-full min-h-0 p-6 overflow-y-auto bg-slate-50 cd-ielts-font">
              <div className="max-w-2xl mx-auto space-y-6 pb-16">
                
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between sticky top-0 bg-amber-50/95 backdrop-blur z-10 shadow-sm">
                  <span className="font-semibold">
                    Questions 1–40: Passage {activeReadingPassageIndex + 1} selected (Active Question: {activeQuestionNumber})
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleFlag(activeQuestionNumber)}
                    className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded transition cursor-pointer ${
                      flaggedQuestions[activeQuestionNumber] 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'bg-white border border-amber-300 text-amber-800'
                    }`}
                  >
                    <Flag className="w-3 h-3" />
                    <span>{flaggedQuestions[activeQuestionNumber] ? 'Flagged for Review' : 'Flag Question'}</span>
                  </button>
                </div>

                {/* Questions List (All 40 Questions) */}
                <div className="space-y-6">
                  {currentReadingTest.questions.map((q) => (
                    <div 
                      key={q.id}
                      id={`q_anchor_${q.number}`}
                      className={`p-4 rounded-xl border transition ${
                        activeQuestionNumber === q.number
                          ? 'border-amber-500 bg-white shadow-md ring-1 ring-amber-400'
                          : 'border-slate-200 bg-white'
                      }`}
                      onClick={() => setActiveQuestionNumber(q.number)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                            userAnswers[q.number] ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {q.number}
                          </span>
                          <span>
                            {q.type === 'true_false_not_given' && 'Do the following statements agree with the text? (TRUE / FALSE / NOT GIVEN)'}
                            {q.type === 'fill_blank' && 'Complete the sentence with NO MORE THAN TWO WORDS:'}
                            {q.type === 'multiple_choice' && 'Choose the correct letter (A, B, C, or D):'}
                            {q.type === 'matching_headings' && 'Match the following statements to the correct category:'}
                          </span>
                        </span>

                        {flaggedQuestions[q.number] && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                            Review
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-800 font-medium mb-3">
                        {q.questionText}
                      </p>

                      {/* True/False/Not Given Options */}
                      {q.type === 'true_false_not_given' && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {['TRUE', 'FALSE', 'NOT GIVEN'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAnswer(q.number, opt);
                              }}
                              className={`px-3.5 py-2 rounded-lg border cursor-pointer font-bold transition flex items-center gap-1.5 select-none ${
                                userAnswers[q.number] === opt
                                  ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-sm'
                                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
                              }`}
                            >
                              <span>{opt}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Fill in Blank Input */}
                      {q.type === 'fill_blank' && (
                        <div>
                          <input
                            type="text"
                            placeholder="Type your exact answer here..."
                            value={userAnswers[q.number] || ''}
                            onChange={(e) => handleSelectAnswer(q.number, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Multiple Choice Options */}
                      {q.type === 'multiple_choice' && q.options && (
                        <div className="space-y-2 text-xs">
                          {q.options.map((opt, i) => {
                            const letter = opt.substring(0, 1);
                            const isSelected = userAnswers[q.number] === letter;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectAnswer(q.number, letter);
                                }}
                                className={`w-full text-left p-2.5 rounded-lg border cursor-pointer transition flex items-center gap-2 select-none ${
                                  isSelected
                                    ? 'bg-amber-50 border-amber-400 font-semibold text-slate-900 ring-1 ring-amber-400 shadow-sm'
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs border ${
                                  isSelected ? 'border-amber-600 bg-amber-500 text-slate-950' : 'border-slate-300 bg-white text-slate-600'
                                }`}>
                                  {letter}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  ))}
                </div>

              </div>
            </div>
          </>
        )}

        {/* ================= LISTENING MODULE (40 QUESTIONS ACROSS 4 SECTIONS) ================= */}
        {activeModule === 'listening' && (
          <>
            {/* Left Column: Simulated Audio Player & Section Scenario */}
            <div className="w-full lg:w-1/2 h-full min-h-0 p-6 overflow-y-auto border-r border-slate-300 bg-white space-y-4 pb-16">
              
              {/* Section Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto sticky top-0 bg-white z-10">
                {currentListeningTest.sections.map((s, idx) => {
                  const isSelected = activeListeningSectionIndex === idx;
                  const qRange = idx === 0 ? '1–10' : idx === 1 ? '11–20' : idx === 2 ? '21–30' : '31–40';
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveListeningSectionIndex(idx);
                        const targetQ = idx * 10 + 1;
                        scrollToQuestion(targetQ, 'listening');
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        isSelected 
                          ? 'bg-sky-500 text-white shadow-sm' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Section {idx + 1} (Q {qRange})</span>
                    </button>
                  );
                })}
              </div>

              <div className="border-b border-slate-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                  SECTION {activeListeningSectionIndex + 1} AUDIO STREAM
                </span>
                <h1 className="text-xl font-bold text-slate-900 mt-1">
                  {activeListeningSection.title}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {activeListeningSection.audioScenario}
                </p>
              </div>

              {/* Simulated Audio Player */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAudioPlaying(!audioPlaying)}
                      className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition shadow cursor-pointer"
                    >
                      {audioPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                    <div>
                      <div className="text-xs font-bold">Track 0{activeListeningSectionIndex + 1}: {activeListeningSection.title}</div>
                      <div className="text-[10px] text-slate-400">Duration: 04:00 • Clear British / Australian Accent • Single Play</div>
                    </div>
                  </div>
                  <Volume2 className="w-5 h-5 text-slate-400" />
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`h-full bg-amber-400 transition-all duration-300 ${audioPlaying ? 'w-2/3' : 'w-1/4'}`}></div>
                </div>
              </div>

              {/* Transcript Scenario Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                  Audio Transcript Scenario
                </span>
                <p className="text-slate-600 leading-relaxed italic whitespace-pre-line text-[11px]">
                  {activeListeningSection.transcript}
                </p>
              </div>
            </div>

            {/* Right Column: All 40 Listening Questions */}
            <div ref={listeningQuestionsRef} className="w-full lg:w-1/2 h-full min-h-0 p-6 overflow-y-auto bg-slate-50">
              <div className="max-w-2xl mx-auto space-y-4 pb-16">
                
                <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 text-xs text-sky-900 flex items-center justify-between sticky top-0 bg-sky-50/95 backdrop-blur z-10 shadow-sm">
                  <span className="font-semibold">
                    Listening Assessment: Section {activeListeningSectionIndex + 1} (Questions {activeListeningSectionIndex * 10 + 1}–{activeListeningSectionIndex * 10 + 10})
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleFlag(activeQuestionNumber)}
                    className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded transition cursor-pointer ${
                      flaggedQuestions[activeQuestionNumber] 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'bg-white border border-sky-300 text-sky-800'
                    }`}
                  >
                    <Flag className="w-3 h-3" />
                    <span>{flaggedQuestions[activeQuestionNumber] ? 'Flagged' : 'Flag Question'}</span>
                  </button>
                </div>

                {/* Render questions for active section */}
                {activeListeningSection.questions.map(q => (
                  <div 
                    key={q.id} 
                    id={`lq_anchor_${q.number}`}
                    className={`p-4 bg-white rounded-xl border transition ${
                      activeQuestionNumber === q.number
                        ? 'border-sky-500 shadow-md ring-1 ring-sky-400'
                        : 'border-slate-200'
                    }`}
                    onClick={() => setActiveQuestionNumber(q.number)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                          userAnswers[q.number] ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {q.number}
                        </span>
                        <span>{q.type === 'fill_blank' ? 'Complete the notes with NO MORE THAN TWO WORDS AND/OR A NUMBER:' : 'Choose the correct letter (A, B, C, or D):'}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mb-2 font-medium">{q.questionText}</p>
                    
                    {q.type === 'fill_blank' ? (
                      <input
                        type="text"
                        placeholder="Type answer..."
                        value={userAnswers[q.number] || ''}
                        onChange={(e) => handleSelectAnswer(q.number, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    ) : (
                      <div className="space-y-1.5">
                        {q.options?.map((opt, i) => {
                          const letter = opt[0];
                          const isSelected = userAnswers[q.number] === letter;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAnswer(q.number, letter);
                              }}
                              className={`w-full text-left p-2 border rounded-lg text-xs cursor-pointer transition flex items-center gap-2 select-none ${
                                isSelected
                                  ? 'bg-sky-50 border-sky-400 font-semibold text-slate-900 ring-1 ring-sky-400 shadow-sm'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs border ${
                                isSelected ? 'border-sky-600 bg-sky-500 text-white' : 'border-slate-300 bg-white text-slate-600'
                              }`}>
                                {letter}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ================= WRITING MODULE ================= */}
        {activeModule === 'writing' && (
          <>
            <div className="w-full lg:w-1/2 h-full min-h-0 p-6 overflow-y-auto border-r border-slate-300 bg-white space-y-4 pb-16">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  {isGeneralTraining ? 'GENERAL TRAINING WRITING • TASK 1 & 2' : 'ACADEMIC WRITING • TASK 1 & 2'}
                </span>
                <h1 className="text-xl font-bold text-slate-900 mt-1">
                  {currentWritingTask.title}
                </h1>
                <div className="flex gap-4 text-xs text-slate-500 mt-2">
                  <span>Suggested Time: {currentWritingTask.suggestedMinutes || 40} minutes</span>
                  <span>•</span>
                  <span className="font-bold text-slate-800">Minimum {currentWritingTask.minWords || 250} Words</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-800 space-y-3 leading-relaxed">
                <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">Essay Topic & Instructions</span>
                <p className="font-serif text-sm font-medium text-slate-900 whitespace-pre-line leading-relaxed">
                  {currentWritingTask.prompt}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1">
                <div className="font-bold">Official IELTS Assessment Criteria:</div>
                <div className="text-[11px] text-amber-800">
                  • Task Response (TR) • Coherence and Cohesion (CC) • Lexical Resource (LR) • Grammatical Range & Accuracy (GRA)
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 h-full min-h-0 p-6 flex flex-col bg-slate-50 pb-16">
              <div className="flex items-center justify-between pb-2 text-xs">
                <span className="font-bold text-slate-700">Type Your Essay Below</span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                    wordsInEssay >= (currentWritingTask.minWords || 250) ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {wordsInEssay} / {currentWritingTask.minWords || 250} Words
                  </span>
                </div>
              </div>

              <textarea
                rows={18}
                value={writingEssay}
                onChange={(e) => setWritingEssay(e.target.value)}
                placeholder="Start typing your response here... (Ensure clear paragraph breaks)"
                className="flex-1 min-h-0 w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs leading-relaxed font-serif bg-white text-slate-900 resize-none shadow-inner"
              />

              <div className="pt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Standard tab indentation and evaluation against certified band descriptors.</span>
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  disabled={isSubmitting}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Evaluating...' : 'Submit Essay for Official Evaluation'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ================= SPEAKING MODULE (OFFICIAL 3-PART STRUCTURE) ================= */}
        {activeModule === 'speaking' && (
          <div className="w-full h-full min-h-0 p-6 sm:p-10 max-w-4xl mx-auto overflow-y-auto space-y-6 pb-20">
            
            <div className="text-center space-y-2 border-b border-slate-200 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Official IELTS Speaking Test (Part 1, Part 2 & Part 3)
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900">{speakingTest.title}</h1>
              <p className="text-xs text-slate-500">
                Candidate oral response evaluated across Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation.
              </p>
            </div>

            {/* Speaking Navigation Tabs */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setActiveSpeakingPart(1)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSpeakingPart === 1 
                    ? 'bg-amber-500 text-slate-950 shadow' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <span>Part 1: Introduction</span>
              </button>
              <button
                onClick={() => setActiveSpeakingPart(2)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSpeakingPart === 2 
                    ? 'bg-amber-500 text-slate-950 shadow' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <span>Part 2: Cue Card</span>
              </button>
              <button
                onClick={() => setActiveSpeakingPart(3)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSpeakingPart === 3 
                    ? 'bg-amber-500 text-slate-950 shadow' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <span>Part 3: Discussion</span>
              </button>
            </div>

            {/* PART 1 DISPLAY */}
            {activeSpeakingPart === 1 && (
              <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-bold uppercase text-amber-600">Part 1 • Introduction & Familiar Topics</span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    Candidate Profile & Daily Life Questions
                  </h3>
                </div>
                <div className="space-y-4 text-xs text-slate-800">
                  {speakingTest.part1Prompts.map((p, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 mb-2 uppercase text-[11px] text-amber-700">Topic: {p.topic}</div>
                      <ul className="space-y-1.5 pl-4 list-decimal text-slate-700 font-medium">
                        {p.questions.map((q, qIdx) => (
                          <li key={qIdx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PART 2 DISPLAY */}
            {activeSpeakingPart === 2 && (
              <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-bold uppercase text-amber-600">Part 2 • Individual Long Turn</span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    {speakingTest.part2CueCard.topic}
                  </h3>
                </div>
                <div className="space-y-2 text-xs text-slate-700">
                  <p className="font-semibold text-slate-800">You should say:</p>
                  <ul className="space-y-1.5 pl-4 list-disc text-slate-700">
                    {speakingTest.part2CueCard.bulletPoints.map((bp, i) => (
                      <li key={i}>{bp}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-slate-500 pt-2 italic">
                    You have 1 minute to prepare notes, followed by 1 to 2 minutes of continuous speaking.
                  </p>
                </div>
              </div>
            )}

            {/* PART 3 DISPLAY */}
            {activeSpeakingPart === 3 && (
              <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-bold uppercase text-amber-600">Part 3 • Analytical Two-Way Discussion</span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    {speakingTest.part3Discussion.topic}
                  </h3>
                </div>
                <div className="space-y-3 text-xs text-slate-800">
                  <p className="font-semibold text-slate-800">Discuss the following abstract issues:</p>
                  <ul className="space-y-2 pl-4 list-decimal text-slate-700 font-medium">
                    {speakingTest.part3Discussion.questions.map((q, idx) => (
                      <li key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Speaking Controls & Waveform */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl text-center space-y-4 border border-slate-800">
              
              {speakingPrepActive && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Preparation Time Remaining
                  </div>
                  <div className="text-4xl font-extrabold text-amber-400 font-mono">
                    00:{speakingPrepTime < 10 ? `0${speakingPrepTime}` : speakingPrepTime}
                  </div>
                  <p className="text-xs text-slate-400">Make notes on paper or organize your talking points.</p>
                </div>
              )}

              {!speakingPrepActive && !speakingRecording && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {activeSpeakingPart === 2 && (
                    <button
                      onClick={handleStartSpeakingPrep}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow transition active:scale-95 cursor-pointer"
                    >
                      Start 1-Minute Prep Countdown
                    </button>
                  )}
                  <button
                    onClick={handleStartSpeakingRecording}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow transition active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Record Part {activeSpeakingPart} Response</span>
                  </button>
                  {activeSpeakingPart < 3 && (
                    <button
                      onClick={() => setActiveSpeakingPart((prev) => (prev + 1) as 1 | 2 | 3)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold underline px-3 py-2 cursor-pointer"
                    >
                      Go to Part {activeSpeakingPart + 1} &rarr;
                    </button>
                  )}
                </div>
              )}

              {speakingRecording && (
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center mx-auto animate-pulse">
                    <Mic className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Recording Part {activeSpeakingPart} Speech Response...</div>
                    <div className="text-xs text-slate-400">Speech-to-text analyzing Fluency, Vocabulary, Grammar, and Pronunciation</div>
                  </div>

                  {/* Waveform meter */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden max-w-md mx-auto">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 transition-all duration-75"
                      style={{ width: `${Math.max(10, speakingVolume)}%` }}
                    ></div>
                  </div>

                  <button
                    onClick={handleStopSpeakingRecording}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition border border-slate-700 cursor-pointer"
                  >
                    Stop Recording Part {activeSpeakingPart}
                  </button>
                </div>
              )}

              {/* Accumulated Transcripts */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left max-h-36 overflow-y-auto text-xs space-y-2">
                <div className="text-[10px] uppercase font-mono text-slate-500">Candidate Speech Transcript</div>
                {part1Transcript && (
                  <p className="text-slate-300"><strong className="text-amber-400">Part 1:</strong> {part1Transcript}</p>
                )}
                {part2Transcript && (
                  <p className="text-slate-300"><strong className="text-amber-400">Part 2:</strong> {part2Transcript}</p>
                )}
                {part3Transcript && (
                  <p className="text-slate-300"><strong className="text-amber-400">Part 3:</strong> {part3Transcript}</p>
                )}
                {!part1Transcript && !part2Transcript && !part3Transcript && (
                  <p className="text-slate-500 italic">No speech recorded yet. Click "Record Response" to begin speaking.</p>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* OFFICIAL CD-IELTS BOTTOM NAVIGATION BAR (ALL 40 QUESTIONS) */}
      {(activeModule === 'reading' || activeModule === 'listening') && (
        <footer className="h-12 flex-shrink-0 bg-[#1f2937] text-white px-4 border-t border-slate-700 flex items-center justify-between gap-2 text-xs select-none">
          
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[11px] text-slate-400 font-semibold uppercase whitespace-nowrap hidden sm:inline">
              Questions (1–{questionsList.length})
            </span>
            <div className="flex items-center gap-1 overflow-x-auto max-w-md sm:max-w-2xl py-1">
              {questionsList.map((q) => {
                const isAnswered = Boolean(userAnswers[q.number]);
                const isFlagged = Boolean(flaggedQuestions[q.number]);
                const isActive = activeQuestionNumber === q.number;

                return (
                  <button
                    key={q.number}
                    type="button"
                    onClick={() => scrollToQuestion(q.number)}
                    className={`w-7 h-7 rounded text-[11px] font-bold relative transition flex items-center justify-center cursor-pointer flex-shrink-0 ${
                      isActive 
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-white' 
                        : isAnswered 
                        ? 'bg-slate-700 text-white border border-slate-500' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span>{q.number}</span>
                    {isFlagged && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-1 -right-1"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                if (activeQuestionNumber > 1) {
                  scrollToQuestion(activeQuestionNumber - 1);
                }
              }}
              disabled={activeQuestionNumber === 1}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeQuestionNumber < questionsList.length) {
                  scrollToQuestion(activeQuestionNumber + 1);
                }
              }}
              disabled={activeQuestionNumber === questionsList.length}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </footer>
      )}

      {/* Pre-Test Equipment & Audio Device Check */}
      <PreTestAudioCheckModal
        isOpen={pendingAudioCheckModule !== null}
        moduleType={pendingAudioCheckModule || 'listening'}
        testTitle={pendingAudioCheckModule === 'speaking' ? 'CD-IELTS Speaking Module' : 'CD-IELTS Listening Module'}
        category="CD-IELTS"
        hasSpeaking={pendingAudioCheckModule === 'speaking'}
        onProceed={handleAudioCheckPassed}
        onCancel={handleAudioCheckCancelled}
      />

    </div>
  );
};
