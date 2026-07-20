# NodePath P1 题型 UI 与大规模题库铺开实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为 NodePath 增加 `diagnosis`、`repair`、`completion`、`execution-order` 专属 UI，并把 P1 题型大规模挂载到 Node.js 与 Next.js 已发布课程。

**架构：** 扩展 `LessonQuestion` 的题干材料字段和课程校验；在 `QuestionOptions` 内按题型委派普通、代码和顺序题 UI；新增 `content/questions/*` 题库补丁层，用 `applyQuestionBank()` 将 P1 题库追加到现有 `LessonSpec.questions`，保持原课程文件不过度膨胀。

**技术栈：** Next.js 16 App Router、React 19 Client Components、TypeScript、Node.js 内置测试运行器、CSS 全局样式、authored trace。

---

## 文件结构

本轮创建或修改以下文件：

```text
lib/curriculum/types.ts
  -> 为 LessonQuestion 增加 materialTitle、materialCode、materialLanguage、expectedOutput、orderItems

lib/curriculum/validate.ts
  -> 增加 P1 题型结构校验、题目 ID 去重、覆盖率校验 validateQuestionCoverage()

content/questions/apply-question-bank.ts
  -> 定义 QuestionBankEntry，并把题库补丁安全追加到 LessonSpec[]

content/questions/nodejs-p1-question-bank.ts
  -> Node.js P1 题库，覆盖 92 个已发布案例

content/questions/nextjs-p1-question-bank.ts
  -> Next.js P1 题库，覆盖 90 个已发布案例

content/lesson-registry.ts
  -> 在 publishedLessons / nextjsPublishedLessons 导出前挂载对应 P1 题库

app/_components/question-options.tsx
  -> 增加 QuestionMaterial 和 OrderQuestionOptions；repair / completion 复用代码题卡片

app/globals.css
  -> 增加 P1 材料卡片、顺序题、移动端样式

tests/curriculum/validate.test.ts
  -> 覆盖 P1 校验失败场景

tests/curriculum/question-bank.test.ts
  -> 覆盖题库挂载、引用存在性、题量覆盖和阶段题型多样性

tests/learning-studio/question-options.test.tsx
  -> 覆盖 diagnosis / repair / completion / execution-order 渲染

tests/visualizers/styles.test.ts
  -> 覆盖 P1 移动端样式

scripts/validate-curriculum.ts
  -> 输出总题目数量和覆盖率摘要

docs/PRODUCT.md
docs/ARTICHECTURE.md
session-handoff.md
  -> 同步产品、架构和交接状态
```

---

### 任务 1：扩展题型材料模型与 P1 校验

**文件：**

- 修改：`lib/curriculum/types.ts`
- 修改：`lib/curriculum/validate.ts`
- 测试：`tests/curriculum/validate.test.ts`

- [ ] **步骤 1：编写失败的 P1 校验测试**

在 `tests/curriculum/validate.test.ts` 末尾追加：

```ts
test("P1 题型必须声明难度和预计作答时间", () => {
  const invalid = cloneLesson();
  invalid.questions.push({
    id: "http-diagnosis",
    type: "diagnosis",
    prompt: "为什么响应状态码不正确？",
    options: [
      { id: "a", label: "没有设置 statusCode", detail: "默认 200", feedback: "正确。" },
      { id: "b", label: "没有调用 listen", detail: "混淆启动和响应", feedback: "listen 影响服务启动，不决定单次响应状态。" },
    ],
    answerId: "a",
    correctExplanation: "Node.js HTTP 响应默认状态码为 200，错误分支需要显式设置状态码。"
  });

  assert.deepEqual(validateLessonSpec(invalid), [
    "课程 event-loop-order 的 P1 题 http-diagnosis 必须声明 difficulty",
    "课程 event-loop-order 的 P1 题 http-diagnosis 必须声明 estimatedSeconds"
  ]);
});

test("repair 和 completion 题至少需要两个代码选项", () => {
  const invalid = cloneLesson();
  invalid.questions.push({
    id: "repair-http-status",
    type: "repair",
    prompt: "选择正确修复方案。",
    difficulty: "beginner",
    estimatedSeconds: 80,
    options: [
      {
        id: "a",
        label: "设置 statusCode",
        detail: "修复响应状态",
        feedback: "正确。",
        language: "js",
        code: "res.statusCode = 404;"
      },
      { id: "b", label: "只打印日志", detail: "没有修复响应", feedback: "日志不影响响应状态。" },
    ],
    answerId: "a",
    correctExplanation: "repair 题需要可比较的代码修复方案。"
  });

  assert.deepEqual(validateLessonSpec(invalid), [
    "课程 event-loop-order 的 repair 题 repair-http-status 至少需要 2 个代码选项"
  ]);
});

test("execution-order 提供 orderItems 时至少需要三个步骤", () => {
  const invalid = cloneLesson();
  invalid.questions.push({
    id: "event-order",
    type: "execution-order",
    prompt: "选择正确执行顺序。",
    materialTitle: "事件循环片段",
    materialCode: "console.log('sync'); Promise.resolve().then(() => console.log('micro'));",
    materialLanguage: "js",
    orderItems: ["sync", "micro"],
    difficulty: "beginner",
    estimatedSeconds: 60,
    options: [
      { id: "a", label: "sync -> micro", detail: "同步后微任务", feedback: "正确。" },
      { id: "b", label: "micro -> sync", detail: "微任务抢先", feedback: "同步代码先执行。" },
    ],
    answerId: "a",
    correctExplanation: "同步调用栈先清空，然后执行微任务。"
  });

  assert.deepEqual(validateLessonSpec(invalid), [
    "课程 event-loop-order 的 execution-order 题 event-order 的 orderItems 至少需要 3 项"
  ]);
});

test("同一课程内题目 ID 不能重复", () => {
  const invalid = cloneLesson();
  invalid.questions.push({ ...invalid.questions[0] });

  assert.deepEqual(validateLessonSpec(invalid), [
    "课程 event-loop-order 的题目 ID 重复：event-loop-order-prediction"
  ]);
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
npm test -- tests/curriculum/validate.test.ts
```

