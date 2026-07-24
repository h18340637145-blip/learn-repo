import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getCourse } from "../../content/curriculum-registry";
import { getLessonsByCourse } from "../../content/lesson-registry";
import type { CourseId } from "../../lib/curriculum/types";
import { validateLessonSpec } from "../../lib/curriculum/validate";

const previewCourses: CourseId[] = [
  "python",
  "network",
  "server-engineering",
  "android",
  "ai-application",
  "ai-agent",
  "ai-math"
];

test("蓝图路线阶段 00 和阶段 01 都可持续学习", () => {
  for (const courseId of previewCourses) {
    const course = getCourse(courseId);
    const lessons = getLessonsByCourse(courseId);

    assert.equal(course.status, "preview");
    assert.equal(course.stages[0].lessons.every((lesson) => lesson.status === "published"), true);
    assert.equal(course.stages[0].project.status, "published");
    assert.equal(course.stages[1].lessons.every((lesson) => lesson.status === "published"), true);
    assert.equal(course.stages[1].project.status, "published");
    assert.equal(lessons.length >= 18, true, `${course.title} 至少应有两个阶段共 18 个可玩案例`);
    assert.deepEqual(lessons.flatMap(validateLessonSpec), []);
  }
});

test("首页课程卡片展示开放阶段、可玩案例和继续学习入口", () => {
  const pageSource = readFileSync("app/page.tsx", "utf8");

  assert.match(pageSource, /buildCourseAvailability/);
  assert.match(pageSource, /已开放/);
  assert.match(pageSource, /可玩案例/);
  assert.match(pageSource, /继续学习/);
});
