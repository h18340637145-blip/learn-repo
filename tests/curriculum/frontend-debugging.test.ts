import assert from "node:assert/strict";
import test from "node:test";

import { frontendDebuggingPublishedLessons, getLessonsByCourse } from "../../content/lesson-registry";
import { validateLessonSpec } from "../../lib/curriculum/validate";

test("前端调试样板课程发布 8 个知识点与 1 个阶段项目", () => {
  assert.equal(frontendDebuggingPublishedLessons.length, 9);
  assert.equal(frontendDebuggingPublishedLessons.filter((lesson) => lesson.kind === "knowledge").length, 8);
  assert.equal(frontendDebuggingPublishedLessons.filter((lesson) => lesson.kind === "stage-project").length, 1);
});

test("前端调试样板课程覆盖诊断、修复与 Trace 调试题型", () => {
  const questionTypes = new Set(frontendDebuggingPublishedLessons.flatMap((lesson) => lesson.questions.map((question) => question.type)));

  assert.ok(questionTypes.has("diagnosis"));
  assert.ok(questionTypes.has("repair"));
  assert.ok(questionTypes.has("trace-debug"));
});

test("前端调试样板课程提供预览、事故与错误栈运行舱", () => {
  assert.ok(frontendDebuggingPublishedLessons.some((lesson) => lesson.preview));
  assert.ok(frontendDebuggingPublishedLessons.some((lesson) => lesson.incident));
  assert.ok(
    frontendDebuggingPublishedLessons.every(
      (lesson) => lesson.execution?.visualizer.type === "frontend-error-stack"
    )
  );
});

test("前端调试课程可以按 courseId 读取并通过课程校验", () => {
  const lessons = getLessonsByCourse("frontend-debugging");

  assert.equal(lessons.length, 9);
  assert.deepEqual(lessons.flatMap(validateLessonSpec), []);
});
