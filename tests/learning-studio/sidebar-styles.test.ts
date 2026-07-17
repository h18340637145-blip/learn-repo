import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("app/globals.css", "utf8");

test("侧边栏路线提供可点击单元和知识点的视觉反馈", () => {
  assert.ok(css.includes(".roadmap-title {"));
  assert.ok(css.includes(".roadmap-title:hover:not(:disabled)"));
  assert.ok(css.includes(".roadmap-items button"));
  assert.ok(css.includes(".roadmap-item.active"));
  assert.ok(css.includes(".roadmap-title:disabled"));
});

test("侧边栏路线与学习区对齐并使用独立滚动容器", () => {
  assert.ok(css.includes("position: sticky"));
  assert.ok(css.includes("max-height: calc(100vh - 68px)"));
  assert.ok(css.includes("overflow-y: auto"));
  assert.ok(css.includes("overscroll-behavior: contain"));
  assert.ok(css.includes(".sidebar::-webkit-scrollbar"));
  assert.ok(css.includes("scrollbar-color"));
});
