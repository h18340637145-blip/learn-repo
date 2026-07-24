import type { QuestionBankEntry } from "./apply-question-bank";
import { blueprintMultiStageLessons } from "../lessons/blueprint-multi-stage";
import { serverEngineeringStageFourMicroservicesLessons } from "../lessons/server-engineering/stage-04-microservices";
import { serverEngineeringStageFiveDistributedDataLessons } from "../lessons/server-engineering/stage-05-distributed-data";
import { serverEngineeringStageSixMessageQueueLessons } from "../lessons/server-engineering/stage-06-message-queue";
import { serverEngineeringStageSevenSecurityAuthLessons } from "../lessons/server-engineering/stage-07-security-auth";
import { serverEngineeringStageEightCiCdLessons } from "../lessons/server-engineering/stage-08-ci-cd";
import { serverEngineeringStageNineObservabilityLessons } from "../lessons/server-engineering/stage-09-observability";
import { serverEngineeringStageTenPlatformEngineeringLessons } from "../lessons/server-engineering/stage-10-platform-engineering";
import {
  buildAiAppP1QuestionBank,
  type AiAppQuestionBankSeedLesson
} from "./server-engineering-p1-question-templates";

const serverEngineeringBlueprintLessons = blueprintMultiStageLessons.filter((lesson) =>
  lesson.id.startsWith("server-engineering-")
) as AiAppQuestionBankSeedLesson[];

const serverEngineeringQuestionSeedLessons: AiAppQuestionBankSeedLesson[] = [
  ...serverEngineeringBlueprintLessons,
  ...serverEngineeringStageFourMicroservicesLessons,
  ...serverEngineeringStageFiveDistributedDataLessons,
  ...serverEngineeringStageSixMessageQueueLessons,
  ...serverEngineeringStageSevenSecurityAuthLessons,
  ...serverEngineeringStageEightCiCdLessons,
  ...serverEngineeringStageNineObservabilityLessons,
  ...serverEngineeringStageTenPlatformEngineeringLessons
];

export const serverEngineeringP1QuestionBank: QuestionBankEntry[] = buildAiAppP1QuestionBank(
  serverEngineeringQuestionSeedLessons,
  {
    runtimeLabel: "Server Runtime 现场",
    stageProfile: {
      "server-api-design": ["diagnosis", "repair", "completion"],
      "server-database-cache": ["diagnosis", "repair", "execution-order"],
      "server-queue-observability": ["execution-order", "diagnosis", "repair"],
      "server-production-incidents": ["repair", "diagnosis", "execution-order"],
      "server-microservices": ["completion", "repair", "diagnosis"],
      "server-distributed-data": ["diagnosis", "completion", "repair"],
      "server-message-queue": ["diagnosis", "execution-order", "completion"],
      "server-security-auth": ["repair", "diagnosis", "completion"],
      "server-ci-cd": ["completion", "diagnosis", "repair"],
      "server-observability": ["execution-order", "repair", "diagnosis"],
      "server-platform-engineering": ["diagnosis", "execution-order", "repair"]
    }
  }
);
