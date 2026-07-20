# NodePath V1.1 题型系统设计规格

> 日期：2026-07-20  
> 依据：`docs/NodePath-PRD.md` V1.0  
> 目标版本：V1.1 代码反推训练  
> 范围：多题型基础结构、`implementation` 题型、单课多题、移动端代码选项体验、进度兼容

## 1. 背景与目标

当前 NodePath 已经支持 Node.js 与 Next.js 两条路线、182 个可交互案例、阶段星图、运行可视化和本地进度。但学习工作台仍以 `lesson.questions[0]` 为核心，只展示每课第一道题；进度也以“答对单题即完成课程”为主。

V1.1 的目标是把学习闭环从“单题预测”升级为“一个知识点可以包含多道题”。本轮不追求批量改写全部课程，而是先建立可扩展题型底座，并上线 PRD P0 指定的 `implementation` 代码实现题。

## 2. 本轮范围

本轮实现以下能力：

1. 扩展课程题目类型，保留旧 `prediction` 数据兼容。
2. 增加 `implementation` 题型，用目标结果或需求反推正确代码方案。
3. 单个知识点可以顺序展示多道题。
4. 完成课程需要完成当前课程中所有必答题。
5. 移动端代码选项以纵向卡片展示，支持展开完整代码。
6. 代码型选项支持语言、摘要和差异行元数据。
7. 课程校验脚本覆盖新题型字段。
8. 旧 localStorage 进度继续可读，不因新增题目状态而崩溃。
9. 选择 Node.js 与 Next.js 各至少一个课程作为试点，追加 `implementation` 题。

本轮不实现：

- Supabase 登录和云端同步。
- 错题本、收藏题目和学习统计页面。
- `diagnosis`、`repair`、`completion`、`execution-order` 等 P1 题型的完整 UI。
- 连续式阶段项目多步骤保存。
- 任意用户代码执行或在线 IDE。

## 3. 用户体验设计

### 3.1 单课多题流程

学习流程调整为：

```text
概念讲解
→ 核心代码案例
→ 第 1 题
→ 反馈
→ 第 2 题
→ 反馈
→ 全部必答题完成
→ 播放 authored trace
→ 展示终端、总结和完成反馈
→ 写入课程进度
```

当前版本保持“答对当前题后自动进入下一题或运行”的节奏：

- 答错：显示所选项反馈，不推进题号，不写入完成。
- 答对且后面还有题：显示解析，并提供“进入下一题”按钮。
- 答对且为最后一道题：播放运行可视化，完成后写入课程进度。

这样可以保留现有运行舱节奏，同时避免每道小题都重复触发大型完成动画。

### 3.2 题目进度提示

挑战区标题从固定“先做预测”改为题型感知：

- `prediction`：先做预测。
- `implementation`：选择实现。
- 其他暂未重点实现的题型：显示通用“完成挑战”。

标题区域展示当前题号：

```text
02 · 第 1 / 2 题 · 结果预测
```

### 3.3 代码实现题选项

`implementation` 题展示目标需求和多段代码方案。代码选项在移动端默认纵向排列，每个卡片包含：

- 选项字母。
- 简短方案名。
- 一行方案摘要。
- 差异提示。
- 可折叠代码预览。

默认只展示关键代码摘要，点击“展开代码”后展示完整代码。提交前允许切换选项；提交后锁定当前题，答错可以重新选择。

### 3.4 视觉反馈

现有粒子、轨道和选项选中状态继续保留。代码型选项增加：

- 图标和边框表达选中状态，不只依赖颜色。
- 正确时显示 `✓`，错误时显示 `×`。
- 差异行用左侧发光条突出，但不做复杂语法 AST diff。

## 4. 数据模型设计

### 4.1 QuestionType

`QuestionType` 扩展为 PRD 定义的完整枚举：

```ts
type QuestionType =
  | "prediction"
  | "implementation"
  | "diagnosis"
  | "repair"
  | "completion"
  | "execution-order"
  | "best-practice"
  | "concept-match"
  | "equivalent-code"
  | "sequence"
  | "transfer";
```

`transfer` 是当前项目已有类型，为兼容旧数据暂时保留。后续可迁移为 `best-practice` 或 `concept-match`。

### 4.2 AnswerOption

在保持旧字段可用的前提下新增可选字段：

```ts
type AnswerOption = {
  id: string;
  label: string;
  detail: string;
  feedback: string;
  code?: string;
  language?: "js" | "ts" | "tsx" | "json" | "bash" | "text";
  diffLines?: number[];
  summary?: string;
};
```

兼容规则：

- 旧选项只提供 `label/detail/feedback` 仍然合法。
- `implementation` 题至少一个选项必须提供 `code`。
- 提供 `code` 时必须提供 `language`。
- `summary` 用于移动端摘要；缺失时回退到 `detail`。

### 4.3 LessonQuestion

新增题目级元数据：

```ts
type LessonQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  options: AnswerOption[];
  answerId: string;
  correctExplanation: string;
  required?: boolean;
  estimatedSeconds?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
};
```

兼容规则：

