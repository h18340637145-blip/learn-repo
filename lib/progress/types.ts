import type { CourseId, StageId } from "../curriculum/types";

export type QuestionAttemptRecord = {
  questionId: string;
  lessonId: string;
  stageId: StageId;
  selectedOptionId: string;
  isCorrect: boolean;
  firstAttemptCorrect: boolean;
  attempts: number;
  firstAnsweredAt: string;
  lastAnsweredAt: string;
  needsReview: boolean;
};

export type QuestionAttemptInput = {
  questionId: string;
  lessonId: string;
  stageId: StageId;
  selectedOptionId: string;
  isCorrect: boolean;
};

export type ProgressSnapshot = {
  version: 1;
  courseId: CourseId;
  completedLessonIds: string[];
  completedProjectIds: string[];
  reviewLessonIds: string[];
  questionAttempts: Record<string, QuestionAttemptRecord>;
  updatedAt: string | null;
};

export type ProgressRepository = {
  load(): ProgressSnapshot;
  replace(snapshot: ProgressSnapshot): ProgressSnapshot;
  completeLesson(snapshot: ProgressSnapshot, lessonId: string): ProgressSnapshot;
  completeProject(snapshot: ProgressSnapshot, projectId: string): ProgressSnapshot;
  recordQuestionAttempt(snapshot: ProgressSnapshot, input: QuestionAttemptInput): ProgressSnapshot;
};

export const emptyProgress = (courseId: CourseId = "nodejs"): ProgressSnapshot => ({
  version: 1,
  courseId,
  completedLessonIds: [],
  completedProjectIds: [],
  reviewLessonIds: [],
  questionAttempts: {},
  updatedAt: null
});
