# NodePath 学习系统 P2 持续学习闭环实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:test-driven-development 执行此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 NodePath 从“首阶段可玩”推进到“路线进度清晰、第二阶段可继续学”的多课程学习系统。

**架构：** 继续复用 `CourseLearningStudio`、`CourseSpec` 和 `lesson-registry`，不复制路线 UI。新增课程可用性纯函数用于首页展示开放阶段、可玩案例和下一步状态；扩展蓝图课程工厂，为 7 条蓝图路线补齐阶段 01 的 8 个知识点和 1 个阶段项目。

**技术栈：** Next.js 16 App Router、React Server/Client Components、TypeScript、现有 authored trace、现有课程校验器。

---

## 任务

### 任务 1：TDD 锁定 P2 路线可持续学习契约

- [ ] 创建 `tests/curriculum/blueprint-second-stage-playable.test.ts`。
- [ ] 断言 Python、网络、服务端工程、Android、AI 应用、AI Agent、AI 数学都有 18 个可玩案例。
- [ ] 断言每条路线阶段 00 和阶段 01 都是 `published`，阶段 02 仍是 `planned`。
- [ ] 断言首页源码展示开放阶段、可玩案例和继续学习文案。

### 任务 2：实现课程可用性模型

- [ ] 创建 `lib/curriculum/course-availability.ts`。
- [ ] 导出 `buildCourseAvailability(course, lessons)`，计算开放阶段数、总阶段数、可玩案例数和下一步文案。
- [ ] 在 `app/page.tsx` 使用该模型渲染课程卡片状态。

### 任务 3：补齐 7 条蓝图路线阶段 01 内容

- [ ] 扩展 `content/lessons/blueprint-first-stage.ts`，追加阶段 01 的 63 个可玩案例。
- [ ] 修改 `content/curriculum-registry.ts`，7 条蓝图路线 `publishedStageCount` 改为 2。
- [ ] 保持所有新增课程使用确定性 authored trace，不执行真实 Python、Android、AI 或网络请求。

### 任务 4：文档与验证

- [ ] 更新 `docs/PRODUCT.md`、`docs/ARTICHECTURE.md`、`session-handoff.md`。
- [ ] 运行新增测试、课程校验、全量测试、lint、build 和 `git diff --check`。
