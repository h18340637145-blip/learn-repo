import type { CourseDomainId, CourseId, CourseSpec, CurriculumStage, LessonSpec, RuntimeSurface, StageId } from "../lib/curriculum/types";
import { curriculum } from "./curriculum";
import { frontendDebuggingCurriculum } from "./curriculum-frontend-debugging";
import { nextjsCurriculum } from "./curriculum-nextjs";
import { pythonStageZeroFoundationsLessons } from "./lessons/python/stage-00-foundations";
import { pythonStageOneDataStructuresLessons } from "./lessons/python/stage-01-data-structures";
import { pythonStageTwoModulesTestingLessons } from "./lessons/python/stage-02-modules-testing";
import { pythonStageThreeAsyncServicesLessons } from "./lessons/python/stage-03-async-services";
import { pythonStageFourFileBatchLessons } from "./lessons/python/stage-04-file-batch";
import { pythonStageFiveRegexParsingLessons } from "./lessons/python/stage-05-regex-parsing";
import { pythonStageSixHttpScrapingLessons } from "./lessons/python/stage-06-http-scraping";
import { pythonStageSevenCliToolsLessons } from "./lessons/python/stage-07-cli-tools";
import { pythonStageEightSchedulingLessons } from "./lessons/python/stage-08-scheduling";
import { pythonStageNineOpsProcessLessons } from "./lessons/python/stage-09-ops-process";
import { pythonStageTenAutomationPipelineLessons } from "./lessons/python/stage-10-automation-pipeline";
// AI Agent real-content lessons (stages 04-10; stages 00-03 remain blueprint)
import { aiAgentStageFourToolOrchestrationLessons } from "./lessons/ai-agent/stage-04-tool-orchestration";
import { aiAgentStageFiveLongMemoryLessons } from "./lessons/ai-agent/stage-05-long-memory";
import { aiAgentStageSixEvaluationObservabilityLessons } from "./lessons/ai-agent/stage-06-evaluation-observability";
import { aiAgentStageSevenSafetyAlignmentLessons } from "./lessons/ai-agent/stage-07-safety-alignment";
import { aiAgentStageEightMultimodalExecutionLessons } from "./lessons/ai-agent/stage-08-multimodal-execution";
import { aiAgentStageNineProductionDeployLessons } from "./lessons/ai-agent/stage-09-production-deploy";
import { aiAgentStageTenPlatformPipelineLessons } from "./lessons/ai-agent/stage-10-platform-pipeline";
// AI Application real-content lessons (stages 04-10)
import { aiApplicationStageFourVectorRetrievalLessons } from "./lessons/ai-application/stage-04-vector-retrieval";
import { aiApplicationStageFivePromptChainLessons } from "./lessons/ai-application/stage-05-prompt-chain";
import { aiApplicationStageSixModelSelectionLessons } from "./lessons/ai-application/stage-06-model-selection";
import { aiApplicationStageSevenEvaluationMetricsLessons } from "./lessons/ai-application/stage-07-evaluation-metrics";
import { aiApplicationStageEightCostCachingLessons } from "./lessons/ai-application/stage-08-cost-caching";
import { aiApplicationStageNineObservabilityTracingLessons } from "./lessons/ai-application/stage-09-observability-tracing";
import { aiApplicationStageTenProductionPlatformLessons } from "./lessons/ai-application/stage-10-production-platform";
import { serverEngineeringStageFourMicroservicesLessons } from "./lessons/server-engineering/stage-04-microservices";
import { serverEngineeringStageFiveDistributedDataLessons } from "./lessons/server-engineering/stage-05-distributed-data";
import { serverEngineeringStageSixMessageQueueLessons } from "./lessons/server-engineering/stage-06-message-queue";
import { serverEngineeringStageSevenSecurityAuthLessons } from "./lessons/server-engineering/stage-07-security-auth";
import { serverEngineeringStageEightCiCdLessons } from "./lessons/server-engineering/stage-08-ci-cd";
import { serverEngineeringStageNineObservabilityLessons } from "./lessons/server-engineering/stage-09-observability";
import { serverEngineeringStageTenPlatformEngineeringLessons } from "./lessons/server-engineering/stage-10-platform-engineering";

const defaultRuntimeSurfaces = ["console", "micro-browser", "runtime-timeline", "incident-hud"] as const;

type PlannedStageSeed = {
  id: StageId;
  number: number;
  title: string;
  summary: string;
  lessons: readonly string[];
  projectTitle: string;
};

