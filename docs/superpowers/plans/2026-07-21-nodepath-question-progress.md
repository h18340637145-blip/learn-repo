# NodePath 题目级学习记录实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为 NodePath 增加题目级本地学习记录、旧进度兼容迁移和学习报告面板。

**架构：** 保持 `lib/progress/*` 作为唯一进度仓储边界，UI 不直接读写 `localStorage`。`LearningStudio` 在用户选择答案时写入题目尝试，报告指标由新的无副作用纯函数计算，后续云端同步只需要替换仓储实现。

**技术栈：** Next.js 16 App Router、React 19 Client Component、TypeScript、node:test、localStorage。

---

## 文件结构

- 修改：`lib/progress/types.ts`
  - 增加 `QuestionAttemptRecord`、`QuestionAttemptInput`、`LearningReport` 类型。
  - 扩展 `ProgressSnapshot.questionAttempts`。
  - 扩展 `ProgressRepository.recordQuestionAttempt()`。
- 修改：`lib/progress/local-progress-repository.ts`
  - 规范化旧快照和损坏快照。
  - 实现题目尝试记录、首次正确率保持、待复习标记和课程隔离。
- 创建：`lib/progress/learning-report.ts`
  - 通过 `ProgressSnapshot` 与 `LessonSpec[]` 计算学习报告。
- 修改：`app/_components/learning-studio.tsx`
  - 导入并使用 `buildLearningReport()`。
  - 在 `chooseAnswer()` 中先记录题目级作答，再处理现有正确 / 错误流程。
  - 在左侧路线统计下方渲染学习报告。
- 修改：`app/globals.css`
  - 增加学习报告面板样式。
- 修改：`tests/progress/local-progress-repository.test.ts`
  - 覆盖迁移、首次答对、首次答错、重答和课程隔离。
- 创建：`tests/progress/learning-report.test.ts`
  - 覆盖学习报告计算。
- 修改：`tests/learning-space/source.test.ts`
  - 确认学习工作台包含报告入口和题目记录调用。
- 修改：`docs/PRODUCT.md`
  - 更新当前进度能力。
- 修改：`docs/ARTICHECTURE.md`
  - 更新进度模型与数据流。
- 修改：`session-handoff.md`
  - 记录本轮交付状态和验证命令。

## 任务 1：为题目级进度写失败测试

**文件：**
- 修改：`tests/progress/local-progress-repository.test.ts`

- [ ] **步骤 1：编写失败测试**

在文件末尾追加以下测试：

```ts
test("旧版本地进度会迁移出空题目记录", () => {
  const storage = new MemoryStorage();
  storage.setItem("nodepath.progress.v1", JSON.stringify({
    version: 1,
    courseId: "nodejs",
    completedLessonIds: ["runtime-introduction"],
    completedProjectIds: [],
    reviewLessonIds: ["runtime-introduction"],
    updatedAt: "2026-07-21T00:00:00.000Z"
  }));

  const progress = createLocalProgressRepository(storage, "nodejs").load();

  assert.deepEqual(progress.questionAttempts, {});
  assert.deepEqual(progress.completedLessonIds, ["runtime-introduction"]);
});

test("首次答对题目会记录首次正确和尝试次数", () => {
  const repository = createLocalProgressRepository(new MemoryStorage(), "nodejs");
  const saved = repository.recordQuestionAttempt(repository.load(), {
    lessonId: "runtime-introduction",
    stageId: "runtime-cli",
    questionId: "runtime-introduction-prediction",
    selectedOptionId: "b",
    isCorrect: true
  });

  assert.equal(saved.questionAttempts["runtime-introduction-prediction"]?.firstAttemptCorrect, true);
  assert.equal(saved.questionAttempts["runtime-introduction-prediction"]?.attempts, 1);
  assert.equal(saved.questionAttempts["runtime-introduction-prediction"]?.needsReview, false);
});

test("首次答错题目会进入待复习，重答不会覆盖首次结果", () => {
  const repository = createLocalProgressRepository(new MemoryStorage(), "nodejs");
  const first = repository.recordQuestionAttempt(repository.load(), {
    lessonId: "runtime-introduction",
    stageId: "runtime-cli",
    questionId: "runtime-introduction-prediction",
    selectedOptionId: "a",
    isCorrect: false
  });
  const second = repository.recordQuestionAttempt(first, {
    lessonId: "runtime-introduction",
    stageId: "runtime-cli",
    questionId: "runtime-introduction-prediction",
    selectedOptionId: "b",
    isCorrect: true
  });

  const record = second.questionAttempts["runtime-introduction-prediction"];
  assert.equal(record?.firstAttemptCorrect, false);
  assert.equal(record?.isCorrect, true);
  assert.equal(record?.attempts, 2);
  assert.equal(record?.needsReview, true);
  assert.equal(record?.selectedOptionId, "b");
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
npm test -- tests/progress/local-progress-repository.test.ts
```

