import type { LessonSpec } from "../../../lib/curriculum/types";
import { createAiAgentLesson, createAiAgentStageProject } from "./ai-agent-lesson-factory";

const eyebrow = "生产化部署";

const knowledgeLessons: LessonSpec[] = [
  createAiAgentLesson({
    id: "ai-agent-production-deploy-model-routing",
    stageId: "ai-agent-production-deploy",
    order: 1,
    eyebrowStage: eyebrow,
    title: "模型路由与降级",
    concept: "生产 Agent 面对的请求复杂度差异极大。用启发式或分类器估计复杂度，简单请求走 `gpt-4o-mini`、`claude-haiku` 这类小模型省钱；复杂请求走 `gpt-4o`、`claude-opus`；再叠加主模型不可用时的 fallback 链，才能兼顾成本与可用性。",
    points: ["按复杂度分流到不同 tier", "主模型失败按 fallback 链降级", "记录路由决策便于回查"],
    memoryHook: "路由 = 复杂度打分 + fallback 链",
    fileName: "model-routing.ts",
    code: `type Tier = "small" | "large";\nconst PRIMARY: Record<Tier, string[]> = {\n  small: ["gpt-4o-mini", "claude-3-haiku"],\n  large: ["gpt-4o", "claude-3-5-sonnet"]\n};\n\nfunction score(prompt: string): number {\n  const tokens = prompt.split(/\\s+/).length;\n  const needsReasoning = /证明|规划|推导|debug/.test(prompt);\n  return Math.min(1, tokens / 800 + (needsReasoning ? 0.4 : 0));\n}\n\nexport async function route(prompt: string, call: (m: string, p: string) => Promise<string>) {\n  const tier: Tier = score(prompt) > 0.5 ? "large" : "small";\n  for (const model of PRIMARY[tier]) {\n    try {\n      return { model, output: await call(model, prompt) };\n    } catch (err) {\n      console.warn("route.fallback", model, (err as Error).message);\n    }\n  }\n  throw new Error("all_models_unavailable");\n}`,
    prompt: "为什么生产 Agent 要按复杂度分流并配置 fallback 链？",
    correct: "小模型接住多数轻量请求节省成本，fallback 链避免单点模型故障导致整体不可用",
    wrong: "只用最强模型最省心，不需要路由和降级",
    output: "gpt-4o-mini",
    lanes: ["复杂度打分", "选择模型", "调用与降级"],
    laneValues: ["score=0.2", "选 gpt-4o-mini", "成功返回"],
    log: ["prompt tokens=64", "tier=small", "gpt-4o-mini ok"],
    summary: ["路由按复杂度分 tier", "fallback 链应对上游故障", "日志记录路由决策"],
    sourceTitle: "OpenAI Rate Limits Guide",
    sourceUrl: "https://platform.openai.com/docs/guides/rate-limits",
    additionalWrong: {
      label: "只按请求 IP 做哈希轮询模型",
      feedback: "哈希轮询忽略了请求复杂度和成本差异，会把简单请求也送到大模型，造成浪费。"
    }
  }),
  createAiAgentLesson({
    id: "ai-agent-production-deploy-cost-control",
    stageId: "ai-agent-production-deploy",
    order: 2,
    eyebrowStage: eyebrow,
    title: "成本控制与预算",
    concept: "多租户 Agent 服务必须按租户/用户维度设 token 预算，每次调用前预估费用，实时累计并在超预算时拒绝或降级。计费必须以厂商实际 usage 字段为准，不能只靠自估。",
    points: ["按租户维度设日/月预算", "调用前预估，调用后按 usage 结算", "超预算触发降级或拒绝"],
    memoryHook: "预估在前，结算在后，超支就降级",
    fileName: "cost-control.ts",
    code: `const PRICE = {\n  "gpt-4o":       { input: 2.5 / 1_000_000, output: 10 / 1_000_000 },\n  "gpt-4o-mini":  { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 }\n} as const;\n\nasync function charge(tenant: string, model: keyof typeof PRICE, usage: { input: number; output: number }) {\n  const price = PRICE[model];\n  const cost = usage.input * price.input + usage.output * price.output;\n  const spent = await budget.increment(tenant, cost);\n  if (spent > budget.limitFor(tenant)) {\n    await budget.markExceeded(tenant);\n    throw new Error("budget_exceeded");\n  }\n  return cost;\n}\n\nexport async function callWithBudget(tenant: string, model: keyof typeof PRICE, prompt: string) {\n  if (await budget.isExceeded(tenant)) throw new Error("budget_exceeded");\n  const resp = await openai.chat(model, prompt);\n  await charge(tenant, model, resp.usage);\n  return resp;\n}`,
    prompt: "为什么按 usage 字段结算而不是只靠调用前估算？",
    correct: "厂商真实 usage 才是计费依据，预估只能用于事前拦截，避免超预算需以 usage 为准",
    wrong: "调用前估算已经足够精确，可以跳过 usage 结算",
    output: "cost=0.0042",
    lanes: ["预估成本", "调用模型", "按 usage 结算"],
    laneValues: ["估算 3000 tokens", "调用 gpt-4o-mini", "记账 0.0042"],
    log: ["tenant=t1 estimate=3000", "call ok usage=3120", "spent=0.0042"],
    summary: ["预估仅做事前拦截", "结算以 usage 为准", "超预算立即降级或拒绝"],
    sourceTitle: "OpenAI Rate Limits Guide",
    sourceUrl: "https://platform.openai.com/docs/guides/rate-limits",
    additionalWrong: {
      label: "只在月底跑一次账单对账",
      feedback: "月底对账无法阻止当月超支，必须实时累计并在触达阈值时拒绝。"
    }
  }),
  createAiAgentLesson({
    id: "ai-agent-production-deploy-rate-limiting",
    stageId: "ai-agent-production-deploy",
    order: 3,
    eyebrowStage: eyebrow,
    title: "限流与背压",
    concept: "OpenAI 与 Anthropic 都按 RPM/TPM 限流，超限返回 429。生产系统需要用 token bucket 或 leaky bucket 在本地预限流，上游 429 时按 `Retry-After` 指数退避，必要时排队或直接返回 429 给客户端形成背压。",
    points: ["本地 token bucket 预限流", "尊重 Retry-After 头做退避", "队列过长时对上游背压 429"],
    memoryHook: "预限流+退避+背压，三件套稳流量",
    fileName: "rate-limit.ts",
    code: `class TokenBucket {\n  private tokens: number;\n  private last = Date.now();\n  constructor(private rate: number, private capacity: number) {\n    this.tokens = capacity;\n  }\n  take(n: number): boolean {\n    const now = Date.now();\n    this.tokens = Math.min(this.capacity, this.tokens + ((now - this.last) / 1000) * this.rate);\n    this.last = now;\n    if (this.tokens < n) return false;\n    this.tokens -= n;\n    return true;\n  }\n}\n\nconst bucket = new TokenBucket(500 / 60, 500); // 500 RPM\n\nexport async function callLLM(prompt: string, attempt = 0): Promise<string> {\n  if (!bucket.take(1)) throw new Error("local_rate_limited");\n  try {\n    return await openai.chat("gpt-4o-mini", prompt);\n  } catch (err: any) {\n    if (err.status === 429 && attempt < 3) {\n      const wait = Number(err.headers?.["retry-after"] ?? 2 ** attempt);\n      await new Promise(r => setTimeout(r, wait * 1000));\n      return callLLM(prompt, attempt + 1);\n    }\n    throw err;\n  }\n}`,
    prompt: "为什么本地要预限流，不能只依赖上游 429？",
    correct: "本地预限流可以在到达上游前平滑削峰，避免连锁 429 击穿重试放大流量",
    wrong: "直接依赖上游 429 就足够，本地限流是多余",
    output: "call ok",
    lanes: ["本地 bucket", "调用上游", "429 退避"],
    laneValues: ["剩余 12 令牌", "gpt-4o-mini ok", "无 429"],
    log: ["bucket=12", "call ok", "no retry"],
    summary: ["本地 token bucket 平滑削峰", "Retry-After 决定退避时长", "队列满时对上游返回 429"],
    sourceTitle: "OpenAI Cookbook: How to handle rate limits",
    sourceUrl: "https://cookbook.openai.com/examples/how_to_handle_rate_limits",
    additionalWrong: {
      label: "遇到 429 立即无限次快速重试",
      feedback: "无退避重试会形成雷群效应，让上游持续 429 并放大自身流量。"
    }
  }),
  createAiAgentLesson({
    id: "ai-agent-production-deploy-multi-tenant",
    stageId: "ai-agent-production-deploy",
    order: 4,
    eyebrowStage: eyebrow,
    title: "多租户隔离",
    concept: "SaaS 化 Agent 服务必须做到 API key、向量库 namespace、日志、缓存、速率限制都按租户隔离。所有下游调用都要携带 `tenantId` 上下文，任何一处泄漏都可能造成跨租户数据串扰。",
    points: ["独立 API key + 向量 namespace", "日志与缓存都按租户分区", "上下文对象贯穿全链路"],
    memoryHook: "tenantId 是贯穿全链路的护照",
    fileName: "multi-tenant.ts",
    code: `type TenantCtx = {\n  tenantId: string;\n  apiKey: string;\n  vectorNamespace: string;\n  logger: (evt: Record<string, unknown>) => void;\n};\n\nexport async function runAgent(ctx: TenantCtx, task: string) {\n  const memory = await vectorStore.query({\n    namespace: ctx.vectorNamespace,\n    query: task,\n    topK: 5\n  });\n  const client = new OpenAI({ apiKey: ctx.apiKey });\n  const resp = await client.chat.completions.create({\n    model: "gpt-4o-mini",\n    messages: [\n      { role: "system", content: \`tenant=\${ctx.tenantId}\` },\n      { role: "user", content: task + "\\n\\n" + memory.map(m => m.text).join("\\n") }\n    ]\n  });\n  ctx.logger({ tenant: ctx.tenantId, task, tokens: resp.usage?.total_tokens });\n  return resp.choices[0].message.content;\n}`,
    prompt: "多租户 Agent 最容易出现的隔离缺陷是什么？",
    correct: "共享向量库 namespace 或缓存键，导致一个租户的私有语料被另一个租户检索到",
    wrong: "只要每个租户用不同的登录账号就自动隔离",
    output: "tenant=acme ok",
    lanes: ["构造 ctx", "命名空间检索", "调用与记录"],
    laneValues: ["tenantId=acme", "vector ns=acme", "logger 记录"],
    log: ["ctx tenant=acme", "vector query ns=acme", "chat ok tokens=812"],
    summary: ["tenantId 贯穿全链路", "向量 namespace 强制隔离", "日志按租户分区便于审计"],
    sourceTitle: "Anthropic API Rate Limits",
    sourceUrl: "https://docs.anthropic.com/en/api/rate-limits",
    additionalWrong: {
      label: "所有租户共用一个向量库，用元数据字段过滤",
      feedback: "元数据过滤一旦忘写就会串数据。生产级隔离应用独立 namespace 或独立 collection。"
    }
  }),
  createAiAgentLesson({
    id: "ai-agent-production-deploy-canary-rollback",
    stageId: "ai-agent-production-deploy",
    order: 5,
    eyebrowStage: eyebrow,
    title: "灰度发布与回滚",
    concept: "新 prompt、新模型、新工具链上线应按 1% → 10% → 50% → 100% 灰度切流。每一档观察成功率、延迟、成本指标；一旦相对基线下降超过阈值，立即自动回滚到上一档。",
    points: ["按流量比例逐档放量", "灰度组与基线组同时观测", "指标退化自动回滚"],
    memoryHook: "灰度 = 分档放量 + 双组对照 + 自动回滚",
    fileName: "canary.ts",
    code: `const CANARY = { percent: 10, variant: "prompt_v3" };\nconst BASELINE = "prompt_v2";\n\nfunction pickVariant(userId: string): string {\n  const bucket = hash(userId) % 100;\n  return bucket < CANARY.percent ? CANARY.variant : BASELINE;\n}\n\nexport async function serve(userId: string, task: string) {\n  const variant = pickVariant(userId);\n  const t0 = Date.now();\n  try {\n    const output = await runWithPrompt(variant, task);\n    metrics.observe(variant, { ok: true, latency: Date.now() - t0 });\n    return output;\n  } catch (err) {\n    metrics.observe(variant, { ok: false, latency: Date.now() - t0 });\n    throw err;\n  }\n}\n\n// 后台调度：canary 成功率相对 baseline 下降 > 2% 或 p99 增加 > 30% 时回滚\nsetInterval(async () => {\n  const c = await metrics.window(CANARY.variant, "5m");\n  const b = await metrics.window(BASELINE, "5m");\n  if (c.successRate < b.successRate - 0.02 || c.p99 > b.p99 * 1.3) {\n    CANARY.percent = 0;\n    alert("canary rolled back", { c, b });\n  }\n}, 60_000);`,
    prompt: "灰度发布中如何判断是否应回滚？",
    correct: "灰度组的成功率/延迟相对基线组显著退化时立即回滚，而不是等到全量再看总指标",
    wrong: "只看灰度组自己的绝对值是否达标，无需与基线比较",
    output: "variant=prompt_v3",
    lanes: ["按用户分桶", "分组执行", "指标对照"],
    laneValues: ["bucket=7 → canary", "prompt_v3 调用", "对比 baseline"],
    log: ["user=u42 → canary", "prompt_v3 ok 812ms", "canary p99=1.2s baseline p99=1.1s"],
    summary: ["按用户哈希稳定分桶", "灰度组与基线组同时观测", "指标退化触发自动回滚"],
    sourceTitle: "Uber Engineering: Predictive to Generative AI",
    sourceUrl: "https://www.uber.com/en-HK/blog/from-predictive-to-generative-ai/",
    additionalWrong: {
      label: "每次请求随机决定用哪个 variant",
      feedback: "随机分组会让同一用户多次请求命中不同 variant，破坏一致性并污染指标。"
    }
  }),
  createAiAgentLesson({
    id: "ai-agent-production-deploy-caching",
    stageId: "ai-agent-production-deploy",
    order: 6,
    eyebrowStage: eyebrow,
    title: "缓存与命中率优化",
    concept: "OpenAI 与 Anthropic 都支持 prompt 前缀缓存：只要 system + 长上下文前缀不变，缓存命中时输入 token 计费大幅打折并降低延迟。另外可以在应用层做结果缓存：相同任务哈希在 TTL 内直接返回上次结果。",
    points: ["把稳定前缀放最前触发 prompt caching", "应用层按 (model, prompt) 哈希缓存结果", "缓存需设 TTL 和淘汰策略"],
    memoryHook: "前缀不动缓存才命中，结果哈希省二次调用",
    fileName: "caching.ts",
    code: `import crypto from "node:crypto";\n\nconst STABLE_SYSTEM = "你是资深客服 Agent...(长指令 4KB)";\n\nfunction cacheKey(model: string, prompt: string) {\n  return crypto.createHash("sha256").update(model + "\\u0001" + prompt).digest("hex");\n}\n\nexport async function ask(model: string, userPrompt: string) {\n  const key = cacheKey(model, userPrompt);\n  const cached = await kv.get(key);\n  if (cached) {\n    metrics.inc("cache.hit");\n    return JSON.parse(cached);\n  }\n  const resp = await openai.chat.completions.create({\n    model,\n    messages: [\n      // 稳定前缀放最前，触发 OpenAI/Anthropic prompt caching\n      { role: "system", content: STABLE_SYSTEM },\n      { role: "user", content: userPrompt }\n    ]\n  });\n  await kv.set(key, JSON.stringify(resp), { ex: 3600 });\n  metrics.inc("cache.miss");\n  return resp;\n}`,
    prompt: "为什么把长系统指令放消息数组最前面能省钱？",
    correct: "OpenAI/Anthropic 的 prompt caching 按前缀匹配，稳定前缀不变即可命中缓存，输入 token 大幅打折",
    wrong: "消息顺序不影响成本，缓存只与结果有关",
    output: "cache.hit",
    lanes: ["计算键", "查缓存", "命中或调用"],
    laneValues: ["sha256(prompt)", "kv.get", "cache.hit"],
    log: ["key=9f2a", "kv hit", "return cached"],
    summary: ["稳定前缀触发 prompt caching", "结果缓存按哈希去重", "TTL 与淘汰要显式配置"],
    sourceTitle: "OpenAI Prompt Caching",
    sourceUrl: "https://platform.openai.com/docs/guides/prompt-caching",
    additionalWrong: {
      label: "把用户输入放系统消息前面以便复用",
      feedback: "用户输入千变万化，放在前面会破坏前缀稳定性，反而永远无法命中 prompt caching。"
    }
  }),
  createAiAgentLesson({
    id: "ai-agent-production-deploy-slo-alerting",
    stageId: "ai-agent-production-deploy",
    order: 7,
    eyebrowStage: eyebrow,
    title: "SLO 与告警",
    concept: "参考 Google SRE 手册，为 Agent 服务显式定义 SLO：可靠性（成功率 ≥ 99%）、延迟（p99 < 3s）、单次成本（< $0.01）。以 error budget 消耗速率触发告警，而不是对每一次抖动响应。",
    points: ["SLI 要贴近用户体验", "SLO 定义清晰的目标窗口", "按 burn rate 告警而非单点抖动"],
    memoryHook: "SLI → SLO → error budget → burn rate 告警",
    fileName: "slo.ts",
    code: `type Slo = { name: string; target: number; window: "30d" };\nconst SLOS: Slo[] = [\n  { name: "availability", target: 0.99, window: "30d" },\n  { name: "latency_p99_lt_3s", target: 0.99, window: "30d" }\n];\n\n// error budget = 1 - target；burn rate = 实际错误率 / (1 - target)\nfunction shouldPage(actualErrorRate: number, target: number, windowMinutes: number) {\n  const budget = 1 - target;\n  const burnRate = actualErrorRate / budget;\n  // 参考 Google SRE：1h 窗口 burn rate > 14.4 或 6h > 6 即快速告警\n  if (windowMinutes <= 60 && burnRate > 14.4) return "page";\n  if (windowMinutes <= 360 && burnRate > 6) return "ticket";\n  return "ok";\n}\n\nexport async function evaluate() {\n  for (const slo of SLOS) {\n    const rate = await metrics.errorRate(slo.name, 60);\n    const action = shouldPage(rate, slo.target, 60);\n    if (action !== "ok") alert(slo.name, { rate, action });\n  }\n}`,
    prompt: "为什么按 burn rate 而不是单次错误告警？",
    correct: "burn rate 反映 error budget 的消耗速度，能区分短暂抖动与真正的可靠性事故",
    wrong: "只要出现一次失败就立即分页值班工程师",
    output: "burn=2.1 ok",
    lanes: ["采样错误率", "计算 burn rate", "决定告警"],
    laneValues: ["errRate=0.002", "burn=0.2", "action=ok"],
    log: ["window=60m", "burn=0.2", "no page"],
    summary: ["SLI 贴近用户体验", "error budget = 1 - SLO", "burn rate 决定告警级别"],
    sourceTitle: "Google SRE Book: Service Level Objectives",
    sourceUrl: "https://sre.google/sre-book/service-level-objectives/",
    additionalWrong: {
      label: "把 CPU 使用率作为 Agent 服务的 SLI",
      feedback: "CPU 是基础设施指标，不直接反映 Agent 用户体验；SLI 应选成功率、延迟、成本这类用户可感指标。"
    }
  }),
  createAiAgentLesson({
    id: "ai-agent-production-deploy-incident-postmortem",
    stageId: "ai-agent-production-deploy",
    order: 8,
    eyebrowStage: eyebrow,
    title: "生产事故复盘",
    concept: "Agent 事故复盘要沿 5-why 追问：模型问题（漂移/降级）、prompt 问题（模板失效）、数据问题（污染/缺失）、基础设施问题（上游 429/超时）。结论要沉淀成 runbook 与自动化检测，避免重复踩坑。",
    points: ["按模型/prompt/数据/基建四类分层归因", "5-why 追到可行动根因", "沉淀 runbook 与回归监控"],
    memoryHook: "四层归因 + 5-why + runbook 落地",
    fileName: "postmortem.ts",
    code: `type Category = "model" | "prompt" | "data" | "infra";\ntype Finding = { category: Category; why: string[]; action: string; owner: string; dueDate: string };\n\nexport function writePostmortem(incidentId: string, findings: Finding[]) {\n  const runbookEntries = findings.map(f => ({\n    incidentId,\n    category: f.category,\n    rootCause: f.why[f.why.length - 1],\n    detection: \`monitor.\${f.category}.\${incidentId}\`,\n    action: f.action,\n    owner: f.owner,\n    dueDate: f.dueDate\n  }));\n  return { incidentId, findings, runbookEntries };\n}\n\nwritePostmortem("INC-2026-07-24", [\n  {\n    category: "prompt",\n    why: [\n      "客服 Agent 回复变短",\n      "模板占位符未渲染",\n      "上游变量 order.items 为空数组",\n      "订单同步任务失败",\n      "同步任务依赖的鉴权 token 过期"\n    ],\n    action: "为鉴权 token 加过期前 24h 预警 + 同步任务失败时降级 fallback 模板",\n    owner: "agent-platform",\n    dueDate: "2026-07-31"\n  }\n]);`,
    prompt: "Agent 事故复盘最应该输出什么？",
    correct: "分层归因到可行动根因，并沉淀成 runbook 条目与新增监控，避免同类事故复发",
    wrong: "写一段自然语言事故描述发到群里就算完成",
    output: "runbook entries=1",
    lanes: ["收集时间线", "分层归因", "沉淀 runbook"],
    laneValues: ["incident INC-2026", "prompt/data/infra", "runbook 1 条"],
    log: ["timeline collected", "root cause: token 过期", "runbook 更新"],
    summary: ["四层分类避免只怪模型", "5-why 追到可修复层", "沉淀 runbook + 新监控"],
    sourceTitle: "Google SRE Book: Service Level Objectives",
    sourceUrl: "https://sre.google/sre-book/service-level-objectives/",
    additionalWrong: {
      label: "复盘结论只写 “以后要更小心”",
      feedback: "非行动性结论无法防止复发。每条 finding 必须落到具体动作、负责人和监控。"
    }
  })
];

