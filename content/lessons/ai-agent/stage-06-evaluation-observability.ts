import type { LessonSpec } from "../../../lib/curriculum/types";
import { createAiAgentLesson, createAiAgentStageProject } from "./ai-agent-lesson-factory";

const eyebrow = "Agent 评测与可观测";

const knowledgeLessons: LessonSpec[] = [
  createAiAgentLesson({
    id: "ai-agent-evaluation-observability-trace-logging",
    stageId: "ai-agent-evaluation-observability",
    order: 1,
    eyebrowStage: eyebrow,
    title: "Trace 结构化日志",
    concept:
      "每次 Agent 调用都要拆成 spans：user_input、llm_call、tool_call、memory_read、output。用 OpenTelemetry 或 Langfuse/LangSmith 打点，把父子关系、耗时、token、错误绑到同一 traceId 上，才能回放整条链路。",
    points: [
      "父 span 覆盖整个 agent.run，子 span 对应每次调用",
      "关键属性：model、prompt hash、token 数、tool 名",
      "错误和重试也要挂到对应 span 上，不能吞掉"
    ],
    memoryHook: "一次调用一条 trace，每步一个 span",
    fileName: "trace-logging.ts",
    code: `import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("agent");

export async function runAgent(input: string) {
  return tracer.startActiveSpan("agent.run", async (span) => {
    span.setAttribute("agent.model", "gpt-4o");
    span.setAttribute("agent.input.chars", input.length);
    try {
      const plan = await tracer.startActiveSpan("llm.plan", async (s) => {
        const r = await llm.invoke(input);
        s.setAttribute("llm.tokens.out", r.usage.completion_tokens);
        s.end();
        return r;
      });
      const result = await tracer.startActiveSpan("tool.search", async (s) => {
        const r = await tools.search(plan.query);
        s.setAttribute("tool.hits", r.length);
        s.end();
        return r;
      });
      span.setAttribute("agent.output.ok", true);
      return result;
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: 2, message: (err as Error).message });
      throw err;
    } finally {
      span.end();
    }
  });
}`,
    prompt: "为什么要把 tool_call 和 llm_call 都做成子 span，而不是只记一个总耗时？",
    correct: "只有拆成子 span 才能定位是哪一步慢、哪一步失败，父 span 只能看到总时长",
    wrong: "父 span 已经包含总耗时，子 span 只是为了图表好看",
    correctFeedback: "正确：子 span 携带模型、工具、token 等属性，是排障和归因的最小单位。",
    wrongFeedback: "错误：没有子 span 就无法知道慢在 LLM 还是工具，也无法做单步重放。",
    additionalWrong: {
      label: "记录一条 JSON 日志就够了，不需要 span 树",
      feedback: "扁平 JSON 无法表达父子关系，跨服务合并 trace 时会丢失因果链。"
    },
    output: "trace exported",
    lanes: ["开启父 span", "记录子 span", "导出 trace"],
    laneValues: ["agent.run 开启", "llm.plan / tool.search", "OTLP 导出"],
    log: ["span agent.run start", "child spans attached", "trace exported"],
    summary: [
      "父 span 覆盖 agent.run 全过程",
      "关键属性挂在对应子 span 上",
      "异常必须 recordException 而不是吞掉"
    ],
    sourceTitle: "OpenTelemetry JavaScript",
    sourceUrl: "https://opentelemetry.io/docs/languages/js/"
  }),
  createAiAgentLesson({
    id: "ai-agent-evaluation-observability-key-metrics",
    stageId: "ai-agent-evaluation-observability",
    order: 2,
    eyebrowStage: eyebrow,
    title: "关键指标三分法",
    concept:
      "Agent 指标分三类：质量（准确率、有用性、幻觉率）、性能（P50/P95 延迟、token 消耗、单次成本）、可靠（失败率、超时率、工具错误率）。每类都要有基线数值，不能只看聚合平均。",
    points: [
      "质量指标依赖标注或 LLM-as-judge",
      "性能指标看分位数而不是平均",
      "可靠指标按错误码/工具名分维度"
    ],
    memoryHook: "质量 · 性能 · 可靠，三本账要分开算",
    fileName: "key-metrics.ts",
    code: `import { Langfuse } from "langfuse";

const lf = new Langfuse();

export async function recordMetrics(traceId: string, run: AgentRun) {
  await lf.score({
    traceId,
    name: "helpfulness",
    value: run.judgeScore,
    comment: run.judgeReason
  });
  await lf.event({
    traceId,
    name: "usage",
    metadata: {
      tokens_in: run.usage.prompt_tokens,
      tokens_out: run.usage.completion_tokens,
      cost_usd: run.cost,
      latency_ms: run.latencyMs,
      tool_error: run.toolError ?? null
    }
  });
}`,
    prompt: "为什么延迟要看 P95 而不是平均值？",
    correct: "少量慢请求会被平均值稀释，P95 才能反映用户真实感知的最差体验",
    wrong: "平均值稳定，用户看到的就是平均延迟",
    correctFeedback: "正确：Agent 场景长尾很重，P95/P99 才能暴露超时和排队问题。",
    wrongFeedback: "错误：LLM 调用长尾极端，平均会被少数快请求拉低，掩盖真实问题。",
    additionalWrong: {
      label: "只要跟踪成本，其他指标自然会好",
      feedback: "只看成本会牺牲质量和可靠性；三类指标必须同时监控并权衡。"
    },
    output: "metrics recorded",
    lanes: ["计算指标", "写入 Langfuse", "刷新看板"],
    laneValues: ["整合 usage/latency", "score + event", "dashboard 更新"],
    log: ["compute scores", "post to langfuse", "metrics recorded"],
    summary: [
      "质量看准确率与幻觉",
      "性能看分位而不是平均",
      "可靠按错误码分维度上报"
    ],
    sourceTitle: "Langfuse Docs",
    sourceUrl: "https://langfuse.com/docs"
  }),
  createAiAgentLesson({
    id: "ai-agent-evaluation-observability-dataset-construction",
    stageId: "ai-agent-evaluation-observability",
    order: 3,
    eyebrowStage: eyebrow,
    title: "评测数据集构建",
    concept:
      "评测集要覆盖三类样本：happy path（生产高频请求）、failure path（历史失败/超时）、adversarial（越狱、注入、边界输入）。数据源 = 生产 trace 采样 + 人工标注 + 主动构造，缺一不可。",
    points: [
      "按 trace 分层采样，避免只覆盖热门 case",
      "失败样本要保留输入、上下文、错误消息",
      "对抗样本单独打标，避免污染主指标"
    ],
    memoryHook: "评测集 = 常见 + 失败 + 恶意",
    fileName: "dataset-construction.ts",
    code: `import { Client } from "langsmith";

const ls = new Client();

export async function buildDataset(name: string) {
  const dataset = await ls.createDataset(name, {
    description: "agent eval: happy + failure + adversarial"
  });

  const happy = await ls.listRuns({ projectName: "prod", filter: "eq(status, 'success')", limit: 200 });
  const failed = await ls.listRuns({ projectName: "prod", filter: "eq(status, 'error')", limit: 100 });
  const adversarial = await loadAdversarialSeeds("./seeds/adversarial.jsonl");

  for (const run of [...happy, ...failed]) {
    await ls.createExample({
      inputs: run.inputs,
      outputs: run.outputs ?? {},
      metadata: { source: "prod", status: run.status },
      datasetId: dataset.id
    });
  }
  for (const item of adversarial) {
    await ls.createExample({
      inputs: item.inputs,
      outputs: item.expected,
      metadata: { source: "adversarial", tag: item.tag },
      datasetId: dataset.id
    });
  }
  return dataset.id;
}`,
    prompt: "为什么不能只用生产 happy path 构建评测集？",
    correct: "只覆盖成功样本会掩盖模型在异常输入和对抗输入上的退化",
    wrong: "生产成功样本已经足够覆盖所有场景",
    correctFeedback: "正确：happy path 只是冰山一角，失败与对抗样本才是模型退化的高发区。",
    wrongFeedback: "错误：只用成功样本会让评测形同虚设，任何回归都测不出来。",
    additionalWrong: {
      label: "让 LLM 自动生成所有测试样本即可",
      feedback: "全靠合成会引入 LLM 自身偏差；生产采样 + 人工标注是不可跳过的锚点。"
    },
    output: "dataset built",
    lanes: ["拉取 trace", "分层采样", "写入数据集"],
    laneValues: ["prod runs", "happy/failed/adversarial", "createExample"],
    log: ["fetch prod runs", "mix three sources", "dataset built"],
    summary: [
      "三类样本要按比例覆盖",
      "对抗样本单独打标",
      "数据集要能持续追加与版本化"
    ],
    sourceTitle: "LangSmith Docs",
    sourceUrl: "https://docs.smith.langchain.com/"
  }),
  createAiAgentLesson({
    id: "ai-agent-evaluation-observability-offline-batch-eval",
    stageId: "ai-agent-evaluation-observability",
    order: 4,
    eyebrowStage: eyebrow,
    title: "离线批量评测",
    concept:
      "用固定数据集跑候选 prompt/model 组合，输出对比矩阵。评分方式：可核对的用 rubric 或程序化判定，主观维度交给 LLM-as-judge，并把 judge 版本、rubric 版本一起归档。",
    points: [
      "候选轴 = prompt × model × 参数",
      "程序化断言优先，判官只覆盖主观项",
      "结果按候选归档，方便追溯"
    ],
    memoryHook: "rubric 打分，judge 兜底，成本可控",
    fileName: "offline-batch-eval.ts",
    code: `import OpenAI from "openai";

const openai = new OpenAI();

type Case = { input: string; expected: string };

export async function runEval(cases: Case[], candidate: { model: string; system: string }) {
  const results = [];
  for (const c of cases) {
    const resp = await openai.chat.completions.create({
      model: candidate.model,
      messages: [
        { role: "system", content: candidate.system },
        { role: "user", content: c.input }
      ]
    });
    const output = resp.choices[0].message.content ?? "";
    const judge = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Rate 0-1. Return {\\"score\\":number,\\"reason\\":string}." },
        { role: "user", content: \`Q: \${c.input}\\nExpected: \${c.expected}\\nActual: \${output}\` }
      ]
    });
    const { score, reason } = JSON.parse(judge.choices[0].message.content ?? "{}");
    results.push({ input: c.input, output, score, reason });
  }
  return results;
}`,
    prompt: "为什么程序化断言应该优先于 LLM-as-judge？",
    correct: "程序化断言稳定、可复现且免费，只有主观维度才值得让判官打分",
    wrong: "LLM-as-judge 更聪明，能覆盖一切判定场景",
    correctFeedback: "正确：能用正则/schema/单元测试判定的就不要花钱调 judge。",
    wrongFeedback: "错误：judge 有偏差且贵，把可断言的部分交出去会带来噪声和成本失控。",
    additionalWrong: {
      label: "只跑一次即可评估模型好坏",
      feedback: "LLM 输出有随机性，同一模型要多次采样并统计置信区间。"
    },
    output: "eval finished",
    lanes: ["跑候选", "程序化判定", "judge 打分"],
    laneValues: ["candidate x cases", "rubric assertions", "LLM judge"],
    log: ["run candidate", "assert rubric", "eval finished"],
    summary: [
      "候选轴清晰后再跑评测",
      "rubric 判定优先，judge 覆盖主观",
      "记录 judge 版本便于回放"
    ],
    sourceTitle: "OpenAI Evals",
    sourceUrl: "https://platform.openai.com/docs/guides/evals"
  }),
  createAiAgentLesson({
    id: "ai-agent-evaluation-observability-ab-baseline",
    stageId: "ai-agent-evaluation-observability",
    order: 5,
    eyebrowStage: eyebrow,
    title: "A/B 对比与基线守门",
    concept:
      "任何新版本必须与当前生产 baseline 比对：关键指标不允许显著下降。用配对样本比较（同一输入喂 A 和 B），再做显著性检验，避免被随机波动误导。",
    points: [
      "baseline = 当前线上版本 + 固定数据集",
      "配对比较消除输入差异",
      "显著性阈值避免噪声决策"
    ],
    memoryHook: "没有 baseline 的 A/B 都是自我感觉良好",
    fileName: "ab-baseline.ts",
    code: `type Run = { score: number };

export function pairedDiff(a: Run[], b: Run[]) {
  if (a.length !== b.length) throw new Error("paired sets must align");
  const diffs = a.map((x, i) => b[i].score - x.score);
  const mean = diffs.reduce((s, d) => s + d, 0) / diffs.length;
  const variance =
    diffs.reduce((s, d) => s + (d - mean) ** 2, 0) / (diffs.length - 1);
  const stderr = Math.sqrt(variance / diffs.length);
  const t = mean / stderr;
  return { mean, t, significant: Math.abs(t) > 1.96 };
}

export function guardRelease(baseline: Run[], candidate: Run[]) {
  const { mean, significant } = pairedDiff(baseline, candidate);
  if (significant && mean < -0.02) {
    throw new Error(\`regression: mean drop \${mean.toFixed(3)}\`);
  }
  return { ok: true, mean };
}`,
    prompt: "为什么要用同一批输入对 A 和 B 做配对比较？",
    correct: "配对比较消除了输入难度差异，把噪声降到最低",
    wrong: "分别抽样 A 和 B 更贴近生产真实分布",
    correctFeedback: "正确：不同输入的难度差异远大于版本差异，配对是唯一稳妥的做法。",
    wrongFeedback: "错误：独立抽样会让难度差异淹没版本差异，看不出真实提升。",
    additionalWrong: {
      label: "只要平均分上升就可以发布",
      feedback: "没有显著性检验时，均值上升可能只是随机波动导致的假阳性。"
    },
    output: "release guarded",
    lanes: ["跑 baseline", "跑候选", "显著性判定"],
    laneValues: ["prod version", "new version", "paired t"],
    log: ["run baseline", "run candidate", "release guarded"],
    summary: [
      "baseline 永远来自生产",
      "配对比较是标准做法",
      "阈值 + 显著性双条件把关"
    ],
    sourceTitle: "Anthropic Evaluation Tool",
    sourceUrl: "https://docs.anthropic.com/en/docs/test-and-evaluate/eval-tool"
  }),
  createAiAgentLesson({
    id: "ai-agent-evaluation-observability-regression-alert",
    stageId: "ai-agent-evaluation-observability",
    order: 6,
    eyebrowStage: eyebrow,
    title: "回归检测与 CI 告警",
    concept:
      "每次发布前把评测集嵌入 CI：指标降幅超过阈值直接失败，阻断劣化上线。同时把评测结果推送到告警渠道，让研发在合并前就看到数据。",
    points: [
      "评测跑在 PR CI 中，不是发布后补票",
      "阈值分级：warn / block",
      "结果链接到 PR 评论便于讨论"
    ],
    memoryHook: "CI 拦不住的回归，一定会进生产",
    fileName: "regression-alert.ts",
    code: `import { runEval } from "./offline-batch-eval";
import { guardRelease } from "./ab-baseline";
import cases from "./dataset.json";

async function main() {
  const baseline = await runEval(cases, { model: "gpt-4o", system: process.env.BASELINE_PROMPT! });
  const candidate = await runEval(cases, { model: "gpt-4o", system: process.env.CANDIDATE_PROMPT! });

  try {
    const { mean } = guardRelease(baseline, candidate);
    console.log(\`::notice::eval passed, mean delta \${mean.toFixed(3)}\`);
  } catch (err) {
    console.log(\`::error::\${(err as Error).message}\`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});`,
    prompt: "为什么阈值要在 CI 阶段直接阻断而不是只发告警？",
    correct: "只发告警很容易被忽略，硬阻断才能真正防止劣化版本进入生产",
    wrong: "阻断会打断发布节奏，只发告警更灵活",
    correctFeedback: "正确：阈值决策要在合并前完成，靠事后告警等于没有守门。",
    wrongFeedback: "错误：软告警很容易被忽略，最终劣化版本仍会进入生产。",
    additionalWrong: {
      label: "线上灰度时再看指标就行",
      feedback: "灰度阶段发现回归意味着用户已经受影响；CI 阻断成本更低。"
    },
    output: "eval passed",
    lanes: ["跑 baseline", "跑 candidate", "阈值判定"],
    laneValues: ["current prompt", "PR prompt", "CI 阻断或放行"],
    log: ["run baseline", "run candidate", "eval passed"],
    summary: [
      "评测集嵌入 CI 而不是发布后",
      "阈值分级 warn/block",
      "结果直接反馈到 PR"
    ],
    sourceTitle: "OpenAI Cookbook: Getting Started with Evals",
    sourceUrl: "https://cookbook.openai.com/examples/evaluation/getting_started_with_openai_evals"
  }),
  createAiAgentLesson({
    id: "ai-agent-evaluation-observability-feedback-loop",
    stageId: "ai-agent-evaluation-observability",
    order: 7,
    eyebrowStage: eyebrow,
    title: "用户反馈闭环",
    concept:
      "收集 thumbs up/down、显式修改、任务放弃事件，绑定到原始 traceId。把负反馈样本定期回流到评测集，形成 采集→标注→评测→回归 的闭环。",
    points: [
      "反馈必须绑定 traceId，才能回放上下文",
      "负反馈按类别归档：错误答案、风格、幻觉",
      "定期把新样本注入评测集，形成滚动基线"
    ],
    memoryHook: "反馈不进评测集，就等于没收集",
    fileName: "feedback-loop.ts",
    code: `import { Langfuse } from "langfuse";

const lf = new Langfuse();

export async function recordFeedback(traceId: string, rating: "up" | "down", note?: string) {
  await lf.score({
    traceId,
    name: "user_feedback",
    value: rating === "up" ? 1 : 0,
    comment: note
  });
}

export async function harvestNegatives(datasetId: string, since: Date) {
  const runs = await lf.api.observations.getMany({
    fromStartTime: since.toISOString(),
    type: "GENERATION"
  });
  for (const r of runs.data) {
    const score = r.scores?.find((s) => s.name === "user_feedback");
    if (score && score.value === 0) {
      await lf.api.datasetItems.create({
        datasetId,
        input: r.input,
        expectedOutput: null,
        metadata: { source: "user_negative", traceId: r.traceId }
      });
    }
  }
}`,
    prompt: "为什么反馈信号必须绑定 traceId？",
    correct: "只有绑定 traceId 才能回放完整上下文，判断问题出在 prompt、工具还是记忆",
    wrong: "反馈只需要记录分数，上下文可以事后凭经验补",
    correctFeedback: "正确：脱离 trace 的反馈只是聚合分，无法驱动定向修复。",
    wrongFeedback: "错误：没有 trace 就没法归因，也无法把样本反哺评测集。",
    additionalWrong: {
      label: "只处理 thumbs down，显式修改可以忽略",
      feedback: "用户的手动修改往往是最高质量的监督信号，比按钮反馈更有价值。"
    },
    output: "feedback harvested",
    lanes: ["接收反馈", "写入 trace", "回流评测集"],
    laneValues: ["up/down", "score to trace", "createDatasetItem"],
    log: ["record feedback", "join with trace", "feedback harvested"],
    summary: [
      "反馈信号绑到 traceId",
      "负样本按类别归档",
      "定期回流评测集形成闭环"
    ],
    sourceTitle: "Langfuse Docs",
    sourceUrl: "https://langfuse.com/docs"
  }),
  createAiAgentLesson({
    id: "ai-agent-evaluation-observability-dashboard",
    stageId: "ai-agent-evaluation-observability",
    order: 8,
    eyebrowStage: eyebrow,
    title: "指标可视化仪表盘",
    concept:
      "用 Grafana 或 Langfuse UI 组合时序图（延迟/成本/失败率）、cohort 对比（按模型/版本）和异常样本抽屉。仪表盘要能同时服务运营（趋势）和研发（下钻定位）。",
    points: [
      "时序面板监控趋势",
      "cohort 面板做版本 A/B",
      "异常样本一键跳转到 trace 详情"
    ],
    memoryHook: "看得见趋势，点得进 trace",
    fileName: "dashboard.ts",
    code: `type Panel =
  | { kind: "timeseries"; metric: string; groupBy?: string }
  | { kind: "cohort"; metric: string; dimension: string }
  | { kind: "sample"; filter: string; link: (traceId: string) => string };

export const agentDashboard: Panel[] = [
  { kind: "timeseries", metric: "latency_ms_p95", groupBy: "model" },
  { kind: "timeseries", metric: "cost_usd_sum", groupBy: "model" },
  { kind: "timeseries", metric: "failure_rate", groupBy: "tool" },
  { kind: "cohort", metric: "helpfulness_avg", dimension: "prompt_version" },
  { kind: "cohort", metric: "hallucination_rate", dimension: "prompt_version" },
  {
    kind: "sample",
    filter: "score('user_feedback') = 0 OR status = 'error'",
    link: (traceId) => \`https://cloud.langfuse.com/trace/\${traceId}\`
  }
];`,
    prompt: "为什么仪表盘上要有异常样本抽屉，而不是只有聚合指标？",
    correct: "聚合指标只告诉你有回归，异常样本抽屉让研发直接跳到 trace 定位根因",
    wrong: "只看聚合指标就够了，具体样本可以下班后再翻",
    correctFeedback: "正确：从异常一键跳到 trace 是缩短 MTTR 的关键路径。",
    wrongFeedback: "错误：没有下钻入口，团队会在告警和查询之间反复切换，浪费时间。",
    additionalWrong: {
      label: "把所有指标堆到同一个面板即可",
      feedback: "面板要按角色分层：运营看趋势，研发看下钻，混在一起谁都看不清。"
    },
    output: "dashboard published",
    lanes: ["定义面板", "绑定指标", "发布仪表盘"],
    laneValues: ["timeseries+cohort+sample", "metric bindings", "publish"],
    log: ["define panels", "bind metrics", "dashboard published"],
    summary: [
      "时序看趋势",
      "cohort 做版本对比",
      "异常抽屉直达 trace"
    ],
    sourceTitle: "Langfuse Docs",
    sourceUrl: "https://langfuse.com/docs"
  })
];

