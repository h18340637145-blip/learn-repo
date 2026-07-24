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

test("蓝图路线阶段 00 到阶段 02 都可持续学习", () => {
  for (const courseId of previewCourses) {
    const course = getCourse(courseId);
    const lessons = getLessonsByCourse(courseId);

    assert.equal(course.status, "preview");
    assert.equal(course.stages[0].lessons.every((lesson) => lesson.status === "published"), true);
    assert.equal(course.stages[1].lessons.every((lesson) => lesson.status === "published"), true);
    assert.equal(course.stages[2].lessons.every((lesson) => lesson.status === "published"), true);
    assert.equal(course.stages[2].project.status, "published");
    assert.equal(course.stages[3].lessons.every((lesson) => lesson.status === "published"), true);
    assert.equal(course.stages[3].project.status, "published");
    const expectedLessons = courseId === "python" || courseId === "ai-agent" || courseId === "ai-application" || courseId === "server-engineering" ? 99 : 36;
    assert.equal(lessons.length, expectedLessons, `${course.title} 应有 ${expectedLessons} 个可玩案例`);
    assert.deepEqual(lessons.flatMap(validateLessonSpec), []);
  }
});

test("学习工作台展示下一阶段预告，帮助学习者继续路线", () => {
  const source = readFileSync("app/_components/learning-studio.tsx", "utf8");

  assert.match(source, /nextStageSpace/);
  assert.match(source, /下一阶段预告/);
  assert.match(source, /已开放|规划中/);
});