const project = createAiAgentStageProject({
  id: "ai-agent-production-deploy-project",
  stageId: "ai-agent-production-deploy",
  eyebrowStage: eyebrow,
  title: "生产化 Agent 服务",
  brief:
    "构建生产化 Agent 服务框架：请求进入 → 路由到合适模型 → 限流 + 多租户隔离 → 缓存命中直接返回 → 未命中走 LLM 并记录指标 → 灰度发布支持切流。",
  concept:
    "把本阶段的模型路由、限流、多租户、缓存、灰度、SLO 组合成一条端到端服务链路，每个请求都能被追踪、被计费、被回滚。",
  points: ["请求上下文贯穿全链路", "缓存与限流放在 LLM 调用之前", "灰度切流与指标观测同一循环"],
  memoryHook: "一条链路：ctx → limit → cache → route → observe",
  fileName: "serve.ts",
  code: `type Req = { tenantId: string; userId: string; prompt: string };\ntype Ctx = Req & { variant: string; model: string };\n\nasync function build(req: Req): Promise<Ctx> {\n  const variant = pickVariant(req.userId);      // 灰度\n  const model = route(req.prompt);               // 路由\n  return { ...req, variant, model };\n}\n\nexport async function serve(req: Req) {\n  const t0 = Date.now();\n  const ctx = await build(req);\n\n  if (await budget.isExceeded(ctx.tenantId)) throw new Error("budget_exceeded");\n  if (!bucket(ctx.tenantId).take(1)) throw new Error("rate_limited");\n\n  const key = hash(ctx.model, ctx.variant, ctx.prompt);\n  const cached = await kv.get(key);\n  if (cached) {\n    metrics.observe(ctx, { ok: true, latency: Date.now() - t0, cache: "hit", cost: 0 });\n    return JSON.parse(cached);\n  }\n\n  try {\n    const resp = await callLLM(ctx.model, ctx.prompt, { tenantId: ctx.tenantId });\n    const cost = await charge(ctx.tenantId, ctx.model, resp.usage);\n    await kv.set(key, JSON.stringify(resp), { ex: 3600 });\n    metrics.observe(ctx, { ok: true, latency: Date.now() - t0, cache: "miss", cost });\n    return resp;\n  } catch (err) {\n    metrics.observe(ctx, { ok: false, latency: Date.now() - t0, cache: "miss", cost: 0 });\n    throw err;\n  }\n}`,
  prompt: "生产 Agent 链路里，缓存与限流放在 LLM 调用之前有什么关键收益？",
  correct: "缓存命中直接返回不消耗配额，限流放在前面能保护上游避免连锁 429 和不必要的成本",
  wrong: "缓存与限流放在 LLM 调用后再补也能达到同样效果",
  correctFeedback: "正确：LLM 调用是最贵、最容易被限流的一步，前置缓存与限流可以最大化成本与稳定性收益。",
  wrongFeedback: "错误：LLM 调用之后再限流意味着已经消耗配额和费用，无法阻止雷群与预算超支。",
  additionalWrong: {
    label: "把灰度切流放在 LLM 返回之后再决定",
    feedback: "灰度必须在选择 prompt/model 时决定，返回之后再切流已经无法影响本次请求的行为。"
  },
  lanes: ["构造上下文", "预算/限流/缓存", "调用与观测"],
  laneValues: ["ctx=tenant+variant+model", "budget ok + cache miss", "LLM ok + metrics"],
  log: [
    "req tenant=acme user=u42 prompt='退款'",
    "budget ok, bucket take 1, cache miss key=9f2a",
    "call gpt-4o-mini ok cost=0.0042 latency=780ms"
  ],
  summary: [
    "请求上下文一次构造贯穿全链路",
    "缓存与限流前置，保护成本与上游",
    "指标观测覆盖成功/失败/缓存/成本四维"
  ],
  sourceTitle: "OpenAI Cookbook: How to handle rate limits",
  sourceUrl: "https://cookbook.openai.com/examples/how_to_handle_rate_limits"
});

export const aiAgentStageNineProductionDeployLessons: LessonSpec[] = [...knowledgeLessons, project];
