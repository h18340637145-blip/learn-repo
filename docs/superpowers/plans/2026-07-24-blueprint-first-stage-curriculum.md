# 蓝图首阶段课程填充实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:test-driven-development 执行此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 Python、计算机网络、服务端工程、Android、AI 应用、AI Agent、AI 数学 7 条规划路线升级为首阶段可玩课程。

**架构：** 保持现有 `CourseLearningStudio` 共享工作台不复制 UI。新增蓝图课程 lesson 工厂批量生成每条路线的阶段 0 课程和阶段项目，`lesson-registry` 按 `CourseId` 返回真实课程；动态 `app/[courseSlug]/page.tsx` 在有可玩课程时直接挂载共享学习工作台，无课程时继续展示规划概览页。

**技术栈：** Next.js 16 App Router、React Server/Client Components、TypeScript、现有 authored trace、现有课程校验器。

---

## 文件结构

- 创建：`content/lessons/blueprint-first-stage.ts`
  - 职责：用数据种子生成 7 条蓝图路线的首阶段 8 个知识点和 1 个阶段项目。
- 创建：`app/[courseSlug]/course-learning-studio.tsx`
  - 职责：动态路线的 Client Component 包装器，复用 `CourseLearningStudio`。
- 修改：`content/lesson-registry.ts`
  - 职责：导出蓝图首阶段课程，并让 `getLessonsByCourse` 对 7 条新路线返回真实课程。
- 修改：`content/curriculum-registry.ts`
  - 职责：把已有规划课程节点状态同步为 `preview` / `published` 可见状态。
- 修改：`app/[courseSlug]/page.tsx`
  - 职责：如果路线有可玩课程则渲染共享学习工作台，否则渲染规划概览页。
- 修改：`docs/PRODUCT.md`、`docs/ARTICHECTURE.md`、`session-handoff.md`
  - 职责：记录 7 条路线首阶段可玩、数据驱动边界和验证结果。

## 任务

### 任务 1：TDD 锁定首阶段可玩契约

- [ ] 编写失败测试：`tests/curriculum/blueprint-first-stage-playable.test.ts`
  - 断言 7 条蓝图路线每条都有 9 个首阶段可玩案例。
  - 断言每个首阶段知识点至少 1 道题，阶段项目至少 2 道题。
  - 断言课程目录阶段 0 节点状态为 `published`，课程状态不再是 `planned`。
- [ ] 运行测试确认失败：缺少课程、题目或状态仍为 planned。

### 任务 2：生成蓝图首阶段课程

- [ ] 创建 `content/lessons/blueprint-first-stage.ts`。
- [ ] 使用真实案例主题生成 Python、网络、服务端、Android、AI 应用、AI Agent、AI 数学课程。
- [ ] 每节课包含概念、代码或结构化案例、题目、authored trace、总结和来源。
- [ ] 阶段项目使用 `stage-project`，至少 2 道题，组合该路线阶段 0 的知识点。

### 任务 3：接入注册表与动态工作台

- [ ] 修改 `content/lesson-registry.ts` 返回新课程。
- [ ] 修改 `content/curriculum-registry.ts`，让有可玩内容的路线状态变为 `preview`，阶段 0 节点为 `published`。
- [ ] 新增 `app/[courseSlug]/course-learning-studio.tsx` 并在动态 page 中接入。
- [ ] 保持无真实代码执行、不接外部服务、不引入 `next/font/google`。

### 任务 4：文档与验证

- [ ] 更新 `docs/PRODUCT.md`、`docs/ARTICHECTURE.md`、`session-handoff.md`。
- [ ] 运行全量测试。
- [ ] 运行课程校验、lint、build、`git diff --check`。
