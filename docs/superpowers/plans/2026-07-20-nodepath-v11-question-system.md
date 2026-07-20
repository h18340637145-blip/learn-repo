# NodePath V1.1 题型系统实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 NodePath 从单课单题预测升级为兼容旧题的多题型学习系统，并上线 `implementation` 代码实现题试点。

**架构：** 在 `lib/curriculum/types.ts` 扩展题目/选项模型，在 `lib/curriculum/validate.ts` 增加题型校验；提取 `app/_components/question-options.tsx` 负责普通选项和代码选项渲染；`app/_components/learning-studio.tsx` 只管理当前题号、选择和完成规则。课程内容先小范围追加 `implementation` 题，保留 authored trace 和本地进度模型。

**技术栈：** Next.js 16 App Router、React 19 Client Components、TypeScript、Node test runner、ESLint、CSS 响应式样式。

---

## 文件结构

- 修改：`lib/curriculum/types.ts`
  - 扩展 `QuestionType`、`AnswerOption`、`LessonQuestion`。
- 修改：`lib/curriculum/validate.ts`
  - 增加题型、代码选项、语言和 diffLines 校验。
- 创建：`app/_components/question-options.tsx`
  - 渲染普通答案卡片和 `implementation` 代码选项卡片。
- 修改：`app/_components/learning-studio.tsx`
  - 支持单课多题、题号提示、答对后进入下一题、最后一题才运行并写入完成。
- 修改：`app/globals.css`
  - 增加代码选项卡片、展开按钮、移动端纵向布局和 diffLines 样式。
- 修改：`content/lessons/stage-00-foundations.ts`
  - 给 Node.js 基础课程追加一个 `implementation` 试点题。
- 修改：`content/lessons/nextjs/stage-00-foundations.ts`
  - 给 Next.js 基础课程追加一个 `implementation` 试点题。
- 修改：`docs/PRODUCT.md`
  - 记录 V1.1 多题型试点能力。
- 修改：`docs/ARTICHECTURE.md`
  - 记录新题型模型和组件边界。
- 修改：`session-handoff.md`
  - 记录当前分支、实现范围和验证命令。
- 测试：`tests/curriculum/validate.test.ts`
  - 覆盖新题型校验。
- 创建：`tests/learning-studio/question-options.test.tsx`
  - 覆盖选项组件输出。
- 创建：`tests/learning-studio/multi-question-flow.test.ts`
  - 源码级断言多题状态和完成规则。
- 创建：`tests/learning-studio/mobile-question-options-styles.test.ts`
  - 样式级断言移动端代码选项纵向布局。

---

### 任务 1：扩展课程题目类型和校验

**文件：**
- 修改：`lib/curriculum/types.ts`
- 修改：`lib/curriculum/validate.ts`
- 修改：`tests/curriculum/validate.test.ts`

- [ ] **步骤 1：编写失败的校验测试**

在 `tests/curriculum/validate.test.ts` 追加测试：

```ts
test("implementation 题必须包含带语言声明的代码选项", () => {
  const invalid = structuredClone(validLesson);
  invalid.questions.push({
    id: "array-map-implementation",
    type: "implementation",
    prompt: "选择能把 [1, 2, 3] 变成 [2, 4, 6] 的实现",
    options: [
      { id: "a", label: "map", detail: "使用 map", feedback: "正确但这里故意缺少 code" },
      { id: "b", label: "filter", detail: "使用 filter", feedback: "filter 不会改变元素值" }
    ],
    answerId: "a",
    correctExplanation: "map 会逐项转换数组元素。"
  });

  assert.deepEqual(validateLessonSpec(invalid), [
    "课程 event-loop-order 的 implementation 题 array-map-implementation 至少需要一个代码选项"
  ]);
});

test("含代码的选项必须声明语言且 diffLines 必须为正整数", () => {
  const invalid = structuredClone(validLesson);
  invalid.questions.push({
    id: "array-map-implementation",
    type: "implementation",
    prompt: "选择正确实现",
    options: [
      { id: "a", label: "map", detail: "转换", feedback: "正确", code: "[1,2,3].map(n => n * 2)", diffLines: [0] }
    ],
    answerId: "a",
    correctExplanation: "map 会返回新数组。"
  });

  assert.deepEqual(validateLessonSpec(invalid), [
    "课程 event-loop-order 的题目 array-map-implementation 至少需要 2 个选项",
    "课程 event-loop-order 的题目 array-map-implementation 选项 a 含代码但缺少 language",
    "课程 event-loop-order 的题目 array-map-implementation 选项 a 的 diffLines 必须是正整数数组"
  ]);
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
npm test -- tests/curriculum/validate.test.ts
```