const project = createAiAgentStageProject({
  id: "ai-agent-evaluation-observability-project",
  stageId: "ai-agent-evaluation-observability",
  eyebrowStage: eyebrow,
  title: "Agent 评测流水线",
  brief:
    "构建端到端 Agent 评测流水线：从生产 trace 采样构建评测集，跑候选 prompt/model 组合，用 LLM-as-judge 打分，与 baseline 配对比较，产出对比报告；若关键指标显著回归，则在 CI 中阻断发布。",
  concept:
    "把 trace 采集、数据集构建、离线评测、A/B 守门、CI 告警串成流水线：采样 → buildDataset → runEval(baseline) + runEval(candidate) → judge 打分 → guardRelease → 发报告或抛错。",
  points: [
    "采样与评测集构建自动化",
    "candidate 与 baseline 配对跑，避免噪声",
    "CI 判定失败要抛非零退出，阻断合并"
  ],
  memoryHook: "采样 → 评测 → 守门 → 发布，一条流水线跑通",
  fileName: "eval-pipeline.ts",
  code: `import { buildDataset } from "./dataset-construction";
import { runEval } from "./offline-batch-eval";
import { guardRelease } from "./ab-baseline";
import { Langfuse } from "langfuse";

const lf = new Langfuse();

type Candidate = { name: string; model: string; system: string };

export async function runPipeline(
  baseline: Candidate,
  candidate: Candidate,
  opts: { datasetName: string; blockThreshold: number }
) {
  const datasetId = await buildDataset(opts.datasetName);
  const cases = await loadCases(datasetId);

  const baseRuns = await runEval(cases, baseline);
  const candRuns = await runEval(cases, candidate);

  const report = {
    dataset: opts.datasetName,
    baseline: baseline.name,
    candidate: candidate.name,
    baselineAvg: avg(baseRuns.map((r) => r.score)),
    candidateAvg: avg(candRuns.map((r) => r.score)),
    samples: candRuns.slice(0, 5)
  };

  await lf.event({
    name: "eval.report",
    metadata: report
  });

  try {
    guardRelease(baseRuns, candRuns);
    console.log(\`::notice::eval passed delta \${(report.candidateAvg - report.baselineAvg).toFixed(3)}\`);
    return { ok: true, report };
  } catch (err) {
    console.log(\`::error::\${(err as Error).message}\`);
    if (report.candidateAvg < report.baselineAvg - opts.blockThreshold) {
      process.exitCode = 1;
    }
    return { ok: false, report, error: (err as Error).message };
  }
}

function avg(xs: number[]) {
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}`,
  prompt: "评测流水线在 CI 中检测到候选版本显著回归时，最合适的处理方式是什么？",
  correct: "抛出非零退出码阻断合并，同时把对比报告和异常样本推到 PR 评论",
  wrong: "记录一条 warning 日志就放行，等灰度阶段再看",
  correctFeedback: "正确：把决策放在 CI 阶段，报告和阻断同时给出，才能既拦住劣化又让人可复盘。",
  wrongFeedback: "错误：软告警在快速迭代节奏中几乎必被忽略，等灰度时用户已经受损。",
  additionalWrong: {
    label: "先跳过评测直接上线，回滚就好",
    feedback: "回滚是止血不是预防；跳过评测意味着每次都在赌，成本远高于运行评测。"
  },
  lanes: ["构建评测集", "跑对比评测", "守门与报告"],
  laneValues: ["sample+adversarial", "baseline vs candidate", "guardRelease + report"],
  log: [
    "buildDataset ok, size=312",
    "runEval baseline+candidate",
    "guardRelease passed, report posted"
  ],
  summary: [
    "评测集来自 prod + adversarial 混合",
    "candidate 与 baseline 必须配对比较",
    "CI 阻断 + 报告推送形成闭环"
  ],
  sourceTitle: "OpenAI Cookbook: Getting Started with Evals",
  sourceUrl: "https://cookbook.openai.com/examples/evaluation/getting_started_with_openai_evals"
});

export const aiAgentStageSixEvaluationObservabilityLessons: LessonSpec[] = [
  ...knowledgeLessons,
  project
];