function createPlannedStages(courseId: CourseId, seeds: readonly PlannedStageSeed[], publishedStageCount = 0) {
  return seeds.map((stage) => ({
    id: stage.id,
    number: stage.number,
    title: stage.title,
    summary: stage.summary,
    lessons: expandPlannedLessons(stage).map((title, index) => ({
      id: `${courseId}-${stage.id}-lesson-${index + 1}`,
      title,
      order: index + 1,
      kind: "knowledge",
      status: stage.number < publishedStageCount ? "published" : "planned"
    })),
    project: {
      id: `${courseId}-${stage.id}-project`,
      title: stage.projectTitle,
      order: 9,
      kind: "stage-project",
      status: stage.number < publishedStageCount ? "published" : "planned"
    }
  })) satisfies CurriculumStage[];
}

function expandPlannedLessons(stage: PlannedStageSeed): readonly string[] {
  const fallbackLessons = [
    `${stage.title}核心模型`,
    `${stage.title}运行链路`,
    `${stage.title}常见误区`,
    `${stage.title}调试路径`,
    `${stage.title}工程实践`,
    `${stage.title}可视化实验`,
    `${stage.title}综合演练`,
    `${stage.title}阶段复盘`
  ];

  return [...stage.lessons, ...fallbackLessons].slice(0, 8);
}

function createPlannedCourse(input: {
  id: CourseId;
  domainId: CourseDomainId;
  slug: string;
  title: string;
  description: string;
  icon: string;
  status?: CourseSpec["status"];
  publishedStageCount?: number;
  runtimeSurfaces: readonly RuntimeSurface[];
  stages: readonly PlannedStageSeed[];
}) {
  return {
    id: input.id,
    domainId: input.domainId,
    slug: input.slug,
    title: input.title,
    description: input.description,
    icon: input.icon,
    status: input.status ?? "planned",
    runtimeSurfaces: input.runtimeSurfaces,
    stages: createPlannedStages(input.id, input.stages, input.publishedStageCount)
  } as const satisfies CourseSpec;
}

function buildPublishedStageFromLessons(
  seed: PlannedStageSeed,
  lessons: readonly LessonSpec[]
): CurriculumStage {
  const knowledgeLessons = lessons.filter((lesson) => lesson.kind === "knowledge");
  const projectLesson = lessons.find((lesson) => lesson.kind === "stage-project");
  if (!projectLesson) {
    throw new Error(`Stage ${seed.id} missing stage-project lesson`);
  }
  return {
    id: seed.id,
    number: seed.number,
    title: seed.title,
    summary: seed.summary,
    lessons: knowledgeLessons.map((lesson, index) => ({
      id: lesson.id,
      title: lesson.title,
      order: index + 1,
      kind: "knowledge" as const,
      status: "published" as const
    })),
    project: {
      id: projectLesson.id,
      title: projectLesson.title,
      order: knowledgeLessons.length + 1,
      kind: "stage-project" as const,
      status: "published" as const
    }
  };
}

export const courseDomains = [
  { id: "language", title: "编程语言" },
  { id: "frontend", title: "前端工程" },
  { id: "network", title: "网络协议" },
  { id: "server", title: "服务端工程" },
  { id: "android", title: "Android 系统" },
  { id: "ai-application", title: "AI 应用" },
  { id: "ai-agent", title: "AI Agent" },
  { id: "ai-math", title: "AI 数学" }
] as const satisfies readonly { id: CourseDomainId; title: string }[];

export const nodejsCourse = {
  id: "nodejs",
  domainId: "server",
  slug: "nodejs",
  title: "Node.js",
  description: "从 JavaScript 基础到生产工程，系统建立 Node.js 运行时心智模型。",
  icon: "⬢",
  status: "published",
  runtimeSurfaces: defaultRuntimeSurfaces,
  stages: curriculum
} as const satisfies CourseSpec;

export const nextjsCourse = {
  id: "nextjs",
  domainId: "frontend",
  slug: "nextjs",
  title: "Next.js",
  description: "从 App Router 到全栈部署，掌握现代 React 服务端框架。",
  icon: "▲",
  status: "published",
  runtimeSurfaces: defaultRuntimeSurfaces,
  stages: nextjsCurriculum
} as const satisfies CourseSpec;

export const frontendDebuggingCourse = {
  id: "frontend-debugging",
  domainId: "frontend",
  slug: "frontend-debugging",
  title: "前端报错调试",
  description: "从控制台、错误栈、Network 和恢复验证中训练真实前端故障定位能力。",
  icon: "⌁",
  status: "preview",
  runtimeSurfaces: defaultRuntimeSurfaces,
  stages: frontendDebuggingCurriculum
} as const satisfies CourseSpec;

