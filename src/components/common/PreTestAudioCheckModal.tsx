/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones, 
  Mic, 
  MicOff, 
  Volume2, 
  Play, 
  Square, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  X,
  Sparkles
} from 'lucide-react';

interface PreTestAudioCheckModalProps {
  isOpen: boolean;
  moduleType: 'listening' | 'speaking' | 'pte' | 'full_mock' | 'reading' | 'writing' | string;
  testTitle?: string;
  category?: string;
  hasSpeaking?: boolean;
  onProceed: () => void;
  onCancel: () => void;
}

export const PreTestAudioCheckModal: React.FC<PreTestAudioCheckModalProps> = ({
  isOpen,
  moduleType,
  testTitle = 'Exam Simulation',
  category = '',
  hasSpeaking,
  onProceed,
  onCancel,
}) => {
  const titleLower = (testTitle || '').toLowerCase();
  const moduleLower = (moduleType || '').toLowerCase();
  const categoryLower = (category || '').toLowerCase();

  // Explicit recognition for all 4 Listening categories:
  // 1. CD-IELTS Listening
  // 2. PTE Academic Listening
  // 3. PTE Academic UKVI Listening
  // 4. PTE Core Listening
  const isListeningTest = 
    moduleLower === 'listening' ||
    titleLower.includes('listening') ||
    categoryLower.includes('listening') ||
    titleLower.includes('cd-ielts listening') ||
    titleLower.includes('pte academic listening') ||
    titleLower.includes('pte academic ukvi listening') ||
    titleLower.includes('pte ukvi listening') ||
    titleLower.includes('pte core listening') ||
    titleLower.includes('dictation') ||
    titleLower.includes('summarize spoken');

  // Speaking tasks that actually require voice recording
  const isSpeakingTest = !isListeningTest && (
    hasSpeaking === true ||
    moduleLower === 'speaking' ||
    titleLower.includes('speaking') ||
    titleLower.includes('spoken') ||
    titleLower.includes('read aloud') ||
    titleLower.includes('repeat sentence') ||
    titleLower.includes('describe image') ||
    (moduleLower === 'pte' && hasSpeaking !== false && !isListeningTest)
  );

  // Determine required checks based on test requirements
  // Audio playback / headphones required for listening & speaking
  const requiresHeadphones = isListeningTest || isSpeakingTest || moduleLower === 'full_mock';
  
  // Microphone permission & checks ONLY apply to Speaking tasks that actually require voice recording.
  // Never required for CD-IELTS Listening, PTE Academic Listening, PTE Academic UKVI Listening, or PTE Core Listening.
  const requiresMicrophone = !isListeningTest && isSpeakingTest;

  // Specific label for listening categories
  const listeningCategoryName = 
    titleLower.includes('ukvi') || categoryLower.includes('ukvi')
      ? 'PTE Academic UKVI Listening'
      : titleLower.includes('core') || categoryLower.includes('core')
      ? 'PTE Core Listening'
      : titleLower.includes('pte') || categoryLower.includes('pte')
      ? 'PTE Academic Listening'
      : 'CD-IELTS Listening';

  // Headphone / Audio Output Check State
  const [isPlayingTone, setIsPlayingTone] = useState(false);
  const [toneHasPlayed, setToneHasPlayed] = useState(false);
  const [outputConfirmed, setOutputConfirmed] = useState<boolean | null>(null);

  // Microphone Check State
  const [micPermissionState, setMicPermissionState] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);
  const [peakDetected, setPeakDetected] = useState<boolean>(false);

  // Voice Sample Record & Playback State
  const [isRecordingSample, setIsRecordingSample] = useState(false);
  const [recordingCountdown, setRecordingCountdown] = useState(4);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecordedAudio, setIsPlayingRecordedAudio] = useState(false);
  const [voiceAudibleConfirmed, setVoiceAudibleConfirmed] = useState<boolean | null>(null);

  // Troubleshooting drawer toggle
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  // Audio Context & Stream Refs for robust cleanup
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Stop and release all hardware resources
  const releaseMediaStreams = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // Ignored
      }
      audioContextRef.current = null;
    }

    if (recordedAudioElementRef.current) {
      recordedAudioElementRef.current.pause();
      recordedAudioElementRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // Ignored
      }
    }
    mediaRecorderRef.current = null;
  };

  // Reset local state when opened or closed
  useEffect(() => {
    if (!isOpen) {
      releaseMediaStreams();
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
        setRecordedAudioUrl(null);
      }
      setIsPlayingTone(false);
      setToneHasPlayed(false);
      setOutputConfirmed(null);
      setMicPermissionState('idle');
      setMicErrorMessage(null);
      setMicVolumeLevel(0);
      setPeakDetected(false);
      setIsRecordingSample(false);
      setVoiceAudibleConfirmed(null);
      setShowTroubleshooting(false);
    }

    return () => {
      releaseMediaStreams();
    };
  }, [isOpen]);

  // Clean up recorded audio object URL when updated or unmounted
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  if (!isOpen) return null;

  // 1. Play Tone via Web Audio API (Chime: C5 -> E5 -> G5)
  const playSampleAudioTone = async () => {
    try {
      setIsPlayingTone(true);
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const notes = [
        { freq: 523.25, time: 0.0, duration: 0.28 }, // C5
        { freq: 659.25, time: 0.26, duration: 0.28 }, // E5
        { freq: 783.99, time: 0.52, duration: 0.55 }, // G5
      ];

      notes.forEach(({ freq, time, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + duration);
      });

      setTimeout(() => {
        setIsPlayingTone(false);
        setToneHasPlayed(true);
        try {
          ctx.close();
        } catch (e) {
          // Ignored
        }
      }, 1200);
    } catch (err) {
      console.error('Audio tone playback failed:', err);
      setIsPlayingTone(false);
      setToneHasPlayed(true);
    }
  };

  // 2. Request Microphone & Start Level Meter
  const requestMicrophoneAccess = async () => {
    setMicPermissionState('requesting');
    setMicErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setMicPermissionState('granted');

      // Setup audio analyzer for volume meter
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalizedVolume = Math.min(100, Math.round((avg / 128) * 100));

        setMicVolumeLevel(normalizedVolume);
        if (normalizedVolume > 15) {
          setPeakDetected(true);
        }

        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (err: any) {
      console.warn('Microphone access denied or unavailable:', err);
      setMicPermissionState('denied');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicErrorMessage('Permission blocked: Please click the lock/tune icon in the address bar to allow microphone access.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicErrorMessage('No microphone detected: Please check that your headset microphone is plugged in.');
      } else {
        setMicErrorMessage(err.message || 'Unable to access audio device. Please check hardware settings.');
      }
      setShowTroubleshooting(true);
    }
  };

  // 3. Record Short Voice Sample (4 seconds)
  const startRecordingSample = () => {
    if (!streamRef.current) {
      requestMicrophoneAccess();
      return;
    }

    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }

    audioChunksRef.current = [];
    setIsRecordingSample(true);
    setRecordingCountdown(4);
    setVoiceAudibleConfirmed(null);

    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        setIsRecordingSample(false);
      };

      mediaRecorder.start();

      let secondsLeft = 4;
      const interval = setInterval(() => {
        secondsLeft -= 1;
        setRecordingCountdown(secondsLeft);
        if (secondsLeft <= 0) {
          clearInterval(interval);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }
      }, 1000);
    } catch (err: any) {
      console.error('Failed to start sample recording:', err);
      setIsRecordingSample(false);
    }
  };

  // 4. Play back the recorded voice sample
  const playRecordedSample = () => {
    if (!recordedAudioUrl) return;

    if (recordedAudioElementRef.current) {
      recordedAudioElementRef.current.pause();
    }

    const audio = new Audio(recordedAudioUrl);
    recordedAudioElementRef.current = audio;
    setIsPlayingRecordedAudio(true);

    audio.onended = () => {
      setIsPlayingRecordedAudio(false);
    };
    audio.onerror = () => {
      setIsPlayingRecordedAudio(false);
    };

    audio.play().catch((err) => {
      console.error('Sample playback error:', err);
      setIsPlayingRecordedAudio(false);
    });
  };

  // Check whether all required conditions are satisfied
  const isHeadphonePassed = !requiresHeadphones || outputConfirmed === true;
  const isMicPassed = !requiresMicrophone || (
    micPermissionState === 'granted' && 
    (peakDetected || micVolumeLevel > 10) && 
    voiceAudibleConfirmed === true
  );

  const canProceed = isHeadphonePassed && isMicPassed;

  // Handle final proceed
  const handleProceedClick = () => {
    releaseMediaStreams();
    onProceed();
  };

  // Handle cancel / exit
  const handleCancelClick = () => {
    releaseMediaStreams();
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0b1329] border border-slate-700/80 rounded-2xl w-full max-w-2xl text-slate-100 shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isListeningTest 
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isListeningTest 
                    ? 'text-sky-300 bg-sky-400/10 border-sky-400/25' 
                    : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                }`}>
                  {isListeningTest ? `${listeningCategoryName} • Audio Playback Only` : 'Mandatory System Check'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {isListeningTest ? 'NO MIC NEEDED' : moduleType.toUpperCase()}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {isListeningTest ? 'Pre-Test Headphone & Audio Check' : 'Pre-Test Audio & Equipment Check'}
              </h2>
            </div>
          </div>

          <button
            onClick={handleCancelClick}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            title="Cancel and Exit"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Bar */}
        <div className="bg-slate-900/50 border-b border-slate-800/80 px-6 py-2.5 text-xs text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Target Test: <strong className="text-white">{testTitle}</strong>.{' '}
            {isListeningTest ? (
              <span className="text-emerald-300 font-medium">
                Microphone permission is <strong>NOT required</strong> for this {listeningCategoryName} exam. Please confirm your headphones or speakers below to enter.
              </span>
            ) : (
              'To guarantee an authentic and fair examination, please verify your headphones and microphone below.'
            )}
          </span>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* STEP 1: Headphone & Sound Output Check */}
          {requiresHeadphones && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    outputConfirmed === true 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Sound Output & Headphone Check</span>
                      {outputConfirmed === true && (
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Pass
                        </span>
                      )}
                      {outputConfirmed === false && (
                        <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Needs Attention
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isListeningTest 
                        ? 'Play the sample chime and confirm you hear it distinctly in your headphones or speakers. Microphone access is not needed.'
                        : 'Play the test chime and confirm you hear it distinctly in your headphones.'}
                    </p>
                  </div>
                </div>

                {/* Play Tone Button */}
                <button
                  onClick={playSampleAudioTone}
                  disabled={isPlayingTone}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow transition shrink-0 ${
                    isPlayingTone
                      ? 'bg-amber-500 text-slate-950 animate-pulse'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {isPlayingTone ? (
                    <>
                      <Volume2 className="w-4 h-4 animate-bounce" />
                      <span>Playing Sound...</span>
                    </>
                  ) : (
                    <>
                      {toneHasPlayed ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{toneHasPlayed ? 'Replay Audio Tone' : 'Play Sample Tone'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sound confirmation query */}
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white">Verification: </span>
                  Can you clearly hear the sound in your headphones or speakers?
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setOutputConfirmed(true);
                      setShowTroubleshooting(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      outputConfirmed === true
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Yes, I hear it clearly</span>
                  </button>

                  <button
                    onClick={() => {
                      setOutputConfirmed(false);
                      setShowTroubleshooting(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      outputConfirmed === false
                        ? 'bg-red-600/80 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <span>No, cannot hear</span>
                  </button>
                </div>
              </div>

              {/* Sound confirmation feedback */}
              {outputConfirmed === true && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Audio confirmed:</strong> Sound output is clear.{' '}
                    {isListeningTest && (
                      <span className="text-emerald-200">
                        Microphone access is <strong>NOT required</strong> for this {listeningCategoryName} test. You may proceed immediately.
                      </span>
                    )}
                  </span>
                </div>
              )}

              {/* Honest headphone disclaimer per prompt guidelines */}
              <p className="text-[11px] text-slate-500 italic leading-relaxed">
                * Note: Successful audio playback confirms your browser sound engine and your manual confirmation. It does not physically verify whether external headphones or speakers are connected—please ensure your headset is worn comfortably before beginning the test.
              </p>
            </div>
          )}

          {/* STEP 2 & 3: Microphone Permission, Level Meter & Voice Playback */}
          {requiresMicrophone && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    voiceAudibleConfirmed === true 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Microphone Input & Voice Clarity</span>
                      {voiceAudibleConfirmed === true && (
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Pass
                        </span>
                      )}
                      {micPermissionState === 'denied' && (
                        <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1">
                          <MicOff className="w-3 h-3" /> Blocked
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Allow microphone access, speak to test the level meter, and record a short sample.
                    </p>
                  </div>
                </div>

                {/* Connect / Reconnect Mic */}
                {micPermissionState !== 'granted' && (
                  <button
                    onClick={requestMicrophoneAccess}
                    disabled={micPermissionState === 'requesting'}
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow transition shrink-0 ${
                      micPermissionState === 'denied'
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-sky-600 hover:bg-sky-500 text-white'
                    }`}
                  >
                    {micPermissionState === 'denied' ? <RotateCcw className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>
                      {micPermissionState === 'requesting' 
                        ? 'Detecting...' 
                        : micPermissionState === 'denied' 
                        ? 'Retry Mic Access' 
                        : 'Enable Microphone'}
                    </span>
                  </button>
                )}
              </div>

              {/* Error Notice if blocked or missing */}
              {micErrorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-300 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-white">{micErrorMessage}</p>
                      <p className="text-[11px] text-red-300/80">
                        Check that your headset is plugged in, or click the site permissions icon in your browser address bar to allow Microphone.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={requestMicrophoneAccess}
                    className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              {/* Live Microphone Visualizer Meter */}
              {micPermissionState === 'granted' && (
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                      <Mic className={`w-3.5 h-3.5 ${micVolumeLevel > 15 ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                      <span>Live Microphone Input Level:</span>
                    </span>
                    <span className={`font-mono text-xs font-bold ${
                      micVolumeLevel > 15 ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {micVolumeLevel > 15 ? 'Input Detected' : 'Speak into mic...'} ({micVolumeLevel}%)
                    </span>
                  </div>

                  {/* Meter Bar */}
                  <div className="w-full bg-slate-800/80 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-75 ${
                        micVolumeLevel > 60
                          ? 'bg-amber-400'
                          : micVolumeLevel > 12
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : 'bg-slate-600'
                      }`}
                      style={{ width: `${Math.max(4, micVolumeLevel)}%` }}
                    />
                  </div>

                  {/* Short Sample Voice Recording */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-300">
                      <span className="font-semibold text-white">Record Voice Sample: </span>
                      Speak: &quot;Testing BrowseraIELTS audio system&quot;
                    </div>

                    <div className="flex items-center gap-2">
                      {!recordedAudioUrl ? (
                        <button
                          onClick={startRecordingSample}
                          disabled={isRecordingSample}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition ${
                            isRecordingSample 
                              ? 'bg-red-600 text-white animate-pulse' 
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          }`}
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>{isRecordingSample ? `Recording (${recordingCountdown}s)...` : 'Record 4s Sample'}</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={playRecordedSample}
                            disabled={isPlayingRecordedAudio}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{isPlayingRecordedAudio ? 'Playing...' : 'Play Back Sample'}</span>
                          </button>

                          <button
                            onClick={startRecordingSample}
                            disabled={isRecordingSample}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 border border-slate-700 transition"
                            title="Record Again"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Re-record</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sample Voice Confirmation */}
                  {recordedAudioUrl && (
                    <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs text-slate-300">
                        Does your recorded voice sound clear without distortion?
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setVoiceAudibleConfirmed(true)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                            voiceAudibleConfirmed === true
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Yes, Voice is Audible</span>
                        </button>

                        <button
                          onClick={() => {
                            setVoiceAudibleConfirmed(false);
                            setShowTroubleshooting(true);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            voiceAudibleConfirmed === false
                              ? 'bg-red-600/80 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <span>No, Unclear</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Collapsible Troubleshooting Guide */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
            <button
              onClick={() => setShowTroubleshooting(!showTroubleshooting)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 hover:text-white transition"
            >
              <span className="flex items-center gap-1.5 font-semibold">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Audio Device Troubleshooting Guide</span>
              </span>
              {showTroubleshooting ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTroubleshooting && (
              <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-3 bg-slate-950/40">
                <div>
                  <h4 className="font-bold text-slate-200">1. Blocked Permissions</h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    Click the <strong>padlock or site settings icon</strong> directly to the left of the URL in your browser address bar. Ensure <strong>Microphone</strong> and <strong>Sound</strong> permissions are set to &quot;Allow&quot;.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">2. Low Volume or No Sound</h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    Check your operating system sound settings (Windows Sound Control Panel or macOS Sound Settings) to confirm output volume is not muted, and input volume is set above 60%.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">3. Headset Microphone Switch</h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    Many testing headsets have a physical hardware mute switch located on the cable cord or earcup. Verify that this mute switch is switched to ON.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Privacy & Zero-Upload Guarantee */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/40 px-3.5 py-2 rounded-lg border border-slate-800/80">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Privacy Guarantee:</strong> All pre-test audio checks and recording samples operate strictly in local browser memory. No audio is recorded, uploaded, or transmitted to any server without your explicit submission during an exam.
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-900/90 border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {canProceed ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-4 h-4" /> {isListeningTest ? 'Sound output verified. You may enter the test now.' : 'All equipment checks passed. You may enter the test.'}
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {isListeningTest ? 'Click "Yes, I hear it clearly" above to unlock test entry.' : 'Complete required checks above to unlock test entry.'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleCancelClick}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleProceedClick}
              disabled={!canProceed}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg ${
                canProceed
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enter Test Now</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
