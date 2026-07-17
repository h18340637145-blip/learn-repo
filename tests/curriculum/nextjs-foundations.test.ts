import assert from "node:assert/strict";
import test from "node:test";

import { nextjsPublishedLessons } from "../../content/lesson-registry";

test("Next.js 基础训练营使用 Next.js 专属运行环境标签", () => {
  assert.equal(nextjsPublishedLessons.length, 90);

  for (const lesson of nextjsPublishedLessons) {
    assert.match(lesson.nodeVersion, /^Next\.js 16/);
  }
});

test("Next.js 基础训练营覆盖 App Router 核心心智模型", () => {
  const titles = nextjsPublishedLessons.slice(0, 9).map((lesson) => lesson.title);

  assert.deepEqual(titles, [
    "Next.js 是什么",
    "App Router 目录结构",
    "页面与动态路由",
    "布局与嵌套",
    "Server Components 详解",
    "Client Components 与指令",
    "导航与预取",
    "环境变量边界",
    "多页个人主页"
  ]);
});
