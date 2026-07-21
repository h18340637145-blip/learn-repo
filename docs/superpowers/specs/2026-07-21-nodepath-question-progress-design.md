# NodePath 题目级学习记录与学习报告设计

日期：2026-07-21

## 1. 背景

NodePath 已经完成 Node.js 与 Next.js 两条路线的大规模题库铺开。当前学习页可以展示单课多题、阶段导航、路线统计、3D 运行舱和本地完成进度，但进度仍主要停留在“课程完成 / 项目完成”粒度。

`docs/NodePath-PRD.md` 已明确下一阶段需要记录每道题的作答结果、首次作答情况、尝试次数、待复习状态和知识点掌握度，并要求旧版 `localStorage` 进度安全读取或迁移。

本设计聚焦下一轮可落地切片：先在本地完成题目级学习数据闭环，为后续错题本、复习模式、Supabase 跨设备同步和个人主页打地基。

## 2. 目标

- 保存每道题的作答记录，包括最近选择、尝试次数、首次是否答对、首次作答时间和最近作答时间。
- 首次答错的题目自动进入待复习集合。
- Node.js 与 Next.js 的题目进度继续按 `courseId` 隔离。
- 兼容现有 `ProgressSnapshot`，旧进度不会丢失、不会导致页面崩溃。
- 在学习工作台展示“学习报告”，让用户看到题目级成果，而不再只看到案例完成百分比。
- 保持本地优先；本阶段不接入 Supabase，不执行用户提交的任意代码。

## 3. 非目标

- 不实现登录、云端同步、RLS 或 Supabase 表结构。
- 不实现完整错题本页面。
- 不实现智能复习算法。
- 不改变课程完成规则：仍然完成全部必答题后才写入知识点完成。
- 不改变 authored trace 执行模型。

## 4. 数据模型

在 `lib/progress/types.ts` 中将进度快照升级为向后兼容结构：

```ts
type QuestionAttemptRecord = {
  questionId: string;
  lessonId: string;
  stageId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  firstAttemptCorrect: boolean;
  attempts: number;
  firstAnsweredAt: string;
  lastAnsweredAt: string;
  needsReview: boolean;
};

type ProgressSnapshot = {
  version: 1;
  courseId: CourseId;
  completedLessonIds: string[];
  completedProjectIds: string[];
  reviewLessonIds: string[];
  questionAttempts: Record<string, QuestionAttemptRecord>;
  updatedAt: string | null;
};
```

说明：

- `questionAttempts` 使用 `questionId` 作为 key，便于 UI 快速查询当前题状态。
- `lessonId` 与 `stageId` 冗余存储，后续错题本可以不反查全量课程数据。
- `firstAttemptCorrect` 一旦写入后不回退，后续重答只更新 `attempts`、`selectedOptionId`、`isCorrect` 和 `lastAnsweredAt`。
- `needsReview` 在首次答错时置为 `true`；本切片暂不提供“连续两次复习答对后移出”的完整机制，只提供后续扩展字段。

## 5. 旧进度兼容与迁移

本地仓储继续使用现有 key：

- Node.js：`nodepath.progress.v1`
- Next.js：`nodepath.progress.nextjs.v1`

`load()` 需要接受三类数据：

1. 没有本地数据：返回 `emptyProgress(courseId)`。
2. 旧版快照：缺少 `questionAttempts` 时补为空对象，并保留已完成课程与项目。
3. 损坏数据：回退为空快照。

迁移原则：

- 不改变 `version`，因为 key 仍然是 v1，且结构可以兼容补齐。
- 不从已完成课程反推题目已答记录，避免制造不真实的首次正确率。
- 已完成课程继续保留；新增题目记录只从迁移后的真实作答开始累计。

## 6. 答题事件流

用户选择答案时，`LearningStudio` 除现有 UI 状态外，还调用进度仓储记录题目尝试：

```text
选择答案
-> 判断是否正确
-> recordQuestionAttempt(snapshot, context)
-> 如果首次答错：needsReview = true
-> 如果答对：保留或更新当前题最近结果
-> 如果完成全部必答题：completeLesson / completeProject
```

题目记录不等待 authored trace 结束。原因是 PRD 关注“作答结果和首次作答情况”，即使用户答完题后离开页面，也应该保留学习行为。

## 7. 学习报告 UI

在学习工作台左侧或当前路线统计卡下方新增轻量学习报告，不抢占主内容区。

