import assert from "node:assert/strict";
import test from "node:test";

import { getLesson, publishedLessons } from "../../content/lesson-registry";
import { validateLessonSpec } from "../../lib/curriculum/validate";

const stageOneToThreeIds = [
  "runtime-introduction",
  "runtime-browser-differences",
  "runtime-v8",
  "runtime-lts",
  "cli-run-scripts",
  "cli-repl",
  "cli-process-arguments",
  "cli-env-console",
  "project-cli-system-inspector",
  "modules-esm",
  "modules-resolution",
  "modules-package-type",
  "modules-node-prefix",
  "packages-dependency-types",
  "packages-semver-scripts",
  "modules-require-cache",
  "typescript-node",
  "project-dependency-inspector",
  "async-callbacks",
  "async-promises",
  "async-await",
  "async-error-propagation",
  "event-loop-order",
  "async-microtasks-nexttick",
  "async-immediate-timers",
  "events-emitter-abort",
  "project-task-scheduler"
];

test("注册表发布阶段 01-03 的全部课程，并保留阶段 04 的两个现有课程", () => {
  assert.deepEqual(
    publishedLessons.map((lesson) => lesson.id),
    stageOneToThreeIds.concat([
      "stream-backpressure",
      "project-cli-log-analyzer"
    ])
  );
});

test("阶段 01-03 的每个课程都可以按 ID 查询", () => {
  for (const lessonId of stageOneToThreeIds) {
    assert.equal(getLesson(lessonId)?.id, lessonId);
  }
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
