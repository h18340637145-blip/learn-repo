import assert from "node:assert/strict";
import test from "node:test";

import { createLocalProgressRepository } from "../../lib/progress/local-progress-repository";
import type { ProgressSnapshot } from "../../lib/progress/types";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(key: string) { return this.data.get(key) ?? null; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string) { this.data.delete(key); }
  setItem(key: string, value: string) { this.data.set(key, value); }
}

test("完成课程后可以恢复进度", () => {
  const repository = createLocalProgressRepository(new MemoryStorage());
  const saved = repository.completeLesson(repository.load(), "event-loop-order");
  assert.equal(saved.courseId, "nodejs");
  assert.deepEqual(saved.completedLessonIds, ["event-loop-order"]);
  assert.deepEqual(repository.load(), saved);
});

test("不同课程使用独立进度存储并保留 courseId", () => {
  const storage = new MemoryStorage();
  const nodeRepository = createLocalProgressRepository(storage, "nodejs");
  const nextRepository = createLocalProgressRepository(storage, "nextjs");

  const nodeProgress = nodeRepository.completeLesson(nodeRepository.load(), "runtime-introduction");
  const nextProgress = nextRepository.completeLesson(nextRepository.load(), "nextjs-foundations-what-is-nextjs");

  assert.equal(nodeProgress.courseId, "nodejs");
  assert.equal(nextProgress.courseId, "nextjs");
  assert.deepEqual(nodeRepository.load().completedLessonIds, ["runtime-introduction"]);
  assert.deepEqual(nextRepository.load().completedLessonIds, ["nextjs-foundations-what-is-nextjs"]);
});

test("损坏的本地数据回退到空进度", () => {
  const storage = new MemoryStorage();
  storage.setItem("nodepath.progress.v1", "not-json");
  assert.deepEqual(createLocalProgressRepository(storage).load(), {
    version: 1,
    courseId: "nodejs",
    completedLessonIds: [],
    completedProjectIds: [],
    reviewLessonIds: [],
    questionAttempts: {},
    updatedAt: null
  });
});

test("可以通过仓储边界替换远端同步快照", () => {
  const repository = createLocalProgressRepository(new MemoryStorage(), "nodejs");
  const saved = repository.replace({
    ...repository.load(),
    completedLessonIds: ["runtime-introduction"],
    updatedAt: "2026-07-22T00:00:00.000Z"
  });

  assert.deepEqual(repository.load(), saved);
  assert.deepEqual(saved.completedLessonIds, ["runtime-introduction"]);
});

test("旧版本地进度会迁移出空题目记录", () => {
  const storage = new MemoryStorage();
  storage.setItem("nodepath.progress.v1", JSON.stringify({
    version: 1,
    courseId: "nodejs",
    completedLessonIds: ["runtime-introduction"],
    completedProjectIds: [],
    reviewLessonIds: ["runtime-introduction"],
    updatedAt: "2026-07-21T00:00:00.000Z"
  }));

  const progress = createLocalProgressRepository(storage, "nodejs").load();

  assert.deepEqual(progress.questionAttempts, {});
  assert.deepEqual(progress.completedLessonIds, ["runtime-introduction"]);
});

test("首次答对题目会记录首次正确和尝试次数", () => {
  const repository = createLocalProgressRepository(new MemoryStorage(), "nodejs");
  const saved = repository.recordQuestionAttempt(repository.load(), {
    lessonId: "runtime-introduction",
    stageId: "runtime-cli",
    questionId: "runtime-introduction-prediction",
    selectedOptionId: "b",
    isCorrect: true
  });

  assert.equal(saved.questionAttempts["runtime-introduction-prediction"]?.firstAttemptCorrect, true);
  assert.equal(saved.questionAttempts["runtime-introduction-prediction"]?.attempts, 1);
  assert.equal(saved.questionAttempts["runtime-introduction-prediction"]?.needsReview, false);
});