- `required` 缺省为 `true`。
- `estimatedSeconds` 缺省由课程校验视为可兼容旧数据，不强制旧题立即补齐。
- `difficulty` 缺省通过课程难度推导，不阻断旧题。

## 5. UI 与组件边界

### 5.1 LearningStudio 状态

新增或调整状态：

- `questionIndex`: 当前题目索引。
- `selectedByQuestion`: 每道题当前选择。
- `answeredQuestionIds`: 已答对题目 ID。
- `status`: 保留 `idle/running/wrong/success`，新增逻辑中 `success` 只代表当前课程完成，不代表单题完成。
- `questionFeedbackState`: 通过现有 `selectedOption` 和 `status` 推导，避免额外复杂状态。

课程切换、阶段切换、重新进入课程时重置题目状态。

### 5.2 选项渲染组件

提取轻量组件：

```text
app/_components/question-options.tsx
```

职责：

- 根据题型渲染普通文本选项或代码实现选项。
- 管理每个代码选项的展开/收起。
- 不负责判断答案正确性。
- 不写入进度。

保持它是 Client Component，因为需要点击展开和选择。

### 5.3 题型展示策略

- `prediction` 使用现有答案卡片布局。
- `implementation` 使用代码方案卡片布局。
- 暂未实现专属 UI 的题型先回退到普通答案卡片，保证未来数据不会直接崩溃。

## 6. 进度与兼容

本轮不新增云端进度，也不强制迁移旧 localStorage 结构。

课程完成仍写入：

- `completedLessonIds`
- `completedProjectIds`

新增多题状态只存在于当前页面会话中。用户刷新后，未完成课程从第一题重新开始；这是 V1.1 可接受限制。后续 V1.2/V1.3 再持久化题目尝试次数、首次答对和项目步骤。

旧进度兼容要求：

- 已完成课程继续显示为完成。
- 损坏数据继续回退空进度。
- Node.js 与 Next.js key 继续隔离。

## 7. 课程试点内容

本轮选择两个代表性知识点追加 `implementation` 题：

1. Node.js 基础训练营中的数组/集合或函数知识点。目标是从结果反推 `map/filter/reduce` 或函数实现。
2. Next.js 基础或数据获取中的一个知识点。目标是从需求反推正确的 App Router/Server Component 代码方案。

试点要求：

- 每个试点课程至少包含 2 道题。
- 新增题必须有 3 个选项。
- 每个代码选项都有 `code`、`language`、`feedback`。
- 正确选项不通过长度或语气明显暴露。

## 8. 校验与测试

### 8.1 课程校验

更新 `lib/curriculum/validate.ts`：

- 题型必须在支持列表内。
- 每题至少 2 个选项。
- 正确选项必须存在。
- 每个选项必须有反馈。
- `implementation` 题必须至少一个选项含代码。
- 含代码选项必须声明 `language`。
- 含 `diffLines` 时必须是正整数数组。

旧题不会因为缺少 `estimatedSeconds` 或 `difficulty` 失败。

### 8.2 单元与组件测试

新增或更新测试：

- `tests/curriculum/validate.test.ts`：覆盖 implementation 题校验。
- `tests/learning-studio/multi-question-flow.test.ts`：通过源码/组件断言多题状态和完成规则。
- `tests/learning-studio/question-options.test.tsx`：代码选项渲染、展开和状态类名。
- `tests/learning-studio/mobile-question-options-styles.test.ts`：移动端纵向布局、无横向溢出关键样式。
- 现有 `registry`、`course-registry` 和 `nextjs-complete` 测试继续通过。

## 9. 验收标准

实现完成后必须满足：

1. 旧课程仍可正常进入和答题。
2. 至少两个课程拥有两道题，其中至少一道为 `implementation`。
3. 答对第一题不会立即写入课程完成；全部必答题完成后才写入。
4. `implementation` 题在移动端表现为纵向代码卡片。
5. 代码选项可以展开/收起。
6. 答错显示定向反馈，答对显示解析并进入下一题或运行。
7. `npm test`、`npm run validate:curriculum`、`npm run lint`、`npm run build`、`git diff --check` 通过。
8. 360px 宽度下题目区不整体横向溢出。

## 10. 风险与取舍

### 10.1 不持久化单题中间状态

刷新后未完成课程从第一题重新开始。这会降低长课程中断恢复能力，但可以避免在 V1.1 过早设计复杂题目作答历史。PRD 的作答历史、错题本和云同步放入 V1.2/V1.4。

### 10.2 不批量迁移 182 个案例

本轮只试点少量课程。这样可以先验证 UI 和数据结构，降低内容制作成本。通过后再用模板批量扩展。

### 10.3 不做复杂 diff 引擎

`diffLines` 采用课程作者手动标注方式。它成本低、稳定、适合移动端；未来若需要自动 diff 再单独设计。

## 11. 实现顺序建议

1. 类型扩展与课程校验红绿测试。
2. 题目选项组件与移动端样式红绿测试。
3. LearningStudio 多题作答流程红绿测试。
4. Node.js / Next.js 试点课程补充 implementation 题。
5. 文档同步与完整验证。

本规格聚焦 V1.1 可交付切片，不引入 Supabase、错题本或连续项目状态，确保后续功能有清晰扩展点。
