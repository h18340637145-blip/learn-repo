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

test("QuestionOptions 为 diagnosis 题渲染诊断材料", () => {
  const html = renderToStaticMarkup(
    <QuestionOptions
      disabled={false}
      onChoose={() => undefined}
      question={{
        ...implementationQuestion,
        id: "diagnosis-question",
        type: "diagnosis",
        prompt: "为什么会打印 undefined？",
        materialTitle: "错误现象",
        materialCode: "console.log(config.port)",
        materialLanguage: "js",
        expectedOutput: "实际输出：undefined"
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
        onChoose={() => undefined}
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
      onChoose={() => undefined}
      question={{
        ...implementationQuestion,
        id: "order-question",
        type: "execution-order",
        orderItems: ["同步日志", "微任务", "定时器"],
        options: [
          { id: "a", label: "同步日志 -> 微任务 -> 定时器", detail: "正确顺序", feedback: "正确。" },
          { id: "b", label: "定时器 -> 同步日志 -> 微任务", detail: "错误顺序", feedback: "同步代码不会等待定时器。" }
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
