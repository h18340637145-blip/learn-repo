import type { LessonSpec } from "../curriculum/types";
import type { ProgressSnapshot } from "./types";

export type LearningReport = {
  answeredQuestions: number;
  totalQuestions: number;
  firstTryCorrect: number;
  firstTryAccuracy: number;
  reviewQuestions: number;
  lastAnsweredAt: string | null;
};

export function buildLearningReport(progress: ProgressSnapshot, publishedLessons: LessonSpec[]): LearningReport {
  const publishedQuestionIds = new Set(
    publishedLessons.flatMap((lesson) => lesson.questions.map((question) => question.id))
  );
  const records = Object.values(progress.questionAttempts)
    .filter((record) => publishedQuestionIds.has(record.questionId));
  const answeredQuestions = records.length;
  const firstTryCorrect = records.filter((record) => record.firstAttemptCorrect).length;
  const reviewQuestions = records.filter((record) => record.needsReview).length;
  const lastAnsweredAt = records
    .map((record) => record.lastAnsweredAt)
    .sort()
    .at(-1) ?? null;

  return {
    answeredQuestions,
    totalQuestions: publishedQuestionIds.size,
    firstTryCorrect,
    firstTryAccuracy: answeredQuestions === 0 ? 0 : Math.round((firstTryCorrect / answeredQuestions) * 100),
    reviewQuestions,
    lastAnsweredAt
  };
}
