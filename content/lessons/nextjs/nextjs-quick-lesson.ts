import type { LessonKind, StageId, VisualizerType } from "../../../lib/curriculum/types";
import { createNextjsLessonSpec } from "./nextjs-lesson-factory";

type QuickNextjsLessonInput = {
  id: string;
  stageId: StageId;
  kind?: LessonKind;
  eyebrow: string;
  title: string;
  objectives: string[];
  prerequisites: string[];
  concept: string;
  points: string[];
  memoryHook: string;
  fileName: string;
  code: string;
  prompt: string;
  correctLabel: string;
  wrongLabels: [string, string];
  correctExplanation: string;
  visualizerType: VisualizerType;
  visualizerTitle: string;
  nodes: string[];
  sourceTitle: string;
  sourceUrl: string;
  summary: string[];
  difficulty?: "基础" | "进阶";
};

export function createNextjsQuickLesson(input: QuickNextjsLessonInput) {
  return createNextjsLessonSpec({
    id: input.id,
    stageId: input.stageId,
    kind: input.kind,
    eyebrow: input.eyebrow,
    title: input.title,
    difficulty: input.difficulty,
    objectives: input.objectives,
    prerequisites: input.prerequisites,
    concept: input.concept,
    points: input.points,
    memoryHook: input.memoryHook,
    files: [{ name: input.fileName, code: input.code }],
    entryFile: input.fileName,
    answer: {
      type: input.kind === "stage-project" ? "transfer" : "prediction",
      prompt: input.prompt,
      options: [
        {
          id: "a",
          label: input.wrongLabels[0],
          detail: "常见误判",
          feedback: "这会忽略 Next.js 在服务端、构建期或边缘层的真实执行边界。"
        },
        {
          id: "b",
          label: input.correctLabel,
          detail: "正确心智模型",
          feedback: "正确：这个选择符合 Next.js App Router 的真实运行方式。"
        },
        {
          id: "c",
          label: input.wrongLabels[1],
          detail: "过度简化",
          feedback: "这个说法只覆盖了表面现象，无法解释代码运行后的完整链路。"
        }
      ],
      answerId: "b",
      correctExplanation: input.correctExplanation
    },
    execution: {
      visualizer: {
        type: input.visualizerType,
        title: input.visualizerTitle,
        nodes: input.nodes
      },
      lanes: ["输入信号", "Next.js 处理层", "学习者可见结果"],
      frames: [
        {
          activeLane: 0,
          laneValues: ["读取示例代码与用户操作", "等待", "等待"],
          log: [`加载 ${input.fileName}`, "准备预测运行结果"],
          note: "先建立执行入口和上下文。",
          delayMs: 360
        },
        {
          activeLane: 1,
          laneValues: ["完成", input.nodes.slice(1, 4).join(" → "), "等待"],
          log: input.nodes.map((node, index) => `${String(index + 1).padStart(2, "0")} ${node}`),
          note: "框架根据文件约定、运行时边界和缓存策略推进。",
          delayMs: 820
        },
        {
          activeLane: 2,
          laneValues: ["完成", "完成", "得到稳定的页面、接口或部署反馈"],
          log: [input.correctExplanation],
          note: "把抽象知识点落回可观察结果。",
          delayMs: 820
        }
      ]
    },
    sources: [{ title: input.sourceTitle, url: input.sourceUrl }],
    summary: input.summary
  });
}
