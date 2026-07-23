import type { AnswerOption, AuthoredTraceExecution, LessonKind, LessonQuestion, LessonSpec, LessonSource, QuestionType, VisualizerSpec } from "../../lib/curriculum/types";
import { getDefaultVisualizer } from "../../lib/curriculum/visualizers";

export type LessonInput = Omit<LessonSpec, "difficulty" | "durationMinutes" | "nodeVersion" | "execution" | "kind" | "questions" | "sources"> & {
  answer?: {
    type?: QuestionType;
    prompt: string;
    options: AnswerOption[];
    answerId: string;
    correctExplanation: string;
  };
  additionalQuestions?: LessonQuestion[];
  execution?: Omit<AuthoredTraceExecution, "mode" | "visualizer"> & {
    visualizer?: AuthoredTraceExecution["visualizer"];
  };
  sources: Omit<LessonSource, "type" | "verifiedAt">[];
  durationMinutes?: number;
  difficulty?: LessonSpec["difficulty"];
  kind?: LessonKind;
  nodeVersion?: string;

  // Multi-step project fields
  brief?: string;
  steps?: LessonSpec["steps"];
  finalFiles?: LessonSpec["finalFiles"];
  finalExecution?: LessonSpec["finalExecution"];
};

export function createLessonSpec(input: LessonInput): LessonSpec {
  const kind = input.kind ?? "knowledge";
  const visualizer = input.execution?.visualizer ?? getDefaultVisualizer(input.stageId, kind);

  return {
    id: input.id,
    stageId: input.stageId,
    kind,
    eyebrow: input.eyebrow,
    title: input.title,
    durationMinutes: input.durationMinutes ?? 9,
    difficulty: input.difficulty ?? "基础",
    nodeVersion: input.nodeVersion ?? "24.x LTS",
    objectives: input.objectives,
    prerequisites: input.prerequisites,
    concept: input.concept,
    points: input.points,
    memoryHook: input.memoryHook,
    files: input.files,
    entryFile: input.entryFile,
    questions: input.steps 
      ? input.steps.map(step => step.question)
      : [
          ...(input.answer ? [{
            id: `${input.id}-prediction`,
            type: input.answer.type ?? "prediction",
            prompt: input.answer.prompt,
            options: input.answer.options,
            answerId: input.answer.answerId,
            correctExplanation: input.answer.correctExplanation
          }] : []),
          ...(input.additionalQuestions ?? [])
        ],
    ...(input.execution ? {
      execution: {
        mode: "authored-trace" as const,
        visualizer: cloneVisualizer(visualizer!),
        lanes: input.execution.lanes,
        frames: input.execution.frames
      }
    } : {}),
    summary: input.summary,
    sources: input.sources.map((source) => ({
      type: "official",
      title: source.title,
      url: source.url,
      verifiedAt: "2026-07-15"
    })),
    brief: input.brief,
    steps: input.steps,
    finalFiles: input.finalFiles,
    finalExecution: input.finalExecution
  };
}

function cloneVisualizer(visualizer: VisualizerSpec): VisualizerSpec {
  return { ...visualizer, nodes: [...visualizer.nodes] };
}
