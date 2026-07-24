export type CourseDomainId =
  | "language"
  | "frontend"
  | "network"
  | "server"
  | "android"
  | "ai-application"
  | "ai-agent"
  | "ai-math";

export type CourseId =
  | "nodejs"
  | "nextjs"
  | "frontend-debugging"
  | "python"
  | "network"
  | "server-engineering"
  | "android"
  | "ai-application"
  | "ai-agent"
  | "ai-math";

export type CourseStatus = "published" | "preview" | "planned";

export type RuntimeSurface =
  | "console"
  | "micro-browser"
  | "network-trace"
  | "memory-stack"
  | "runtime-timeline"
  | "incident-hud"
  | "android-system-trace"
  | "agent-trace"
  | "math-graph-lab"
  | "transformer-visualizer";

export type StageId =
  // Node.js stages
  | "foundations"
  | "runtime-cli"
  | "modules-packages"
  | "async-events"
  | "files-streams"
  | "http-foundations"
  | "api-design"
  | "process-concurrency"
  | "realtime"
  | "testing-security"
  | "diagnostics-production"
  // Next.js stages
  | "nextjs-foundations"
  | "nextjs-routing"
  | "nextjs-rendering"
  | "nextjs-data-fetching"
  | "nextjs-styling-optimization"
  | "nextjs-api-routes"
  | "nextjs-auth-middleware"
  | "nextjs-database"
  | "nextjs-testing-deployment"
  | "nextjs-advanced-patterns"
  // Frontend debugging stages
  | "frontend-debugging-console-stack"
  // Planned blueprint stages
  | "python-foundations"
  | "python-data-structures"
  | "python-modules-testing"
  | "python-async-services"
  | "network-url-dns"
  | "network-http-cache"
  | "network-security-realtime"
  | "network-gateway-debugging"
  | "server-api-design"
  | "server-database-cache"
  | "server-queue-observability"
  | "server-production-incidents"
  | "android-app-foundations"
  | "android-jetpack-compose"
  | "android-framework-binder"
  | "android-performance-native"
  | "ai-app-prompt-rag"
  | "ai-app-tools-workflows"
  | "ai-app-multimodal-eval"
  | "ai-app-safety-production"
  | "ai-agent-loop-planning"
  | "ai-agent-memory-tools"
  | "ai-agent-multi-agent"
  | "ai-agent-failure-recovery"
  | "ai-math-linear-algebra"
  | "ai-math-probability-calculus"
  | "ai-math-optimization"
  | "ai-math-transformer";

export type LessonKind = "knowledge" | "stage-project" | "final-project";
export type LessonStatus = "published" | "planned";
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
  | "transfer"
  | "trace-debug"
  | "network-debug"
  | "visual-math"
  | "agent-debug"
  | "android-stack-debug";
export type SourceType = "official" | "engineering-extension";
export type CodeLanguage =
  | "js"
  | "ts"
  | "tsx"
  | "json"
  | "bash"
  | "text"
  | "c"
  | "cpp"
  | "py"
  | "kt"
  | "java"
  | "html"
  | "css"
  | "math";
export type VisualizerType =
  | "lane-flow"
  | "http-pipeline"
  | "service-boundary"
  | "worker-pool"
  | "realtime-mesh"
  | "quality-shield"
  | "diagnostics-tower"
  | "stage-project-core"
  | "generic-particle-flow"
  // Next.js visualizers
  | "nextjs-render-pipeline"
  | "nextjs-routing-tree"
  | "nextjs-component-boundary"
  | "nextjs-data-flow"
  | "nextjs-middleware-chain"
  | "nextjs-build-output"
  | "frontend-error-stack"
  | "browser-network-debug"
  | "memory-stack"
  | "android-system-trace"
  | "agent-trace"
  | "math-graph-lab"
  | "transformer-attention";

export type VisualizerSpec = {
  type: VisualizerType;
  title: string;
  readonly nodes: readonly string[];
};

export type CatalogLesson = {
  id: string;
  title: string;
  order: number;
  kind: LessonKind;
  status: LessonStatus;
};

export type CurriculumStage = {
  id: StageId;
  number: number;
  title: string;
  summary: string;
  lessons: readonly CatalogLesson[];
  project: CatalogLesson;
};

export type CourseSpec = {
  id: CourseId;
  domainId: CourseDomainId;
  slug: string;
  title: string;
  description: string;
  icon: string;
  status: CourseStatus;
  runtimeSurfaces: readonly RuntimeSurface[];
  stages: readonly CurriculumStage[];
};

export type LessonSource = {
  type: SourceType;
  title: string;
  url: string;
  verifiedAt: string;
};

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
  materialTitle?: string;
  materialCode?: string;
  materialLanguage?: CodeLanguage;
  expectedOutput?: string;
  orderItems?: string[];
  options: AnswerOption[];
  answerId: string;
  correctExplanation: string;
  required?: boolean;
  estimatedSeconds?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
};

export type RunnerFrame = {
  activeLane: number;
  laneValues: string[];
  log: string[];
  note: string;
  delayMs: number;
};

export type AuthoredTraceExecution = {
  mode: "authored-trace";
  visualizer: VisualizerSpec;
  lanes: string[];
  frames: RunnerFrame[];
};

export type MicroBrowserSpec = {
  url: string;
  statusCode?: number;
  contentType?: "text/html" | "application/json" | "ui-card";
  renderedHtml?: string;
  jsonOutput?: Record<string, unknown> | Array<unknown>;
  uiComponentKey?: string;
  headers?: Record<string, string>;
};

export type ProductionIncidentMetric = {
  label: string;
  incident: string;
  patching: string;
  critical: string;
  restored: string;
};

export type ProductionIncidentSpec = {
  title?: string;
  summary: string;
  metrics: ProductionIncidentMetric[];
  recoveryMessage?: string;
  runbook?: string[];
};

export type ProjectStep = {
  id: string;
  title: string;
  context: string;
  files: { name: string; code: string }[];
  entryFile: string;
  question: LessonQuestion;
  execution?: AuthoredTraceExecution;
  preview?: MicroBrowserSpec;
  incident?: ProductionIncidentSpec;
};

export type LessonSpec = {
  id: string;
  stageId: StageId;
  kind: LessonKind;
  eyebrow: string;
  title: string;
  durationMinutes: number;
  difficulty: "基础" | "进阶";
  nodeVersion: string;
  objectives: string[];
  prerequisites: string[];
  concept: string;
  points: string[];
  memoryHook: string;
  files?: { name: string; code: string }[];
  entryFile?: string;
  questions: LessonQuestion[];
  execution?: AuthoredTraceExecution;
  preview?: MicroBrowserSpec;
  incident?: ProductionIncidentSpec;
  summary: string[];
  sources: LessonSource[];

  // Multi-step project extensions (V1.3)
  brief?: string;
  steps?: ProjectStep[];
  finalFiles?: { name: string; code: string }[];
  finalExecution?: AuthoredTraceExecution;
};
