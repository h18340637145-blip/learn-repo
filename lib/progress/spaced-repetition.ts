import type { LessonSpec, LessonQuestion } from "../curriculum/types";
import type { ProgressSnapshot, QuestionAttemptRecord } from "./types";

export type ReviewCardItem = {
  question: LessonQuestion;
  lesson: LessonSpec;
  record?: QuestionAttemptRecord;
  reason: "needs-review" | "ebbinghaus-due" | "practice";
};

// Spaced repetition intervals in milliseconds
const INTERVALS_MS = [
  1 * 24 * 60 * 60 * 1000,  // 1 day
  3 * 24 * 60 * 60 * 1000,  // 3 days
  7 * 24 * 60 * 60 * 1000,  // 7 days
  14 * 24 * 60 * 60 * 1000, // 14 days
  30 * 24 * 60 * 60 * 1000, // 30 days
];

function isEbbinghausDue(record: QuestionAttemptRecord, nowMs: number): boolean {
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
