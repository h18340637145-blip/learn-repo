import type { DifficultyStars, LessonKind, LessonQuestion, LessonSpec, RunnerFrame, StageId } from "../../../lib/curriculum/types";
import { createLessonSpec } from "../lesson-factory";

const source = (title: string, url: string) => ({ title, url });

/**
 * Python 阶段案例种子。用于 04-10 阶段的批量内容生成，保持工厂 API 与 Node.js
 * 侧一致，方便后续复用可视化和运行时组件。
 */
export type PythonLessonSeed = {
  id: string;
  stageId: StageId;
  order: number;
  eyebrowStage: string;
  title: string;
  concept: string;
  points: [string, string, string];
  memoryHook: string;
  fileName: string;
  code: string;
  prompt: string;
  correct: string;
  wrong: string;
  output: string;
  lanes: [string, string, string];
  laneValues: [string, string, string];
  log: string[];
  summary: string[];
  sourceTitle: string;
  sourceUrl: string;
  objectives?: string[];
  prerequisites?: string[];
  difficultyStars?: DifficultyStars;
  difficulty?: "基础" | "进阶";
  correctFeedback?: string;
  wrongFeedback?: string;
  additionalWrong?: { label: string; feedback: string };
};

function buildFrames(seed: PythonLessonSeed): RunnerFrame[] {
  return [
    {
      activeLane: 0,
      laneValues: [seed.laneValues[0], "等待", "等待"],
      log: seed.log.slice(0, 1),
      note: `${seed.lanes[0]}：${seed.laneValues[0]}`,
      delayMs: 320
    },
    {
      activeLane: 1,
      laneValues: ["完成", seed.laneValues[1], "等待"],
      log: seed.log.slice(0, 2),
      note: `${seed.lanes[1]}：${seed.laneValues[1]}`,
      delayMs: 720
    },
    {
      activeLane: 2,
      laneValues: ["完成", "完成", seed.laneValues[2]],
      log: seed.log,
      note: `${seed.lanes[2]}：${seed.laneValues[2]}`,
      delayMs: 720
    }
  ];
}

export function createPythonLesson(seed: PythonLessonSeed): LessonSpec {
  const kind: LessonKind = "knowledge";
  const options = [
    {
      id: "a",
      label: seed.wrong,
      detail: "忽略了 Python 运行边界",
      feedback: seed.wrongFeedback ?? `注意：${seed.memoryHook}`
    },
    {
      id: "b",
      label: seed.correct,
      detail: "符合 Python 运行模型",
      feedback: seed.correctFeedback ?? `正确：${seed.memoryHook}`
    }
  ];

  if (seed.additionalWrong) {
    options.push({
      id: "c",
      label: seed.additionalWrong.label,
      detail: "边界条件错误",
      feedback: seed.additionalWrong.feedback
    });
  }

  return createLessonSpec({
    id: seed.id,
    stageId: seed.stageId,
    kind,
    eyebrow: `${String(stageNumber(seed.stageId)).padStart(2, "0")}.${seed.order} · ${seed.eyebrowStage}`,
    title: seed.title,
    durationMinutes: 10,
    difficulty: seed.difficulty ?? (seed.order >= 6 ? "进阶" : "基础"),
    difficultyStars: seed.difficultyStars ?? (seed.order >= 7 ? 3 : seed.order >= 4 ? 2 : 1),
    nodeVersion: "Python 3.12",
    objectives: seed.objectives ?? [`掌握${seed.title}的核心运行模型`, "在真实脚本中定位并解释关键行为"],
    prerequisites: seed.prerequisites ?? [],
    concept: seed.concept,
    points: [...seed.points],
    memoryHook: seed.memoryHook,
    files: [{ name: seed.fileName, code: seed.code }],
    entryFile: seed.fileName,
    answer: {
      type: seed.order % 2 === 0 ? "best-practice" : "prediction",
      prompt: seed.prompt,
      options,
      answerId: "b",
      correctExplanation: seed.correctFeedback ?? seed.memoryHook
    },
    execution: {
      lanes: seed.lanes,
      frames: buildFrames(seed)
    },
    summary: seed.summary,
    sources: [source(seed.sourceTitle, seed.sourceUrl)]
  });
}