const pythonStageSeeds = [
  {
    id: "python-foundations",
    number: 0,
    title: "语法与运行模型",
    summary: "变量、类型、函数、控制流和解释执行过程。",
    lessons: ["变量与动态类型", "函数调用栈", "条件与循环", "异常处理"],
    projectTitle: "命令行文本清洗器"
  },
  {
    id: "python-data-structures",
    number: 1,
    title: "数据结构与标准库",
    summary: "list、dict、set、迭代器和常用标准库。",
    lessons: ["list 与切片", "dict 查询与更新", "迭代器协议", "pathlib 与 json"],
    projectTitle: "日志聚合统计器"
  },
  {
    id: "python-modules-testing",
    number: 2,
    title: "模块、包与测试",
    summary: "import、虚拟环境、pytest 和可维护项目结构。",
    lessons: ["模块解析", "虚拟环境", "pytest 断言", "依赖隔离"],
    projectTitle: "可测试配置解析器"
  },
  {
    id: "python-async-services",
    number: 3,
    title: "异步与服务开发",
    summary: "asyncio、HTTP 客户端、任务调度和服务边界。",
    lessons: ["协程与事件循环", "并发请求", "超时与重试", "服务错误模型"],
    projectTitle: "异步 API 聚合器"
  },
  {
    id: "python-file-batch",
    number: 4,
    title: "文件批处理与文本自动化",
    summary: "路径遍历、编码识别、批量重命名与文本清洗流水线。",
    lessons: ["pathlib 遍历模式", "编码探测与转换", "批量重命名规则", "结构化文本清洗"],
    projectTitle: "批量文档标准化工具"
  },
  {
    id: "python-regex-parsing",
    number: 5,
    title: "正则与结构化解析",
    summary: "re 模块、命名捕获、CSV / JSON / YAML 解析与校验。",
    lessons: ["正则思维模型", "命名捕获与回溯", "CSV/JSON 双向转换", "YAML 数据校验"],
    projectTitle: "多源日志统一解析器"
  },
  {
    id: "python-http-scraping",
    number: 6,
    title: "HTTP 抓取与数据管道",
    summary: "requests/httpx、限流、重试、持久化与反爬边界。",
    lessons: ["同步与异步客户端", "限流与退避策略", "内容抽取与持久化", "反爬合规边界"],
    projectTitle: "站点抓取与增量入库脚本"
  },
  {
    id: "python-cli-tools",
    number: 7,
    title: "CLI 与配置化脚本",
    summary: "argparse/typer、配置合并、日志分级与可复用脚手架。",
    lessons: ["argparse 语义", "typer 类型驱动 CLI", "配置分层合并", "结构化日志"],
    projectTitle: "可发布的运维 CLI 工具"
  },
  {
    id: "python-scheduling",
    number: 8,
    title: "任务调度与后台运行",
    summary: "APScheduler、cron、systemd/timer 与幂等重试。",
    lessons: ["调度触发器建模", "任务幂等性", "失败重试与告警", "systemd/timer 部署"],
    projectTitle: "跨机任务调度器"
  },
  {
    id: "python-ops-process",
    number: 9,
    title: "子进程与运维编排",
    summary: "subprocess、信号处理、并发编排与安全边界。",
    lessons: ["subprocess 输入输出", "信号与超时", "并发编排策略", "凭据与最小权限"],
    projectTitle: "远程主机批量运维脚本"
  },
  {
    id: "python-automation-pipeline",
    number: 10,
    title: "端到端自动化流水线",
    summary: "数据采集→清洗→通知的完整脚本项目，覆盖打包与部署。",
    lessons: ["流水线阶段拆分", "错误恢复与断点续跑", "打包与依赖锁定", "部署与观测"],
    projectTitle: "自动化运营周报流水线"
  }
] as const satisfies readonly PlannedStageSeed[];

const pythonPublishedLessonsByStageId = new Map<StageId, readonly LessonSpec[]>([
  ["python-foundations", pythonStageZeroFoundationsLessons],
  ["python-data-structures", pythonStageOneDataStructuresLessons],
  ["python-modules-testing", pythonStageTwoModulesTestingLessons],
  ["python-async-services", pythonStageThreeAsyncServicesLessons],
  ["python-file-batch", pythonStageFourFileBatchLessons],
  ["python-regex-parsing", pythonStageFiveRegexParsingLessons],
  ["python-http-scraping", pythonStageSixHttpScrapingLessons],
  ["python-cli-tools", pythonStageSevenCliToolsLessons],
  ["python-scheduling", pythonStageEightSchedulingLessons],
  ["python-ops-process", pythonStageNineOpsProcessLessons],
  ["python-automation-pipeline", pythonStageTenAutomationPipelineLessons]
]);

const pythonPlannedStages = createPlannedStages("python", pythonStageSeeds, 4);

