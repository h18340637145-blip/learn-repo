import type { LessonSpec } from "../../../lib/curriculum/types";
import { createAiAgentLesson, createAiAgentStageProject } from "./ai-agent-lesson-factory";

const eyebrow = "端到端 Agent 平台";

const knowledgeLessons: LessonSpec[] = [
  createAiAgentLesson({
    id: "ai-agent-platform-pipeline-intake-intent",
    stageId: "ai-agent-platform-pipeline",
    order: 1,
    eyebrowStage: eyebrow,
    title: "任务接入与意图识别",
    concept: "平台入口是一个 API gateway：所有请求先做鉴权、限流、trace 注入，再交给意图分类器，把请求分成问答、工具执行或多轮任务三类，路由到对应的 Agent 流水线。意图错分会导致后续规划器选错工具集，因此分类结果要携带置信度并允许兜底 fallback。",
    points: ["gateway 统一鉴权与 trace 注入", "意图分类返回置信度而非硬标签", "低置信度请求走通用兜底流水线"],
    memoryHook: "入口决定路径：先分意图，再走 Agent",
    fileName: "intake.ts",
    code: `import express from \"express\";\nimport { classifyIntent } from \"./intent\";\nimport { runPipeline } from \"./pipeline\";\n\nconst app = express();\napp.use(express.json());\n\napp.post(\"/agent/invoke\", async (req, res) => {\n  const traceId = req.header(\"x-trace-id\") ?? crypto.randomUUID();\n  const intent = await classifyIntent(req.body.query);\n  if (intent.confidence < 0.4) {\n    return runPipeline(\"fallback\", req.body, { traceId }).then(r => res.json(r));\n  }\n  const result = await runPipeline(intent.label, req.body, { traceId });\n  res.json({ intent, result, traceId });\n});\n\napp.listen(8080);`,
    prompt: "为什么意图分类要返回置信度而不是直接返回标签？",
    correct: "低置信度可以走通用兜底流水线，避免选错工具集",
    wrong: "只要模型足够大，硬标签就够用，不需要置信度",
    output: "listening on :8080",
    lanes: ["Gateway 接入", "意图分类", "路由流水线"],
    laneValues: ["鉴权 + trace 注入", "分类结果 tool-exec 0.82", "route → tool pipeline"],
    log: [
      "POST /agent/invoke traceId=req-9f21",
      "intent=tool-exec confidence=0.82",
      "route → tool pipeline"
    ],
    summary: [
      "gateway 统一鉴权、限流和 trace 注入",
      "意图分类的置信度是路由的关键信号",
      "低置信度走 fallback 而不是硬跑"
    ],
    sourceTitle: "OpenAI Agents guide",
    sourceUrl: "https://platform.openai.com/docs/guides/agents",
    additionalWrong: {
      label: "把所有请求都塞进同一个通用 Agent，让模型自己选工具",
      feedback: "通用 Agent 会加载所有工具描述，成本和错误率都会飙升；意图分类是路由基础。"
    }
  }),
  createAiAgentLesson({
    id: "ai-agent-platform-pipeline-task-planning",
    stageId: "ai-agent-platform-pipeline",
    order: 2,
    eyebrowStage: eyebrow,
    title: "任务规划与拆解",
    concept: "复杂任务由 Planner Agent 拆成 DAG：每个节点标注所需工具、可读取的记忆命名空间以及 token / 时间预算。DAG 结构让下游 Executor 能识别可以并行的节点，也让预算超支时可以按节点粒度熔断。",
    points: ["Planner 输出结构化 DAG 而非自由文本", "节点标注工具、记忆、预算", "并行节点显式声明"],
    memoryHook: "先画 DAG 再动手，预算写进节点里",
    fileName: "planner.ts",
    code: `import { z } from \"zod\";\n\nconst PlanNode = z.object({\n  id: z.string(),\n  goal: z.string(),\n  tool: z.enum([\"search\", \"sql\", \"code\", \"llm\"]),\n  memoryScope: z.string(),\n  dependsOn: z.array(z.string()),\n  budget: z.object({ tokens: z.number(), timeoutMs: z.number() })\n});\n\nexport const Plan = z.object({ traceId: z.string(), nodes: z.array(PlanNode) });\n\nexport async function buildPlan(intent: string, query: string) {\n  const raw = await llm.responses({\n    model: \"gpt-4.1\",\n    tools: [{ type: \"function\", function: PlannerToolSchema }],\n    input: [{ role: \"user\", content: query }]\n  });\n  return Plan.parse(JSON.parse(raw.output_text));\n}`,
    prompt: "Planner 输出为什么必须是结构化 DAG 而不是自由文本？",
    correct: "结构化 DAG 才能被 Executor 调度并按节点粒度控预算",
    wrong: "自由文本可读性更好，Executor 直接用正则解析即可",
    output: "plan.nodes = 5",
    lanes: ["理解意图", "生成 DAG", "校验节点"],
    laneValues: ["intent=tool-exec", "planner 输出 5 个节点", "zod 校验通过"],
    log: [
      "planner input=tool-exec",
      "planner 输出 nodes=5 含 2 组并行",
      "plan.nodes = 5"
    ],
    summary: [
      "Planner 输出结构化 DAG",
      "节点要显式声明工具、记忆、预算",
      "并行关系写进 dependsOn 而不是靠模型隐含"
    ],
    sourceTitle: "LangGraph docs",
    sourceUrl: "https://langchain-ai.github.io/langgraph/",
    additionalWrong: {
      label: "让模型每步都自问自答，不需要事先规划",
      feedback: "无规划的自问自答会陷入 ReAct 死循环，也没法做预算熔断和回滚。"
    }
  }),
  createAiAgentLesson({
    id: "ai-agent-platform-pipeline-tool-orchestration",
    stageId: "ai-agent-platform-pipeline",
    order: 3,
    eyebrowStage: eyebrow,
    title: "工具编排与执行",
    concept: "Executor Agent 拓扑遍历 DAG：无依赖节点并行 fan-out，聚合完再进入下一层 fan-in。工具调用统一走第 07 阶段的安全策略——权限校验、超时、速率限制和错误重试，失败节点触发降级而不是让整个 DAG 崩溃。",
    points: ["并行 fan-out + 显式 fan-in", "工具走统一安全中间件", "节点失败按策略降级"],
    memoryHook: "DAG 执行 = 并行 + 熔断 + 降级",
    fileName: "executor.ts",
    code: `import pLimit from \"p-limit\";\nimport type { Plan } from \"./planner\";\nimport { callTool } from \"./tools\";\n\nconst limit = pLimit(6);\n\nexport async function runPlan(plan: Plan, ctx: { traceId: string }) {\n  const results = new Map<string, unknown>();\n  const layers = topoSort(plan.nodes);\n  for (const layer of layers) {\n    await Promise.all(\n      layer.map(node =>\n        limit(async () => {\n          try {\n            results.set(node.id, await callTool(node, ctx));\n          } catch (err) {\n            results.set(node.id, { degraded: true, reason: (err as Error).message });\n          }\n        })\n      )\n    );\n  }\n  return results;\n}`,
    prompt: "为什么工具执行要按拓扑分层而不是按节点顺序串行调用？",
    correct: "同一层无依赖节点并行执行可以缩短端到端延迟，同时保留依赖关系",
    wrong: "串行执行更安全，Agent 平台不需要并发",
    output: "layer=1 完成，layer=2 fan-in",
    lanes: ["拓扑排序", "并行 fan-out", "聚合 fan-in"],
    laneValues: ["3 层拓扑", "6 并发工具调用", "结果写入 Map"],
    log: [
      "topoSort → 3 层",
      "layer=1 并行 3 个 search 节点",
      "layer=1 完成，layer=2 fan-in"
    ],
    summary: [
      "同层节点并行 fan-out",
      "工具走统一安全中间件",
      "失败节点标注 degraded 而不是抛断 DAG"
    ],
    sourceTitle: "OpenAI Cookbook — Orchestrating Agents",
    sourceUrl: "https://cookbook.openai.com/examples/orchestrating_agents",
    additionalWrong: {
      label: "任何一个节点失败就整个 DAG 直接返回 500",
      feedback: "整体崩溃会浪费已完成节点的成本；平台要按节点粒度降级并保留部分结果。"
    }
  }),
  createAiAgentLesson({
    id: "ai-agent-platform-pipeline-memory-integration",
    stageId: "ai-agent-platform-pipeline",
    order: 4,
    eyebrowStage: eyebrow,
    title: "记忆写入与检索",
    concept: "执行前，Planner / Executor 需要从长期记忆检索相关上下文；执行后，关键结论按用户、任务、领域打标签写入向量库。记忆读写要与业务隔离，命名空间和 TTL 是 must-have，避免污染其他任务或长期堆积垃圾。",
    points: ["执行前检索、执行后写入", "命名空间隔离用户 / 任务 / 领域", "关键结论打标签 + TTL"],
    memoryHook: "记忆闭环：读→用→写→标签",
    fileName: "memory.ts",
    code: `import { QdrantClient } from \"@qdrant/js-client-rest\";\n\nconst qdrant = new QdrantClient({ url: process.env.QDRANT_URL });\n\nexport async function recall(namespace: string, query: string, k = 5) {\n  const vec = await embed(query);\n  return qdrant.search(namespace, { vector: vec, limit: k, with_payload: true });\n}\n\nexport async function remember(namespace: string, note: {\n  text: string;\n  tags: string[];\n  ttlDays?: number;\n}) {\n  const vec = await embed(note.text);\n  await qdrant.upsert(namespace, {\n    points: [{\n      id: crypto.randomUUID(),\n      vector: vec,\n      payload: { ...note, expiresAt: note.ttlDays ? Date.now() + note.ttlDays * 864e5 : null }\n    }]\n  });\n}`,
    prompt: "为什么记忆写入必须带命名空间和 TTL？",
    correct: "命名空间避免跨用户 / 跨任务污染，TTL 防止长期垃圾堆积",
    wrong: "全平台共用一个集合更省事，反正 embedding 会自动区分",
    output: "recall hits=3",
    lanes: ["检索上下文", "执行任务", "写回记忆"],
    laneValues: ["namespace=user:42", "命中 3 条相关记忆", "写入 1 条结论 + TTL"],
    log: [
      "recall namespace=user:42 hits=3",
      "executor 使用检索到的 3 条上下文",
      "remember 写入 1 条结论 tags=order-refund"
    ],
    summary: [
      "读写分离但同一命名空间",
      "关键结论才写入，避免记忆噪声",
      "TTL + 标签方便后续清理与审计"
    ],
    sourceTitle: "LangChain agents tutorial",
    sourceUrl: "https://python.langchain.com/docs/tutorials/agents/",
    additionalWrong: {
      label: "把每一步 Trace 原文都写进向量库当作记忆",
      feedback: "原始 Trace 会让向量库爆炸并稀释召回质量；应只写关键结论并加标签。"
    }
  }),
  createAiAgentLesson({
    id: "ai-agent-platform-pipeline-quality-gate",
    stageId: "ai-agent-platform-pipeline",
    order: 5,
    eyebrowStage: eyebrow,
    title: "评测与质量守护",
    concept: "输出返回用户前经过质量闸门：用 LLM-as-judge 按一组事先设计的 rubric 打分，不达标触发 self-correction 重跑；连续两次仍失败则降级到人工兜底，避免无限循环消耗预算。",
    points: ["LLM-as-judge 使用固定 rubric", "自纠错次数硬上限", "触底后必须走人工兜底"],
    memoryHook: "质量闸门：打分 → 重试 → 人工",
    fileName: "judge.ts",
    code: `import { z } from \"zod\";\n\nconst Verdict = z.object({ pass: z.boolean(), score: z.number(), reasons: z.array(z.string()) });\n\nexport async function judge(output: string, rubric: string): Promise<z.infer<typeof Verdict>> {\n  const raw = await llm.responses({\n    model: \"gpt-4.1-mini\",\n    input: [\n      { role: \"system\", content: \"你是严格的评审。按 rubric 打分并返回 JSON。\" },\n      { role: \"user\", content: JSON.stringify({ rubric, output }) }\n    ],\n    response_format: { type: \"json_schema\", json_schema: verdictSchema }\n  });\n  return Verdict.parse(JSON.parse(raw.output_text));\n}\n\nexport async function guardedRun(run: () => Promise<string>, rubric: string, maxRetry = 2) {\n  for (let i = 0; i <= maxRetry; i++) {\n    const out = await run();\n    const v = await judge(out, rubric);\n    if (v.pass) return { out, verdict: v };\n  }\n  return { out: null, verdict: { pass: false, escalate: \"human\" } };\n}`,
    prompt: "为什么自纠错必须设硬上限而不是一直重跑到通过？",
    correct: "没有上限会陷入死循环并烧掉预算，必须触底后转人工",
    wrong: "预算允许的话让 Agent 一直重跑，直到评分器给出 pass",
    output: "verdict.pass = false → escalate human",
    lanes: ["生成输出", "LLM 打分", "重试或转人工"],
    laneValues: ["Executor 输出草稿", "judge score=0.62 fail", "重试 1 次仍失败 → human"],
    log: [
      "output draft len=812",
      "judge score=0.62 pass=false",
      "verdict.pass = false → escalate human"
    ],
    summary: [
      "LLM-as-judge 用固定 rubric",
      "自纠错要有硬上限",
      "触底人工兜底是止损而不是失败"
    ],
    sourceTitle: "LangSmith docs",
    sourceUrl: "https://docs.smith.langchain.com/",
    additionalWrong: {
      label: "只要输出格式合法就直接返回，不做质量评审",
      feedback: "格式合法 ≠ 内容正确；平台级 Agent 必须在返回前经过评测闸门。"
    }
  }),
  createAiAgentLesson({
    id: "ai-agent-platform-pipeline-safety-compliance",
    stageId: "ai-agent-platform-pipeline",
    order: 6,
    eyebrowStage: eyebrow,
    title: "安全与合规检查",
    concept: "返回前依次运行 moderation、PII 脱敏和审计日志：敏感字段替换成掩码，操作日志按 trace 落到 append-only 存储。涉及资金、账号、外发邮件等高风险操作走人工审批闸门，审批通过再释放。",
    points: ["moderation + PII 脱敏在同一中间件", "审计日志 append-only", "高风险操作必须人工审批"],
    memoryHook: "输出前三件事：审→脱→审计",
    fileName: "safety.ts",
    code: `import { moderate } from \"./moderation\";\nimport { maskPII } from \"./pii\";\nimport { appendAudit } from \"./audit\";\n\nconst HIGH_RISK = new Set([\"transfer_money\", \"send_email\", \"delete_user\"]);\n\nexport async function safetyGate(payload: {\n  traceId: string;\n  actor: string;\n  output: string;\n  toolCalls: { name: string; args: unknown }[];\n}) {\n  const mod = await moderate(payload.output);\n  if (!mod.allowed) throw new Error(\`moderation blocked: \${mod.reason}\`);\n  const masked = maskPII(payload.output);\n  const needsApproval = payload.toolCalls.some(t => HIGH_RISK.has(t.name));\n  await appendAudit({ traceId: payload.traceId, actor: payload.actor, toolCalls: payload.toolCalls, needsApproval });\n  return { output: masked, needsApproval };\n}`,
    prompt: "为什么高风险操作要额外走人工审批而不是只靠 moderation？",
    correct: "moderation 只判内容合规，转账/删数据这类副作用需要人工确认",
    wrong: "只要 moderation 通过就说明操作安全，可以直接执行",
    output: "audit#a1c7 written, needsApproval=true",
    lanes: ["moderation", "PII 脱敏", "审计与审批"],
    laneValues: ["moderation allowed", "mask 3 处手机号", "写审计 + 触发审批"],
    log: [
      "moderation allowed=true",
      "maskPII replaced 3 fields",
      "audit#a1c7 written, needsApproval=true"
    ],
    summary: [
      "输出前统一走 safetyGate 中间件",
      "审计日志 append-only 便于追溯",
      "高风险操作需要人工审批闸门"
    ],
    sourceTitle: "Anthropic agent capabilities & guardrails",
    sourceUrl: "https://docs.anthropic.com/en/docs/agents-and-tools/agent-capabilities-and-guardrails",
    additionalWrong: {
      label: "把审计日志和业务表放同一张表，方便一起 UPDATE",
      feedback: "审计必须 append-only 且与业务隔离，否则一次误删就丢失合规证据。"
    }
  }),
  createAiAgentLesson({
    id: "ai-agent-platform-pipeline-deployment-canary",
    stageId: "ai-agent-platform-pipeline",
    order: 7,
    eyebrowStage: eyebrow,
    title: "部署与灰度",
    concept: "平台按 dev/staging/prod 三套环境发布，prod 内部再切灰度桶。Prompt、工具描述、模型选择等配置变更走 GitOps：PR 合并 → 自动同步到配置中心 → 按桶灰度。发布出问题一键把桶权重切回旧版本即可回滚。",
    points: ["三环境 + 灰度桶双层隔离", "配置走 GitOps 而不是手改", "回滚 = 桶权重切换"],
    memoryHook: "发布靠 GitOps，回滚靠切桶",
    fileName: "release.ts",
    code: `type BucketConfig = { version: string; weight: number };\n\nconst buckets: BucketConfig[] = [\n  { version: \"v2025.07.20\", weight: 0.9 },\n  { version: \"v2025.07.24-rc\", weight: 0.1 }\n];\n\nexport function pickVersion(userId: string) {\n  const hash = Number.parseInt(userId.slice(-4), 16) / 0xffff;\n  let acc = 0;\n  for (const b of buckets) {\n    acc += b.weight;\n    if (hash <= acc) return b.version;\n  }\n  return buckets[0].version;\n}\n\nexport async function rollback(badVersion: string) {\n  buckets.forEach(b => { if (b.version === badVersion) b.weight = 0; });\n  await publishConfig({ buckets, reason: \"rollback\" });\n}`,
    prompt: "为什么灰度回滚推荐直接把权重切到 0 而不是重新走一次发布？",
    correct: "切权重是秒级动作，重新发布要走完整流水线，故障期扛不住",
    wrong: "只有重新发布才算真正回滚，切权重不够彻底",
    output: "bucket v2025.07.24-rc weight → 0",
    lanes: ["合并 PR", "同步配置", "灰度桶生效"],
    laneValues: ["GitOps 同步", "配置中心 v2025.07.24-rc", "10% 灰度桶生效"],
    log: [
      "GitOps merge → sync config",
      "buckets = [v0.9, rc 0.1]",
      "bucket v2025.07.24-rc weight → 0"
    ],
    summary: [
      "环境 + 灰度桶双层隔离",
      "配置 GitOps 化保留审计线索",
      "回滚就是把权重切回旧版本"
    ],
    sourceTitle: "Langfuse docs",
    sourceUrl: "https://langfuse.com/docs",
    additionalWrong: {
      label: "prod 直接改配置文件，手动重启进程完成发布",
      feedback: "手改配置无审计、无灰度、无回滚路径，平台级 Agent 会因一次误改而全线中断。"
    }
  }),
  createAiAgentLesson({
    id: "ai-agent-platform-pipeline-ops-iteration",
    stageId: "ai-agent-platform-pipeline",
    order: 8,
    eyebrowStage: eyebrow,
    title: "运营与迭代",
    concept: "上线只是起点。平台持续收集用户反馈、Trace 采样和失败案例，聚合成迭代候选（新 prompt、新工具、新记忆策略），先在离线评测集跑通再灰度上线，形成 build-measure-learn 循环。",
    points: ["反馈 + Trace 聚成候选", "离线评测集必须先跑通", "上线还是走灰度桶"],
    memoryHook: "闭环：反馈 → 候选 → 评测 → 灰度",
    fileName: "iterate.ts",
    code: `import { fetchFeedback, sampleTraces } from \"./telemetry\";\nimport { runOfflineEval } from \"./eval\";\nimport { promoteBucket } from \"./release\";\n\nexport async function weeklyIteration() {\n  const feedback = await fetchFeedback({ since: \"7d\" });\n  const traces = await sampleTraces({ label: \"fail\", limit: 200 });\n  const candidates = proposeCandidates(feedback, traces);\n  const report = await runOfflineEval(candidates, { suite: \"regression+edge\" });\n  const winners = report.filter(r => r.score > r.baseline + 0.03);\n  for (const w of winners) {\n    await promoteBucket({ version: w.version, weight: 0.05, reason: w.reason });\n  }\n  return { proposed: candidates.length, promoted: winners.length };\n}`,
    prompt: "为什么迭代候选必须先跑离线评测集再上线？",
    correct: "离线评测能在灰度前发现 regression，避免拿真实用户当白鼠",
    wrong: "评测集只是辅助材料，直接灰度看指标更真实",
    output: "proposed=6, promoted=2",
    lanes: ["收集信号", "生成候选", "离线评测 + 灰度"],
    laneValues: ["7d 反馈 + 200 trace", "6 个候选", "2 个通过 → 5% 灰度"],
    log: [
      "fetchFeedback 7d",
      "sampleTraces label=fail 200",
      "proposed=6, promoted=2"
    ],
    summary: [
      "反馈 + Trace 是迭代原料",
      "离线评测集守护 regression 底线",
      "通过评测才进入灰度而不是全量"
    ],
    sourceTitle: "Langfuse docs",
    sourceUrl: "https://langfuse.com/docs",
    additionalWrong: {
      label: "迭代候选写好后直接推 100% 流量，用户即评测集",
      feedback: "拿真实用户做评测集会把 regression 直接暴露给所有人，必须离线评测 + 灰度双闸门。"
    }
  })
];