展示指标：

- 已发布案例：复用现有 route stats。
- 互动题总数：复用现有 route stats。
- 已作答题目：`questionAttempts` 数量。
- 首次正确率：`firstAttemptCorrect === true` 的题目数 / 已作答题目数。
- 待复习：`needsReview === true` 的题目数。
- 最近学习：最近一次 `lastAnsweredAt`，无数据时显示“等待首次作答”。

交互边界：

- 本切片只展示学习报告，不新增独立错题本页面。
- 待复习数字可以作为后续入口预留，但当前不跳转。
- 指标文字必须清楚说明是“已作答题目”，避免和“已发布题目总数”混淆。

## 8. 掌握度计算

本切片提供纯函数 `buildLearningReport(progress, publishedLessons)`，用于生成 UI 可消费的报告模型。

最小字段：

```ts
type LearningReport = {
  answeredQuestions: number;
  totalQuestions: number;
  firstTryCorrect: number;
  firstTryAccuracy: number;
  reviewQuestions: number;
  lastAnsweredAt: string | null;
};
```

计算规则：

- `answeredQuestions`：当前课程下 `questionAttempts` 的有效数量。
- `totalQuestions`：当前课程已发布课程的题目总数。
- `firstTryAccuracy`：没有已作答题时为 `0`。
- `reviewQuestions`：`needsReview` 为 `true` 的记录数量。
- 已不存在于课程中的题目记录不参与 `totalQuestions` 命中率，但仍可保留在本地快照中，避免数据丢失。

## 9. 组件与模块边界

优先保持现有边界：

- `lib/progress/types.ts`：扩展进度类型。
- `lib/progress/local-progress-repository.ts`：新增 `recordQuestionAttempt()`，负责迁移和保存。
- `lib/progress/learning-report.ts`：新增无副作用报告计算函数。
- `app/_components/learning-studio.tsx`：在选择答案时写入题目记录，并渲染报告卡。
- `tests/progress/*`：覆盖迁移、首次答对、首次答错、重答、课程隔离。
- `tests/learning-studio/*` 或 `tests/learning-space/*`：覆盖学习报告渲染入口和文案。

UI 不直接读写 `localStorage`；所有浏览器存储仍通过仓储层进入。

## 10. 错误处理

- 损坏 JSON：返回空进度。
- 旧数据缺字段：补齐默认值。
- 作答记录缺必要字段：加载时过滤或规范化，不能让页面崩溃。
- 本地存储写入失败：不阻断 UI 反馈；当前可以沿用现有仓储同步写入方式，后续再补 toast 或降级提示。

## 11. 测试与验收

自动化验收：

- `tests/progress/local-progress-repository.test.ts`
  - 旧快照可迁移出 `questionAttempts: {}`。
  - 首次答对写入 `firstAttemptCorrect: true`。
  - 首次答错写入 `needsReview: true`。
  - 重答不会覆盖 `firstAttemptCorrect`。
  - Node.js 与 Next.js 仍然隔离。
- `tests/progress/learning-report.test.ts`
  - 正确计算已作答、首次正确率、待复习和最近学习时间。
  - 忽略课程外题目对总题数命中率的影响。
- `tests/learning-studio/source.test.ts`
  - 学习工作台包含学习报告渲染入口。
  - 答题路径调用题目级记录方法。

完整交付前运行：

```bash
npm test -- tests/progress/local-progress-repository.test.ts tests/progress/learning-report.test.ts tests/learning-studio/source.test.ts
npm run validate:curriculum
npm run lint
npm run build
git diff --check
```

## 12. 后续延展

完成本切片后，下一步可以自然进入：

1. 基础错题本：读取 `needsReview` 题目并按课程、阶段、题型筛选。
2. 复习模式：记录复习次数，连续两次答对后标记掌握。
3. Supabase 同步：把 `ProgressRepository` 换成本地 + 云端合并仓储。
4. 个人主页：展示路线进度、首次正确率、连续学习天数和阶段徽章。

## 13. 规格自检

- 无 TODO、占位符或未定字段。
- 范围限定在题目级本地学习记录与学习报告，不包含云端同步和完整错题本页面。
- 数据模型与 PRD 的“每道题作答结果、首次作答情况、待复习、知识掌握度”一致。
- 保持现有课程完成规则，不和当前多题答题流程冲突。
- 旧进度迁移策略明确，不会用已完成课程伪造题目级历史。