const pythonStages = pythonStageSeeds.map((seed) => {
  const authored = pythonPublishedLessonsByStageId.get(seed.id);
  if (authored) {
    return buildPublishedStageFromLessons(seed, authored);
  }
  return pythonPlannedStages[seed.number];
}) satisfies CurriculumStage[];

export const pythonCourse = {
  id: "python",
  domainId: "language",
  slug: "python",
  title: "Python",
  description: "从语法、数据结构到自动化脚本与运维，用可视化方式掌握 Python 运行模型。",
  icon: "Py",
  status: "preview",
  runtimeSurfaces: ["console", "memory-stack", "runtime-timeline"],
  stages: pythonStages
} as const satisfies CourseSpec;

export const networkCourse = createPlannedCourse({
  id: "network",
  domainId: "network",
  slug: "network",
  title: "计算机网络",
  description: "从 URL 到服务响应，拆解 DNS、TCP、TLS、HTTP、缓存、跨域和实时连接。",
  icon: "NET",
  status: "preview",
  publishedStageCount: 4,
  runtimeSurfaces: ["console", "micro-browser", "network-trace", "runtime-timeline"],
  stages: [
    {
      id: "network-url-dns",
      number: 0,
      title: "URL、DNS 与连接建立",
      summary: "从输入 URL 到找到服务地址的完整链路。",
      lessons: ["URL 结构", "DNS 查询", "TCP 握手", "TLS 协商"],
      projectTitle: "页面加载链路解释器"
    },
    {
      id: "network-http-cache",
      number: 1,
      title: "HTTP 与缓存",
      summary: "方法、状态码、Headers、Cookie 和缓存协商。",
      lessons: ["HTTP 请求响应", "状态码诊断", "Headers 语义", "强缓存与协商缓存"],
      projectTitle: "缓存命中调试面板"
    },
    {
      id: "network-security-realtime",
      number: 2,
      title: "安全与实时连接",
      summary: "CORS、CSRF、Token、WebSocket 和 SSE 生命周期。",
      lessons: ["CORS 预检", "Cookie 与 SameSite", "WebSocket 连接", "SSE 重连"],
      projectTitle: "实时通知链路诊断"
    },
    {
      id: "network-gateway-debugging",
      number: 3,
      title: "代理、网关与联调故障",
      summary: "网关转发、代理配置、超时、重试和线上排障。",
      lessons: ["反向代理", "网关超时", "重试风暴", "链路追踪"],
      projectTitle: "API 网关故障复盘"
    }
  ]
});

