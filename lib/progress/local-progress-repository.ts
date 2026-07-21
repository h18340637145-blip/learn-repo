import { emptyProgress, type ProgressRepository, type ProgressSnapshot } from "./types";
import type { CourseId } from "../curriculum/types";

const baseKey = "nodepath.progress";
const unique = (values: string[]) => [...new Set(values)];

function normalizeCourseId(courseId?: CourseId): CourseId {
  return courseId ?? "nodejs";
}

function storageKey(courseId?: CourseId): string {
  if (!courseId || courseId === "nodejs") return `${baseKey}.v1`;
  return `${baseKey}.${courseId}.v1`;
}

function normalizeSnapshot(raw: unknown, courseId: CourseId): ProgressSnapshot {
  if (!raw || typeof raw !== "object") return emptyProgress(courseId);

  const parsed = raw as Partial<ProgressSnapshot>;
  if (parsed.version !== 1 || !Array.isArray(parsed.completedLessonIds)) return emptyProgress(courseId);

  return {
    version: 1,
    courseId,
    completedLessonIds: Array.isArray(parsed.completedLessonIds) ? unique(parsed.completedLessonIds) : [],
    completedProjectIds: Array.isArray(parsed.completedProjectIds) ? unique(parsed.completedProjectIds) : [],
    reviewLessonIds: Array.isArray(parsed.reviewLessonIds) ? unique(parsed.reviewLessonIds) : [],
    questionAttempts: normalizeQuestionAttempts(parsed.questionAttempts),
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null
  };
}

function normalizeQuestionAttempts(value: unknown): ProgressSnapshot["questionAttempts"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(([, record]) => isQuestionAttemptRecord(record))
  );
}

function isQuestionAttemptRecord(value: unknown): value is ProgressSnapshot["questionAttempts"][string] {
  if (!value || typeof value !== "object") return false;
  const record = value as ProgressSnapshot["questionAttempts"][string];
  return typeof record.questionId === "string"
    && typeof record.lessonId === "string"
    && typeof record.stageId === "string"
    && typeof record.selectedOptionId === "string"
    && typeof record.isCorrect === "boolean"
    && typeof record.firstAttemptCorrect === "boolean"
    && Number.isInteger(record.attempts)
    && typeof record.firstAnsweredAt === "string"
    && typeof record.lastAnsweredAt === "string"
    && typeof record.needsReview === "boolean";
}

export function createLocalProgressRepository(storage: Storage, courseId?: CourseId): ProgressRepository {
  const normalizedCourseId = normalizeCourseId(courseId);
  const key = storageKey(normalizedCourseId);
  const save = (snapshot: ProgressSnapshot) => {
    const scopedSnapshot = { ...snapshot, courseId: normalizedCourseId };
    storage.setItem(key, JSON.stringify(scopedSnapshot));
    return scopedSnapshot;
  };

  return {
    load() {
      try {
        const raw = storage.getItem(key);
        if (!raw) return emptyProgress(normalizedCourseId);
        return normalizeSnapshot(JSON.parse(raw), normalizedCourseId);
      } catch {
        return emptyProgress(normalizedCourseId);
      }
    },
    completeLesson(snapshot, lessonId) {
      return save({
        ...snapshot,
        completedLessonIds: unique([...snapshot.completedLessonIds, lessonId]),
        reviewLessonIds: unique([...snapshot.reviewLessonIds, lessonId]),
        updatedAt: new Date().toISOString()
      });
    },
    completeProject(snapshot, projectId) {
      return save({
        ...snapshot,
        completedProjectIds: unique([...snapshot.completedProjectIds, projectId]),
        updatedAt: new Date().toISOString()
      });
    },
    recordQuestionAttempt(snapshot, input) {
      const now = new Date().toISOString();
      const previous = snapshot.questionAttempts[input.questionId];
      const nextRecord = previous
        ? {
            ...previous,
            selectedOptionId: input.selectedOptionId,
            isCorrect: input.isCorrect,
            attempts: previous.attempts + 1,
            lastAnsweredAt: now,
            needsReview: previous.needsReview || !previous.firstAttemptCorrect
          }
        : {
            questionId: input.questionId,
            lessonId: input.lessonId,
            stageId: input.stageId,
            selectedOptionId: input.selectedOptionId,
            isCorrect: input.isCorrect,
            firstAttemptCorrect: input.isCorrect,
            attempts: 1,
            firstAnsweredAt: now,
            lastAnsweredAt: now,
            needsReview: !input.isCorrect
          };

      return save({
        ...snapshot,
        questionAttempts: {
          ...snapshot.questionAttempts,
          [input.questionId]: nextRecord
        },
        updatedAt: now
      });
    }
  };
}
