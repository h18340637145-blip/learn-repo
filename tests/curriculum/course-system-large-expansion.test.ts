import assert from "node:assert/strict";
import test from "node:test";

import { allCourses, getCourse } from "../../content/curriculum-registry";
import { getLessonsByCourse, publishedLessons } from "../../content/lesson-registry";
import { validateCourseCatalog, validateLessonSpec } from "../../lib/curriculum/validate";

const legacyFourStageCourses = [
  "network",
  "server-engineering",
  "android",
  "ai-application",
  "ai-math"
] as const;

test("全站课程体系扩容至 610 个已发布案例", () => {
  const totalPublished = allCourses.reduce((total, course) => total + getLessonsByCourse(course.id).length, 0);

  assert.equal(totalPublished, 610);
  assert.equal(getLessonsByCourse("nodejs").length, 106);
  assert.equal(getLessonsByCourse("nextjs").length, 90);
  assert.equal(getLessonsByCourse("frontend-debugging").length, 36);
});

test("Node.js 阶段 04 补齐文件 Buffer Stream 主知识点并追加碎片知识点", () => {
  const nodejs = getCourse("nodejs");
  const stageFour = nodejs.stages.find((stage) => stage.id === "files-streams");

  assert.ok(stageFour);
  assert.equal(stageFour.lessons.length, 15);
  assert.equal(stageFour.lessons.every((lesson) => lesson.status === "published"), true);
  assert.equal(stageFour.project.status, "published");
  assert.equal(publishedLessons.filter((lesson) => lesson.stageId === "files-streams").length, 16);
});

test("前端报错调试扩展为四阶段完整调试路线", () => {
  const frontendDebugging = getCourse("frontend-debugging");
  const lessons = getLessonsByCourse("frontend-debugging");

  assert.equal(frontendDebugging.stages.length, 4);
  assert.equal(frontendDebugging.stages.every((stage) => stage.lessons.every((lesson) => lesson.status === "published")), true);
  assert.equal(frontendDebugging.stages.every((stage) => stage.project.status === "published"), true);
  assert.equal(lessons.length, 36);
  assert.deepEqual(lessons.flatMap(validateLessonSpec), []);
});

test("六条蓝图路线发布阶段 00 到阶段 03", () => {
  for (const courseId of legacyFourStageCourses) {
    const course = getCourse(courseId);
    const lessons = getLessonsByCourse(courseId);

    assert.equal(course.stages.length, 4);
    assert.equal(course.stages.every((stage) => stage.lessons.every((lesson) => lesson.status === "published")), true);
    assert.equal(course.stages.every((stage) => stage.project.status === "published"), true);
    assert.equal(lessons.length, 36, `${course.title} 应有四阶段 36 个可玩案例`);
    assert.deepEqual(lessons.flatMap(validateLessonSpec), []);
  }
});

test("Python 阶段 00-10 全部发布，覆盖脚本运维完整路线", () => {
  const python = getCourse("python");

  assert.equal(python.stages.length, 11);
  assert.equal(python.stages.every((stage) => stage.lessons.every((lesson) => lesson.status === "published")), true);
  assert.equal(python.stages.every((stage) => stage.project.status === "published"), true);
  assert.equal(getLessonsByCourse("python").length, 99, "Python 应有 4 蓝图 + 7 真实阶段共 99 个可玩案例");
});

test("AI Agent 阶段 00-10 全部发布，覆盖工具编排到平台化完整路线", () => {
  const aiAgent = getCourse("ai-agent");

  assert.equal(aiAgent.stages.length, 11);
  assert.equal(aiAgent.stages.every((stage) => stage.lessons.every((lesson) => lesson.status === "published")), true);
  assert.equal(aiAgent.stages.every((stage) => stage.project.status === "published"), true);
  assert.equal(getLessonsByCourse("ai-agent").length, 99, "AI Agent 应有 4 蓝图 + 7 真实阶段共 99 个可玩案例");
});

test("扩容后所有课程目录和已发布课程仍能通过校验", () => {
  for (const course of allCourses) {
    assert.deepEqual(validateCourseCatalog(course), []);
    assert.deepEqual(getLessonsByCourse(course.id).flatMap(validateLessonSpec), []);
  }
});