export const serverEngineeringCourse = (() => {
  const seeds = [
    {
      id: "server-api-design",
      number: 0,
      title: "API 设计与错误模型",
      summary: "REST/RPC、输入校验、幂等性和统一错误结构。",
      lessons: ["资源建模", "输入校验", "错误码设计", "幂等请求"],
      projectTitle: "任务 API 设计复盘"
    },
    {
      id: "server-database-cache",
      number: 1,
      title: "数据库、事务与缓存",
      summary: "索引、事务、连接池、缓存一致性和迁移。",
      lessons: ["索引选择", "事务边界", "连接池", "缓存失效"],
      projectTitle: "库存缓存一致性修复"
    },
    {
      id: "server-queue-observability",
      number: 2,
      title: "队列与可观测性",
      summary: "后台任务、消息队列、日志、指标和 Trace Span。",
      lessons: ["消息投递", "死信队列", "结构化日志", "Trace Span"],
      projectTitle: "订单任务追踪器"
    },
    {
      id: "server-production-incidents",
      number: 3,
      title: "生产事故工程",
      summary: "限流、超时、降级、告警和事故复盘。",
      lessons: ["限流保护", "超时预算", "服务降级", "事故复盘"],
      projectTitle: "生产延迟事故恢复"
    },
    {
      id: "server-microservices",
      number: 4,
      title: "微服务与服务网格",
      summary: "服务拆分、gRPC、发现、网关、Sidecar 与分布式追踪。",
      lessons: ["服务拆分", "服务通信", "服务发现", "API Gateway"],
      projectTitle: "可观测的微服务通信链路"
    },
    {
      id: "server-distributed-data",
      number: 5,
      title: "分布式数据与一致性",
      summary: "CAP、分片、复制、Raft、Saga 与幂等。",
      lessons: ["CAP 权衡", "分片键", "主从复制", "Raft 共识"],
      projectTitle: "分片 + 幂等的订单系统"
    },
    {
      id: "server-message-queue",
      number: 6,
      title: "消息队列深入",
      summary: "Kafka 分区、offset、EOS、RabbitMQ、DLQ 与事件模式。",
      lessons: ["Kafka 分区", "offset 管理", "Exactly-once", "RabbitMQ 拓扑"],
      projectTitle: "高可靠订单事件流水线"
    },
    {
      id: "server-security-auth",
      number: 7,
      title: "安全与认证",
      summary: "OAuth2 + PKCE、OIDC、JWT、RBAC/ABAC、mTLS 与审计。",
      lessons: ["OAuth 2.0", "OIDC", "JWT", "RBAC vs ABAC"],
      projectTitle: "OAuth + RBAC + audit 的 API"
    },
    {
      id: "server-ci-cd",
      number: 8,
      title: "CI/CD 与发布策略",
      summary: "GitHub Actions、多阶段镜像、蓝绿、canary、feature flag 与回滚。",
      lessons: ["GitHub Actions", "Docker 多阶段", "蓝绿部署", "灰度发布"],
      projectTitle: "canary + auto-rollback 流水线"
    },
    {
      id: "server-observability",
      number: 9,
      title: "可观测性三支柱",
      summary: "结构化日志、Prometheus、OTel Trace、USE/RED、SLO 与告警。",
      lessons: ["结构化日志", "Prometheus 指标", "OTel Trace", "USE 方法"],
      projectTitle: "端到端可观测性接入"
    },
    {
      id: "server-platform-engineering",
      number: 10,
      title: "平台工程与 IDP",
      summary: "Kubernetes、Helm、GitOps、Backstage、Terraform 与 FinOps。",
      lessons: ["K8s 对象", "Helm Chart", "GitOps", "Backstage"],
      projectTitle: "GitOps 驱动的内部开发者平台"
    }
  ] as const satisfies readonly PlannedStageSeed[];

  const publishedByStageId = new Map<StageId, readonly LessonSpec[]>([
    ["server-microservices", serverEngineeringStageFourMicroservicesLessons],
    ["server-distributed-data", serverEngineeringStageFiveDistributedDataLessons],
    ["server-message-queue", serverEngineeringStageSixMessageQueueLessons],
    ["server-security-auth", serverEngineeringStageSevenSecurityAuthLessons],
    ["server-ci-cd", serverEngineeringStageEightCiCdLessons],
    ["server-observability", serverEngineeringStageNineObservabilityLessons],
    ["server-platform-engineering", serverEngineeringStageTenPlatformEngineeringLessons]
  ]);

  const planned = createPlannedStages("server-engineering", seeds, 4);
  const stages = seeds.map((seed) => {
    const authored = publishedByStageId.get(seed.id);
    if (authored) {
      return buildPublishedStageFromLessons(seed, authored);
    }
    return planned[seed.number];
  }) satisfies CurriculumStage[];

  return {
    id: "server-engineering",
    domainId: "server",
    slug: "server-engineering",
    title: "服务端工程",
    description: "覆盖 API、数据库、缓存、队列、可观测性、微服务、安全、CI/CD 与平台工程。",
    icon: "SRV",
    status: "preview",
    runtimeSurfaces: ["console", "micro-browser", "runtime-timeline", "incident-hud"],
    stages
  } as const satisfies CourseSpec;
})();

export const androidCourse = createPlannedCourse({
  id: "android",
  domainId: "android",
  slug: "android",
  title: "Android 系统",
  description: "从 App 生命周期到 Framework、Binder、Native 与 HAL 调用链。",
  icon: "AND",
  status: "preview",
  publishedStageCount: 4,
  runtimeSurfaces: ["console", "memory-stack", "android-system-trace", "runtime-timeline"],
  stages: [
    {
      id: "android-app-foundations",
      number: 0,
      title: "App 基础与生命周期",
      summary: "Activity、Fragment、资源、权限和 Manifest。",
      lessons: ["Activity 生命周期", "资源系统", "权限声明", "Manifest 解析"],
      projectTitle: "启动流程诊断器"
    },
    {
      id: "android-jetpack-compose",
      number: 1,
      title: "Jetpack 与 Compose",
      summary: "ViewModel、State、Compose 重组和导航。",
      lessons: ["ViewModel 边界", "State 提升", "Compose 重组", "Navigation"],
      projectTitle: "状态错乱修复任务"
    },
    {
      id: "android-framework-binder",
      number: 2,
      title: "Framework 与 Binder",
      summary: "AMS、WMS、PMS、System Service 与 Binder IPC。",
      lessons: ["System Service", "Binder 调用", "AMS 启动链", "PMS 查询"],
      projectTitle: "跨进程调用链追踪"
    },
    {
      id: "android-performance-native",
      number: 3,
      title: "性能、JNI 与 Native",
      summary: "ANR、内存泄漏、启动优化、JNI 与 HAL。",
      lessons: ["ANR 现场", "内存泄漏", "JNI 边界", "HAL 调用"],
      projectTitle: "卡顿事故复盘"
    }
  ]
});