test("首次答错题目会进入待复习，重答不会覆盖首次结果", () => {
  const repository = createLocalProgressRepository(new MemoryStorage(), "nodejs");
  const first = repository.recordQuestionAttempt(repository.load(), {
    lessonId: "runtime-introduction",
    stageId: "runtime-cli",
    questionId: "runtime-introduction-prediction",
    selectedOptionId: "a",
    isCorrect: false
  });
  const second = repository.recordQuestionAttempt(first, {
    lessonId: "runtime-introduction",
    stageId: "runtime-cli",
    questionId: "runtime-introduction-prediction",
    selectedOptionId: "b",
    isCorrect: true
  });

  const record = second.questionAttempts["runtime-introduction-prediction"];
  assert.equal(record?.firstAttemptCorrect, false);
  assert.equal(record?.isCorrect, true);
  assert.equal(record?.attempts, 2);
  assert.equal(record?.needsReview, true);
  assert.equal(record?.selectedOptionId, "b");
});

test("污染结构迁移时会过滤非法字段且记录作答时保持防御", () => {
  const storage = new MemoryStorage();
  storage.setItem("nodepath.progress.v1", JSON.stringify({
    version: 1,
    courseId: "nodejs",
    completedLessonIds: ["runtime-introduction", "", 12, "runtime-introduction"],
    completedProjectIds: ["runtime-project", null, ""],
    reviewLessonIds: ["runtime-introduction", false, ""],
    questionAttempts: {
      "mismatched-key": {
        questionId: "runtime-introduction-prediction",
        lessonId: "runtime-introduction",
        stageId: "runtime-cli",
        selectedOptionId: "a",
        isCorrect: false,
        firstAttemptCorrect: false,
        attempts: 1,
        firstAnsweredAt: "2026-07-21T01:00:00.000Z",
        lastAnsweredAt: "2026-07-21T01:01:00.000Z",
        needsReview: true
      },
      "negative-attempts": {
        questionId: "negative-attempts",
        lessonId: "runtime-introduction",
        stageId: "runtime-cli",
        selectedOptionId: "a",
        isCorrect: false,
        firstAttemptCorrect: false,
        attempts: -1,
        firstAnsweredAt: "2026-07-21T01:00:00.000Z",
        lastAnsweredAt: "2026-07-21T01:01:00.000Z",
        needsReview: true
      },
      "invalid-date": {
        questionId: "invalid-date",
        lessonId: "runtime-introduction",
        stageId: "runtime-cli",
        selectedOptionId: "a",
        isCorrect: false,
        firstAttemptCorrect: false,
        attempts: 1,
        firstAnsweredAt: "not-a-date",
        lastAnsweredAt: "2026-07-21T01:01:00.000Z",
        needsReview: true
      },
      "reversed-time": {
        questionId: "reversed-time",
        lessonId: "runtime-introduction",
        stageId: "runtime-cli",
        selectedOptionId: "a",
        isCorrect: false,
        firstAttemptCorrect: false,
        attempts: 1,
        firstAnsweredAt: "2026-07-21T01:02:00.000Z",
        lastAnsweredAt: "2026-07-21T01:01:00.000Z",
        needsReview: true
      },
      "valid-question": {
        questionId: "valid-question",
        lessonId: "runtime-introduction",
        stageId: "runtime-cli",
        selectedOptionId: "b",
        isCorrect: true,
        firstAttemptCorrect: true,
        attempts: 1,
        firstAnsweredAt: "2026-07-21T01:00:00.000Z",
        lastAnsweredAt: "2026-07-21T01:01:00.000Z",
        needsReview: false
      }
    },
    updatedAt: "2026-07-21T02:00:00.000Z"
  }));
  const repository = createLocalProgressRepository(storage, "nodejs");

  const progress = repository.load();

  assert.deepEqual(progress.completedLessonIds, ["runtime-introduction"]);
  assert.deepEqual(progress.completedProjectIds, ["runtime-project"]);
  assert.deepEqual(progress.reviewLessonIds, ["runtime-introduction"]);
  assert.deepEqual(Object.keys(progress.questionAttempts), ["valid-question"]);

  const contaminatedSnapshot = {
    ...progress,
    questionAttempts: undefined
  } as unknown as ProgressSnapshot;
  const saved = repository.recordQuestionAttempt(contaminatedSnapshot, {
    lessonId: "runtime-introduction",
    stageId: "runtime-cli",
    questionId: "runtime-introduction-prediction",
    selectedOptionId: "b",
    isCorrect: true
  });

  assert.equal(saved.questionAttempts["runtime-introduction-prediction"]?.attempts, 1);
});