预期：失败，TypeScript 或运行时提示 `recordQuestionAttempt` / `questionAttempts` 尚未定义。

## 任务 2：实现进度类型、迁移和题目记录仓储

**文件：**
- 修改：`lib/progress/types.ts`
- 修改：`lib/progress/local-progress-repository.ts`
- 测试：`tests/progress/local-progress-repository.test.ts`

- [ ] **步骤 1：扩展进度类型**

将 `lib/progress/types.ts` 调整为包含以下导出：

```ts
import type { CourseId, StageId } from "../curriculum/types";

export type QuestionAttemptRecord = {
  questionId: string;
  lessonId: string;
  stageId: StageId;
  selectedOptionId: string;
  isCorrect: boolean;
  firstAttemptCorrect: boolean;
  attempts: number;
  firstAnsweredAt: string;
  lastAnsweredAt: string;
  needsReview: boolean;
};

export type QuestionAttemptInput = {
  questionId: string;
  lessonId: string;
  stageId: StageId;
  selectedOptionId: string;
  isCorrect: boolean;
};

export type ProgressSnapshot = {
  version: 1;
  courseId: CourseId;
  completedLessonIds: string[];
  completedProjectIds: string[];
  reviewLessonIds: string[];
  questionAttempts: Record<string, QuestionAttemptRecord>;
  updatedAt: string | null;
};

export type ProgressRepository = {
  load(): ProgressSnapshot;
  completeLesson(snapshot: ProgressSnapshot, lessonId: string): ProgressSnapshot;
  completeProject(snapshot: ProgressSnapshot, projectId: string): ProgressSnapshot;
  recordQuestionAttempt(snapshot: ProgressSnapshot, input: QuestionAttemptInput): ProgressSnapshot;
};

export const emptyProgress = (courseId: CourseId = "nodejs"): ProgressSnapshot => ({
  version: 1,
  courseId,
  completedLessonIds: [],
  completedProjectIds: [],
  reviewLessonIds: [],
  questionAttempts: {},
  updatedAt: null
});
```

- [ ] **步骤 2：实现本地快照规范化**

在 `lib/progress/local-progress-repository.ts` 中增加内部函数：

```ts
function normalizeSnapshot(raw: unknown, courseId: CourseId): ProgressSnapshot {
  if (!raw || typeof raw !== "object") return emptyProgress(courseId);

  const parsed = raw as Partial<ProgressSnapshot>;
  if (parsed.version !== 1 || !Array.isArray(parsed.completedLessonIds)) return emptyProgress(courseId);

  return {
    version: 1,
    courseId,
    completedLessonIds: Array.isArray(parsed.completedLessonIds) ? unique(parsed.completedLessonIds) : [],
    completedProjectIds: Array.isArray(parsed.completedProjectIds) ? unique(parsed.completedProjectIds) : [],
    reviewLessonIds: Array.isArray(parsed.reviewLessonIds) ? unique(parsed.reviewLessonIds) : [],
    questionAttempts: normalizeQuestionAttempts(parsed.questionAttempts),
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null
  };
}

function normalizeQuestionAttempts(value: unknown): ProgressSnapshot["questionAttempts"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(([, record]) => isQuestionAttemptRecord(record))
  );
}

function isQuestionAttemptRecord(value: unknown): value is ProgressSnapshot["questionAttempts"][string] {
  if (!value || typeof value !== "object") return false;
  const record = value as ProgressSnapshot["questionAttempts"][string];
  return typeof record.questionId === "string"
    && typeof record.lessonId === "string"
    && typeof record.stageId === "string"
    && typeof record.selectedOptionId === "string"
    && typeof record.isCorrect === "boolean"
    && typeof record.firstAttemptCorrect === "boolean"
    && Number.isInteger(record.attempts)
    && typeof record.firstAnsweredAt === "string"
    && typeof record.lastAnsweredAt === "string"
    && typeof record.needsReview === "boolean";
}
```

- [ ] **步骤 3：实现 `recordQuestionAttempt()`**

