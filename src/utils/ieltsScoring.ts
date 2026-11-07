/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Official IELTS Academic Reading Band Conversion (out of 40 raw score):
 * 39-40: 9.0 | 37-38: 8.5 | 35-36: 8.0 | 33-34: 7.5 | 30-32: 7.0
 * 27-29: 6.5 | 23-26: 6.0 | 19-22: 5.5 | 15-18: 5.0 | 13-14: 4.5
 * 10-12: 4.0 | 8-9: 3.5   | 6-7: 3.0   | 4-5: 2.5   | 2-3: 2.0
 * 1: 1.0     | 0: 0.0
 */
export function getAcademicReadingBand(rawScore: number, totalQuestions: number = 40): number {
  if (rawScore <= 0 || totalQuestions <= 0) return 0.0;
  
  // Normalize raw score to a 40-question scale if test length differs
  const normalized = totalQuestions === 40 
    ? Math.round(rawScore) 
    : Math.round((rawScore / totalQuestions) * 40);

  if (normalized >= 39) return 9.0;
  if (normalized >= 37) return 8.5;
  if (normalized >= 35) return 8.0;
  if (normalized >= 33) return 7.5;
  if (normalized >= 30) return 7.0;
  if (normalized >= 27) return 6.5;
  if (normalized >= 23) return 6.0;
  if (normalized >= 19) return 5.5;
  if (normalized >= 15) return 5.0;
  if (normalized >= 13) return 4.5;
  if (normalized >= 10) return 4.0;
  if (normalized >= 8) return 3.5;
  if (normalized >= 6) return 3.0;
  if (normalized >= 4) return 2.5;
  if (normalized >= 2) return 2.0;
  if (normalized >= 1) return 1.0;
  return 0.0;
}

/**
 * Official IELTS General Training Reading Band Conversion (out of 40 raw score):
 * 40: 9.0    | 39: 8.5    | 37-38: 8.0 | 36: 7.5    | 34-35: 7.0
 * 32-33: 6.5 | 30-31: 6.0 | 27-29: 5.5 | 23-26: 5.0 | 19-22: 4.5
 * 15-18: 4.0 | 12-14: 3.5 | 8-11: 3.0  | 5-7: 2.5   | 2-4: 2.0
 * 1: 1.0     | 0: 0.0
 */
export function getGeneralReadingBand(rawScore: number, totalQuestions: number = 40): number {
  if (rawScore <= 0 || totalQuestions <= 0) return 0.0;

  const normalized = totalQuestions === 40 
    ? Math.round(rawScore) 
    : Math.round((rawScore / totalQuestions) * 40);

  if (normalized >= 40) return 9.0;
  if (normalized >= 39) return 8.5;
  if (normalized >= 37) return 8.0;
  if (normalized >= 36) return 7.5;
  if (normalized >= 34) return 7.0;
  if (normalized >= 32) return 6.5;
  if (normalized >= 30) return 6.0;
  if (normalized >= 27) return 5.5;
  if (normalized >= 23) return 5.0;
  if (normalized >= 19) return 4.5;
  if (normalized >= 15) return 4.0;
  if (normalized >= 12) return 3.5;
  if (normalized >= 8) return 3.0;
  if (normalized >= 5) return 2.5;
  if (normalized >= 2) return 2.0;
  if (normalized >= 1) return 1.0;
  return 0.0;
}

/**
 * Official IELTS Listening Band Conversion (out of 40 raw score, both Academic & General):
 * 39-40: 9.0 | 37-38: 8.5 | 35-36: 8.0 | 32-34: 7.5 | 30-31: 7.0
 * 26-29: 6.5 | 23-25: 6.0 | 18-22: 5.5 | 16-17: 5.0 | 13-15: 4.5
 * 10-12: 4.0 | 8-9: 3.5   | 6-7: 3.0   | 4-5: 2.5   | 2-3: 2.0
 * 1: 1.0     | 0: 0.0
 */
export function getListeningBand(rawScore: number, totalQuestions: number = 40): number {
  if (rawScore <= 0 || totalQuestions <= 0) return 0.0;

  const normalized = totalQuestions === 40 
    ? Math.round(rawScore) 
    : Math.round((rawScore / totalQuestions) * 40);

  if (normalized >= 39) return 9.0;
  if (normalized >= 37) return 8.5;
  if (normalized >= 35) return 8.0;
  if (normalized >= 32) return 7.5;
  if (normalized >= 30) return 7.0;
  if (normalized >= 26) return 6.5;
  if (normalized >= 23) return 6.0;
  if (normalized >= 18) return 5.5;
  if (normalized >= 16) return 5.0;
  if (normalized >= 13) return 4.5;
  if (normalized >= 10) return 4.0;
  if (normalized >= 8) return 3.5;
  if (normalized >= 6) return 3.0;
  if (normalized >= 4) return 2.5;
  if (normalized >= 2) return 2.0;
  if (normalized >= 1) return 1.0;
  return 0.0;
}

