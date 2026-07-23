import type { CurriculumStage } from "../lib/curriculum/types";

export const frontendDebuggingCurriculum = [
  {
    id: "frontend-debugging-console-stack",
    number: 0,
    title: "浏览器控制台与错误栈",
    summary: "学习从控制台错误、调用栈和业务源码帧定位前端故障第一现场。",
    lessons: [
      {
        id: "frontend-debugging-stack-first-frame",
        title: "读取错误栈的第一现场",
        order: 1,
        kind: "knowledge",
        status: "published"
      },
      {
        id: "frontend-debugging-error-types",
        title: "区分常见 JavaScript 错误类型",
        order: 2,
        kind: "knowledge",
        status: "published"
      },
      {
        id: "frontend-debugging-undefined-property",
        title: "定位 undefined 属性访问",
        order: 3,
        kind: "knowledge",
        status: "published"
      },
      {
        id: "frontend-debugging-promise-rejection",
        title: "识别异步 Promise 报错",
        order: 4,
        kind: "knowledge",
        status: "published"
      },
      {
        id: "frontend-debugging-source-map",
        title: "从 Source Map 回到源码",
        order: 5,
        kind: "knowledge",
        status: "published"
      },
      {
        id: "frontend-debugging-console-structure",
        title: "用结构化 console 整理调试信息",
        order: 6,
        kind: "knowledge",
        status: "published"
      },
      {
        id: "frontend-debugging-data-vs-render",
        title: "判断数据问题还是渲染问题",
        order: 7,
        kind: "knowledge",
        status: "published"
      },
      {
        id: "frontend-debugging-runtime-recovery",
        title: "观察修复后的运行恢复",
        order: 8,
        kind: "knowledge",
        status: "published"
      }
    ],
    project: {
      id: "project-frontend-debugging-product-list",
      title: "修复商品列表白屏事故",
      order: 9,
      kind: "stage-project",
      status: "published"
    }
  }
] as const satisfies readonly CurriculumStage[];
