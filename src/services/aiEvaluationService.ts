/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AiEvaluationReport } from '../types';
import { performLinguisticSpeakingEvaluation, performLinguisticWritingEvaluation } from '../server/linguisticEvaluator';

export const BACKEND_INTEGRATION_CONFIG = {
  endpoints: {
    writingEvaluation: '/api/evaluate/writing',
    speakingEvaluation: '/api/evaluate/speaking',
    speechToText: '/api/stt/transcribe',
    databaseSync: '/api/db/sync',
  },
  supportedModels: ['gemini-3.8-flash', 'gemini-4-argon'],
  isBackendConnected: true,
  isGeminiConfigured: true
};

export async function evaluateWritingSubmission(
  taskPrompt: string,
  userEssay: string,
  taskNumber: 1 | 2 = 2
): Promise<AiEvaluationReport> {
  const cleanEssay = (userEssay || '').trim();

  // 1. Try secure backend evaluation endpoint
  try {
    const res = await fetch('/api/evaluate/writing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: taskPrompt,
        text: cleanEssay,
        taskNumber
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.report && typeof data.report.overallBand === 'number') {
        return data.report;
      }
    }
  } catch (err) {
    console.warn('Backend writing evaluation unreachable, applying linguistic engine:', err);
  }

  // 2. Client-side linguistic evaluation engine (Official IELTS criteria, non-fixed)
  return performLinguisticWritingEvaluation(taskPrompt, cleanEssay, taskNumber);
}

export async function evaluateSpeakingSubmission(
  partPrompt: string,
  transcript: string,
  audioDurationSeconds: number
): Promise<AiEvaluationReport> {
  const cleanTranscript = (transcript || '').trim();
  const dur = Math.max(audioDurationSeconds || 0, 10);

  // 1. Try secure backend evaluation endpoint
  try {
    const res = await fetch('/api/evaluate/speaking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: partPrompt,
        transcript: cleanTranscript,
        durationSeconds: dur
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.report && typeof data.report.overallBand === 'number') {
        return data.report;
      }
    }
  } catch (err) {
    console.warn('Backend speaking evaluation unreachable, applying linguistic engine:', err);
  }

  // 2. Client-side linguistic evaluation engine (Official IELTS criteria, non-fixed)
  return performLinguisticSpeakingEvaluation(partPrompt, cleanTranscript, dur);
}