const aiApplicationStageSeeds = [
  {
    id: "ai-app-prompt-rag",
    number: 0,
    title: "Prompt 与 RAG",
    summary: "提示词结构、检索、召回、重排和上下文组装。",
    lessons: ["Prompt 结构", "文档切分", "召回与重排", "上下文预算"],
    projectTitle: "知识库问答诊断"
  },
  {
    id: "ai-app-tools-workflows",
    number: 1,
    title: "工具调用与工作流",
    summary: "Function Calling、参数构造、工具结果和工作流编排。",
    lessons: ["工具 Schema", "参数校验", "结果解析", "工作流节点"],
    projectTitle: "工具调用排障台"
  },
  {
    id: "ai-app-multimodal-eval",
    number: 2,
    title: "多模态与评测",
    summary: "图文输入、结构化输出、样本集和回归评测。",
    lessons: ["图像输入", "结构化输出", "评测样本", "回归对比"],
    projectTitle: "多模态结果评测"
  },
  {
    id: "ai-app-safety-production",
    number: 3,
    title: "安全与生产化",
    summary: "幻觉控制、权限、审计、成本和生产监控。",
    lessons: ["幻觉边界", "权限控制", "成本预算", "生产监控"],
    projectTitle: "AI 应用安全复盘"
  },
  {
    id: "ai-app-vector-retrieval",
    number: 4,
    title: "向量检索与混合搜索",
    summary: "Embedding、向量库、ANN、混合检索、rerank 与检索评测。",
    lessons: ["Embedding 生成", "向量库写入", "ANN 检索", "混合检索"],
    projectTitle: "端到端向量检索管线"
  },
  {
    id: "ai-app-prompt-chain",
    number: 5,
    title: "高级 Prompt 与链式调用",
    summary: "Few-shot、CoT、LCEL、Output parser 与 streaming。",
    lessons: ["Message 角色", "Few-shot 提示", "CoT 推理", "结构化输出"],
    projectTitle: "多步 Chain 编排"
  },
  {
    id: "ai-app-model-selection",
    number: 6,
    title: "模型选型与路由",
    summary: "能力矩阵、任务复杂度、fallback、延迟质量成本三角。",
    lessons: ["能力矩阵", "任务分级", "Fallback 策略", "延迟成本三角"],
    projectTitle: "智能模型路由系统"
  },
  {
    id: "ai-app-evaluation-metrics",
    number: 7,
    title: "评测指标与自动化",
    summary: "Golden set、LLM as Judge、RAGAS、A/B 与 CI 集成。",
    lessons: ["Golden Set", "LLM as Judge", "RAG 指标", "RAGAS 框架"],
    projectTitle: "自动化评测流水线"
  },
  {
    id: "ai-app-cost-caching",
    number: 8,
    title: "成本与缓存",
    summary: "Token 精算、prompt cache、语义缓存、批处理与预算护栏。",
    lessons: ["Token 精算", "Prompt Caching", "语义缓存", "精确缓存"],
    projectTitle: "三层缓存架构"
  },
  {
    id: "ai-app-observability-tracing",
    number: 9,
    title: "可观测与 Tracing",
    summary: "OpenTelemetry GenAI、LangSmith、Langfuse 与用户反馈。",
    lessons: ["OTel GenAI 规范", "Span 结构", "LangSmith", "Langfuse"],
    projectTitle: "RAG 端到端 Tracing"
  },
  {
    id: "ai-app-production-platform",
    number: 10,
    title: "端到端 AI 应用平台",
    summary: "Ingest、RAG、Chain、Eval、Safety、Ops、UI 与 Analytics 全链路。",
    lessons: ["Ingest 层", "RAG 层", "Chain 层", "Eval 层"],
    projectTitle: "端到端 AI 应用平台"
  }
] as const satisfies readonly PlannedStageSeed[];

const aiApplicationPublishedLessonsByStageId = new Map<StageId, readonly LessonSpec[]>([
  ["ai-app-vector-retrieval", aiApplicationStageFourVectorRetrievalLessons],
  ["ai-app-prompt-chain", aiApplicationStageFivePromptChainLessons],
  ["ai-app-model-selection", aiApplicationStageSixModelSelectionLessons],
  ["ai-app-evaluation-metrics", aiApplicationStageSevenEvaluationMetricsLessons],
  ["ai-app-cost-caching", aiApplicationStageEightCostCachingLessons],
  ["ai-app-observability-tracing", aiApplicationStageNineObservabilityTracingLessons],
  ["ai-app-production-platform", aiApplicationStageTenProductionPlatformLessons]
]);

