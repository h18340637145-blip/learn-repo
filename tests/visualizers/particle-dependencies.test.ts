import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
  dependencies?: Record<string, string>;
};

test("声明专业 3D 粒子增强依赖", () => {
  assert.ok(manifest.dependencies?.["proton-engine"], "应声明 Proton 轻量粒子引擎");
  assert.ok(manifest.dependencies?.["three.quarks"], "应声明 three.quarks 专业粒子系统");
  assert.ok(manifest.dependencies?.["three-nebula"], "应声明 Three-Nebula 三维粒子引擎");
});
