import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("app/globals.css", "utf8");

test("样式包含阶段入口、课程星图和空间运行舱", () => {
  for (const selector of [
    ".stage-sidebar",
    ".stage-entry",
    ".stage-space-map",
    ".stage-node",
    ".spatial-runtime-visualizer",
    ".spatial-runtime-canvas",
    ".visualizer-fallback"
  ]) {
    assert.ok(css.includes(selector), `${selector} 应存在`);
  }
});

test("样式包含移动端和减少动态效果降级", () => {
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
  assert.ok(css.includes("@media (max-width: 760px)"));
  assert.ok(css.includes(".spatial-runtime-canvas"));
  assert.ok(css.includes(".visualizer-fallback"));
});

test("样式包含更多空间面板和答案粒子特效", () => {
  for (const selector of [
    ".nebula-stage-button",
    ".course-orbital-dashboard",
    ".orbital-card",
    ".answer-particle-field",
    ".answer-orbit",
    ".answer-core"
  ]) {
    assert.ok(css.includes(selector), `${selector} 应存在`);
  }

  assert.ok(css.includes("@keyframes answer-particles"));
  assert.ok(css.includes("@keyframes orbit-spin"));
});

test("样式包含知识环绕世界和代码面板景深增强", () => {
  for (const selector of [
    ".code-panel__title",
    ".code-panel__aurora",
    ".knowledge-world",
    ".knowledge-world__ring",
    ".spatial-runtime-visualizer::before",
    ".stage-space-map::after"
  ]) {
    assert.ok(css.includes(selector), `${selector} 应存在`);
  }

  assert.ok(css.includes("@keyframes knowledge-ring"));
  assert.ok(css.includes("@keyframes code-aurora"));
});

test("运行舱 Canvas 自身保持深色背景避免白屏", () => {
  assert.ok(css.includes(".spatial-runtime-canvas {"));
  assert.ok(css.includes("background: #080b0f"));
});

test("代码实现题在移动端保持可读和可横向滚动", () => {
  const mobileStart = css.indexOf("@media (max-width: 760px)");
  assert.notEqual(mobileStart, -1, "移动端媒体查询应存在");
  const mobileCss = css.slice(mobileStart);

  for (const selector of [
    ".code-answer-card__select",
    ".code-answer-card__code",
    ".success-feedback"
  ]) {
    assert.ok(mobileCss.includes(selector), `${selector} 应在移动端单独适配`);
  }

  assert.match(mobileCss, /overflow-x:\s*auto/);
});

test("样式包含 P1 题型材料和顺序题移动端适配", () => {
  for (const selector of [
    ".question-material",
    ".question-material__code",
    ".expected-output",
    ".order-answer-grid",
    ".order-answer-card"
  ]) {
    assert.ok(css.includes(selector), `${selector} 应存在`);
  }

  const mobileStart = css.indexOf("@media (max-width: 760px)");
  assert.notEqual(mobileStart, -1, "移动端媒体查询应存在");
  const mobileCss = css.slice(mobileStart);
  assert.ok(mobileCss.includes(".question-material__code"));
  assert.ok(mobileCss.includes(".order-answer-card"));
});
