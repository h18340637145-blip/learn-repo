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
