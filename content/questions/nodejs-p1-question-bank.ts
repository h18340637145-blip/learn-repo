import type { QuestionBankEntry } from "./apply-question-bank";
import { stageZeroFoundationsLessons } from "../lessons/stage-00-foundations";
import { stageOneRuntimeCliLessons } from "../lessons/stage-01-runtime-cli";
import { stageTwoModulesPackagesLessons } from "../lessons/stage-02-modules-packages";
import { stageThreeAsyncEventsLessons } from "../lessons/stage-03-async-events";
import { stageFiveHttpFoundationsLessons } from "../lessons/stage-05-http-foundations";
import { stageSixApiDesignLessons } from "../lessons/stage-06-api-design";
import { stageSevenProcessConcurrencyLessons } from "../lessons/stage-07-process-concurrency";
import { stageEightRealtimeLessons } from "../lessons/stage-08-realtime";
import { stageNineTestingSecurityLessons } from "../lessons/stage-09-testing-security";
import { stageTenDiagnosticsProductionLessons } from "../lessons/stage-10-diagnostics-production";
import { stageFourFilesStreamsLessons } from "../lessons/stage-04-files-streams";
import { buildP1QuestionBank, type QuestionBankSeedLesson } from "./p1-question-templates";



const nodejsQuestionSeedLessons: QuestionBankSeedLesson[] = [
  ...stageZeroFoundationsLessons,
  ...stageOneRuntimeCliLessons,
  ...stageTwoModulesPackagesLessons,
  ...stageThreeAsyncEventsLessons,
  ...stageFourFilesStreamsLessons,
  ...stageFiveHttpFoundationsLessons,
  ...stageSixApiDesignLessons,
  ...stageSevenProcessConcurrencyLessons,
  ...stageEightRealtimeLessons,
  ...stageNineTestingSecurityLessons,
  ...stageTenDiagnosticsProductionLessons
];

export const nodejsP1QuestionBank: QuestionBankEntry[] = buildP1QuestionBank(nodejsQuestionSeedLessons, {
  courseLabel: "Node.js",
  runtimeLabel: "Node.js 运行现场",
  stageProfile: {
    foundations: ["completion", "repair", "diagnosis"],
    "runtime-cli": ["diagnosis", "execution-order", "completion"],
    "modules-packages": ["diagnosis", "repair", "completion"],
    "async-events": ["execution-order", "repair", "diagnosis"],
    "files-streams": ["repair", "diagnosis", "execution-order"],
    "http-foundations": ["repair", "diagnosis", "completion"],
    "api-design": ["diagnosis", "repair", "completion"],
    "process-concurrency": ["execution-order", "diagnosis", "repair"],
    realtime: ["execution-order", "diagnosis", "repair"],
    "testing-security": ["diagnosis", "completion", "repair"],
    "diagnostics-production": ["diagnosis", "execution-order", "completion"]
  }
});
