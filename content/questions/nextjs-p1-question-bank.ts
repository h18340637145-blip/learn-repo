import type { QuestionBankEntry } from "./apply-question-bank";
import { nextjsStageZeroFoundationsLessons } from "../lessons/nextjs/stage-00-foundations";
import { nextjsStageOneRoutingLessons } from "../lessons/nextjs/stage-01-routing";
import { nextjsStageTwoRenderingLessons } from "../lessons/nextjs/stage-02-rendering";
import { nextjsStageThreeDataFetchingLessons } from "../lessons/nextjs/stage-03-data-fetching";
import { nextjsStageFourStylingOptimizationLessons } from "../lessons/nextjs/stage-04-styling-optimization";
import { nextjsStageFiveApiRoutesLessons } from "../lessons/nextjs/stage-05-api-routes";
import { nextjsStageSixAuthMiddlewareLessons } from "../lessons/nextjs/stage-06-auth-middleware";
import { nextjsStageSevenDatabaseLessons } from "../lessons/nextjs/stage-07-database";
import { nextjsStageEightTestingDeploymentLessons } from "../lessons/nextjs/stage-08-testing-deployment";
import { nextjsStageNineArchitectureAdvancedLessons } from "../lessons/nextjs/stage-09-architecture";
import { buildP1QuestionBank, type QuestionBankSeedLesson } from "./p1-question-templates";

const nextjsQuestionSeedLessons: QuestionBankSeedLesson[] = [
  ...nextjsStageZeroFoundationsLessons,
  ...nextjsStageOneRoutingLessons,
  ...nextjsStageTwoRenderingLessons,
  ...nextjsStageThreeDataFetchingLessons,
  ...nextjsStageFourStylingOptimizationLessons,
  ...nextjsStageFiveApiRoutesLessons,
  ...nextjsStageSixAuthMiddlewareLessons,
  ...nextjsStageSevenDatabaseLessons,
  ...nextjsStageEightTestingDeploymentLessons,
  ...nextjsStageNineArchitectureAdvancedLessons
];

export const nextjsP1QuestionBank: QuestionBankEntry[] = buildP1QuestionBank(nextjsQuestionSeedLessons, {
  courseLabel: "Next.js",
  runtimeLabel: "Next.js App Router 运行现场",
  stageProfile: {
    "nextjs-foundations": ["completion", "repair", "diagnosis"],
    "nextjs-routing": ["completion", "diagnosis", "repair"],
    "nextjs-rendering": ["diagnosis", "execution-order", "repair"],
    "nextjs-data-fetching": ["repair", "execution-order", "diagnosis"],
    "nextjs-styling-optimization": ["diagnosis", "completion", "repair"],
    "nextjs-api-routes": ["repair", "diagnosis", "completion"],
    "nextjs-auth-middleware": ["diagnosis", "repair", "execution-order"],
    "nextjs-database": ["diagnosis", "repair", "completion"],
    "nextjs-testing-deployment": ["completion", "diagnosis", "repair"],
    "nextjs-advanced-patterns": ["execution-order", "diagnosis", "repair"]
  }
});