预期：FAIL，失败原因包含 `implementation` 类型尚不满足类型或校验缺失。

- [ ] **步骤 3：实现类型扩展和校验**

在 `lib/curriculum/types.ts`：

```ts
export type QuestionType =
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

export type CodeLanguage = "js" | "ts" | "tsx" | "json" | "bash" | "text";

export type AnswerOption = {
  id: string;
  label: string;
  detail: string;
  feedback: string;
  code?: string;
  language?: CodeLanguage;
  diffLines?: number[];
  summary?: string;
};

export type LessonQuestion = {
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

在 `lib/curriculum/validate.ts` 增加：

```ts
const supportedQuestionTypes = new Set<QuestionType>([
  "prediction",
  "implementation",
  "diagnosis",
  "repair",
  "completion",
  "execution-order",
  "best-practice",
  "concept-match",
  "equivalent-code",
  "sequence",
  "transfer"
]);

const supportedCodeLanguages = new Set<CodeLanguage>(["js", "ts", "tsx", "json", "bash", "text"]);
```

并在每题循环里校验题型、选项数量、implementation 代码选项、language 和 diffLines。

- [ ] **步骤 4：运行测试验证通过**

运行：

```bash
npm test -- tests/curriculum/validate.test.ts
```

预期：PASS。

---

### 任务 2：提取题目选项组件并支持 implementation 代码卡片

**文件：**
- 创建：`app/_components/question-options.tsx`
- 创建：`tests/learning-studio/question-options.test.tsx`
- 修改：`app/globals.css`

- [ ] **步骤 1：编写失败的组件测试**

创建 `tests/learning-studio/question-options.test.tsx`：

```tsx
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { QuestionOptions } from "../../app/_components/question-options";
import type { LessonQuestion } from "../../lib/curriculum/types";

const implementationQuestion: LessonQuestion = {
  id: "array-map-implementation",
  type: "implementation",
  prompt: "选择正确实现",
  answerId: "b",
  correctExplanation: "map 返回转换后的新数组。",
  options: [
    {
      id: "a",
      label: "filter 方案",
      detail: "筛选元素",
      summary: "保留符合条件的元素",
      feedback: "filter 不会把元素乘以 2。",
      code: "const doubled = values.filter((n) => n * 2);",
      language: "js",
      diffLines: [1]
    },
    {
      id: "b",
      label: "map 方案",
      detail: "转换元素",
      summary: "逐项返回 n * 2",
      feedback: "正确。",
      code: "const doubled = values.map((n) => n * 2);",
      language: "js",
      diffLines: [1]
    }
  ]
};

