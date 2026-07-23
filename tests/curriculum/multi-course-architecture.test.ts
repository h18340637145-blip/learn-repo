import assert from "node:assert/strict";
import test from "node:test";

import { allCourses, courseDomains, getCourse, getCoursesByDomain } from "../../content/curriculum-registry";

test("课程注册表暴露多学院元信息", () => {
  assert.ok(courseDomains.some((domain) => domain.id === "frontend"));
  assert.ok(courseDomains.some((domain) => domain.id === "server"));
  assert.ok(courseDomains.some((domain) => domain.id === "ai-application"));
  assert.ok(courseDomains.some((domain) => domain.id === "ai-agent"));
});

test("课程路线带有学院、状态和运行舱元信息", () => {
  const frontendDebugging = getCourse("frontend-debugging");

  assert.equal(frontendDebugging.domainId, "frontend");
  assert.equal(frontendDebugging.slug, "frontend-debugging");
  assert.equal(frontendDebugging.status, "preview");
  assert.deepEqual(frontendDebugging.runtimeSurfaces, ["console", "micro-browser", "runtime-timeline", "incident-hud"]);
});

test("可以按学院读取课程路线", () => {
  assert.ok(getCoursesByDomain("frontend").some((course) => course.id === "nextjs"));
  assert.ok(getCoursesByDomain("frontend").some((course) => course.id === "frontend-debugging"));
  assert.ok(getCoursesByDomain("server").some((course) => course.id === "nodejs"));
});

test("课程注册表保留现有路线顺序并追加样板路线", () => {
  assert.deepEqual(allCourses.map((course) => course.id), ["nodejs", "nextjs", "frontend-debugging"]);
});
