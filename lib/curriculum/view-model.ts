import type { CurriculumStage } from "./types";
import type { ProgressSnapshot } from "../progress/types";

export type RoadmapStage = {
  id: string;
  number: number;
  title: string;
  totalLessons: number;
  publishedLessons: number;
  completedLessons: number;
  state: "done" | "active" | "locked" | "planned";
  items: { id: string; title: string; status: "published" | "planned" }[];
};

export function buildRoadmap(
  stages: readonly CurriculumStage[],
  progress: ProgressSnapshot
): RoadmapStage[] {
  return stages.map((stage) => {
    const published = stage.lessons.filter((lesson) => lesson.status === "published");
    const completed = published.filter((lesson) => progress.completedLessonIds.includes(lesson.id));
    const completedLessonIds = new Set(progress.completedLessonIds);
    const everyPlannedLessonCompleted = stage.lessons.every((lesson) => completedLessonIds.has(lesson.id));
    const state = published.length === 0
      ? "planned"
      : everyPlannedLessonCompleted
        ? "done"
        : "active";

    return {
      id: stage.id,
      number: stage.number,
      title: stage.title,
      totalLessons: stage.lessons.length,
      publishedLessons: published.length,
      completedLessons: completed.length,
      state,
      items: stage.lessons.map(({ id, title, status }) => ({ id, title, status }))
    };
  });
}
