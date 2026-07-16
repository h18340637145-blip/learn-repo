import type { CurriculumStage, LessonKind, LessonSpec, StageId } from "./types";
import type { ProgressSnapshot } from "../progress/types";

export type StageSpaceNode = {
  id: string;
  title: string;
  order: number;
  kind: LessonKind;
  status: "published" | "planned";
  state: "done" | "available" | "planned";
  lessonIndex: number | null;
};

export type StageSpace = {
  id: StageId;
  number: number;
  title: string;
  summary: string;
  completedCount: number;
  publishedCount: number;
  nodes: StageSpaceNode[];
};

export function buildStageSpaces(
  stages: readonly CurriculumStage[],
  lessons: readonly LessonSpec[],
  progress: ProgressSnapshot
): StageSpace[] {
  const lessonIndexById = new Map(lessons.map((lesson, index) => [lesson.id, index]));
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const completedIds = new Set([...progress.completedLessonIds, ...progress.completedProjectIds]);

  return stages.map((stage) => {
    const entries = [...stage.lessons, stage.project];
    const nodes = entries.map((entry) => {
      const lesson = lessonById.get(entry.id);
      const isPublished = entry.status === "published" && Boolean(lesson);
      const isDone = completedIds.has(entry.id);

      return {
        id: entry.id,
        title: entry.title,
        order: entry.order,
        kind: entry.kind,
        status: entry.status,
        state: isDone ? "done" : isPublished ? "available" : "planned",
        lessonIndex: isPublished ? lessonIndexById.get(entry.id) ?? null : null
      } satisfies StageSpaceNode;
    });

    return {
      id: stage.id,
      number: stage.number,
      title: stage.title,
      summary: stage.summary,
      completedCount: nodes.filter((node) => node.state === "done").length,
      publishedCount: nodes.filter((node) => node.status === "published").length,
      nodes
    };
  });
}

export function getStageSpace(
  stageId: StageId,
  stages: readonly CurriculumStage[],
  lessons: readonly LessonSpec[],
  progress: ProgressSnapshot
): StageSpace | undefined {
  return buildStageSpaces(stages, lessons, progress).find((stage) => stage.id === stageId);
}
