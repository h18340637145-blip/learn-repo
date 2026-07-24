import type { CurriculumStage } from "./types";
import type { ProgressSnapshot } from "../progress/types";

/**
 * 解锁阶段所需的知识点完成率阈值。
 *
 * 阶段 N+1 解锁条件：阶段 N 已发布知识点中，已完成数量 ≥ ⌈总数 × 0.7⌉。
 * 阶段项目完成不计入解锁判断。
 */
export const STAGE_UNLOCK_THRESHOLD = 0.7;

/**
 * 判断某个阶段是否已解锁。
 *
 * 规则：
 * - 阶段 0（或 number ≤ 0）始终解锁
 * - 上一阶段不存在时视为解锁
 * - 上一阶段没有已发布知识点时视为解锁（不阻塞规划中的路线）
 * - 否则要求已完成知识点数 ≥ ⌈已发布知识点数 × 0.7⌉
 */
export function isStageUnlocked(
  stageNumber: number,
  progress: ProgressSnapshot,
  stages: readonly CurriculumStage[]
): boolean {
  if (stageNumber <= 0) return true;

  const previousStage = stages.find((s) => s.number === stageNumber - 1);
  if (!previousStage) return true;

  const publishedLessons = previousStage.lessons.filter((l) => l.status === "published");
  if (publishedLessons.length === 0) return true;

  const requiredCount = Math.ceil(publishedLessons.length * STAGE_UNLOCK_THRESHOLD);
  const completedCount = publishedLessons.filter((l) =>
    progress.completedLessonIds.includes(l.id)
  ).length;

  return completedCount >= requiredCount;
}

export type UnlockRequirement = {
  required: number;
  completed: number;
  remaining: number;
};

/**
 * 返回阶段解锁所需知识点数、当前已完成数和剩余数。
 * 阶段 0 或前置阶段不存在时返回 null。
 */
export function getUnlockRequirement(
  stageNumber: number,
  progress: ProgressSnapshot,
  stages: readonly CurriculumStage[]
): UnlockRequirement | null {
  if (stageNumber <= 0) return null;

  const previousStage = stages.find((s) => s.number === stageNumber - 1);
  if (!previousStage) return null;

  const publishedLessons = previousStage.lessons.filter((l) => l.status === "published");
  if (publishedLessons.length === 0) return null;

  const required = Math.ceil(publishedLessons.length * STAGE_UNLOCK_THRESHOLD);
  const completed = publishedLessons.filter((l) =>
    progress.completedLessonIds.includes(l.id)
  ).length;

  return {
    required,
    completed,
    remaining: Math.max(0, required - completed)
  };
}
