import type { CodeLanguage, LessonQuestion, LessonSpec, MicroBrowserSpec, QuestionType, StageId, VisualizerType } from "../../../lib/curriculum/types";
import { createLessonSpec } from "../lesson-factory";

type FrontendDebugStageSeed = {
  stageId: StageId;
  stageNumber: number;
  stageLabel: string;
  visualizerType: VisualizerType;
  sourceTitle: string;
  sourceUrl: string;
  runtimeUrl: string;
  lessons: readonly string[];
  projectTitle: string;
  projectConcept: string;
};

const stageSeeds: FrontendDebugStageSeed[] = [
  {
    stageId: "frontend-debugging-network-requests",
    stageNumber: 1,
    stageLabel: "Network 请求排障",
    visualizerType: "browser-network-debug",
    sourceTitle: "MDN Web Docs: Network request concepts",
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
    runtimeUrl: "/debug-lab/network",
    lessons: ["请求瀑布流", "状态码分层", "请求头缺失", "响应体解析", "CORS 预检失败", "Cookie 未携带", "Token 过期", "缓存误命中"],
    projectTitle: "登录接口跨域事故",
    projectConcept: "从 Network 面板读取预检、Cookie、Token 和响应状态，修复一次登录接口跨域失败。"
  },
  {
    stageId: "frontend-debugging-react-render",
    stageNumber: 2,
    stageLabel: "React 渲染问题",
    visualizerType: "frontend-error-stack",
    sourceTitle: "React Docs: Rendering",
    sourceUrl: "https://react.dev/learn/render-and-commit",
    runtimeUrl: "/debug-lab/react-render",
    lessons: ["状态未更新", "闭包旧值", "Effect 无限循环", "Key 不稳定", "条件渲染空洞", "Memo 误用", "受控输入异常", "错误边界恢复"],
    projectTitle: "修复搜索列表重复渲染",
    projectConcept: "沿着 state、props、effect 和 key 的路径定位重复渲染，恢复搜索列表的稳定交互。"
  },
  {
    stageId: "frontend-debugging-build-env",
    stageNumber: 3,
    stageLabel: "构建与环境问题",
    visualizerType: "nextjs-build-output",
    sourceTitle: "Next.js Docs: Environment Variables",
    sourceUrl: "https://nextjs.org/docs/app/guides/environment-variables",
    runtimeUrl: "/debug-lab/build-env",
    lessons: ["环境变量缺失", "客户端变量前缀", "构建产物缓存", "依赖版本冲突", "Source Map 上传", "静态资源路径", "SSR 与浏览器 API", "部署回滚验证"],
    projectTitle: "修复生产环境配置缺失",
    projectConcept: "从构建日志、环境变量和运行时预览定位生产配置缺失，并验证回滚与修复结果。"
  }
];

function createPreview(stage: FrontendDebugStageSeed, title: string): MicroBrowserSpec {
  return {
    url: stage.runtimeUrl,
    statusCode: stage.stageNumber === 1 ? 401 : 200,
    contentType: stage.stageNumber === 3 ? "application/json" : "ui-card",
    headers: {
      "x-nodepath-debug-stage": stage.stageLabel,
      "cache-control": stage.stageNumber === 1 ? "no-store" : "private, max-age=0"
    },
    jsonOutput: stage.stageNumber === 3 ? { stage: stage.stageLabel, lesson: title, status: "inspect" } : undefined,
    renderedHtml: stage.stageNumber === 3
      ? undefined
      : `<section class="debug-preview"><h1>${title}</h1><p>${stage.stageLabel} 已进入可观察状态。</p></section>`
  };
}

function createPrimaryQuestion(stage: FrontendDebugStageSeed, title: string, index: number): LessonQuestion {
  const type = pickPrimaryType(stage, index);

  return {
    id: `${stage.stageId}-lesson-${index + 1}-${type}`,
    type,
    prompt: `调试「${title}」时，最可靠的第一步是什么？`,
    materialTitle: `${stage.stageLabel} 调试现场`,
    materialCode: createMaterial(stage, title),
    materialLanguage: "text",
    expectedOutput: "先收集证据，再定位最小修复点。",
    orderItems: type === "execution-order" ? ["读取现象", "定位证据", "选择修复", "验证恢复"] : undefined,
    difficulty: "beginner",
    estimatedSeconds: 85,
    options: [
      {
        id: "a",
        label: "先刷新页面三次，看是否偶现恢复",
        detail: "把偶发恢复当作修复",
        feedback: "刷新只能改变现场，不能解释根因。调试要保留可复查证据。"
      },
      {
        id: "b",
        label: `沿 ${stage.stageLabel} 的证据链定位 ${title}`,
        detail: "先证据再修复",
        feedback: "正确：先把错误、请求、渲染或构建日志放回执行链路，再选择最小修复。"
      },
      {
        id: "c",
        label: "先删除相关功能避免报错",
        detail: "绕过用户路径",
        feedback: "删除功能不能证明问题被理解，也无法保证同类事故不复发。"
      }
    ],
    answerId: "b",
    correctExplanation: `「${title}」需要从 ${stage.stageLabel} 的可观察证据开始，而不是靠猜。`
  };
}

