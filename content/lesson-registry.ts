import type { CourseId, LessonSpec } from "../lib/curriculum/types";
import { stageZeroFoundationsLessons } from "./lessons/stage-00-foundations";
import { stageOneRuntimeCliLessons } from "./lessons/stage-01-runtime-cli";
import { stageTwoModulesPackagesLessons } from "./lessons/stage-02-modules-packages";
import { stageThreeAsyncEventsLessons } from "./lessons/stage-03-async-events";
import { stageFourFilesStreamsLessons } from "./lessons/stage-04-files-streams";
import { stageFiveHttpFoundationsLessons } from "./lessons/stage-05-http-foundations";
import { stageSixApiDesignLessons } from "./lessons/stage-06-api-design";
import { stageSevenProcessConcurrencyLessons } from "./lessons/stage-07-process-concurrency";
import { stageEightRealtimeLessons } from "./lessons/stage-08-realtime";
import { stageNineTestingSecurityLessons } from "./lessons/stage-09-testing-security";
import { stageTenDiagnosticsProductionLessons } from "./lessons/stage-10-diagnostics-production";
// Next.js lessons
import { nextjsStageZeroFoundationsLessons } from "./lessons/nextjs/stage-00-foundations";
import { nextjsStageOneRoutingLessons } from "./lessons/nextjs/stage-01-routing";
import { nextjsStageTwoRenderingLessons } from "./lessons/nextjs/stage-02-rendering";
import { nextjsStageThreeDataFetchingLessons } from "./lessons/nextjs/stage-03-data-fetching";
import { nextjsStageFourStylingOptimizationLessons } from "./lessons/nextjs/stage-04-styling-optimization";
import { nextjsStageFiveApiRoutesLessons } from "./lessons/nextjs/stage-05-api-routes";
import { nextjsStageSixAuthMiddlewareLessons } from "./lessons/nextjs/stage-06-auth-middleware";
import { nextjsStageSevenDatabaseLessons } from "./lessons/nextjs/stage-07-database";
import { nextjsStageEightTestingDeploymentLessons } from "./lessons/nextjs/stage-08-testing-deployment";
import { nextjsStageNineArchitectureAdvancedLessons } from "./lessons/nextjs/stage-09-architecture";
import { frontendDebuggingStageZeroLessons } from "./lessons/frontend-debugging/stage-00-console-stack";
import { frontendDebuggingExpandedLessons } from "./lessons/frontend-debugging/expanded-stages";
import { blueprintMultiStageLessons } from "./lessons/blueprint-multi-stage";
// Python published lessons (stages 00-10)
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
// AI Agent real-content lessons (stages 04-10)
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
// Server Engineering real-content lessons (stages 04-10)
import { serverEngineeringStageFourMicroservicesLessons } from "./lessons/server-engineering/stage-04-microservices";
import { serverEngineeringStageFiveDistributedDataLessons } from "./lessons/server-engineering/stage-05-distributed-data";
import { serverEngineeringStageSixMessageQueueLessons } from "./lessons/server-engineering/stage-06-message-queue";
import { serverEngineeringStageSevenSecurityAuthLessons } from "./lessons/server-engineering/stage-07-security-auth";
import { serverEngineeringStageEightCiCdLessons } from "./lessons/server-engineering/stage-08-ci-cd";
import { serverEngineeringStageNineObservabilityLessons } from "./lessons/server-engineering/stage-09-observability";
import { serverEngineeringStageTenPlatformEngineeringLessons } from "./lessons/server-engineering/stage-10-platform-engineering";
import { applyQuestionBank } from "./questions/apply-question-bank";
import { nextjsP1QuestionBank } from "./questions/nextjs-p1-question-bank";
import { nodejsP1QuestionBank } from "./questions/nodejs-p1-question-bank";
import { pythonP1QuestionBank } from "./questions/python-p1-question-bank";
import { aiAgentP1QuestionBank } from "./questions/ai-agent-p1-question-bank";
import { aiApplicationP1QuestionBank } from "./questions/ai-application-p1-question-bank";
import { serverEngineeringP1QuestionBank } from "./questions/server-engineering-p1-question-bank";

const basePublishedLessons = [
  stageZeroFoundationsLessons,
  stageOneRuntimeCliLessons,
  stageTwoModulesPackagesLessons,
  stageThreeAsyncEventsLessons,
  stageFourFilesStreamsLessons,
  stageFiveHttpFoundationsLessons,
  stageSixApiDesignLessons,
  stageSevenProcessConcurrencyLessons,
  stageEightRealtimeLessons,
  stageNineTestingSecurityLessons,
  stageTenDiagnosticsProductionLessons
].flat() satisfies LessonSpec[];

export const publishedLessons = applyQuestionBank(basePublishedLessons, nodejsP1QuestionBank) satisfies LessonSpec[];

const lessonById = new Map(publishedLessons.map((lesson) => [lesson.id, lesson]));

export function getLesson(id: string): LessonSpec | undefined {
  return lessonById.get(id);
}

// ── Next.js published lessons ──────────────────────────────
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

export const nextjsPublishedLessons = applyQuestionBank(
  baseNextjsPublishedLessons,
  nextjsP1QuestionBank
) satisfies LessonSpec[];

const nextjsLessonById = new Map(nextjsPublishedLessons.map((lesson) => [lesson.id, lesson]));

export function getNextjsLesson(id: string): LessonSpec | undefined {
  return nextjsLessonById.get(id);
}

