# NodePath 游戏化交互增强实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:executing-plans 或在当前会话中按 TDD 小步执行。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 参考 `vj-achievement-universe` 的宇宙成就感，为 NodePath 增加纯前端游戏化交互，让学习过程更像完成任务、解锁知识芯片。

**架构：** 保持 `LearningStudio` 为交互宿主，新增专注的沉浸式组件 `CursorSparks` 和 `AchievementUnlock`。样式增强集中在 `app/globals.css`，课程数据、进度仓储和 authored trace 执行逻辑不变。

**技术栈：** Next.js 16 App Router、React 19、TypeScript、Canvas 2D、CSS 动效、Node.js `node:test`。

---

## 文件结构

- 创建：`components/immersive/cursor-sparks.tsx`
  - 负责鼠标移动时的轻量粒子火花画布。
- 创建：`components/immersive/achievement-unlock.tsx`
  - 负责成功完成课程或项目后的 HUD 成就解锁弹层。
- 修改：`components/immersive/index.ts`
  - 统一导出新增组件。
- 修改：`app/learning-studio.tsx`
  - 接入 `CursorSparks`、`AchievementUnlock` 和 Mission HUD 文案。
- 修改：`app/globals.css`
  - 增加游戏化 HUD、扫描线、成就弹层、鼠标火花和卡片 3D hover 样式。
- 修改：`tests/immersive/components.test.tsx`
  - 覆盖新增组件的可渲染结构。
- 修改：`tests/immersive/styles.test.ts`
  - 覆盖新增游戏化样式选择器和减少动态效果降级。
- 修改：`tests/learning-space/source.test.ts`
  - 覆盖 `LearningStudio` 已接入游戏化组件和 Mission HUD。
- 修改：`docs/PRODUCT.md`、`docs/ARTICHECTURE.md`、`session-handoff.md`
  - 同步产品和架构边界。

## 任务

### 任务 1：红灯测试

- [ ] 在 `tests/immersive/components.test.tsx` 中新增 `CursorSparks` 和 `AchievementUnlock` 结构测试。
- [ ] 在 `tests/immersive/styles.test.ts` 中新增游戏化 HUD 样式测试。
- [ ] 在 `tests/learning-space/source.test.ts` 中新增 `LearningStudio` 接入测试。
- [ ] 运行 `npx tsx --test tests/immersive/components.test.tsx tests/immersive/styles.test.ts tests/learning-space/source.test.ts`，预期因组件和样式缺失失败。

### 任务 2：新增沉浸式组件

- [ ] 实现 `CursorSparks`，监听鼠标移动生成少量粒子，支持 `prefers-reduced-motion` 自动静默。
- [ ] 实现 `AchievementUnlock`，根据 `visible` 和 `variant` 显示课程或阶段项目解锁反馈。
- [ ] 更新 `components/immersive/index.ts`。
- [ ] 运行目标测试，预期组件测试通过，样式和接入测试仍可能失败。

### 任务 3：接入学习工作台

- [ ] 在 `app/learning-studio.tsx` 导入并渲染 `CursorSparks`。
- [ ] 将顶部 `streak` 文案升级为 Mission HUD。
- [ ] 在成功状态渲染 `AchievementUnlock`，不替代原有总结面板。
- [ ] 运行目标测试，预期接入测试通过。

### 任务 4：样式和文档

- [ ] 在 `app/globals.css` 增加扫描线、玻璃 HUD、成就弹层、鼠标火花、3D hover 和减少动态效果降级。
- [ ] 更新产品、架构和 handoff 文档。
- [ ] 运行 `npm test`、`npm run lint`、`npm run build`、`git diff --check`。
