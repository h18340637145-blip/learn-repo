import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { allCourses } from "../../content/curriculum-registry";

test("首页作为课程选择入口并链接到独立学习路径", () => {
  const source = readFileSync("app/page.tsx", "utf8");

  assert.deepEqual(allCourses.map((course) => course.title), [
    "Node.js",
    "Next.js",
    "前端报错调试",
    "Python",
    "计算机网络",
    "服务端工程",
    "Android 系统",
    "AI 应用开发",
    "AI Agent",
    "AI 数学基础"
  ]);
  assert.match(source, /import \{ courseDomains, getCoursesByDomain \} from "@\/content\/curriculum-registry"/);
  assert.match(source, /import \{ getLessonsByCourse \} from "@\/content\/lesson-registry"/);
  assert.match(source, /courseDomains\.map/);
  assert.match(source, /const courses = getCoursesByDomain\(domain\.id\)/);
  assert.match(source, /courses\.map/);
  assert.match(source, /href=\{`\/\$\{course\.slug\}`\}/);
  assert.match(source, /id=\{`course-\$\{course\.id\}`\}/);
  assert.match(source, /course\.icon/);
  assert.match(source, /course\.title/);
  assert.match(source, /course\.description/);
  assert.match(source, /buildCourseAvailability\(course, getLessonsByCourse\(course\.id\)\)/);
  assert.match(source, /availability\.stageSummary/);
  assert.match(source, /availability\.caseSummary/);
  assert.match(source, /course\.status === "planned"/);
});

test("Node.js 与 Next.js 路由都挂载共享学习工作台", () => {
  const nodeSource = readFileSync("app/nodejs/learning-studio.tsx", "utf8");
  const nextSource = readFileSync("app/nextjs/learning-studio.tsx", "utf8");

  assert.match(nodeSource, /CourseLearningStudio/);
  assert.match(nodeSource, /courseId: "nodejs"/);
  assert.match(nextSource, /CourseLearningStudio/);
  assert.match(nextSource, /courseId: "nextjs"/);
});

test("前端报错调试路由挂载共享学习工作台", () => {
  const frontendDebuggingSource = readFileSync("app/frontend-debugging/learning-studio.tsx", "utf8");

  assert.match(frontendDebuggingSource, /CourseLearningStudio/);
  assert.match(frontendDebuggingSource, /courseId: "frontend-debugging"/);
  assert.doesNotMatch(frontendDebuggingSource, /as never/);
});

test("旧单页 LearningStudio 实现不再作为并行入口存在", () => {
  assert.equal(existsSync("app/learning-studio.tsx"), false);
});
