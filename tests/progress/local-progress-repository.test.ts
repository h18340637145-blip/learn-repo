import assert from "node:assert/strict";
import test from "node:test";

import { createLocalProgressRepository } from "../../lib/progress/local-progress-repository";

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
    updatedAt: null
  });
});
