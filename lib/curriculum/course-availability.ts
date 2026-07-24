import type { CourseSpec, LessonSpec } from "./types";

export type CourseAvailability = {
  publishedStageCount: number;
  totalStageCount: number;
  playableCaseCount: number;
  nextActionLabel: "开始学习" | "继续学习" | "预览路线" | "查看规划";
  stageSummary: string;
  caseSummary: string;
};

export function buildCourseAvailability(course: CourseSpec, lessons: readonly LessonSpec[]): CourseAvailability {
  const publishedStageCount = course.stages.filter((stage) =>
    stage.lessons.some((lesson) => lesson.status === "published") || stage.project.status === "published"
  ).length;
  const playableCaseCount = lessons.length;

  return {
    publishedStageCount,
    totalStageCount: course.stages.length,
    playableCaseCount,
    nextActionLabel: resolveNextAction(course.status, playableCaseCount),
    stageSummary: `已开放 ${publishedStageCount}/${course.stages.length} 阶段`,
    caseSummary: playableCaseCount > 0 ? `${playableCaseCount} 个可玩案例` : "内容规划可见"
  };
}

function resolveNextAction(status: CourseSpec["status"], playableCaseCount: number): CourseAvailability["nextActionLabel"] {
  if (playableCaseCount === 0) return "查看规划";
  if (status === "published") return "开始学习";
  if (status === "preview") return "继续学习";

  return "预览路线";
}
