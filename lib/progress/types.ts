export type ProgressSnapshot = {
  version: 1;
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

export const emptyProgress = (): ProgressSnapshot => ({
  version: 1,
  completedLessonIds: [],
  completedProjectIds: [],
  reviewLessonIds: [],
  updatedAt: null
});
