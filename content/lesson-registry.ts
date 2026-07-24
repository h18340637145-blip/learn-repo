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
import { applyQuestionBank } from "./questions/apply-question-bank";
import { nextjsP1QuestionBank } from "./questions/nextjs-p1-question-bank";
import { nodejsP1QuestionBank } from "./questions/nodejs-p1-question-bank";

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

  return blueprintPreviewLessonsByCourse.get(courseId) ?? [];
}
