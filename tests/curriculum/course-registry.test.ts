import assert from "node:assert/strict";
import test from "node:test";

import { allCourses, getCourse } from "../../content/curriculum-registry";
import { getLessonsByCourse, nextjsPublishedLessons, publishedLessons } from "../../content/lesson-registry";
import { validateCourseCatalog, validateLessonSpec } from "../../lib/curriculum/validate";

test("课程注册中心聚合 Node.js、Next.js 与前端报错调试路线", () => {
  assert.deepEqual(allCourses.map((course) => course.id), ["nodejs", "nextjs", "frontend-debugging"]);
  assert.equal(getCourse("nodejs").stages.length, 11);
  assert.equal(getCourse("nextjs").stages.length, 10);
  assert.equal(getCourse("frontend-debugging").stages.length, 1);
});

test("每条学习路径可以独立校验目录和已发布课程", () => {
  for (const course of allCourses) {
    assert.deepEqual(validateCourseCatalog(course), []);
  }

  assert.equal(publishedLessons.length, 99);
  assert.equal(nextjsPublishedLessons.length, 90);
  assert.deepEqual(nextjsPublishedLessons.flatMap(validateLessonSpec), []);
});

test("按课程读取课程内容时隔离 Node.js 与 Next.js 案例", () => {
  assert.equal(getLessonsByCourse("nodejs").length, 99);
  assert.equal(getLessonsByCourse("nextjs").length, 90);
  assert.ok(getLessonsByCourse("nextjs").every((lesson) => lesson.id.startsWith("nextjs-") || lesson.id.startsWith("project-nextjs-")));
});