预期：FAIL，至少包含 `materialTitle` / `orderItems` 类型不存在或新增校验未实现。

- [ ] **步骤 3：扩展 `LessonQuestion` 类型**

在 `lib/curriculum/types.ts` 的 `LessonQuestion` 中加入：

```ts
  materialTitle?: string;
  materialCode?: string;
  materialLanguage?: CodeLanguage;
  expectedOutput?: string;
  orderItems?: string[];
```

- [ ] **步骤 4：实现 P1 校验**

在 `lib/curriculum/validate.ts` 中加入辅助集合：

```ts
const p1QuestionTypes = new Set<QuestionType>([
  "diagnosis",
  "repair",
  "completion",
  "execution-order"
]);
```

在 `validateLessonSpec()` 的题目循环开始处加入题目 ID 去重：

```ts
  const questionIds = new Set<string>();

  for (const question of lesson.questions) {
    if (questionIds.has(question.id)) {
      errors.push(`课程 ${lesson.id} 的题目 ID 重复：${question.id}`);
    }
    questionIds.add(question.id);
```

在同一循环中加入：

```ts
    if (p1QuestionTypes.has(question.type) && !question.difficulty) {
      errors.push(`课程 ${lesson.id} 的 P1 题 ${question.id} 必须声明 difficulty`);
    }
    if (p1QuestionTypes.has(question.type) && !question.estimatedSeconds) {
      errors.push(`课程 ${lesson.id} 的 P1 题 ${question.id} 必须声明 estimatedSeconds`);
    }
    if (question.materialLanguage && !supportedCodeLanguages.has(question.materialLanguage)) {
      errors.push(`课程 ${lesson.id} 的题目 ${question.id} 使用了不支持的材料语言 ${question.materialLanguage}`);
    }
    if (question.type === "repair" && question.options.filter((option) => option.code?.trim()).length < 2) {
      errors.push(`课程 ${lesson.id} 的 repair 题 ${question.id} 至少需要 2 个代码选项`);
    }
    if (question.type === "completion" && question.options.filter((option) => option.code?.trim()).length < 2) {
      errors.push(`课程 ${lesson.id} 的 completion 题 ${question.id} 至少需要 2 个代码选项`);
    }
    if (question.type === "execution-order" && question.orderItems && question.orderItems.length < 3) {
      errors.push(`课程 ${lesson.id} 的 execution-order 题 ${question.id} 的 orderItems 至少需要 3 项`);
    }
```

- [ ] **步骤 5：运行测试验证通过**

运行：

```bash
npm test -- tests/curriculum/validate.test.ts
```

预期：PASS。

- [ ] **步骤 6：Commit**

```bash
git add lib/curriculum/types.ts lib/curriculum/validate.ts tests/curriculum/validate.test.ts
git commit -m "feat: 扩展 P1 题型材料模型与校验"
```

---

### 任务 2：实现 P1 题型 UI 与移动端样式

**文件：**

- 修改：`app/_components/question-options.tsx`
- 修改：`app/globals.css`
- 测试：`tests/learning-studio/question-options.test.tsx`
- 测试：`tests/visualizers/styles.test.ts`

- [ ] **步骤 1：编写失败的组件渲染测试**

在 `tests/learning-studio/question-options.test.tsx` 追加：