test("QuestionOptions 为 implementation 题渲染代码选项卡片", () => {
  const html = renderToStaticMarkup(
    <QuestionOptions
      disabled={false}
      onChoose={() => undefined}
      question={implementationQuestion}
      selectedId="b"
      status="idle"
    />
  );

  assert.match(html, /code-answer-grid/);
  assert.match(html, /code-answer-card/);
  assert.match(html, /map 方案/);
  assert.match(html, /const doubled = values.map/);
  assert.match(html, /展开代码/);
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
npm test -- tests/learning-studio/question-options.test.tsx
```

预期：FAIL，提示 `QuestionOptions` 模块不存在。

- [ ] **步骤 3：实现组件和基础样式**

创建 `app/_components/question-options.tsx`，导出：

```tsx
"use client";

import { useState } from "react";
import type { AnswerOption, LessonQuestion } from "@/lib/curriculum/types";

type AnswerStatus = "idle" | "running" | "wrong" | "success";

type QuestionOptionsProps = {
  question: LessonQuestion;
  selectedId: string | null;
  status: AnswerStatus;
  disabled: boolean;
  onChoose: (optionId: string) => void;
};

export function QuestionOptions({ question, selectedId, status, disabled, onChoose }: QuestionOptionsProps) {
  if (question.type === "implementation") {
    return <CodeQuestionOptions question={question} selectedId={selectedId} status={status} disabled={disabled} onChoose={onChoose} />;
  }

  return <TextQuestionOptions question={question} selectedId={selectedId} status={status} disabled={disabled} onChoose={onChoose} />;
}
```

实现 `TextQuestionOptions` 复用现有 `.answer-grid/.answer` 结构；实现 `CodeQuestionOptions` 输出 `.code-answer-grid/.code-answer-card`、摘要、展开按钮和 `<pre><code>`。

在 `app/globals.css` 添加 `.code-answer-grid`、`.code-answer-card`、`.code-answer-card__code`、`.code-answer-card__toggle` 和移动端规则。

- [ ] **步骤 4：运行测试验证通过**

运行：

```bash
npm test -- tests/learning-studio/question-options.test.tsx
```

预期：PASS。

---

### 任务 3：LearningStudio 支持多题作答流程

**文件：**
- 修改：`app/_components/learning-studio.tsx`
- 创建：`tests/learning-studio/multi-question-flow.test.ts`

- [ ] **步骤 1：编写失败的源码行为测试**

创建 `tests/learning-studio/multi-question-flow.test.ts`：

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("app/_components/learning-studio.tsx", "utf8");

test("LearningStudio 使用 questionIndex 展示当前题而不是固定第一题", () => {
  assert.match(source, /const \\[questionIndex, setQuestionIndex\\]/);
  assert.match(source, /lesson\\.questions\\[questionIndex\\]/);
  assert.doesNotMatch(source, /const question = lesson\\.questions\\[0\\]!/);
});

test("答对非最后一道题不会立即写入课程完成", () => {
  assert.match(source, /hasMoreRequiredQuestions/);
  assert.match(source, /setQuestionIndex\\(\\(current\\) => current \\+ 1\\)/);
  assert.match(source, /if \\(hasMoreRequiredQuestions\\)/);
});

test("LearningStudio 使用 QuestionOptions 渲染题目选项", () => {
  assert.match(source, /import \\{ QuestionOptions \\}/);
  assert.match(source, /<QuestionOptions/);
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
npm test -- tests/learning-studio/multi-question-flow.test.ts
```

预期：FAIL，当前源码仍固定读取 `questions[0]`。

- [ ] **步骤 3：实现多题状态**

在 `app/_components/learning-studio.tsx`：

- 导入 `QuestionOptions`。
- 新增 `questionIndex`、`selectedByQuestion`、`answeredQuestionIds`。
- `const question = lesson.questions[questionIndex] ?? lesson.questions[0]!;`
- 课程切换时清空这些状态。
- `chooseAnswer` 先按当前题判断。
- 如果答对且存在后续必答题，则记录当前题、设置局部解析状态，并显示“进入下一题”按钮，不运行 trace、不写 progress。
- 最后一题答对时沿用现有 trace 和 progress 写入。

- [ ] **步骤 4：运行测试验证通过**

运行：

```bash
npm test -- tests/learning-studio/multi-question-flow.test.ts tests/learning-studio/question-options.test.tsx
```

预期：PASS。

---

### 任务 4：追加 Node.js 与 Next.js implementation 试点题

**文件：**
- 修改：`content/lessons/stage-00-foundations.ts`
- 修改：`content/lessons/nextjs/stage-00-foundations.ts`
- 修改：`tests/curriculum/registry.test.ts`

- [ ] **步骤 1：编写失败的课程试点测试**

在 `tests/curriculum/registry.test.ts` 追加：

```ts
test("Node.js 与 Next.js 至少各有一个 implementation 多题试点", () => {
  const nodeTrial = publishedLessons.find((lesson) =>
    lesson.questions.some((question) => question.type === "implementation")
  );
  const nextTrial = nextjsPublishedLessons.find((lesson) =>
    lesson.questions.some((question) => question.type === "implementation")
  );

  assert.ok(nodeTrial, "Node.js 应至少有一个 implementation 试点题");
  assert.ok(nextTrial, "Next.js 应至少有一个 implementation 试点题");
  assert.ok(nodeTrial.questions.length >= 2);
  assert.ok(nextTrial.questions.length >= 2);
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
npm test -- tests/curriculum/registry.test.ts
```

预期：FAIL，当前没有 implementation 试点。

- [ ] **步骤 3：追加试点题**

给 Node.js 基础课程追加数组转换 implementation 题；给 Next.js 基础课程追加 Server Component 页面实现 implementation 题。每题 3 个代码选项，均包含 `code`、`language`、`summary`、`diffLines` 和定向反馈。

- [ ] **步骤 4：运行测试验证通过**

运行：

```bash
npm test -- tests/curriculum/registry.test.ts
npm run validate:curriculum
```

预期：PASS，课程校验通过。

---

### 任务 5：移动端样式和文档同步

**文件：**
- 修改：`app/globals.css`
- 修改：`docs/PRODUCT.md`
- 修改：`docs/ARTICHECTURE.md`
- 修改：`session-handoff.md`
- 创建：`tests/learning-studio/mobile-question-options-styles.test.ts`

- [ ] **步骤 1：编写失败的移动端样式测试**

创建 `tests/learning-studio/mobile-question-options-styles.test.ts`：

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("app/globals.css", "utf8");

test("移动端代码选项使用纵向卡片且不造成页面横向溢出", () => {
  assert.match(css, /\\.code-answer-grid/);
  assert.match(css, /grid-template-columns:\\s*1fr/);
  assert.match(css, /\\.code-answer-card__code/);
  assert.match(css, /overflow-x:\\s*auto/);
  assert.match(css, /@media \\(max-width:\\s*760px\\)[\\s\\S]*\\.code-answer-card/);
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
npm test -- tests/learning-studio/mobile-question-options-styles.test.ts
```

预期：FAIL，样式尚未完整存在。

- [ ] **步骤 3：补齐样式与文档**

在 `app/globals.css` 明确代码选项卡片纵向布局、代码横向滚动、移动端 padding 和无 hover 触屏可用状态。

更新文档：

- `docs/PRODUCT.md` 记录 V1.1 试点上线。
- `docs/ARTICHECTURE.md` 记录 `QuestionOptions` 组件和题型数据结构。
- `session-handoff.md` 记录实现分支、试点范围、验证命令。

- [ ] **步骤 4：运行测试验证通过**

运行：

```bash
npm test -- tests/learning-studio/mobile-question-options-styles.test.ts
```

预期：PASS。

---

### 任务 6：完整验证和提交

**文件：**
- 检查所有修改文件。

- [ ] **步骤 1：运行完整验证**

运行：

```bash
npm test
npm run validate:curriculum
npm run lint
npm run build
git diff --check
```

预期：全部通过。`npm run build` 如遇 Turbopack 端口权限，按项目说明提权重跑。

- [ ] **步骤 2：提交实现**

运行：

```bash
git add app/_components/question-options.tsx app/_components/learning-studio.tsx app/globals.css lib/curriculum/types.ts lib/curriculum/validate.ts content/lessons/stage-00-foundations.ts content/lessons/nextjs/stage-00-foundations.ts tests/curriculum/validate.test.ts tests/curriculum/registry.test.ts tests/learning-studio/question-options.test.tsx tests/learning-studio/multi-question-flow.test.ts tests/learning-studio/mobile-question-options-styles.test.ts docs/PRODUCT.md docs/ARTICHECTURE.md session-handoff.md docs/superpowers/plans/2026-07-20-nodepath-v11-question-system.md
git commit -m "feat: 实现 NodePath V1.1 多题型试点"
```

预期：提交成功。