function createRepairQuestion(stage: FrontendDebugStageSeed, title: string, index: number): LessonQuestion {
  const language: CodeLanguage = stage.stageNumber === 3 ? "ts" : "tsx";

  return {
    id: `${stage.stageId}-lesson-${index + 1}-repair`,
    type: index % 2 === 0 ? "repair" : "completion",
    prompt: `选择更适合「${title}」的修复策略。`,
    materialTitle: "待修复片段",
    materialCode: `// ${title}\nconst evidence = collect("${stage.stageLabel}");\n// TODO: 根据证据选择最小修复`,
    materialLanguage: language,
    difficulty: "beginner",
    estimatedSeconds: 95,
    options: [
      {
        id: "a",
        label: "根据证据收窄输入并补充恢复验证",
        detail: "最小可证明修复",
        feedback: "正确：修复要覆盖根因和恢复验证，不只是压掉错误日志。",
        language,
        diffLines: [2, 3],
        code: `const evidence = collect("${stage.stageLabel}");\nconst fixed = normalizeEvidence(evidence, "${title}");\nverifyRecovery(fixed);`
      },
      {
        id: "b",
        label: "隐藏错误提示继续上线",
        detail: "掩盖现场",
        feedback: "隐藏提示会丢失证据，线上问题还会以另一种形式出现。",
        language,
        diffLines: [2],
        code: `tryRunFeature();\nconsole.clear();`
      },
      {
        id: "c",
        label: "跳过日志和预览直接合并",
        detail: "没有验证",
        feedback: "没有恢复验证，无法确认用户路径真的恢复。",
        language,
        diffLines: [3],
        code: `mergeWithoutVerification("${title}");`
      }
    ],
    answerId: "a",
    correctExplanation: "调试题的修复必须和证据链绑定，并在预览或日志中证明恢复。"
  };
}

function createDebugLesson(stage: FrontendDebugStageSeed, title: string, index: number): LessonSpec {
  const fileName = `${stage.stageId}-${index + 1}.${stage.stageNumber === 3 ? "ts" : "tsx"}`;

  return createLessonSpec({
    id: `${stage.stageId}-lesson-${index + 1}`,
    stageId: stage.stageId,
    eyebrow: `${String(stage.stageNumber).padStart(2, "0")}.${index + 1} · ${stage.stageLabel}`,
    title,
    durationMinutes: 11,
    difficulty: "基础",
    nodeVersion: "Browser DevTools + React",
    objectives: [`定位${title}的第一证据`, "选择能证明恢复的最小修复"],
    prerequisites: ["frontend-debugging-stack-first-frame"],
    concept: `${title} 是 ${stage.stageLabel} 中常见但细碎的真实故障点。学习重点不是背结论，而是把现象、日志、代码位置和恢复结果串成可复查 trace。`,
    points: [`读取${title}现场`, "定位第一条有效证据", "验证用户路径恢复"],
    memoryHook: `${title}：先保留现场，再做最小修复`,
    files: [{
      name: fileName,
      code: createCode(stage, title)
    }],
    entryFile: fileName,
    answer: undefined,
    additionalQuestions: [createPrimaryQuestion(stage, title, index), createRepairQuestion(stage, title, index)],
    execution: {
      visualizer: {
        type: stage.visualizerType,
        title: `${stage.stageLabel} Trace`,
        nodes: ["现象", title, "源码位置", "修复", "恢复"]
      },
      lanes: ["Signal", "Source", "Patch", "Preview"],
      frames: [
        {
          activeLane: 0,
          laneValues: [`${title} 出现`, "等待", "等待", "异常预览"],
          log: [`发现 ${stage.stageLabel} 现场：${title}`],
          note: "保留现场，先读证据。",
          delayMs: 360
        },
        {
          activeLane: 1,
          laneValues: ["已记录", fileName, "等待", "异常预览"],
          log: [`定位到 ${fileName}`],
          note: "把现象落到源码或配置入口。",
          delayMs: 720
        },
        {
          activeLane: 3,
          laneValues: ["已记录", "已定位", "最小修复", "恢复完成"],
          log: [`${title} 已通过预览和日志复核`],
          note: "修复必须用恢复信号证明。",
          delayMs: 720
        }
      ]
    },
    preview: createPreview(stage, title),
    summary: [`${title} 要从可观察证据开始`, "修复要最小且可复查", "恢复验证必须覆盖用户路径"],
    sources: [{ title: stage.sourceTitle, url: stage.sourceUrl }]
  });
}

