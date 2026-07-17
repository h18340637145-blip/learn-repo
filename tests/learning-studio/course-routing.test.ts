import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("首页作为课程选择入口并链接到独立学习路径", () => {
  const source = readFileSync("app/page.tsx", "utf8");

  assert.match(source, /href="\/nodejs"/);
  assert.match(source, /href="\/nextjs"/);
  assert.match(source, /Node\.js/);
  assert.match(source, /Next\.js/);
});

test("Node.js 与 Next.js 路由都挂载共享学习工作台", () => {
  const nodeSource = readFileSync("app/nodejs/learning-studio.tsx", "utf8");
  const nextSource = readFileSync("app/nextjs/learning-studio.tsx", "utf8");

  assert.match(nodeSource, /CourseLearningStudio/);
  assert.match(nodeSource, /courseId: "nodejs"/);
  assert.match(nextSource, /CourseLearningStudio/);
  assert.match(nextSource, /courseId: "nextjs"/);
});

test("旧单页 LearningStudio 实现不再作为并行入口存在", () => {
  assert.equal(existsSync("app/learning-studio.tsx"), false);
});
