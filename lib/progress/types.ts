import type { CourseId } from "../curriculum/types";

export type ProgressSnapshot = {
  version: 1;
  courseId: CourseId;
  completedLessonIds: string[];
  completedProjectIds: string[];
  reviewLessonIds: string[];
  updatedAt: string | null;
};

export type ProgressRepository = {
  load(): ProgressSnapshot;
  completeLesson(snapshot: ProgressSnapshot, lessonId: string): ProgressSnapshot;
  completeProject(snapshot: ProgressSnapshot, projectId: string): ProgressSnapshot;
};

export const emptyProgress = (courseId: CourseId = "nodejs"): ProgressSnapshot => ({
  version: 1,
  courseId,
  completedLessonIds: [],
  completedProjectIds: [],
  reviewLessonIds: [],
  updatedAt: null
});
