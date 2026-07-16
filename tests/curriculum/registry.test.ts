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

const stageFiveToTenIds = [
  "http-transaction",
  "http-create-server",
  "http-request",
  "http-response",
  "http-headers-status",
  "http-routing-query",
  "http-request-body",
  "http-streaming-fetch",
  "project-static-file-server",
  "api-rest-modeling",
  "api-input-validation",
  "api-error-model",
  "api-config-boundary",
  "api-structured-logging",
  "api-timeout",
  "api-abort-signal",
  "api-health-shutdown",
  "project-task-rest-api",
  "concurrency-blocking-loop",
  "concurrency-libuv-pool",
  "concurrency-child-process",
  "concurrency-worker-threads",
  "concurrency-ipc",
  "concurrency-shared-memory",
  "concurrency-cluster",
  "concurrency-model-choice",
  "project-worker-report",
  "realtime-polling",
  "realtime-sse",
  "realtime-websocket-handshake",
  "realtime-connection-lifecycle",
  "realtime-heartbeat",
  "realtime-broadcast",
  "realtime-backpressure",
  "realtime-recovery",
  "project-realtime-notifications",
  "testing-node-test",
  "testing-assertions",
  "testing-lifecycle",
  "testing-mocking",
  "testing-coverage",
  "testing-integration",
  "security-permissions-secrets",
  "security-dependencies-web",
  "project-tested-auth",
  "diagnostics-inspector",
  "diagnostics-cpu-profile",
  "diagnostics-heap-snapshot",
  "diagnostics-gc-tracing",
  "diagnostics-flame-graphs",
  "diagnostics-performance-baseline",
  "production-config-observability",
  "production-release-incident",
  "project-production-diagnostics"
] as const;

test("注册表发布阶段 01-03、阶段 04 现有案例和阶段 05-10 全部课程", () => {
  assert.deepEqual(
    publishedLessons.map((lesson) => lesson.id),
    stageOneToThreeIds.concat([
      "stream-backpressure",
      "project-cli-log-analyzer"
    ], stageFiveToTenIds)
  );
});

test("发布案例数量包含阶段 05-10 的完整 54 个新增案例", () => {
  assert.equal(stageFiveToTenIds.length, 54);
  assert.equal(publishedLessons.length, 83);
});

test("每个已上线阶段课程都可以按 ID 查询", () => {
  for (const lessonId of stageOneToThreeIds.concat(stageFiveToTenIds)) {
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
