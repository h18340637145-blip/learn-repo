import type { QuestionBankEntry } from "./apply-question-bank";
import { blueprintMultiStageLessons } from "../lessons/blueprint-multi-stage";
import { aiApplicationStageFourVectorRetrievalLessons } from "../lessons/ai-application/stage-04-vector-retrieval";
import { aiApplicationStageFivePromptChainLessons } from "../lessons/ai-application/stage-05-prompt-chain";
import { aiApplicationStageSixModelSelectionLessons } from "../lessons/ai-application/stage-06-model-selection";
import { aiApplicationStageSevenEvaluationMetricsLessons } from "../lessons/ai-application/stage-07-evaluation-metrics";
import { aiApplicationStageEightCostCachingLessons } from "../lessons/ai-application/stage-08-cost-caching";
import { aiApplicationStageNineObservabilityTracingLessons } from "../lessons/ai-application/stage-09-observability-tracing";
import { aiApplicationStageTenProductionPlatformLessons } from "../lessons/ai-application/stage-10-production-platform";
import {
  buildAiAppP1QuestionBank,
  type AiAppQuestionBankSeedLesson
} from "./ai-application-p1-question-templates";

const aiApplicationBlueprintLessons = blueprintMultiStageLessons.filter((lesson) =>
  lesson.id.startsWith("ai-application-")
) as AiAppQuestionBankSeedLesson[];

const aiApplicationQuestionSeedLessons: AiAppQuestionBankSeedLesson[] = [
  ...aiApplicationBlueprintLessons,
  ...aiApplicationStageFourVectorRetrievalLessons,
  ...aiApplicationStageFivePromptChainLessons,
  ...aiApplicationStageSixModelSelectionLessons,
  ...aiApplicationStageSevenEvaluationMetricsLessons,
  ...aiApplicationStageEightCostCachingLessons,
  ...aiApplicationStageNineObservabilityTracingLessons,
  ...aiApplicationStageTenProductionPlatformLessons
];

export const aiApplicationP1QuestionBank: QuestionBankEntry[] = buildAiAppP1QuestionBank(
  aiApplicationQuestionSeedLessons,
  {
    runtimeLabel: "AI Runtime 现场",
    stageProfile: {
      "ai-app-prompt-rag": ["diagnosis", "repair", "completion"],
      "ai-app-tools-workflows": ["diagnosis", "repair", "execution-order"],
      "ai-app-multimodal-eval": ["execution-order", "diagnosis", "repair"],
      "ai-app-safety-production": ["repair", "diagnosis", "execution-order"],
      "ai-app-vector-retrieval": ["completion", "repair", "diagnosis"],
      "ai-app-prompt-chain": ["diagnosis", "completion", "repair"],
      "ai-app-model-selection": ["diagnosis", "execution-order", "completion"],
      "ai-app-evaluation-metrics": ["repair", "diagnosis", "completion"],
      "ai-app-cost-caching": ["completion", "diagnosis", "repair"],
      "ai-app-observability-tracing": ["execution-order", "repair", "diagnosis"],
      "ai-app-production-platform": ["diagnosis", "execution-order", "repair"]
    }
  }
);
