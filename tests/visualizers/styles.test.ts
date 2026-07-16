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
