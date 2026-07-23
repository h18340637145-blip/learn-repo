import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const studio = readFileSync("app/_components/learning-studio.tsx", "utf8");
const cheatsheet = readFileSync("components/cheatsheet/cheatsheet-modal.tsx", "utf8");
const review = readFileSync("components/review/daily-review-modal.tsx", "utf8");
const skillTree = readFileSync("components/gamification/skill-tree-modal.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

test("顶部学习工具入口使用工具舱样式并展示状态辅助信息", () => {
  assert.match(studio, /learning-tool-nav/);
  assert.match(studio, /learning-tool-button/);
  assert.match(studio, /速查库/);
  assert.match(studio, /复习队列/);
  assert.match(studio, /技能星图/);
});

test("知识卡片速查升级为知识扫描台", () => {
  assert.match(cheatsheet, /cheatsheet-command-center/);
  assert.match(cheatsheet, /知识扫描台/);
  assert.match(cheatsheet, /card-metric/);
});

test("每日复习升级为今日复习任务舱", () => {
  assert.match(review, /review-command-center/);
  assert.match(review, /今日复习任务/);
  assert.match(review, /review-progress-rail/);
});

test("技能树升级为技能星图轨道", () => {
  assert.match(skillTree, /skill-orbit-map/);
  assert.match(skillTree, /技能星图/);
  assert.match(skillTree, /skill-stage-orbit/);
});

test("全局样式包含三个工具舱的空间化视觉类", () => {
  for (const selector of [
    ".learning-tool-nav",
    ".learning-tool-button",
    ".cheatsheet-command-center",
    ".review-command-center",
    ".skill-orbit-map",
    ".skill-stage-orbit"
  ]) {
    assert.ok(css.includes(selector), `${selector} 应存在`);
  }
});
