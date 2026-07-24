import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getCourse } from "../../content/curriculum-registry";
import { getLessonsByCourse } from "../../content/lesson-registry";
import type { CourseId } from "../../lib/curriculum/types";
import { validateCourseCatalog, validateLessonSpec } from "../../lib/curriculum/validate";

const blueprintPlayableCourses: CourseId[] = [
  "python",
  "network",
  "server-engineering",
  "android",
  "ai-application",
  "ai-agent",
  "ai-math"
];

test("蓝图路线首阶段都升级为可玩课程", () => {
  for (const courseId of blueprintPlayableCourses) {
    const course = getCourse(courseId);
    const firstStage = course.stages[0];
    const lessons = getLessonsByCourse(courseId);

    assert.equal(course.status, "preview", `${course.title} 应进入样板预览状态`);
    assert.equal(firstStage.lessons.filter((lesson) => lesson.status === "published").length, 8);
    assert.equal(firstStage.project.status, "published");
    assert.ok(lessons.length >= 9, `${course.title} 至少应有首阶段 8 个知识点和 1 个阶段项目`);
    assert.deepEqual(validateCourseCatalog(course), []);
  }
});

test("蓝图首阶段课程具备真实学习闭环", () => {
  for (const courseId of blueprintPlayableCourses) {
    const lessons = getLessonsByCourse(courseId);
    const knowledgeLessons = lessons.filter((lesson) => lesson.kind === "knowledge");
    const projectLessons = lessons.filter((lesson) => lesson.kind === "stage-project");

    assert.ok(knowledgeLessons.length >= 8);
    assert.ok(projectLessons.length >= 1);

    for (const lesson of knowledgeLessons) {
      assert.ok(lesson.files!.length >= 1, `${lesson.id} 应有案例文件`);
      assert.ok(lesson.questions.length >= 1, `${lesson.id} 应至少有 1 道互动题`);
      assert.ok(lesson.execution, `${lesson.id} 应有 authored trace`);
      assert.ok(lesson.summary.length >= 2, `${lesson.id} 应有知识总结`);
      assert.deepEqual(validateLessonSpec(lesson), []);
    }

    for (const project of projectLessons) {
      assert.ok(project.questions.length >= 2, `${project.id} 阶段项目至少需要 2 道题`);
      assert.deepEqual(validateLessonSpec(project), []);
    }
  }
});

test("蓝图路线不再落入规划概览页的静态参数", () => {
  const pageSource = readFileSync("app/[courseSlug]/page.tsx", "utf8");

  assert.match(pageSource, /getLessonsByCourse\(course\.id\)/);
  assert.match(pageSource, /CourseSlugLearningStudio/);
  assert.match(pageSource, /hasPlayableLessons/);
});
