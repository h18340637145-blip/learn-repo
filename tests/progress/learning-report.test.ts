import assert from "node:assert/strict";
import test from "node:test";

import { buildLearningReport } from "../../lib/progress/learning-report";
import { emptyProgress, type ProgressSnapshot } from "../../lib/progress/types";

const lessons = [
  {
    id: "runtime-introduction",
    questions: [{ id: "q1" }, { id: "q2" }]
  },
  {
    id: "modules-esm",
    questions: [{ id: "q3" }]
  }
];

test("学习报告统计已作答、首次正确率和待复习数量", () => {
  const progress: ProgressSnapshot = {
    ...emptyProgress("nodejs"),
    questionAttempts: {
      q1: {
        questionId: "q1",
        lessonId: "runtime-introduction",
        stageId: "runtime-cli",
        selectedOptionId: "a",
        isCorrect: false,
        firstAttemptCorrect: false,
        attempts: 2,
        firstAnsweredAt: "2026-07-21T01:00:00.000Z",
        lastAnsweredAt: "2026-07-21T01:05:00.000Z",
        needsReview: true
      },
      q2: {
        questionId: "q2",
        lessonId: "runtime-introduction",
        stageId: "runtime-cli",
        selectedOptionId: "b",
        isCorrect: true,
        firstAttemptCorrect: true,
        attempts: 1,
        firstAnsweredAt: "2026-07-21T02:00:00.000Z",
        lastAnsweredAt: "2026-07-21T02:00:00.000Z",
        needsReview: false
      }
    }
  };

  assert.deepEqual(buildLearningReport(progress, lessons), {
    answeredQuestions: 2,
    totalQuestions: 3,
    firstTryCorrect: 1,
    firstTryAccuracy: 50,
    reviewQuestions: 1,
    lastAnsweredAt: "2026-07-21T02:00:00.000Z"
  });
});

test("学习报告忽略课程外题目记录且保留空报告默认值", () => {
  const progress: ProgressSnapshot = {
    ...emptyProgress("nodejs"),
    questionAttempts: {
      outside: {
        questionId: "outside",
        lessonId: "unknown-lesson",
        stageId: "runtime-cli",
        selectedOptionId: "a",
        isCorrect: true,
        firstAttemptCorrect: true,
        attempts: 1,
        firstAnsweredAt: "2026-07-21T03:00:00.000Z",
        lastAnsweredAt: "2026-07-21T03:00:00.000Z",
        needsReview: true
      }
    }
  };

  assert.deepEqual(buildLearningReport(progress, lessons), {
    answeredQuestions: 0,
    totalQuestions: 3,
    firstTryCorrect: 0,
    firstTryAccuracy: 0,
    reviewQuestions: 0,
    lastAnsweredAt: null
  });
});

test("学习报告按真实时间而不是字符串字典序选取最近作答时间", () => {
  const progress: ProgressSnapshot = {
    ...emptyProgress("nodejs"),
    questionAttempts: {
      q1: {
        questionId: "q1",
        lessonId: "runtime-introduction",
        stageId: "runtime-cli",
        selectedOptionId: "a",
        isCorrect: true,
        firstAttemptCorrect: true,
        attempts: 1,
        firstAnsweredAt: "Wed, 01 Jan 2025 00:00:00 GMT",
        lastAnsweredAt: "Wed, 01 Jan 2025 00:00:00 GMT",
        needsReview: false
      },
      q2: {
        questionId: "q2",
        lessonId: "runtime-introduction",
        stageId: "runtime-cli",
        selectedOptionId: "b",
        isCorrect: true,
        firstAttemptCorrect: true,
        attempts: 1,
        firstAnsweredAt: "2026-07-21T02:00:00.000Z",
        lastAnsweredAt: "2026-07-21T02:00:00.000Z",
        needsReview: false
      }
    }
  };

  assert.equal(
    buildLearningReport(progress, lessons).lastAnsweredAt,
    "2026-07-21T02:00:00.000Z"
  );
});