const project = createAiAgentStageProject({
  id: "ai-agent-platform-pipeline-project",
  stageId: "ai-agent-platform-pipeline",
  eyebrowStage: eyebrow,
  title: "端到端 Agent 平台",
  brief: "构建一个可交付的 Agent 平台雏形：暴露 REST API → 意图分类 → 任务规划 → 工具编排 → 记忆读写 → 输出评测 → 安全审计 → 结果返回；所有链路可观测、可回滚、可迭代。",
  concept: "把阶段 04-09 的能力串成一条完整流水线：入口鉴权、意图分类、DAG 规划、并行工具执行、记忆读写、LLM-as-judge 评测、安全脱敏和审计、灰度发布，最终返回带 traceId 的结果并写入迭代闭环。",
  points: [
    "REST 层做入口、鉴权、trace 注入",
    "Pipeline 编排 planner → executor → memory → judge → safety",
    "所有步骤共享 traceId 便于观测与回滚"
  ],
  memoryHook: "平台 = 入口 + 编排 + 记忆 + 评测 + 安全 + 灰度",
  fileName: "platform.ts",
  code: `import express from \"express\";\nimport { classifyIntent } from \"./intent\";\nimport { buildPlan } from \"./planner\";\nimport { runPlan } from \"./executor\";\nimport { recall, remember } from \"./memory\";\nimport { guardedRun } from \"./judge\";\nimport { safetyGate } from \"./safety\";\nimport { pickVersion } from \"./release\";\n\nconst app = express();\napp.use(express.json());\n\napp.post(\"/agent/invoke\", async (req, res) => {\n  const traceId = crypto.randomUUID();\n  const actor = req.header(\"x-user-id\") ?? \"anonymous\";\n  const version = pickVersion(actor);\n  try {\n    const intent = await classifyIntent(req.body.query);\n    if (intent.confidence < 0.4) return res.status(202).json({ traceId, fallback: true });\n\n    const context = await recall(\`user:\${actor}\`, req.body.query);\n    const plan = await buildPlan(intent.label, req.body.query);\n\n    const { out, verdict } = await guardedRun(async () => {\n      const results = await runPlan(plan, { traceId, memory: context, version });\n      return synthesize(results);\n    }, RUBRIC[intent.label]);\n\n    if (!verdict.pass) return res.status(422).json({ traceId, retry: true, verdict });\n\n    const gated = await safetyGate({ traceId, actor, output: out!, toolCalls: plan.nodes.map(n => ({ name: n.tool, args: n })) });\n    if (gated.needsApproval) return res.status(202).json({ traceId, pendingApproval: true });\n\n    await remember(\`user:\${actor}\`, { text: out!, tags: [intent.label] });\n    res.json({ traceId, version, output: gated.output });\n  } catch (err) {\n    res.status(500).json({ traceId, error: (err as Error).message });\n  }\n});\n\napp.listen(8080);`,
  prompt: "上线前对这条端到端流水线最应该验证什么？",
  correct: "针对每种意图跑典型样本，比对 Trace、工具调用、记忆写入、评测分数、审计日志和最终输出",
  wrong: "只压测 QPS 和延迟，业务链路让灰度用户自然验证",
  additionalWrong: {
    label: "在 dev 环境跑通一次示例请求就直接推到 prod",
    feedback: "一次示例无法覆盖意图路由、评测闸门、安全审计等分支；必须建立典型样本 + 证据链验收。"
  },
  correctFeedback: "正确：平台级 Agent 的验收标准是每条链路都有可复查的证据，能沿 traceId 回放所有决策。",
  wrongFeedback: "错误：只压测性能会漏掉记忆污染、评测失效、审计缺失这些高危缺陷。",
  lanes: ["接入与规划", "工具与记忆", "评测与安全"],
  laneValues: ["intent + DAG 就绪", "executor 并行 + memory 读写", "judge 通过 + safety 脱敏"],
  log: [
    "POST /agent/invoke traceId=req-9f21 version=v2025.07.20",
    "plan.nodes=5 executor 完成 fan-in",
    "judge score=0.87 safety allowed 返回 200"
  ],
  summary: [
    "端到端流水线共享 traceId",
    "评测闸门 + 安全闸门缺一不可",
    "灰度桶决定这次请求走哪个版本"
  ],
  sourceTitle: "OpenAI Cookbook — Orchestrating Agents",
  sourceUrl: "https://cookbook.openai.com/examples/orchestrating_agents"
});

export const aiAgentStageTenPlatformPipelineLessons: LessonSpec[] = [...knowledgeLessons, project];