/**
 * Official IELTS Speaking & Writing Rounding Convention:
 * The average of the four sub-scores is calculated.
 * - If the average ends in .25, it rounds UP to the next half band (e.g., 6.25 -> 6.5).
 * - If the average ends in .75, it rounds UP to the next whole band (e.g., 6.75 -> 7.0).
 * - If the average ends in .125 or .375 etc., it rounds to the closest half or whole band.
 */
export function calculateOverallBandFromCriteria(
  criteria: [number, number, number, number]
): number {
  const sum = criteria.reduce((a, b) => a + b, 0);
  if (sum === 0) return 0.0;
  
  const rawAvg = sum / 4;
  const intPart = Math.floor(rawAvg);
  const frac = rawAvg - intPart;

  if (frac < 0.25) {
    return intPart;
  } else if (frac < 0.75) {
    return intPart + 0.5;
  } else {
    return intPart + 1.0;
  }
}

/**
 * Rigorous answer evaluation matching IELTS test-checking rules:
 * - Case-insensitive
 * - Removes leading/trailing spaces and internal duplicate whitespace
 * - Handles punctuation and brackets
 * - Handles True/False/Not Given shortcuts ("T", "F", "NG")
 * - Handles letter-only vs full letter options (e.g. "B" vs "B. Option text")
 */
export function evaluateAnswer(userAnswer: string | undefined | null, correctAnswer: string | string[]): boolean {
  if (!userAnswer) return false;
  const cleanUser = cleanAnswerString(userAnswer);
  if (!cleanUser) return false;

  const validAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];

  for (const target of validAnswers) {
    const cleanTarget = cleanAnswerString(target);
    if (!cleanTarget) continue;

    // Direct match
    if (cleanUser === cleanTarget) return true;

    // Handle True / False / Not Given shortcuts
    if (isTrueFalseMatch(cleanUser, cleanTarget)) return true;

    // Handle multiple choice single letter comparison (e.g. "B" vs "B. Something")
    if (isMultipleChoiceMatch(cleanUser, cleanTarget)) return true;

    // Handle numeric or simple variations (e.g. "401" vs "cr-401")
    if (isNumericOrCodeMatch(cleanUser, cleanTarget)) return true;
  }

  return false;
}

function cleanAnswerString(val: string): string {
  return val
    .trim()
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isTrueFalseMatch(user: string, target: string): boolean {
  const tMap: Record<string, string> = {
    't': 'true',
    'true': 'true',
    'yes': 'true',
    'y': 'true',
    'f': 'false',
    'false': 'false',
    'no': 'false',
    'n': 'false',
    'ng': 'not given',
    'not given': 'not given',
    'notgiven': 'not given'
  };

  const normUser = tMap[user];
  const normTarget = tMap[target];
  return Boolean(normUser && normTarget && normUser === normTarget);
}

function isMultipleChoiceMatch(user: string, target: string): boolean {
  // If target is like "b" or "b option", extract first character if it's a-d
  const userFirst = user.charAt(0);
  const targetFirst = target.charAt(0);
  if (['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].includes(userFirst)) {
    if (user === targetFirst || userFirst === target || userFirst === targetFirst) {
      return true;
    }
  }
  return false;
}

function isNumericOrCodeMatch(user: string, target: string): boolean {
  const userNum = user.replace(/[^a-z0-9]/g, '');
  const targetNum = target.replace(/[^a-z0-9]/g, '');
  return Boolean(userNum && targetNum && userNum === targetNum);
}

/**
 * Returns CEFR descriptor and official IELTS user level based on band score.
 */
export function getIeltsBandDescriptor(band: number): { label: string; cefr: string } {
  if (band >= 9.0) return { label: 'Expert User', cefr: 'C2' };
  if (band >= 8.0) return { label: 'Very Good User', cefr: 'C1/C2' };
  if (band >= 7.0) return { label: 'Good User', cefr: 'C1' };
  if (band >= 6.0) return { label: 'Competent User', cefr: 'B2' };
  if (band >= 5.0) return { label: 'Modest User', cefr: 'B1' };
  if (band >= 4.0) return { label: 'Limited User', cefr: 'B1' };
  if (band >= 3.0) return { label: 'Extremely Limited User', cefr: 'A2' };
  if (band >= 2.0) return { label: 'Intermittent User', cefr: 'A1' };
  if (band >= 1.0) return { label: 'Non-User', cefr: 'A0' };
  return { label: 'Did Not Attempt / Zero Score', cefr: 'N/A' };
}
