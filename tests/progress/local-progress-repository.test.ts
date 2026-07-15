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
  assert.deepEqual(saved.completedLessonIds, ["event-loop-order"]);
  assert.deepEqual(repository.load(), saved);
});

test("损坏的本地数据回退到空进度", () => {
  const storage = new MemoryStorage();
  storage.setItem("nodepath.progress.v1", "not-json");
  assert.deepEqual(createLocalProgressRepository(storage).load(), {
    version: 1,
    completedLessonIds: [],
    completedProjectIds: [],
    reviewLessonIds: [],
    updatedAt: null
  });
});
