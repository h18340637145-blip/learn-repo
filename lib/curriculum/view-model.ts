import { getUnlockRequirement, isStageUnlocked } from "./stage-unlock";
import type { CurriculumStage, StageId } from "./types";
import type { ProgressSnapshot } from "../progress/types";

export type RoadmapStage = {
  id: StageId;
  number: number;
  title: string;
  totalLessons: number;
  publishedLessons: number;
  completedLessons: number;
  state: "done" | "active" | "locked" | "planned";
  locked: boolean;
  unlockHint?: { required: number; completed: number; remaining: number };
  items: { id: string; title: string; status: "published" | "planned" }[];
};

export function buildRoadmap(
  stages: readonly CurriculumStage[],
  progress: ProgressSnapshot
): RoadmapStage[] {
  const completedLessonIds = new Set(progress.completedLessonIds);

  return stages.map((stage) => {
    const published = stage.lessons.filter((lesson) => lesson.status === "published");
    const completed = published.filter((lesson) => completedLessonIds.has(lesson.id));
    const everyPlannedLessonCompleted = stage.lessons.every((lesson) => completedLessonIds.has(lesson.id));
    const unlocked = isStageUnlocked(stage.number, progress, stages);
    const hint = getUnlockRequirement(stage.number, progress, stages);

    let state: RoadmapStage["state"];
    if (published.length === 0) {
      state = "planned";
    } else if (!unlocked) {
      state = "locked";
    } else if (everyPlannedLessonCompleted) {
      state = "done";
    } else {
      state = "active";
    }

    return {
      id: stage.id,
      number: stage.number,
      title: stage.title,
      totalLessons: stage.lessons.length,
      publishedLessons: published.length,
      completedLessons: completed.length,
      state,
      locked: !unlocked,
      unlockHint: hint ?? undefined,
      items: stage.lessons.map(({ id, title, status }) => ({ id, title, status }))
    };
  });
}
