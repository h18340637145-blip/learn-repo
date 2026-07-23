import assert from "node:assert/strict";
import test from "node:test";

import { mergeProgressSnapshots, mergeQuestionAttemptRecord } from "../../lib/progress/sync-strategy";
import type { ProgressSnapshot, QuestionAttemptRecord } from "../../lib/progress/types";

test("mergeQuestionAttemptRecord 选择包含最新 lastAnsweredAt 的主记录，并保留最早 firstAnsweredAt 与逻辑并集", () => {
  const localRecord: QuestionAttemptRecord = {
    questionId: "q1",
    lessonId: "lesson-1",
    stageId: "runtime-cli",
    selectedOptionId: "opt-a",
    isCorrect: false,
    firstAttemptCorrect: false,
    attempts: 2,
    firstAnsweredAt: "2026-07-21T10:00:00.000Z",
    lastAnsweredAt: "2026-07-22T10:00:00.000Z",
    needsReview: true
  };

  const cloudRecord: QuestionAttemptRecord = {
    questionId: "q1",
    lessonId: "lesson-1",
    stageId: "runtime-cli",
    selectedOptionId: "opt-b",
    isCorrect: true,
    firstAttemptCorrect: true,
    attempts: 1,
    firstAnsweredAt: "2026-07-20T10:00:00.000Z",
    lastAnsweredAt: "2026-07-23T10:00:00.000Z",
    needsReview: false
  };

  const merged = mergeQuestionAttemptRecord(localRecord, cloudRecord);

  assert.ok(merged);
  assert.equal(merged.selectedOptionId, "opt-b");
  assert.equal(merged.firstAnsweredAt, "2026-07-20T10:00:00.000Z");
  assert.equal(merged.lastAnsweredAt, "2026-07-23T10:00:00.000Z");
  assert.equal(merged.firstAttemptCorrect, false); // once false, stays false
  assert.equal(merged.attempts, 2); // max of 2 and 1
  assert.equal(merged.needsReview, true); // union of needsReview
});

test("mergeProgressSnapshots 合并已完成课程、阶段项目与多设备作答记录", () => {
  const localSnapshot: ProgressSnapshot = {
    version: 1,
    courseId: "nodejs",
    completedLessonIds: ["lesson-1", "lesson-2"],
    completedProjectIds: ["project-1"],
    reviewLessonIds: ["lesson-1"],
    questionAttempts: {
      q1: {
        questionId: "q1",
        lessonId: "lesson-1",
        stageId: "runtime-cli",
        selectedOptionId: "opt-a",
        isCorrect: true,
        firstAttemptCorrect: true,
        attempts: 1,
        firstAnsweredAt: "2026-07-21T00:00:00.000Z",
        lastAnsweredAt: "2026-07-21T00:00:00.000Z",
        needsReview: false
      }
    },
    updatedAt: "2026-07-21T00:00:00.000Z"
  };

  const cloudSnapshot: ProgressSnapshot = {
    version: 1,
    courseId: "nodejs",
    completedLessonIds: ["lesson-2", "lesson-3"],
    completedProjectIds: ["project-2"],
    reviewLessonIds: ["lesson-3"],
    questionAttempts: {
      q2: {
        questionId: "q2",
        lessonId: "lesson-2",
        stageId: "runtime-cli",
        selectedOptionId: "opt-c",
        isCorrect: true,
        firstAttemptCorrect: true,
        attempts: 1,
        firstAnsweredAt: "2026-07-22T00:00:00.000Z",
        lastAnsweredAt: "2026-07-22T00:00:00.000Z",
        needsReview: false
      }
    },
    updatedAt: "2026-07-22T00:00:00.000Z"
  };

  const merged = mergeProgressSnapshots(localSnapshot, cloudSnapshot);

  assert.equal(merged.courseId, "nodejs");
  assert.deepEqual(merged.completedLessonIds.sort(), ["lesson-1", "lesson-2", "lesson-3"]);
  assert.deepEqual(merged.completedProjectIds.sort(), ["project-1", "project-2"]);
  assert.deepEqual(merged.reviewLessonIds.sort(), ["lesson-1", "lesson-3"]);
  assert.ok(merged.questionAttempts.q1);
  assert.ok(merged.questionAttempts.q2);
});
