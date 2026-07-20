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
import { buildP1QuestionBank, type QuestionBankSeedLesson } from "./p1-question-templates";

const legacyStageFourQuestionSeeds: QuestionBankSeedLesson[] = [
  {
    id: "stream-backpressure",
    stageId: "files-streams",
    kind: "knowledge",
    title: "Stream 背压与 drain",
    concept: "当 writable.write() 返回 false，生产者应该暂停写入并等待 drain 事件，避免缓冲区持续膨胀。",
    points: ["write 返回 false 代表缓冲压力", "drain 事件代表可以恢复写入", "背压保护内存和吞吐稳定性"],
    memoryHook: "write 返回 false → 等待 drain",
    files: [{
      name: "lesson.js",
      code: `if (!writable.write(chunk)) {
  await once(writable, "drain");
}
console.log("resume writing");`
    }],
    entryFile: "lesson.js"
  },
  {
    id: "project-cli-log-analyzer",
    stageId: "files-streams",
    kind: "stage-project",
    title: "CLI 日志分析器",
    concept: "用文件流逐行读取日志，校验日志级别，再聚合 INFO、WARN、ERROR 等统计结果。",
    points: ["流式读取大文件", "先校验日志级别再计数", "输出聚合报告"],
    memoryHook: "流式读取 → 校验输入 → 聚合报告",
    files: [{
      name: "analyze.js",
      code: `for await (const line of source) {
  const level = parseLevel(line);
  if (level in counts) counts[level] += 1;
}
console.table(counts);`
    }],
    entryFile: "analyze.js"
  }
];

const nodejsQuestionSeedLessons: QuestionBankSeedLesson[] = [
  ...stageZeroFoundationsLessons,
  ...stageOneRuntimeCliLessons,
  ...stageTwoModulesPackagesLessons,
  ...stageThreeAsyncEventsLessons,
  ...legacyStageFourQuestionSeeds,
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