在 repository 返回对象中增加方法：

```ts
recordQuestionAttempt(snapshot, input) {
  const now = new Date().toISOString();
  const previous = snapshot.questionAttempts[input.questionId];
  const nextRecord = previous
    ? {
        ...previous,
        selectedOptionId: input.selectedOptionId,
        isCorrect: input.isCorrect,
        attempts: previous.attempts + 1,
        lastAnsweredAt: now,
        needsReview: previous.needsReview || !previous.firstAttemptCorrect
      }
    : {
        questionId: input.questionId,
        lessonId: input.lessonId,
        stageId: input.stageId,
        selectedOptionId: input.selectedOptionId,
        isCorrect: input.isCorrect,
        firstAttemptCorrect: input.isCorrect,
        attempts: 1,
        firstAnsweredAt: now,
        lastAnsweredAt: now,
        needsReview: !input.isCorrect
      };

  return save({
    ...snapshot,
    questionAttempts: {
      ...snapshot.questionAttempts,
      [input.questionId]: nextRecord
    },
    updatedAt: now
  });
}
```

- [ ] **步骤 4：运行进度测试验证通过**

运行：

```bash
npm test -- tests/progress/local-progress-repository.test.ts
```

预期：全部通过。

- [ ] **步骤 5：提交任务 1-2**

运行：

```bash
git add lib/progress/types.ts lib/progress/local-progress-repository.ts tests/progress/local-progress-repository.test.ts
git commit -m "feat: 记录题目级学习进度"
```

## 任务 3：实现学习报告纯函数

**文件：**
- 创建：`lib/progress/learning-report.ts`
- 创建：`tests/progress/learning-report.test.ts`

- [ ] **步骤 1：编写学习报告失败测试**

创建 `tests/progress/learning-report.test.ts`：

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { buildLearningReport } from "../../lib/progress/learning-report";
import { emptyProgress, type ProgressSnapshot } from "../../lib/progress/types";
import type { LessonSpec } from "../../lib/curriculum/types";

const lessons = [
  {
    id: "runtime-introduction",
    questions: [{ id: "q1" }, { id: "q2" }]
  },
  {
    id: "modules-esm",
    questions: [{ id: "q3" }]
  }
] as LessonSpec[];

