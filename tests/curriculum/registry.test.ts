import assert from "node:assert/strict";
import test from "node:test";

import { getLesson, publishedLessons } from "../../content/lesson-registry";
import { validateLessonSpec } from "../../lib/curriculum/validate";

test("注册表包含现有 3 个知识点和 1 个项目", () => {
  assert.deepEqual(publishedLessons.map((lesson) => lesson.id), [
    "modules-require-cache",
    "event-loop-order",
    "stream-backpressure",
    "project-cli-log-analyzer"
  ]);
});

test("每个已发布课程通过规格校验并提供定向错误反馈", () => {
  for (const lesson of publishedLessons) {
    assert.deepEqual(validateLessonSpec(lesson), []);
    for (const question of lesson.questions) {
      assert.ok(question.options.every((option) => option.feedback.length > 0));
    }
  }
});

test("按 ID 查询课程，未知 ID 返回 undefined", () => {
  assert.equal(getLesson("event-loop-order")?.title, "读懂 Event Loop 执行顺序");
  assert.equal(getLesson("missing"), undefined);
});
