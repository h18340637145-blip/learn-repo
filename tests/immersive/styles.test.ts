import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("app/globals.css", "utf8");

test("沉浸式样式包含空间背景、星云进度、能量通道和完成爆发", () => {
  for (const selector of [
    ".space-backdrop",
    ".space-canvas",
    ".cockpit-grid",
    ".nebula-progress",
    ".energy-runway",
    ".completion-burst",
  ]) {
    assert.ok(css.includes(selector), `${selector} 应存在`);
  }
});

test("沉浸式样式支持减少动态效果", () => {
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
  assert.ok(css.includes(".space-canvas"));
  assert.ok(css.includes(".completion-burst"));
});