test("学习报告统计已作答、首次正确率和待复习数量", () => {
  const progress: ProgressSnapshot = {
    ...emptyProgress("nodejs"),
    questionAttempts: {
      q1: {
        questionId: "q1",
        lessonId: "runtime-introduction",
        stageId: "runtime-cli",
        selectedOptionId: "a",
        isCorrect: false,
        firstAttemptCorrect: false,
        attempts: 2,
        firstAnsweredAt: "2026-07-21T01:00:00.000Z",
        lastAnsweredAt: "2026-07-21T01:05:00.000Z",
        needsReview: true
      },
      q2: {
        questionId: "q2",
        lessonId: "runtime-introduction",
        stageId: "runtime-cli",
        selectedOptionId: "b",
        isCorrect: true,
        firstAttemptCorrect: true,
        attempts: 1,
        firstAnsweredAt: "2026-07-21T02:00:00.000Z",
        lastAnsweredAt: "2026-07-21T02:00:00.000Z",
        needsReview: false
      }
    }
  };

  assert.deepEqual(buildLearningReport(progress, lessons), {
    answeredQuestions: 2,
    totalQuestions: 3,
    firstTryCorrect: 1,
    firstTryAccuracy: 50,
    reviewQuestions: 1,
    lastAnsweredAt: "2026-07-21T02:00:00.000Z"
  });
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
npm test -- tests/progress/learning-report.test.ts
```

预期：失败，提示 `lib/progress/learning-report` 找不到。

- [ ] **步骤 3：实现报告函数**

创建 `lib/progress/learning-report.ts`：

```ts
import type { LessonSpec } from "../curriculum/types";
import type { ProgressSnapshot } from "./types";

export type LearningReport = {
  answeredQuestions: number;
  totalQuestions: number;
  firstTryCorrect: number;
  firstTryAccuracy: number;
  reviewQuestions: number;
  lastAnsweredAt: string | null;
};

export function buildLearningReport(progress: ProgressSnapshot, publishedLessons: LessonSpec[]): LearningReport {
  const publishedQuestionIds = new Set(
    publishedLessons.flatMap((lesson) => lesson.questions.map((question) => question.id))
  );
  const records = Object.values(progress.questionAttempts)
    .filter((record) => publishedQuestionIds.has(record.questionId));
  const answeredQuestions = records.length;
  const firstTryCorrect = records.filter((record) => record.firstAttemptCorrect).length;
  const reviewQuestions = records.filter((record) => record.needsReview).length;
  const lastAnsweredAt = records
    .map((record) => record.lastAnsweredAt)
    .sort()
    .at(-1) ?? null;

  return {
    answeredQuestions,
    totalQuestions: publishedQuestionIds.size,
    firstTryCorrect,
    firstTryAccuracy: answeredQuestions === 0 ? 0 : Math.round((firstTryCorrect / answeredQuestions) * 100),
    reviewQuestions,
    lastAnsweredAt
  };
}
```

- [ ] **步骤 4：运行报告测试验证通过**

运行：

```bash
npm test -- tests/progress/learning-report.test.ts
```

预期：全部通过。

- [ ] **步骤 5：提交任务 3**

运行：

```bash
git add lib/progress/learning-report.ts tests/progress/learning-report.test.ts
git commit -m "feat: 生成学习报告数据"
```

## 任务 4：接入学习工作台和学习报告 UI

**文件：**
- 修改：`app/_components/learning-studio.tsx`
- 修改：`app/globals.css`
- 修改：`tests/learning-space/source.test.ts`

- [ ] **步骤 1：编写失败的源码结构测试**

在 `tests/learning-space/source.test.ts` 末尾追加：

```ts
test("LearningStudio 写入题目级作答记录并展示学习报告", () => {
  assert.match(source, /buildLearningReport/);
  assert.match(source, /recordQuestionAttempt/);
  assert.match(source, /learning-report-panel/);
  assert.match(source, /首次正确率/);
  assert.match(source, /待复习/);
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
npm test -- tests/learning-space/source.test.ts
```

预期：失败，提示源码中找不到 `buildLearningReport` 或 `learning-report-panel`。

- [ ] **步骤 3：在工作台中计算报告**

在 `app/_components/learning-studio.tsx` 中增加导入：

```ts
import { buildLearningReport } from "@/lib/progress/learning-report";
```

在 `routeStats` 下方增加：

```ts
const learningReport = useMemo(
  () => buildLearningReport(progress, publishedLessons),
  [progress, publishedLessons]
);
const lastAnsweredLabel = learningReport.lastAnsweredAt
  ? new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .format(new Date(learningReport.lastAnsweredAt))
  : "等待首次作答";
```

- [ ] **步骤 4：在 `chooseAnswer()` 里写入题目记录**

在 `setFrame(null);` 后增加：

```ts
const repository = getBrowserProgressRepository(courseId);
const nextProgress = repository.recordQuestionAttempt(progress, {
  lessonId: lesson.id,
  stageId: lesson.stageId,
  questionId: question.id,
  selectedOptionId: answer,
  isCorrect: answer === question.answerId
});
setProgress(nextProgress);
```

在完成 authored trace 后保留现有 `completeLesson()` / `completeProject()`，但改成基于当前最新快照：

```ts
setProgress((current) => lesson.kind === "stage-project"
  ? repository.completeProject(current, lesson.id)
  : repository.completeLesson(current, lesson.id));
```

注意：此处的 `repository` 可以复用本函数前面声明的常量，不要重复声明同名 `const repository`。

- [ ] **步骤 5：渲染学习报告面板**

在路线统计卡后、`NebulaProgress` 前加入：

```tsx
<section className="learning-report-panel" aria-label={`${courseTitle} 学习报告`}>
  <span className="kicker">LEARNING REPORT</span>
  <div className="learning-report-grid">
    <span><strong>{learningReport.answeredQuestions}</strong><small>已作答题</small></span>
    <span><strong>{learningReport.firstTryAccuracy}%</strong><small>首次正确率</small></span>
    <span><strong>{learningReport.reviewQuestions}</strong><small>待复习</small></span>
    <span><strong>{lastAnsweredLabel}</strong><small>最近学习</small></span>
  </div>
  <p>{learningReport.answeredQuestions} / {learningReport.totalQuestions} 道互动题已经留下学习记录。</p>
</section>
```

- [ ] **步骤 6：添加样式**

在 `app/globals.css` 的路线统计样式附近加入：

```css
.learning-report-panel { margin: -6px 0 22px; padding: 14px; border: 1px solid rgba(110, 231, 255, .18); background: linear-gradient(145deg, rgba(110, 231, 255, .08), rgba(159, 232, 112, .06)); box-shadow: inset 0 0 28px rgba(110, 231, 255, .04); }
.learning-report-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 12px; }
.learning-report-grid span { min-width: 0; padding: 9px; border: 1px solid rgba(110, 231, 255, .14); background: rgba(4, 8, 13, .42); }
.learning-report-grid strong { display: block; overflow: hidden; color: var(--cyan); font-size: 15px; white-space: nowrap; text-overflow: ellipsis; }
.learning-report-grid small { display: block; margin-top: 4px; color: var(--muted); font-size: 8px; letter-spacing: .08em; text-transform: uppercase; }
.learning-report-panel p { margin: 10px 0 0; color: var(--quiet); font-size: 10px; line-height: 1.6; }
```

- [ ] **步骤 7：运行 UI 相关测试验证通过**

运行：

```bash
npm test -- tests/learning-space/source.test.ts tests/progress/local-progress-repository.test.ts tests/progress/learning-report.test.ts
```

预期：全部通过。

- [ ] **步骤 8：提交任务 4**

运行：

```bash
git add app/_components/learning-studio.tsx app/globals.css tests/learning-space/source.test.ts
git commit -m "feat: 展示题目级学习报告"
```

## 任务 5：更新产品、架构和交接文档

**文件：**
- 修改：`docs/PRODUCT.md`
- 修改：`docs/ARTICHECTURE.md`
- 修改：`session-handoff.md`

- [ ] **步骤 1：更新产品文档**

在 `docs/PRODUCT.md` 的“已实现体验”和“Progress”段落中增加：

```md
- 学习工作台新增题目级学习报告，展示已作答题、首次正确率、待复习题和最近学习时间。
- 每次选择答案都会保存题目级作答记录，首次答错的题目进入待复习统计。
```

并将 Progress 列表改为包含：

```md
- 每道已作答题记录最近选择、尝试次数、首次是否答对、首次作答时间、最近作答时间和待复习状态。
- 旧版本地进度会自动补齐题目记录结构，不会伪造历史题目数据。
```

- [ ] **步骤 2：更新架构文档**

在 `docs/ARTICHECTURE.md` 的 `lib/progress/*` 与 `ProgressSnapshot` 段落中加入：

```md
- `questionAttempts`: 以 questionId 为 key 的题目级作答记录，包含 lessonId、stageId、最近选择、是否正确、首次是否答对、尝试次数、首次/最近作答时间和待复习状态。
- `lib/progress/learning-report.ts`: 纯函数报告层，把 ProgressSnapshot 与已发布课程转换为学习报告，不读写浏览器存储。
```

- [ ] **步骤 3：更新交接文档**

在 `session-handoff.md` 的当前状态和重要文件中记录：

```md
- 当前进度模型已扩展到题目级作答记录，学习报告展示已作答题、首次正确率、待复习和最近学习。
- `lib/progress/learning-report.ts`: 题目级学习报告纯函数。
```

- [ ] **步骤 4：运行文档空白检查**

运行：

```bash
git diff --check
```

预期：无输出。

- [ ] **步骤 5：提交任务 5**

运行：

```bash
git add docs/PRODUCT.md docs/ARTICHECTURE.md session-handoff.md
git commit -m "docs: 更新题目级进度说明"
```

## 任务 6：全量验证和收尾

**文件：**
- 检查：所有已修改文件

- [ ] **步骤 1：运行目标测试**

运行：

```bash
npm test -- tests/progress/local-progress-repository.test.ts tests/progress/learning-report.test.ts tests/learning-space/source.test.ts
```

预期：全部通过。

- [ ] **步骤 2：运行课程校验**

运行：

```bash
npm run validate:curriculum
```

预期：输出课程校验通过，并包含 Node.js、Next.js 已发布案例和题目统计。

- [ ] **步骤 3：运行 lint**

运行：

```bash
npm run lint
```

预期：通过，无新增错误。

- [ ] **步骤 4：运行生产构建**

运行：

```bash
npm run build
```

预期：构建通过；如果只出现已有 multiple lockfiles warning，不视为失败。

- [ ] **步骤 5：运行 diff 空白检查**

运行：

```bash
git diff --check
```

预期：无输出。

- [ ] **步骤 6：查看最终状态**

运行：

```bash
git status --short --branch
git log --oneline -6
```

预期：只看到本计划产生的提交，工作区干净，或仅剩用户明确保留的无关改动。