function createProjectLesson(stage: FrontendDebugStageSeed): LessonSpec {
  const fileName = `${stage.stageId}-project.tsx`;

  return createLessonSpec({
    id: `${stage.stageId}-project`,
    stageId: stage.stageId,
    kind: "stage-project",
    eyebrow: `${String(stage.stageNumber).padStart(2, "0")}.9 · 阶段项目`,
    title: stage.projectTitle,
    durationMinutes: 22,
    difficulty: "进阶",
    nodeVersion: "Browser DevTools + React",
    objectives: [`完成${stage.projectTitle}的完整排障闭环`, "输出可证明恢复的事故复盘"],
    prerequisites: stage.lessons.slice(0, 4).map((lesson) => `${stage.stageId}-lesson-${stage.lessons.indexOf(lesson) + 1}`),
    concept: stage.projectConcept,
    points: ["读取事故现场", "选择最小修复", "验证恢复并总结防回归"],
    memoryHook: "阶段项目不是猜答案，是把事故 trace 跑完",
    files: [{ name: fileName, code: createCode(stage, stage.projectTitle) }],
    entryFile: fileName,
    answer: undefined,
    additionalQuestions: [
      createPrimaryQuestion(stage, stage.projectTitle, 8),
      createRepairQuestion(stage, stage.projectTitle, 8),
      createProjectOrderQuestion(stage)
    ],
    execution: {
      visualizer: {
        type: stage.visualizerType,
        title: `${stage.projectTitle} 事故恢复`,
        nodes: ["Incident", "Evidence", "Patch", "Verify", "Report"]
      },
      lanes: ["Incident", "Evidence", "Patch", "Recovery"],
      frames: [
        { activeLane: 0, laneValues: ["事故升级", "等待", "等待", "用户路径异常"], log: [`启动阶段项目：${stage.projectTitle}`], note: "项目从事故现场开始。", delayMs: 420 },
        { activeLane: 1, laneValues: ["已记录", stage.stageLabel, "等待", "待恢复"], log: ["关键证据已收集"], note: "用阶段知识点缩小根因范围。", delayMs: 760 },
        { activeLane: 3, laneValues: ["已记录", "已定位", "补丁生效", "恢复完成"], log: ["恢复验证通过，生成复盘摘要"], note: "最终交付可解释恢复。", delayMs: 760 }
      ]
    },
    preview: createPreview(stage, stage.projectTitle),
    summary: [stage.projectConcept, "阶段项目需要同时覆盖证据、修复和恢复验证"],
    sources: [{ title: stage.sourceTitle, url: stage.sourceUrl }]
  });
}

function createProjectOrderQuestion(stage: FrontendDebugStageSeed): LessonQuestion {
  return {
    id: `${stage.stageId}-project-order`,
    type: "execution-order",
    prompt: `${stage.projectTitle} 的恢复链路应该如何排序？`,
    materialTitle: "阶段项目复盘顺序",
    materialCode: "incident -> evidence -> patch -> verify -> report",
    materialLanguage: "text",
    orderItems: ["读取事故", "收集证据", "应用补丁", "验证恢复", "写入复盘"],
    difficulty: "intermediate",
    estimatedSeconds: 100,
    options: [
      { id: "a", label: "读取事故 -> 收集证据 -> 应用补丁 -> 验证恢复 -> 写入复盘", detail: "完整恢复链路", feedback: "正确：这是可审查的前端事故处理顺序。" },
      { id: "b", label: "应用补丁 -> 清空日志 -> 写入复盘", detail: "跳过证据", feedback: "没有证据链，复盘无法解释为什么这么修。" },
      { id: "c", label: "刷新页面 -> 观察运气 -> 合并代码", detail: "偶发恢复", feedback: "偶发恢复不能证明问题被修复。" }
    ],
    answerId: "a",
    correctExplanation: "前端事故项目必须保留从现场到恢复的顺序。"
  };
}

function pickPrimaryType(stage: FrontendDebugStageSeed, index: number): QuestionType {
  if (stage.stageNumber === 1) return index % 2 === 0 ? "network-debug" : "diagnosis";
  if (stage.stageNumber === 2) return index % 3 === 0 ? "execution-order" : "trace-debug";
  return index % 2 === 0 ? "diagnosis" : "execution-order";
}

function createMaterial(stage: FrontendDebugStageSeed, title: string): string {
  if (stage.stageNumber === 1) return `Network\n  request: ${title}\n  status: pending/error\n  headers: inspect required`;
  if (stage.stageNumber === 2) return `React Trace\n  state -> props -> render\n  focus: ${title}`;
  return `Build Output\n  stage: ${stage.stageLabel}\n  signal: ${title}`;
}

function createCode(stage: FrontendDebugStageSeed, title: string): string {
  if (stage.stageNumber === 1) {
    return `export async function inspectRequest(response: Response) {
  console.log("${title}", response.status, response.headers.get("content-type"));
  return response.ok ? "continue" : "inspect-network";
}`;
  }

  if (stage.stageNumber === 2) {
    return `export function RenderProbe({ value }: { value?: string }) {
  console.log("${title}", value ?? "missing");
  return <output>{value ?? "fallback"}</output>;
}`;
  }

  return `export function inspectBuildEnv(env: Record<string, string | undefined>) {
  const value = env.NEXT_PUBLIC_NODEPATH_FLAG;
  console.log("${title}", value ?? "missing");
  return value ? "ready" : "inspect-env";
}`;
}

export const frontendDebuggingExpandedLessons = stageSeeds.flatMap((stage) => [
  ...stage.lessons.map((lesson, index) => createDebugLesson(stage, lesson, index)),
  createProjectLesson(stage)
]) satisfies LessonSpec[];
