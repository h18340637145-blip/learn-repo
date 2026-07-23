import type { LessonSpec, LessonQuestion } from "../curriculum/types";
import type { ProgressSnapshot, QuestionAttemptRecord } from "./types";

export type ReviewCardItem = {
  question: LessonQuestion;
  lesson: LessonSpec;
  record?: QuestionAttemptRecord;
  reason: "needs-review" | "ebbinghaus-due" | "practice";
};

export type SM2Result = {
  easinessFactor: number;
  intervalDays: number;
  nextReviewAt: string;
  reviewState: "new" | "reviewing" | "mastered";
};

// Spaced repetition fallback intervals in milliseconds
const INTERVALS_MS = [
  1 * 24 * 60 * 60 * 1000,  // 1 day
  3 * 24 * 60 * 60 * 1000,  // 3 days
  7 * 24 * 60 * 60 * 1000,  // 7 days
  14 * 24 * 60 * 60 * 1000, // 14 days
  30 * 24 * 60 * 60 * 1000, // 30 days
];

export function calculateSM2NextReview(
  isCorrect: boolean,
  attemptsCount: number,
  prevEf = 2.5,
  prevInterval = 1
): SM2Result {
  // Quality q: 5 if first try correct, 3 if 2nd try, 1 if 3+ tries, 0 if wrong
  let q = 0;
  if (isCorrect) {
    if (attemptsCount <= 1) q = 5;
    else if (attemptsCount === 2) q = 3;
    else q = 1;
  } else {
    q = 0;
  }

  // SM-2 formula
  const newEf = Math.max(1.3, prevEf + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  let intervalDays = 1;
  if (q >= 3) {
    if (prevInterval <= 1) {
      intervalDays = 3;
    } else if (prevInterval <= 3) {
      intervalDays = 7;
    } else {
      intervalDays = Math.round(prevInterval * newEf);
    }
  } else {
    intervalDays = 1;
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);

  let reviewState: "new" | "reviewing" | "mastered" = "reviewing";
  if (isCorrect && attemptsCount <= 1 && newEf >= 2.4) {
    reviewState = "mastered";
  } else if (!isCorrect) {
    reviewState = "reviewing";
  }

  return {
    easinessFactor: Number(newEf.toFixed(2)),
    intervalDays,
    nextReviewAt: nextDate.toISOString(),
    reviewState
  };
}

function isEbbinghausDue(record: QuestionAttemptRecord, nowMs: number): boolean {
  if (record.nextReviewAt) {
    const nextTime = Date.parse(record.nextReviewAt);
    if (!Number.isNaN(nextTime)) {
      return nowMs >= nextTime;
    }
  }

  const lastTime = Date.parse(record.lastAnsweredAt);
  if (Number.isNaN(lastTime)) return false;

  const attemptIndex = Math.min(record.attempts - 1, INTERVALS_MS.length - 1);
  const interval = INTERVALS_MS[attemptIndex]!;

  return nowMs - lastTime >= interval;
}

export function getReviewDeck(
  progress: ProgressSnapshot,
  publishedLessons: readonly LessonSpec[],
  limit = 10
): ReviewCardItem[] {
  const allQuestionsMap = new Map<string, { question: LessonQuestion; lesson: LessonSpec }>();

  publishedLessons.forEach((lesson) => {
    const questions = lesson.steps ? lesson.steps.map(s => s.question) : lesson.questions;
    questions.forEach((q) => {
      allQuestionsMap.set(q.id, { question: q, lesson });
    });
  });

  const now = Date.now();
  const dueItems: ReviewCardItem[] = [];
  const normalItems: ReviewCardItem[] = [];

  Object.values(progress.questionAttempts).forEach((record) => {
    const target = allQuestionsMap.get(record.questionId);
    if (!target) return;

    if (record.needsReview) {
      dueItems.push({
        question: target.question,
        lesson: target.lesson,
        record,
        reason: "needs-review"
      });
    } else if (isEbbinghausDue(record, now)) {
      dueItems.push({
        question: target.question,
        lesson: target.lesson,
        record,
        reason: "ebbinghaus-due"
      });
    } else {
      normalItems.push({
        question: target.question,
        lesson: target.lesson,
        record,
        reason: "practice"
      });
    }
  });

  // If dueItems are fewer than limit, fill in with any answered questions for reinforcement
  if (dueItems.length < limit) {
    const remainingCount = limit - dueItems.length;
    const additional = normalItems.slice(0, remainingCount);
    return [...dueItems, ...additional];
  }

  return dueItems.slice(0, limit);
}
