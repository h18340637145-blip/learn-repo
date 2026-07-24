import assert from "node:assert/strict";
import test from "node:test";

import {
  allCourses,
  courseDomains,
  getCourseBySlug,
  getCoursesByDomain
} from "../../content/curriculum-registry";
import { getLessonsByCourse } from "../../content/lesson-registry";

test("蓝图中的八大学院都有可见路线入口", () => {
  const visibleDomainIds = new Set(allCourses.map((course) => course.domainId));

  for (const domain of courseDomains) {
    assert.ok(
      visibleDomainIds.has(domain.id),
      `学院 ${domain.id} 缺少首页可见课程路线`
    );
  }
});

test("蓝图 preview 路线可通过 slug 打开首阶段学习路线", () => {
  const previewSlugs = ["python", "network", "server-engineering", "android", "ai-application", "ai-agent", "ai-math"];

  for (const slug of previewSlugs) {
    const course = getCourseBySlug(slug);

    assert.ok(course, `缺少 ${slug} 路线注册`);
    assert.equal(course.status, "preview");
    assert.ok(course.stages.length >= 4, `${slug} 至少应展示 4 个规划阶段`);
    assert.ok(course.runtimeSurfaces.length >= 2, `${slug} 应声明运行舱方向`);
  }
});

test("可以按学院读取 preview 与 published 路线", () => {
  assert.ok(getCoursesByDomain("language").some((course) => course.slug === "python"));
  assert.ok(getCoursesByDomain("network").some((course) => course.slug === "network"));
  assert.ok(getCoursesByDomain("server").some((course) => course.slug === "nodejs"));
  assert.ok(getCoursesByDomain("server").some((course) => course.slug === "server-engineering"));
  assert.ok(getCoursesByDomain("frontend").some((course) => course.slug === "frontend-debugging"));
});

test("preview 路线拥有独立四阶段题库且不会误用 Node.js 已发布题库", () => {
  assert.equal(getLessonsByCourse("python").length, 99);
  assert.equal(getLessonsByCourse("network").length, 36);
  assert.ok(getLessonsByCourse("python").every((lesson) => lesson.id.startsWith("python-")));
  assert.ok(getLessonsByCourse("network").every((lesson) => lesson.id.startsWith("network-")));
  assert.ok(getLessonsByCourse("nodejs").length > 0);
});