```tsx
test("QuestionOptions 为 diagnosis 题渲染诊断材料", () => {
  const html = renderToStaticMarkup(
    <QuestionOptions
      disabled={false}
      onChoose={() => {}}
      question={{
        ...implementationQuestion,
        id: "diagnosis-question",
        type: "diagnosis",
        prompt: "为什么会打印 undefined？",
        materialTitle: "错误现象",
        materialCode: "console.log(config.port)",
        materialLanguage: "js",
        expectedOutput: "实际输出：undefined",
      }}
      selectedId={null}
      status="idle"
    />
  );

  assert.match(html, /question-material/);
  assert.match(html, /错误现象/);
  assert.match(html, /实际输出：undefined/);
});

test("QuestionOptions 为 repair 和 completion 题复用代码方案卡片", () => {
  for (const type of ["repair", "completion"] as const) {
    const html = renderToStaticMarkup(
      <QuestionOptions
        disabled={false}
        onChoose={() => {}}
        question={{ ...implementationQuestion, id: `${type}-question`, type }}
        selectedId={null}
        status="idle"
      />
    );

    assert.match(html, /code-answer-grid/);
    assert.match(html, /code-answer-card/);
  }
});

test("QuestionOptions 为 execution-order 题渲染顺序方案", () => {
  const html = renderToStaticMarkup(
    <QuestionOptions
      disabled={false}
      onChoose={() => {}}
      question={{
        ...implementationQuestion,
        id: "order-question",
        type: "execution-order",
        orderItems: ["同步日志", "微任务", "定时器"],
        options: [
          { id: "a", label: "同步日志 -> 微任务 -> 定时器", detail: "正确顺序", feedback: "正确。" },
          { id: "b", label: "定时器 -> 同步日志 -> 微任务", detail: "错误顺序", feedback: "同步代码不会等待定时器。" },
        ],
        answerId: "a"
      }}
      selectedId={null}
      status="idle"
    />
  );

  assert.match(html, /order-answer-grid/);
  assert.match(html, /同步日志/);
  assert.match(html, /微任务/);
  assert.match(html, /定时器/);
});
```

在 `tests/visualizers/styles.test.ts` 追加：

```ts
test("样式包含 P1 题型材料和顺序题移动端适配", () => {
  for (const selector of [
    ".question-material",
    ".question-material__code",
    ".expected-output",
    ".order-answer-grid",
    ".order-answer-card"
  ]) {
    assert.ok(css.includes(selector), `${selector} 应存在`);
  }

  const mobileStart = css.indexOf("@media (max-width: 760px)");
  assert.notEqual(mobileStart, -1);
  const mobileCss = css.slice(mobileStart);
  assert.ok(mobileCss.includes(".question-material__code"));
  assert.ok(mobileCss.includes(".order-answer-card"));
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
npm test -- tests/learning-studio/question-options.test.tsx tests/visualizers/styles.test.ts
```

预期：FAIL，缺少 `question-material`、`order-answer-grid` 等标记。

- [ ] **步骤 3：实现题干材料和题型委派**

在 `app/_components/question-options.tsx` 中：

1. 将 `QuestionOptions()` 分支改为：

```tsx
  if (question.type === "implementation" || question.type === "repair" || question.type === "completion") {
    return (
      <>
        <QuestionMaterial question={question} />
        <CodeQuestionOptions
          disabled={disabled}
          onChoose={onChoose}
          question={question}
          selectedId={selectedId}
          status={status}
        />
      </>
    );
  }

  if (question.type === "execution-order") {
    return (
      <>
        <QuestionMaterial question={question} />
        <OrderQuestionOptions
          disabled={disabled}
          onChoose={onChoose}
          question={question}
          selectedId={selectedId}
          status={status}
        />
      </>
    );
  }

  return (
    <>
      <QuestionMaterial question={question} />
      <TextQuestionOptions ... />
    </>
  );
```

2. 新增：

```tsx
function QuestionMaterial({ question }: { question: LessonQuestion }) {
  if (!question.materialTitle && !question.materialCode && !question.expectedOutput && !question.orderItems?.length) {
    return null;
  }

  return (
    <aside className="question-material">
      {question.materialTitle && <span className="question-material__title">{question.materialTitle}</span>}
      {question.materialCode && (
        <pre className="question-material__code" data-language={question.materialLanguage}>
          <code>{question.materialCode}</code>
        </pre>
      )}
      {question.expectedOutput && <p className="expected-output">{question.expectedOutput}</p>}
      {question.orderItems && (
        <ol className="order-items">
          {question.orderItems.map((item) => <li key={item}>{item}</li>)}
        </ol>
      )}
    </aside>
  );
}
```

3. 新增：

