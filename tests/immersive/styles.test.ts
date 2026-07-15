import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("app/globals.css", "utf8");

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function ruleFor(selector: string, source = css) {
  const match = new RegExp(`${escapeRegExp(selector)}\\s*\\{([^}]*)\\}`).exec(
    source,
  );
  assert.ok(match, `${selector} 规则应存在`);
  return match[1];
}

function blockFor(prefix: string) {
  const start = css.indexOf(prefix);
  assert.notEqual(start, -1, `${prefix} 应存在`);

  const open = css.indexOf("{", start);
  assert.notEqual(open, -1, `${prefix} 应包含规则体`);

  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    if (depth === 0) return css.slice(open + 1, index);
  }

  assert.fail(`${prefix} 规则体未闭合`);
}

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

test("沉浸式样式约束关键显示和层级行为", () => {
  const spaceBackdropRule = ruleFor(".space-backdrop");
  assert.match(spaceBackdropRule, /pointer-events:\s*none/);
  assert.match(spaceBackdropRule, /z-index:\s*0/);

  assert.match(ruleFor(".completion-burst"), /display:\s*none/);
  assert.match(ruleFor(".completion-burst.visible"), /display:\s*flex/);

  const reducedMotionBlock = blockFor("@media (prefers-reduced-motion: reduce)");
  assert.match(
    ruleFor(".space-canvas", reducedMotionBlock),
    /display:\s*none/,
  );

  const mobileBlock = blockFor("@media (max-width: 760px)");
  assert.match(ruleFor(".nebula-progress", mobileBlock), /display:\s*none/);

  assert.doesNotMatch(ruleFor(".app-shell"), /overflow:\s*hidden/);
});