// AI Application 阶段 00-03 仍来自 blueprint-first-stage.ts；createPlannedStages
// 会为它们保留兼容的 lesson id 与 published 状态。
const aiApplicationPlannedStages = createPlannedStages("ai-application", aiApplicationStageSeeds, 4);

const aiApplicationStages = aiApplicationStageSeeds.map((seed) => {
  const authored = aiApplicationPublishedLessonsByStageId.get(seed.id);
  if (authored) {
    return buildPublishedStageFromLessons(seed, authored);
  }
  return aiApplicationPlannedStages[seed.number];
}) satisfies CurriculumStage[];

export const aiApplicationCourse = {
  id: "ai-application",
  domainId: "ai-application",
  slug: "ai-application",
  title: "AI 应用开发",
  description: "从 Prompt/RAG/工具/多模态基础到向量检索、Chain、评测、成本、Tracing 与端到端平台。",
  icon: "AI",
  status: "preview",
  runtimeSurfaces: ["console", "agent-trace", "runtime-timeline"],
  stages: aiApplicationStages
} as const satisfies CourseSpec;

const aiAgentStageSeeds = [
  {
    id: "ai-agent-loop-planning",
    number: 0,
    title: "观察-计划-行动循环",
    summary: "Observe、Think、Act、Reflect 的基本闭环。",
    lessons: ["观察建模", "任务计划", "行动执行", "反思修正"],
    projectTitle: "Agent Trace 复盘"
  },
  {
    id: "ai-agent-memory-tools",
    number: 1,
    title: "记忆与工具使用",
    summary: "短期记忆、长期记忆、检索记忆和工具选择。",
    lessons: ["短期记忆", "长期记忆", "工具选择", "参数构造"],
    projectTitle: "记忆命中调试"
  },
  {
    id: "ai-agent-multi-agent",
    number: 2,
    title: "多 Agent 协作",
    summary: "Planner、Executor、Reviewer 的分工与冲突解决。",
    lessons: ["角色分工", "任务树", "消息协议", "冲突解决"],
    projectTitle: "多 Agent 协作复盘"
  },
  {
    id: "ai-agent-failure-recovery",
    number: 3,
    title: "失败恢复与安全边界",
    summary: "工具失败、权限拒绝、上下文压缩和恢复策略。",
    lessons: ["工具失败", "权限拒绝", "上下文压缩", "恢复策略"],
    projectTitle: "失败恢复演练"
  },
  {
    id: "ai-agent-tool-orchestration",
    number: 4,
    title: "工具链与工具编排",
    summary: "Function Calling、并行工具、工具组合、错误重试与 trace 归因。",
    lessons: ["Function Calling 契约", "并行工具执行", "工具组合与依赖", "工具选择策略"],
    projectTitle: "工具编排调度器"
  },
  {
    id: "ai-agent-long-memory",
    number: 5,
    title: "长期记忆与向量检索",
    summary: "Embedding、向量存储、记忆分层、压缩遗忘与污染防护。",
    lessons: ["Embedding 生成", "向量存储检索", "记忆分层", "写入策略"],
    projectTitle: "长期记忆检索增强系统"
  },
  {
    id: "ai-agent-evaluation-observability",
    number: 6,
    title: "Agent 评测与可观测",
    summary: "Trace、指标、评测数据集、A/B 对比与回归告警。",
    lessons: ["结构化 Trace", "关键指标", "评测数据集", "离线批量评测"],
    projectTitle: "Agent 评测流水线"
  },
  {
    id: "ai-agent-safety-alignment",
    number: 7,
    title: "安全对齐与防护",
    summary: "Prompt Injection、越狱、内容审核、权限沙箱与人在回路。",
    lessons: ["Injection 检测", "越狱防御", "内容审核", "权限沙箱"],
    projectTitle: "Agent 安全防线"
  },
  {
    id: "ai-agent-multimodal-execution",
    number: 8,
    title: "多模态与代码执行",
    summary: "视觉输入、音频转录、代码沙箱、Web/GUI 操作与反馈闭环。",
    lessons: ["图像输入", "音频转录", "代码沙箱", "文件读写"],
    projectTitle: "多模态执行 Agent"
  },
  {
    id: "ai-agent-production-deploy",
    number: 9,
    title: "生产化部署",
    summary: "模型路由、成本控制、限流、多租户、灰度与 SLO。",
    lessons: ["模型路由与降级", "成本控制", "限流与背压", "多租户隔离"],
    projectTitle: "生产化 Agent 服务"
  },
  {
    id: "ai-agent-platform-pipeline",
    number: 10,
    title: "端到端 Agent 平台",
    summary: "意图识别、任务规划、工具编排、记忆、评测、安全、部署与运营的完整平台。",
    lessons: ["意图识别", "任务规划", "工具编排", "记忆集成"],
    projectTitle: "端到端 Agent 平台"
  }
] as const satisfies readonly PlannedStageSeed[];

