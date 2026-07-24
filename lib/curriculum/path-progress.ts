import type { CurriculumStage, DifficultyTier, StageId } from "./types";
import type { ProgressSnapshot } from "../progress/types";

export type PathProgress = Record<DifficultyTier, number>;

/**
 * 计算学习者在入门/深入/实战三段路径上的完成百分比。
 *
 * 完成率 = (已完成知识点 + 已完成阶段项目) / (已发布知识点 + 已发布阶段项目) * 100
 * 未发布的节点不计入分母，避免规划中的路线拉低百分比。
 */
export function buildPathProgress(
  progress: ProgressSnapshot,
  stages: readonly CurriculumStage[],
  tiers: Record<DifficultyTier, StageId[]>
): PathProgress {
  const completedIds = new Set([
    ...progress.completedLessonIds,
    ...progress.completedProjectIds
  ]);

  function calcTier(tierStageIds: readonly StageId[]): number {
    const tierStageIdSet = new Set(tierStageIds);
    const tierStages = stages.filter((s) => tierStageIdSet.has(s.id));

    let total = 0;
    let completed = 0;

    for (const stage of tierStages) {
      const publishedLessons = stage.lessons.filter((l) => l.status === "published");
      total += publishedLessons.length;
      completed += publishedLessons.filter((l) => completedIds.has(l.id)).length;

      if (stage.project.status === "published") {
        total += 1;
        if (completedIds.has(stage.project.id)) completed += 1;
      }
    }

    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  return {
    beginner: calcTier(tiers.beginner),
    intermediate: calcTier(tiers.intermediate),
    advanced: calcTier(tiers.advanced)
  };
}
