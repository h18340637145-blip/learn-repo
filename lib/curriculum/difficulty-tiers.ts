import type { CourseSpec, DifficultyTier, StageId } from "./types";

/**
 * 首页筛选 Tab 使用的难度分类，"all" 表示不筛选。
 */
export type FilterTier = DifficultyTier | "all";

/**
 * 根据课程的阶段顺序推导默认的难度分层。
 *
 * 约定：
 * - 前 4 个阶段（含预备）为"入门"
 * - 中间 4 个阶段为"深入"
 * - 剩余阶段为"实战"
 *
 * 少于 4 个阶段的路线会退化为只有入门段。
 */
export function getDefaultDifficultyTiers(
  stageIds: readonly StageId[]
): Record<DifficultyTier, StageId[]> {
  return {
    beginner: stageIds.slice(0, 4) as StageId[],
    intermediate: stageIds.slice(4, 8) as StageId[],
    advanced: stageIds.slice(8) as StageId[]
  };
}

/**
 * 返回某个课程的难度分层配置；未显式定义时，按阶段顺序推导默认值。
 */
export function resolveDifficultyTiers(
  course: CourseSpec
): Record<DifficultyTier, StageId[]> {
  if (course.difficultyTiers) return course.difficultyTiers;
  return getDefaultDifficultyTiers(course.stages.map((stage) => stage.id));
}

/**
 * 按难度筛选课程列表。
 *
 * - "all" 返回所有课程
 * - 其他 tier 只返回在该难度段中至少有一个已发布节点（知识点或阶段项目）的课程
 */
export function filterCoursesByTier(
  courses: readonly CourseSpec[],
  tier: FilterTier
): CourseSpec[] {
  if (tier === "all") return [...courses];

  return courses.filter((course) => {
    const tiers = resolveDifficultyTiers(course);
    const tierStageIds = new Set(tiers[tier]);

    return course.stages.some((stage) => {
      if (!tierStageIds.has(stage.id)) return false;
      const hasPublishedLesson = stage.lessons.some((l) => l.status === "published");
      const hasPublishedProject = stage.project.status === "published";
      return hasPublishedLesson || hasPublishedProject;
    });
  });
}
