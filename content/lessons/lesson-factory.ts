import type { LessonKind, LessonSpec, LessonSource, QuestionType } from "../../lib/curriculum/types";

type LessonInput = Omit<LessonSpec, "difficulty" | "durationMinutes" | "nodeVersion" | "execution" | "kind" | "questions" | "sources"> & {
  answer: {
    type?: QuestionType;
    prompt: string;
    options: { id: string; label: string; detail: string; feedback: string }[];
    answerId: string;
    correctExplanation: string;
  };
  execution: Omit<LessonSpec["execution"], "mode" | "visualizer">;
  sources: Omit<LessonSource, "type" | "verifiedAt">[];
  durationMinutes?: number;
  difficulty?: LessonSpec["difficulty"];
  kind?: LessonKind;
};

export function createLessonSpec(input: LessonInput): LessonSpec {
  return {
    id: input.id,
    stageId: input.stageId,
    kind: input.kind ?? "knowledge",
    eyebrow: input.eyebrow,
    title: input.title,
    durationMinutes: input.durationMinutes ?? 9,
    difficulty: input.difficulty ?? "基础",
    nodeVersion: "24.x LTS",
    objectives: input.objectives,
    prerequisites: input.prerequisites,
    concept: input.concept,
    points: input.points,
    memoryHook: input.memoryHook,
    files: input.files,
    entryFile: input.entryFile,
    questions: [{
      id: `${input.id}-prediction`,
      type: input.answer.type ?? "prediction",
      prompt: input.answer.prompt,
      options: input.answer.options,
      answerId: input.answer.answerId,
      correctExplanation: input.answer.correctExplanation
    }],
    execution: {
      mode: "authored-trace",
      visualizer: "lane-flow",
      lanes: input.execution.lanes,
      frames: input.execution.frames
    },
    summary: input.summary,
    sources: input.sources.map((source) => ({
      type: "official",
      title: source.title,
      url: source.url,
      verifiedAt: "2026-07-15"
    }))
  };
}
