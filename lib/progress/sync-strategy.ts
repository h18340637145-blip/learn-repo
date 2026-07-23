import type { ProgressSnapshot, QuestionAttemptRecord } from "./types";

export function mergeQuestionAttemptRecord(
  local?: QuestionAttemptRecord,
  cloud?: QuestionAttemptRecord
): QuestionAttemptRecord | undefined {
  if (!local) return cloud;
  if (!cloud) return local;

  const localLast = Date.parse(local.lastAnsweredAt) || 0;
  const cloudLast = Date.parse(cloud.lastAnsweredAt) || 0;
  const latestRecord = localLast >= cloudLast ? local : cloud;

  const localFirst = Date.parse(local.firstAnsweredAt) || Date.now();
  const cloudFirst = Date.parse(cloud.firstAnsweredAt) || Date.now();
  const earliestFirstAnsweredAt = new Date(Math.min(localFirst, cloudFirst)).toISOString();

  return {
    ...latestRecord,
    firstAnsweredAt: earliestFirstAnsweredAt,
    firstAttemptCorrect: local.firstAttemptCorrect && cloud.firstAttemptCorrect,
    attempts: Math.max(local.attempts, cloud.attempts),
    needsReview: local.needsReview || cloud.needsReview
  };
}

export function mergeProgressSnapshots(
  local: ProgressSnapshot,
  cloud: ProgressSnapshot
): ProgressSnapshot {
  const completedLessonIdsMap = new Set([
    ...local.completedLessonIds.filter(Boolean),
    ...cloud.completedLessonIds.filter(Boolean)
  ]);

  const completedProjectIdsMap = new Set([
    ...local.completedProjectIds.filter(Boolean),
    ...cloud.completedProjectIds.filter(Boolean)
  ]);

  const reviewLessonIdsMap = new Set([
    ...local.reviewLessonIds.filter(Boolean),
    ...cloud.reviewLessonIds.filter(Boolean)
  ]);

  const mergedAttempts: Record<string, QuestionAttemptRecord> = {};
  const allQuestionIds = new Set([
    ...Object.keys(local.questionAttempts || {}),
    ...Object.keys(cloud.questionAttempts || {})
  ]);

  allQuestionIds.forEach((qId) => {
    const merged = mergeQuestionAttemptRecord(
      local.questionAttempts[qId],
      cloud.questionAttempts[qId]
    );
    if (merged) {
      mergedAttempts[qId] = merged;
    }
  });

  const localTime = Date.parse(local.updatedAt || "") || 0;
  const cloudTime = Date.parse(cloud.updatedAt || "") || 0;
  const latestTime = Math.max(localTime, cloudTime, Date.now());

  return {
    version: 1,
    courseId: local.courseId || cloud.courseId || "nodejs",
    completedLessonIds: Array.from(completedLessonIdsMap),
    completedProjectIds: Array.from(completedProjectIdsMap),
    reviewLessonIds: Array.from(reviewLessonIdsMap),
    questionAttempts: mergedAttempts,
    updatedAt: new Date(latestTime).toISOString()
  };
}