const aiAgentPublishedLessonsByStageId = new Map<StageId, readonly LessonSpec[]>([
  ["ai-agent-tool-orchestration", aiAgentStageFourToolOrchestrationLessons],
  ["ai-agent-long-memory", aiAgentStageFiveLongMemoryLessons],
  ["ai-agent-evaluation-observability", aiAgentStageSixEvaluationObservabilityLessons],
  ["ai-agent-safety-alignment", aiAgentStageSevenSafetyAlignmentLessons],
  ["ai-agent-multimodal-execution", aiAgentStageEightMultimodalExecutionLessons],
  ["ai-agent-production-deploy", aiAgentStageNineProductionDeployLessons],
  ["ai-agent-platform-pipeline", aiAgentStageTenPlatformPipelineLessons]
]);

// AI Agent 阶段 00-03 仍来自 blueprint-first-stage.ts；createPlannedStages 会
// 为它们保留兼容的 lesson id (ai-agent-{stageId}-lesson-{n}) 与 published 状态。
const aiAgentPlannedStages = createPlannedStages("ai-agent", aiAgentStageSeeds, 4);

const aiAgentStages = aiAgentStageSeeds.map((seed) => {
  const authored = aiAgentPublishedLessonsByStageId.get(seed.id);
  if (authored) {
    return buildPublishedStageFromLessons(seed, authored);
  }
  return aiAgentPlannedStages[seed.number];
}) satisfies CurriculumStage[];

export const aiAgentCourse = {
  id: "ai-agent",
  domainId: "ai-agent",
  slug: "ai-agent",
  title: "AI Agent",
  description: "从 Observe/Plan/Act/Reflect 循环到工具编排、长期记忆、评测、安全与生产化平台。",
  icon: "AGT",
  status: "preview",
  runtimeSurfaces: ["console", "agent-trace", "runtime-timeline"],
  stages: aiAgentStages
} as const satisfies CourseSpec;

export const aiMathCourse = createPlannedCourse({
  id: "ai-math",
  domainId: "ai-math",
  slug: "ai-math",
  title: "AI 数学基础",
  description: "用图形和实验理解线性代数、概率、微积分、优化与 Transformer 数学。",
  icon: "Σ",
  status: "preview",
  publishedStageCount: 4,
  runtimeSurfaces: ["console", "math-graph-lab", "transformer-visualizer", "runtime-timeline"],
  stages: [
    {
      id: "ai-math-linear-algebra",
      number: 0,
      title: "线性代数与向量空间",
      summary: "向量、矩阵、线性变换和特征值。",
      lessons: ["向量表示", "矩阵乘法", "线性变换", "特征向量"],
      projectTitle: "二维变换实验室"
    },
    {
      id: "ai-math-probability-calculus",
      number: 1,
      title: "概率统计与微积分",
      summary: "分布、期望、方差、导数和链式法则。",
      lessons: ["概率分布", "期望方差", "导数直觉", "链式法则"],
      projectTitle: "损失曲线解释器"
    },
    {
      id: "ai-math-optimization",
      number: 2,
      title: "优化方法",
      summary: "损失函数、梯度下降、学习率和正则化。",
      lessons: ["损失函数", "梯度下降", "学习率", "正则化"],
      projectTitle: "梯度下降可视化"
    },
    {
      id: "ai-math-transformer",
      number: 3,
      title: "Transformer 数学",
      summary: "Embedding、Attention、Softmax 和位置编码。",
      lessons: ["Embedding", "Attention 权重", "Softmax", "位置编码"],
      projectTitle: "Attention 热力图实验"
    }
  ]
});

export const allCourses = [
  nodejsCourse,
  nextjsCourse,
  frontendDebuggingCourse,
  pythonCourse,
  networkCourse,
  serverEngineeringCourse,
  androidCourse,
  aiApplicationCourse,
  aiAgentCourse,
  aiMathCourse
] as const satisfies readonly CourseSpec[];

export function getCourse(courseId: CourseId): CourseSpec {
  const course = allCourses.find((item) => item.id === courseId);

  if (!course) {
    throw new Error(`未知课程：${courseId}`);
  }

  return course;
}

export function getCoursesByDomain(domainId: CourseDomainId): CourseSpec[] {
  return allCourses.filter((course) => course.domainId === domainId);
}

export function getCourseBySlug(slug: string): CourseSpec | undefined {
  return allCourses.find((course) => course.slug === slug);
}
