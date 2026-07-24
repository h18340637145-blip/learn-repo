import type { QuestionBankEntry } from "./apply-question-bank";
import { pythonStageZeroFoundationsLessons } from "../lessons/python/stage-00-foundations";
import { pythonStageOneDataStructuresLessons } from "../lessons/python/stage-01-data-structures";
import { pythonStageTwoModulesTestingLessons } from "../lessons/python/stage-02-modules-testing";
import { pythonStageThreeAsyncServicesLessons } from "../lessons/python/stage-03-async-services";
import { pythonStageFourFileBatchLessons } from "../lessons/python/stage-04-file-batch";
import { pythonStageFiveRegexParsingLessons } from "../lessons/python/stage-05-regex-parsing";
import { pythonStageSixHttpScrapingLessons } from "../lessons/python/stage-06-http-scraping";
import { pythonStageSevenCliToolsLessons } from "../lessons/python/stage-07-cli-tools";
import { pythonStageEightSchedulingLessons } from "../lessons/python/stage-08-scheduling";
import { pythonStageNineOpsProcessLessons } from "../lessons/python/stage-09-ops-process";
import { pythonStageTenAutomationPipelineLessons } from "../lessons/python/stage-10-automation-pipeline";
import {
  buildPythonP1QuestionBank,
  type PythonQuestionBankSeedLesson
} from "./python-p1-question-templates";

const pythonQuestionSeedLessons: PythonQuestionBankSeedLesson[] = [
  ...pythonStageZeroFoundationsLessons,
  ...pythonStageOneDataStructuresLessons,
  ...pythonStageTwoModulesTestingLessons,
  ...pythonStageThreeAsyncServicesLessons,
  ...pythonStageFourFileBatchLessons,
  ...pythonStageFiveRegexParsingLessons,
  ...pythonStageSixHttpScrapingLessons,
  ...pythonStageSevenCliToolsLessons,
  ...pythonStageEightSchedulingLessons,
  ...pythonStageNineOpsProcessLessons,
  ...pythonStageTenAutomationPipelineLessons
];

export const pythonP1QuestionBank: QuestionBankEntry[] = buildPythonP1QuestionBank(pythonQuestionSeedLessons, {
  runtimeLabel: "Python 运行现场",
  stageProfile: {
    "python-foundations": ["completion", "repair", "diagnosis"],
    "python-data-structures": ["diagnosis", "execution-order", "completion"],
    "python-modules-testing": ["diagnosis", "repair", "completion"],
    "python-async-services": ["execution-order", "repair", "diagnosis"],
    "python-file-batch": ["repair", "diagnosis", "execution-order"],
    "python-regex-parsing": ["repair", "diagnosis", "completion"],
    "python-http-scraping": ["diagnosis", "repair", "completion"],
    "python-cli-tools": ["execution-order", "diagnosis", "repair"],
    "python-scheduling": ["execution-order", "diagnosis", "repair"],
    "python-ops-process": ["diagnosis", "completion", "repair"],
    "python-automation-pipeline": ["diagnosis", "execution-order", "completion"]
  }
});