export type PythonStageProjectSeed = {
  id: string;
  stageId: StageId;
  eyebrowStage: string;
  title: string;
  brief: string;
  concept: string;
  points: [string, string, string];
  memoryHook: string;
  fileName: string;
  code: string;
  prompt: string;
  correct: string;
  wrong: string;
  additionalWrong?: { label: string; feedback: string };
  correctFeedback: string;
  wrongFeedback: string;
  lanes: [string, string, string];
  laneValues: [string, string, string];
  log: string[];
  summary: string[];
  sourceTitle: string;
  sourceUrl: string;
  objectives?: string[];
  prerequisites?: string[];
};

export function createPythonStageProject(seed: PythonStageProjectSeed): LessonSpec {
  const stageNum = stageNumber(seed.stageId);
  const options = [
    { id: "a", label: seed.wrong, detail: "忽略了自动化脚本的边界", feedback: seed.wrongFeedback },
    { id: "b", label: seed.correct, detail: "符合脚本工程实践", feedback: seed.correctFeedback }
  ];
  if (seed.additionalWrong) {
    options.push({ id: "c", label: seed.additionalWrong.label, detail: "边界条件错误", feedback: seed.additionalWrong.feedback });
  }

  const validationCheck: LessonQuestion = {
    id: `${seed.id}-validation-check`,
    type: "best-practice",
    prompt: "阶段项目完成后最应该先验证什么？",
    options: [
      {
        id: "a",
        label: "只观察脚本是否没有报错就当作通过",
        detail: "只解决表面现象",
        feedback: "自动化脚本没有报错并不代表逻辑正确，需要观察真实输入输出。"
      },
      {
        id: "b",
        label: "针对关键路径构造样本输入，比对输出、日志和落盘结果",
        detail: "兼顾模型与验证",
        feedback: "阶段项目必须建立可复查的验证证据链。"
      },
      {
        id: "c",
        label: "只补测试代码，跳过手工样本",
        detail: "跳过关键验证",
        feedback: "缺少真实样本时，自动化测试也会漏掉边界。"
      }
    ],
    answerId: "b",
    correctExplanation: "阶段项目要把概念、代码、运行轨迹和最终输出合成一个闭环。"
  };

  return createLessonSpec({
    id: seed.id,
    stageId: seed.stageId,
    kind: "stage-project",
    eyebrow: `${String(stageNum).padStart(2, "0")}.9 · ${seed.eyebrowStage}`,
    title: seed.title,
    durationMinutes: 18,
    difficulty: "进阶",
    difficultyStars: 3,
    nodeVersion: "Python 3.12",
    objectives: seed.objectives ?? [`独立完成${seed.title}`, "把阶段知识点组合为可交付脚本"],
    prerequisites: seed.prerequisites ?? [],
    concept: seed.concept,
    points: [...seed.points],
    memoryHook: seed.memoryHook,
    files: [{ name: seed.fileName, code: seed.code }],
    entryFile: seed.fileName,
    brief: seed.brief,
    answer: {
      type: "best-practice",
      prompt: seed.prompt,
      options,
      answerId: "b",
      correctExplanation: seed.correctFeedback
    },
    additionalQuestions: [validationCheck],
    execution: {
      lanes: seed.lanes,
      frames: [
        { activeLane: 0, laneValues: [seed.laneValues[0], "等待", "等待"], log: seed.log.slice(0, 1), note: `${seed.lanes[0]}：${seed.laneValues[0]}`, delayMs: 380 },
        { activeLane: 1, laneValues: ["完成", seed.laneValues[1], "等待"], log: seed.log.slice(0, 2), note: `${seed.lanes[1]}：${seed.laneValues[1]}`, delayMs: 780 },
        { activeLane: 2, laneValues: ["完成", "完成", seed.laneValues[2]], log: seed.log, note: `${seed.lanes[2]}：${seed.laneValues[2]}`, delayMs: 780 }
      ]
    },
    summary: seed.summary,
    sources: [source(seed.sourceTitle, seed.sourceUrl)]
  });
}

function stageNumber(stageId: StageId): number {
  switch (stageId) {
    case "python-foundations":
      return 0;
    case "python-data-structures":
      return 1;
    case "python-modules-testing":
      return 2;
    case "python-async-services":
      return 3;
    case "python-file-batch":
      return 4;
    case "python-regex-parsing":
      return 5;
    case "python-http-scraping":
      return 6;
    case "python-cli-tools":
      return 7;
    case "python-scheduling":
      return 8;
    case "python-ops-process":
      return 9;
    case "python-automation-pipeline":
      return 10;
    default:
      return 0;
  }
}