// ── Frontend debugging published lessons ───────────────────
export const frontendDebuggingPublishedLessons = [
  ...frontendDebuggingStageZeroLessons,
  ...frontendDebuggingExpandedLessons
] satisfies LessonSpec[];

// ── Python published lessons (stages 00-10) ───────────────
const basePythonPublishedLessons = [
  pythonStageZeroFoundationsLessons,
  pythonStageOneDataStructuresLessons,
  pythonStageTwoModulesTestingLessons,
  pythonStageThreeAsyncServicesLessons,
  pythonStageFourFileBatchLessons,
  pythonStageFiveRegexParsingLessons,
  pythonStageSixHttpScrapingLessons,
  pythonStageSevenCliToolsLessons,
  pythonStageEightSchedulingLessons,
  pythonStageNineOpsProcessLessons,
  pythonStageTenAutomationPipelineLessons
].flat() satisfies LessonSpec[];

export const pythonPublishedLessons = applyQuestionBank(
  basePythonPublishedLessons,
  pythonP1QuestionBank
) satisfies LessonSpec[];

// ── AI Agent real-content lessons (stages 04-10) ──────────
// Stages 00-03 remain blueprint-generated in blueprintPreviewLessonsByCourse.
// Stages 04-10 use dedicated content files mirroring the Python pattern.
const baseAiAgentRealLessons = [
  aiAgentStageFourToolOrchestrationLessons,
  aiAgentStageFiveLongMemoryLessons,
  aiAgentStageSixEvaluationObservabilityLessons,
  aiAgentStageSevenSafetyAlignmentLessons,
  aiAgentStageEightMultimodalExecutionLessons,
  aiAgentStageNineProductionDeployLessons,
  aiAgentStageTenPlatformPipelineLessons
].flat() satisfies LessonSpec[];

export const aiAgentRealLessons: LessonSpec[] = baseAiAgentRealLessons;

// ── AI Application real-content lessons (stages 04-10) ──────
const baseAiApplicationRealLessons = [
  aiApplicationStageFourVectorRetrievalLessons,
  aiApplicationStageFivePromptChainLessons,
  aiApplicationStageSixModelSelectionLessons,
  aiApplicationStageSevenEvaluationMetricsLessons,
  aiApplicationStageEightCostCachingLessons,
  aiApplicationStageNineObservabilityTracingLessons,
  aiApplicationStageTenProductionPlatformLessons
].flat() satisfies LessonSpec[];

export const aiApplicationRealLessons: LessonSpec[] = baseAiApplicationRealLessons;

// ── Server Engineering real-content lessons (stages 04-10) ──────
const baseServerEngineeringRealLessons = [
  serverEngineeringStageFourMicroservicesLessons,
  serverEngineeringStageFiveDistributedDataLessons,
  serverEngineeringStageSixMessageQueueLessons,
  serverEngineeringStageSevenSecurityAuthLessons,
  serverEngineeringStageEightCiCdLessons,
  serverEngineeringStageNineObservabilityLessons,
  serverEngineeringStageTenPlatformEngineeringLessons
].flat() satisfies LessonSpec[];

export const serverEngineeringRealLessons: LessonSpec[] = baseServerEngineeringRealLessons;

export const blueprintPreviewLessons = blueprintMultiStageLessons satisfies LessonSpec[];

const blueprintPreviewLessonsByCourse = new Map<CourseId, LessonSpec[]>();

for (const lesson of blueprintPreviewLessons) {
  const courseId = lesson.id.split("-")[0] as CourseId;
  const normalizedCourseId = lesson.id.startsWith("server-engineering-")
    ? "server-engineering"
    : lesson.id.startsWith("ai-application-")
      ? "ai-application"
      : lesson.id.startsWith("ai-agent-")
        ? "ai-agent"
        : lesson.id.startsWith("ai-math-")
          ? "ai-math"
          : courseId;
  blueprintPreviewLessonsByCourse.set(normalizedCourseId, [
    ...(blueprintPreviewLessonsByCourse.get(normalizedCourseId) ?? []),
    lesson
  ]);
}

// ── Course-based access ────────────────────────────────────
export function getLessonsByCourse(courseId: CourseId): LessonSpec[] {
  if (courseId === "nodejs") return publishedLessons;
  if (courseId === "nextjs") return nextjsPublishedLessons;
  if (courseId === "frontend-debugging") return frontendDebuggingPublishedLessons;
  if (courseId === "python") return pythonPublishedLessons;
  if (courseId === "ai-agent") {
    const blueprintLessons = blueprintPreviewLessonsByCourse.get("ai-agent") ?? [];
    return applyQuestionBank([...blueprintLessons, ...aiAgentRealLessons], aiAgentP1QuestionBank);
  }
  if (courseId === "ai-application") {
    const blueprintLessons = blueprintPreviewLessonsByCourse.get("ai-application") ?? [];
    return applyQuestionBank([...blueprintLessons, ...aiApplicationRealLessons], aiApplicationP1QuestionBank);
  }
  if (courseId === "server-engineering") {
    const blueprintLessons = blueprintPreviewLessonsByCourse.get("server-engineering") ?? [];
    return applyQuestionBank([...blueprintLessons, ...serverEngineeringRealLessons], serverEngineeringP1QuestionBank);
  }

  return blueprintPreviewLessonsByCourse.get(courseId) ?? [];
}