```tsx
function OrderQuestionOptions({ question, selectedId, status, disabled, onChoose }: QuestionOptionsProps) {
  return (
    <div className="order-answer-grid">
      {question.options.map((option) => {
        const state = optionState(option, question.answerId, selectedId, status);

        return (
          <button
            className={`order-answer-card ${state}`}
            disabled={disabled}
            key={option.id}
            onClick={() => onChoose(option.id)}
            type="button"
          >
            <span className="answer-letter">{option.id.toUpperCase()}</span>
            <span className="order-answer-card__copy">
              <strong>{option.label}</strong>
              <small>{option.detail}</small>
            </span>
            <AnswerMark option={option} answerId={question.answerId} selectedId={selectedId} status={status} />
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **步骤 4：补充样式**

在 `app/globals.css` 的答案样式区域加入：

```css
.question-material { margin-top: 18px; border: 1px solid rgba(110, 231, 255, .18); background: radial-gradient(circle at 0 0, rgba(110, 231, 255, .1), transparent 42%), rgba(6, 10, 16, .72); padding: 14px; }
.question-material__title { display: block; color: var(--cyan); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 9px; letter-spacing: .14em; text-transform: uppercase; }
.question-material__code { max-height: 180px; margin: 10px 0 0; padding: 12px; overflow: auto; color: #d6e0ee; background: rgba(0, 0, 0, .28); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; font-size: 10px; line-height: 1.7; white-space: pre; }
.expected-output { margin: 10px 0 0; color: var(--green-bright); font-size: 10px; }
.order-items { margin: 10px 0 0; padding-left: 18px; color: var(--muted); font-size: 10px; line-height: 1.7; }
.order-answer-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 20px; }
.order-answer-card { min-height: 70px; border: 1px solid rgba(110, 231, 255, .16); background: radial-gradient(circle at 8% 50%, rgba(110, 231, 255, .12), transparent 28%), #0a0e13; padding: 14px; display: grid; grid-template-columns: 34px 1fr auto; align-items: center; gap: 12px; color: inherit; text-align: left; cursor: pointer; }
.order-answer-card.correct { border-color: rgba(159, 232, 112, .58); box-shadow: var(--glow-green); }
.order-answer-card.wrong { border-color: #7f3d42; background: rgba(255,107,107,.08); }
.order-answer-card.selected { border-color: rgba(110, 231, 255, .58); box-shadow: var(--glow-cyan); }
.order-answer-card__copy strong, .order-answer-card__copy small { display: block; }
.order-answer-card__copy strong { font-size: 10px; }
.order-answer-card__copy small { margin-top: 5px; color: var(--quiet); font-size: 8px; }
```

在 `@media (max-width: 760px)` 中加入：

```css
  .question-material__code { max-height: 140px; overflow-x: auto; font-size: 9px; }
  .order-answer-card { grid-template-columns: 30px minmax(0, 1fr); }
  .order-answer-card .answer-mark { grid-column: 2; justify-self: start; }
```

- [ ] **步骤 5：运行测试验证通过**

运行：

```bash
npm test -- tests/learning-studio/question-options.test.tsx tests/visualizers/styles.test.ts
```

预期：PASS。

- [ ] **步骤 6：Commit**

```bash
git add app/_components/question-options.tsx app/globals.css tests/learning-studio/question-options.test.tsx tests/visualizers/styles.test.ts
git commit -m "feat: 支持 P1 题型 UI"
```

---

### 任务 3：实现题库补丁层与覆盖率校验

**文件：**

- 创建：`content/questions/apply-question-bank.ts`
- 修改：`lib/curriculum/validate.ts`
- 修改：`content/lesson-registry.ts`
- 测试：`tests/curriculum/question-bank.test.ts`

- [ ] **步骤 1：编写失败的题库补丁测试**

创建 `tests/curriculum/question-bank.test.ts`：

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { nodejsP1QuestionBank } from "../../content/questions/nodejs-p1-question-bank";
import { nextjsP1QuestionBank } from "../../content/questions/nextjs-p1-question-bank";
import { getLessonsByCourse, nextjsPublishedLessons, publishedLessons } from "../../content/lesson-registry";
import { validateQuestionBank, validateQuestionCoverage } from "../../lib/curriculum/validate";

test("P1 题库补丁只引用已存在课程", () => {
  assert.deepEqual(validateQuestionBank(publishedLessons, nodejsP1QuestionBank), []);
  assert.deepEqual(validateQuestionBank(nextjsPublishedLessons, nextjsP1QuestionBank), []);
});

test("Node.js 已发布课程达到 P1 题库覆盖要求", () => {
  assert.deepEqual(validateQuestionCoverage(getLessonsByCourse("nodejs"), {
    minKnowledgeQuestions: 2,
    minProjectQuestions: 3,
    minStageQuestionTypes: 3
  }), []);
});

test("Next.js 已发布课程达到 P1 题库覆盖要求", () => {
  assert.deepEqual(validateQuestionCoverage(getLessonsByCourse("nextjs"), {
    minKnowledgeQuestions: 2,
    minProjectQuestions: 3,
    minStageQuestionTypes: 3
  }), []);
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
npm test -- tests/curriculum/question-bank.test.ts
```

预期：FAIL，缺少题库文件和校验函数。

- [ ] **步骤 3：创建题库补丁类型与挂载函数**

创建 `content/questions/apply-question-bank.ts`：

```ts
import type { LessonQuestion, LessonSpec } from "@/lib/curriculum/types";

export type QuestionBankEntry = {
  lessonId: string;
  questions: LessonQuestion[];
};

export function applyQuestionBank(lessons: LessonSpec[], bank: readonly QuestionBankEntry[]): LessonSpec[] {
  const questionsByLessonId = new Map(bank.map((entry) => [entry.lessonId, entry.questions]));

  return lessons.map((lesson) => ({
    ...lesson,
    questions: [
      ...lesson.questions,
      ...(questionsByLessonId.get(lesson.id) ?? [])
    ]
  }));
}
```

- [ ] **步骤 4：创建临时空题库文件**

创建 `content/questions/nodejs-p1-question-bank.ts`：

```ts
import type { QuestionBankEntry } from "./apply-question-bank";

export const nodejsP1QuestionBank: QuestionBankEntry[] = [];
```

创建 `content/questions/nextjs-p1-question-bank.ts`：

```ts
import type { QuestionBankEntry } from "./apply-question-bank";

export const nextjsP1QuestionBank: QuestionBankEntry[] = [];
```

- [ ] **步骤 5：实现题库和覆盖率校验函数**

在 `lib/curriculum/validate.ts` 导入：

```ts
import type { QuestionBankEntry } from "@/content/questions/apply-question-bank";
```

新增：

```ts
type QuestionCoverageOptions = {
  minKnowledgeQuestions: number;
  minProjectQuestions: number;
  minStageQuestionTypes: number;
};

export function validateQuestionBank(lessons: readonly LessonSpec[], bank: readonly QuestionBankEntry[]): string[] {
  const errors: string[] = [];
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const questionIds = new Set<string>();

  for (const entry of bank) {
    if (!lessonIds.has(entry.lessonId)) errors.push(`题库引用了不存在的课程 ${entry.lessonId}`);
    for (const question of entry.questions) {
      if (questionIds.has(question.id)) errors.push(`题库题目 ID 重复：${question.id}`);
      questionIds.add(question.id);
    }
  }

  return errors;
}

export function validateQuestionCoverage(lessons: readonly LessonSpec[], options: QuestionCoverageOptions): string[] {
  const errors: string[] = [];
  const lessonsByStage = new Map<string, LessonSpec[]>();

  for (const lesson of lessons) {
    const minimum = lesson.kind === "stage-project" ? options.minProjectQuestions : options.minKnowledgeQuestions;
    if (lesson.questions.length < minimum) {
      errors.push(`课程 ${lesson.id} 至少需要 ${minimum} 道题，实际为 ${lesson.questions.length}`);
    }
    lessonsByStage.set(lesson.stageId, [...(lessonsByStage.get(lesson.stageId) ?? []), lesson]);
  }

  for (const [stageId, stageLessons] of lessonsByStage) {
    const types = new Set(stageLessons.flatMap((lesson) => lesson.questions.map((question) => question.type)));
    if (types.size < options.minStageQuestionTypes) {
      errors.push(`阶段 ${stageId} 至少需要 ${options.minStageQuestionTypes} 种题型，实际为 ${types.size}`);
    }
  }

  return errors;
}
```

- [ ] **步骤 6：在注册表挂载题库**

在 `content/lesson-registry.ts` 导入：

```ts
import { applyQuestionBank } from "./questions/apply-question-bank";
import { nodejsP1QuestionBank } from "./questions/nodejs-p1-question-bank";
import { nextjsP1QuestionBank } from "./questions/nextjs-p1-question-bank";
```

将 Node.js 导出改成：

```ts
const basePublishedLessons = [
  stageZeroFoundationsLessons,
  stageOneRuntimeCliLessons,
  stageTwoModulesPackagesLessons,
  stageThreeAsyncEventsLessons,
  legacyStageFourLessons,
  stageFiveHttpFoundationsLessons,
  stageSixApiDesignLessons,
  stageSevenProcessConcurrencyLessons,
  stageEightRealtimeLessons,
  stageNineTestingSecurityLessons,
  stageTenDiagnosticsProductionLessons
].flat() satisfies LessonSpec[];

export const publishedLessons = applyQuestionBank(basePublishedLessons, nodejsP1QuestionBank) satisfies LessonSpec[];
```

将 Next.js 导出改成：

```ts
const baseNextjsPublishedLessons = [
  nextjsStageZeroFoundationsLessons,
  nextjsStageOneRoutingLessons,
  nextjsStageTwoRenderingLessons,
  nextjsStageThreeDataFetchingLessons,
  nextjsStageFourStylingOptimizationLessons,
  nextjsStageFiveApiRoutesLessons,
  nextjsStageSixAuthMiddlewareLessons,
  nextjsStageSevenDatabaseLessons,
  nextjsStageEightTestingDeploymentLessons,
  nextjsStageNineArchitectureAdvancedLessons
].flat() satisfies LessonSpec[];

export const nextjsPublishedLessons = applyQuestionBank(baseNextjsPublishedLessons, nextjsP1QuestionBank) satisfies LessonSpec[];
```

- [ ] **步骤 7：运行测试确认覆盖率仍失败**

运行：

```bash
npm test -- tests/curriculum/question-bank.test.ts
```

预期：FAIL，错误包含课程题量不足。这个失败会在任务 4 和任务 5 补题后修复。

- [ ] **步骤 8：Commit 基础设施**

```bash
git add content/questions/apply-question-bank.ts content/questions/nodejs-p1-question-bank.ts content/questions/nextjs-p1-question-bank.ts content/lesson-registry.ts lib/curriculum/validate.ts tests/curriculum/question-bank.test.ts
git commit -m "feat: 添加 P1 题库补丁层与覆盖率校验"
```

---

### 任务 4：大规模铺开 Node.js P1 题库

**文件：**

- 修改：`content/questions/nodejs-p1-question-bank.ts`
- 测试：`tests/curriculum/question-bank.test.ts`
- 测试：`tests/curriculum/registry.test.ts`

- [ ] **步骤 1：编写 Node.js 覆盖率断言**

在 `tests/curriculum/registry.test.ts` 追加：

```ts
test("Node.js 每个已发布知识点至少包含 2 道题，阶段项目至少 3 道题", () => {
  for (const lesson of publishedLessons) {
    const minimum = lesson.kind === "stage-project" ? 3 : 2;
    assert.ok(
      lesson.questions.length >= minimum,
      `${lesson.id} 应至少包含 ${minimum} 道题，实际为 ${lesson.questions.length}`
    );
  }
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
npm test -- tests/curriculum/question-bank.test.ts tests/curriculum/registry.test.ts
```

预期：FAIL，Node.js 多数课程题量不足。

- [ ] **步骤 3：生成 Node.js 题库条目**

在 `content/questions/nodejs-p1-question-bank.ts` 中替换空数组，结构必须是：

```ts
import type { QuestionBankEntry } from "./apply-question-bank";

export const nodejsP1QuestionBank: QuestionBankEntry[] = [
  {
    lessonId: "foundations-node-javascript",
    questions: [{
      id: "foundations-node-javascript-diagnosis",
      type: "diagnosis",
      prompt: "为什么这段脚本能读取 process，却不能读取 document？",
      materialTitle: "运行现象",
      materialCode: "console.log(typeof process);\nconsole.log(typeof document);",
      materialLanguage: "js",
      expectedOutput: "输出：object / undefined",
      difficulty: "beginner",
      estimatedSeconds: 70,
      options: [
        { id: "a", label: "Node.js 运行时没有 DOM 宿主对象", detail: "process 是 Node 宿主能力", feedback: "正确：document 属于浏览器 DOM，Node.js 默认不提供。" },
        { id: "b", label: "JavaScript 不支持 document", detail: "混淆语言和宿主", feedback: "document 不是语言语法，而是浏览器宿主 API。" },
        { id: "c", label: "process 需要先 import", detail: "忽略 Node 全局对象", feedback: "process 在 Node.js 中通常可直接访问，不需要普通 import。" }
      ],
      answerId: "a",
      correctExplanation: "JavaScript 语法可以运行在不同宿主中。Node.js 提供 process、Buffer、文件和网络能力；浏览器提供 document、window 和 DOM。"
    }]
  }
];
```

实际补题时必须覆盖 `publishedLessons.map((lesson) => lesson.id)` 中全部 92 个 ID。

要求：

- 普通知识点：每个 `lessonId` 追加 1 道 P1 题。
- 阶段项目：每个 `lessonId` 追加 2 道 P1 项目决策题。
- 阶段 04 只覆盖 `stream-backpressure` 和 `project-cli-log-analyzer`。
- 每题必须有 `difficulty` 和 `estimatedSeconds`。
- `repair` / `completion` 题必须至少 2 个代码选项，并为代码选项声明 `language`。
- 每个阶段至少混合 3 种题型。

题型分配表：

```text
foundations: completion / repair / diagnosis
runtime-cli: diagnosis / execution-order / completion
modules-packages: diagnosis / repair / completion
async-events: execution-order / repair / diagnosis
files-streams: repair / diagnosis / execution-order
http-foundations: repair / diagnosis / completion
api-design: diagnosis / repair / completion
process-concurrency: execution-order / diagnosis / repair
realtime: execution-order / diagnosis / repair
testing-security: diagnosis / completion / repair
diagnostics-production: diagnosis / execution-order / completion
```

内容生成时使用真实 Node.js 场景，不使用“显然错误”的干扰项。

- [ ] **步骤 4：运行 Node.js 覆盖率测试**

运行：

```bash
npm test -- tests/curriculum/question-bank.test.ts tests/curriculum/registry.test.ts
```

预期：Node.js 覆盖相关断言 PASS；Next.js 覆盖断言仍可能 FAIL，下一任务修复。

- [ ] **步骤 5：运行课程校验**

运行：

```bash
npm run validate:curriculum
```

预期：如果因 Next.js 尚未补齐覆盖率失败，可以接受；但 `validateLessonSpec` 结构错误必须为 0。

- [ ] **步骤 6：Commit**

```bash
git add content/questions/nodejs-p1-question-bank.ts tests/curriculum/registry.test.ts
git commit -m "feat: 大规模补充 Node.js P1 题库"
```

---

### 任务 5：大规模铺开 Next.js P1 题库

**文件：**

- 修改：`content/questions/nextjs-p1-question-bank.ts`
- 测试：`tests/curriculum/question-bank.test.ts`
- 测试：`tests/curriculum/nextjs-complete.test.ts`

- [ ] **步骤 1：编写 Next.js 覆盖率断言**

在 `tests/curriculum/nextjs-complete.test.ts` 追加：

```ts
test("Next.js 每个已发布知识点至少包含 2 道题，阶段项目至少 3 道题", () => {
  for (const lesson of nextjsPublishedLessons) {
    const minimum = lesson.kind === "stage-project" ? 3 : 2;
    assert.ok(
      lesson.questions.length >= minimum,
      `${lesson.id} 应至少包含 ${minimum} 道题，实际为 ${lesson.questions.length}`
    );
  }
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
npm test -- tests/curriculum/question-bank.test.ts tests/curriculum/nextjs-complete.test.ts
```

预期：FAIL，Next.js 多数课程题量不足。

- [ ] **步骤 3：生成 Next.js 题库条目**

在 `content/questions/nextjs-p1-question-bank.ts` 中替换空数组，结构必须是：

```ts
import type { QuestionBankEntry } from "./apply-question-bank";

export const nextjsP1QuestionBank: QuestionBankEntry[] = [
  {
    lessonId: "nextjs-foundations-what-is-nextjs",
    questions: [{
      id: "nextjs-foundations-what-is-nextjs-diagnosis",
      type: "diagnosis",
      prompt: "为什么这段 console.log 不会出现在浏览器 DevTools？",
      materialTitle: "Server Component 日志",
      materialCode: "export default function Page() {\n  console.log('server only');\n  return <h1>Hello</h1>;\n}",
      materialLanguage: "tsx",
      expectedOutput: "日志出现在运行 Next.js 的服务端终端",
      difficulty: "beginner",
      estimatedSeconds: 70,
      options: [
        { id: "a", label: "默认组件在服务端执行", detail: "App Router 默认 RSC", feedback: "正确：Server Component 的 console.log 在服务端运行。" },
        { id: "b", label: "React 自动删除 console.log", detail: "混淆框架优化", feedback: "React 不会因为日志语句就自动删除代码。" },
        { id: "c", label: "浏览器禁用了 console", detail: "错误定位方向", feedback: "问题不在 DevTools，而在组件执行位置。" }
      ],
      answerId: "a",
      correctExplanation: "App Router 下组件默认是 Server Component，代码在服务端执行，浏览器收到的是渲染结果。"
    }]
  }
];
```

实际补题时必须覆盖 `nextjsPublishedLessons.map((lesson) => lesson.id)` 中全部 90 个 ID。

要求：

- 普通知识点：每个 `lessonId` 追加 1 道 P1 题。
- 阶段项目：每个 `lessonId` 追加 2 道 P1 项目决策题。
- 每题必须有 `difficulty` 和 `estimatedSeconds`。
- `repair` / `completion` 题必须至少 2 个代码选项，并声明 `language`。
- 每个阶段至少混合 3 种题型。

题型分配表：

```text
nextjs-foundations: completion / repair / diagnosis
nextjs-routing: completion / diagnosis / repair
nextjs-rendering: diagnosis / execution-order / repair
nextjs-data-fetching: repair / execution-order / diagnosis
nextjs-styling-optimization: diagnosis / completion / repair
nextjs-api-routes: repair / diagnosis / completion
nextjs-auth-middleware: diagnosis / repair / execution-order
nextjs-database: diagnosis / repair / completion
nextjs-testing-deployment: completion / diagnosis / repair
nextjs-advanced-patterns: execution-order / diagnosis / repair
```

内容生成时优先使用本地 Next.js 16 App Router 约定，避免使用旧 Pages Router 心智模型。

- [ ] **步骤 4：运行 Next.js 覆盖率测试**

运行：

```bash
npm test -- tests/curriculum/question-bank.test.ts tests/curriculum/nextjs-complete.test.ts
```

预期：PASS。

- [ ] **步骤 5：运行全量课程测试**

运行：

```bash
npm test -- tests/curriculum
```

预期：PASS。

- [ ] **步骤 6：Commit**

```bash
git add content/questions/nextjs-p1-question-bank.ts tests/curriculum/nextjs-complete.test.ts
git commit -m "feat: 大规模补充 Next.js P1 题库"
```

---

### 任务 6：更新课程校验 CLI 与文档

**文件：**

- 修改：`scripts/validate-curriculum.ts`
- 修改：`docs/PRODUCT.md`
- 修改：`docs/ARTICHECTURE.md`
- 修改：`session-handoff.md`
- 测试：`tests/curriculum/question-bank.test.ts`

- [ ] **步骤 1：查看现有校验脚本**

运行：

```bash
sed -n '1,220p' scripts/validate-curriculum.ts
```

确认当前输出格式后再修改。

- [ ] **步骤 2：让 CLI 输出题目数量**

在 `scripts/validate-curriculum.ts` 中计算：

```ts
const nodeQuestionCount = getLessonsByCourse("nodejs")
  .reduce((total, lesson) => total + lesson.questions.length, 0);
const nextQuestionCount = getLessonsByCourse("nextjs")
  .reduce((total, lesson) => total + lesson.questions.length, 0);
```

输出追加：

```ts
console.log(`题库覆盖：Node.js ${nodeQuestionCount} 道题，Next.js ${nextQuestionCount} 道题，共 ${nodeQuestionCount + nextQuestionCount} 道题。`);
```

- [ ] **步骤 3：把覆盖率校验纳入 CLI**

在脚本中追加：

```ts
const coverageErrors = [
  ...validateQuestionCoverage(getLessonsByCourse("nodejs"), {
    minKnowledgeQuestions: 2,
    minProjectQuestions: 3,
    minStageQuestionTypes: 3
  }),
  ...validateQuestionCoverage(getLessonsByCourse("nextjs"), {
    minKnowledgeQuestions: 2,
    minProjectQuestions: 3,
    minStageQuestionTypes: 3
  })
];

errors.push(...coverageErrors);
```

如果当前脚本变量命名不同，保持现有结构，只确保覆盖率错误会导致非 0 退出。

- [ ] **步骤 4：更新产品文档**

在 `docs/PRODUCT.md` 的 Current Experience 和 Success Criteria 中明确：

```md
- `diagnosis`、`repair`、`completion`、`execution-order` 已具备专属题型 UI。
- Node.js 与 Next.js 已发布知识点至少包含 2 道题，阶段项目至少包含 3 道题。
- 课程校验会检查阶段题型多样性。
```

- [ ] **步骤 5：更新架构文档**

在 `docs/ARTICHECTURE.md` 的 Module Boundaries 中加入：

```text
content/questions/*
  -> P1 题库补丁层，将 diagnosis、repair、completion、execution-order 追加到已发布课程
```

在 Data Model 中补充题干材料字段。

- [ ] **步骤 6：更新交接文档**

在 `session-handoff.md` 中记录：

```md
- 已新增 P1 题型 UI 与题库补丁层。
- Node.js / Next.js 已发布课程完成 P1 题库覆盖。
- `npm run validate:curriculum` 会输出课程数、案例数和题目数。
```

- [ ] **步骤 7：运行校验**

运行：

```bash
npm run validate:curriculum
npm test -- tests/curriculum/question-bank.test.ts
```

预期：PASS，CLI 输出包含题库覆盖数量。

- [ ] **步骤 8：Commit**

```bash
git add scripts/validate-curriculum.ts docs/PRODUCT.md docs/ARTICHECTURE.md session-handoff.md
git commit -m "docs: 更新 P1 题库覆盖文档与校验输出"
```

---

### 任务 7：完整验证、构建和收尾

**文件：**

- 检查：全项目

- [ ] **步骤 1：运行课程校验**

运行：

```bash
npm run validate:curriculum
```

预期：PASS，输出包含：

```text
课程校验通过：Node.js 11 个阶段 92 个案例，Next.js 10 个阶段 90 个案例，共 182 个已发布案例。
题库覆盖：Node.js <N> 道题，Next.js <M> 道题，共 <N+M> 道题。
```

- [ ] **步骤 2：运行完整测试**

运行：

```bash
npm test
```

预期：PASS。

- [ ] **步骤 3：运行 lint**

运行：

```bash
npm run lint
```

预期：PASS。

- [ ] **步骤 4：运行生产构建**

运行：

```bash
npm run build
```

预期：PASS。允许出现 Next.js 多 lockfile workspace root warning；不允许 TypeScript 或构建失败。

- [ ] **步骤 5：检查空白错误**

运行：

```bash
git diff --check
```

预期：无输出，退出码 0。

- [ ] **步骤 6：检查工作区状态**

运行：

```bash
git status --short --branch
```

预期：只有用户明确保留的未跟踪文件可以存在；本轮改动都应已提交。

- [ ] **步骤 7：最终 Commit（如有遗漏文档或修复）**

如果步骤 1-6 发现小修复，完成后提交：

```bash
git add <changed-files>
git commit -m "fix: 完成 P1 题库铺开收尾验证"
```

如果没有未提交改动，不创建空提交。

---

## 自检记录

- 规格覆盖度：计划覆盖 P1 UI、题库补丁层、Node.js 大规模题库、Next.js 大规模题库、覆盖率校验、文档更新和最终验证。
- 占位符扫描：计划没有使用 TODO、待定或“类似任务”等占位描述。
- 类型一致性：使用现有 `LessonQuestion`、`AnswerOption`、`LessonSpec`、`QuestionType`，新增字段和校验函数在任务 1 / 3 中定义后再被后续任务使用。
- 范围控制：本轮不实现 Supabase、错题本、拖拽排序、代码沙箱和阶段 04 未发布内容。
