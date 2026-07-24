import type { QuestionBankEntry } from "./apply-question-bank";
import { blueprintMultiStageLessons } from "../lessons/blueprint-multi-stage";
import { aiAgentStageFourToolOrchestrationLessons } from "../lessons/ai-agent/stage-04-tool-orchestration";
import { aiAgentStageFiveLongMemoryLessons } from "../lessons/ai-agent/stage-05-long-memory";
import { aiAgentStageSixEvaluationObservabilityLessons } from "../lessons/ai-agent/stage-06-evaluation-observability";
import { aiAgentStageSevenSafetyAlignmentLessons } from "../lessons/ai-agent/stage-07-safety-alignment";
import { aiAgentStageEightMultimodalExecutionLessons } from "../lessons/ai-agent/stage-08-multimodal-execution";
import { aiAgentStageNineProductionDeployLessons } from "../lessons/ai-agent/stage-09-production-deploy";
import { aiAgentStageTenPlatformPipelineLessons } from "../lessons/ai-agent/stage-10-platform-pipeline";
import {
  buildAiAgentP1QuestionBank,
  type AiAgentQuestionBankSeedLesson
} from "./ai-agent-p1-question-templates";

const aiAgentBlueprintLessons = blueprintMultiStageLessons.filter((lesson) =>
  lesson.id.startsWith("ai-agent-")
) as AiAgentQuestionBankSeedLesson[];

const aiAgentQuestionSeedLessons: AiAgentQuestionBankSeedLesson[] = [
  ...aiAgentBlueprintLessons,
  ...aiAgentStageFourToolOrchestrationLessons,
  ...aiAgentStageFiveLongMemoryLessons,
  ...aiAgentStageSixEvaluationObservabilityLessons,
  ...aiAgentStageSevenSafetyAlignmentLessons,
  ...aiAgentStageEightMultimodalExecutionLessons,
  ...aiAgentStageNineProductionDeployLessons,
  ...aiAgentStageTenPlatformPipelineLessons
];

export const aiAgentP1QuestionBank: QuestionBankEntry[] = buildAiAgentP1QuestionBank(
  aiAgentQuestionSeedLessons,
  {
    runtimeLabel: "Agent Runtime 现场",
    stageProfile: {
      "ai-agent-loop-planning": ["diagnosis", "repair", "completion"],
      "ai-agent-memory-tools": ["diagnosis", "repair", "execution-order"],
      "ai-agent-multi-agent": ["execution-order", "diagnosis", "repair"],
      "ai-agent-failure-recovery": ["repair", "diagnosis", "execution-order"],
      "ai-agent-tool-orchestration": ["completion", "repair", "diagnosis"],
      "ai-agent-long-memory": ["diagnosis", "completion", "repair"],
      "ai-agent-evaluation-observability": ["diagnosis", "execution-order", "completion"],
      "ai-agent-safety-alignment": ["repair", "diagnosis", "completion"],
      "ai-agent-multimodal-execution": ["completion", "diagnosis", "repair"],
      "ai-agent-production-deploy": ["execution-order", "repair", "diagnosis"],
      "ai-agent-platform-pipeline": ["diagnosis", "execution-order", "repair"]
    }
  }
);
