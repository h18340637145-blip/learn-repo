# 学习工具舱增强实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将顶部“知识卡片速查、每日复习、技能树”三个入口升级成更有空间感、更有学习辅助价值的工具舱。

**架构：** 继续复用现有 `CheatSheetModal`、`DailyReviewModal`、`SkillTreeModal`，不新增路由、不引入新的 3D 运行时。顶部入口只改展示语义与状态反馈，弹窗内部通过 CSS 玻璃拟态、星链、统计条和任务面板增强沉浸感。

**技术栈：** Next.js 16 App Router、React Client Components、CSS 动效、Node `tsx --test` 源码级测试。

---

### 任务 1：锁定三类工具舱结构

**文件：**
- 创建：`tests/learning-studio/learning-tools-panels.test.ts`
- 修改：`components/cheatsheet/cheatsheet-modal.tsx`
- 修改：`components/review/daily-review-modal.tsx`
- 修改：`components/gamification/skill-tree-modal.tsx`
- 修改：`app/_components/learning-studio.tsx`
- 修改：`app/globals.css`

- [ ] **步骤 1：编写失败的测试**

```ts
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
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx tsx --test tests/learning-studio/learning-tools-panels.test.ts`

预期：FAIL，失败信息指向缺少 `learning-tool-nav`、`cheatsheet-command-center` 等新结构。

- [ ] **步骤 3：实现最小代码**

将三个内联按钮改为统一 `learning-tool-button`；在三个弹窗顶部加入 command center 统计区；技能树阶段卡使用 `skill-stage-orbit`。

- [ ] **步骤 4：运行测试验证通过**

运行：`npx tsx --test tests/learning-studio/learning-tools-panels.test.ts`

预期：PASS。

- [ ] **步骤 5：回归验证**

运行：`npm run lint`、`npm run build`、`git diff --check`。

预期：全部通过。
