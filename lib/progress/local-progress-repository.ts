import { emptyProgress, type ProgressRepository, type ProgressSnapshot } from "./types";
import type { CourseId } from "../curriculum/types";
import { calculateSM2NextReview } from "./spaced-repetition";

const baseKey = "nodepath.progress";
const unique = (values: string[]) => [...new Set(values)];

function normalizeCourseId(courseId?: CourseId): CourseId {
  return courseId ?? "nodejs";
}

function storageKey(courseId?: CourseId): string {
  if (!courseId || courseId === "nodejs") return `${baseKey}.v1`;
  return `${baseKey}.${courseId}.v1`;
}

function normalizeStringIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return unique(value.filter((item): item is string => typeof item === "string" && item.length > 0));
}

function normalizeSnapshot(raw: unknown, courseId: CourseId): ProgressSnapshot {
  if (!raw || typeof raw !== "object") return emptyProgress(courseId);

  const parsed = raw as Partial<ProgressSnapshot>;
  if (parsed.version !== 1 || !Array.isArray(parsed.completedLessonIds)) return emptyProgress(courseId);

  return {
    version: 1,
    courseId,
    completedLessonIds: normalizeStringIds(parsed.completedLessonIds),
    completedProjectIds: normalizeStringIds(parsed.completedProjectIds),
    reviewLessonIds: normalizeStringIds(parsed.reviewLessonIds),
    questionAttempts: normalizeQuestionAttempts(parsed.questionAttempts),
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null
  };
}

function normalizeQuestionAttempts(value: unknown): ProgressSnapshot["questionAttempts"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(([key, record]) => isQuestionAttemptRecord(key, record))
  );
}

function isQuestionAttemptRecord(key: string, value: unknown): value is ProgressSnapshot["questionAttempts"][string] {
  if (!value || typeof value !== "object") return false;
  const record = value as ProgressSnapshot["questionAttempts"][string];
  if (typeof record.questionId !== "string" || record.questionId !== key) return false;
  if (!Number.isInteger(record.attempts) || record.attempts < 1) return false;
  if (!isValidDateString(record.firstAnsweredAt) || !isValidDateString(record.lastAnsweredAt)) return false;
  if (Date.parse(record.lastAnsweredAt) < Date.parse(record.firstAnsweredAt)) return false;

  return typeof record.lessonId === "string"
    && typeof record.stageId === "string"
    && typeof record.selectedOptionId === "string"
    && typeof record.isCorrect === "boolean"
    && typeof record.firstAttemptCorrect === "boolean"
    && typeof record.needsReview === "boolean";
}

function isValidDateString(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
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
    replace(snapshot) {
      return save(normalizeSnapshot(snapshot, normalizedCourseId));
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
      const questionAttempts = normalizeQuestionAttempts(snapshot.questionAttempts ?? {});
      const previous = questionAttempts[input.questionId];

      const attemptsCount = previous ? Math.max(previous.attempts, 0) + 1 : 1;
      const prevEf = previous?.easinessFactor ?? 2.5;
      const prevInterval = previous?.intervalDays ?? 1;

      const sm2 = calculateSM2NextReview(input.isCorrect, attemptsCount, prevEf, prevInterval);

      const nextRecord = previous
        ? {
            ...previous,
            selectedOptionId: input.selectedOptionId,
            isCorrect: input.isCorrect,
            attempts: attemptsCount,
            lastAnsweredAt: now,
            needsReview: previous.needsReview || !previous.firstAttemptCorrect,
            easinessFactor: sm2.easinessFactor,
            intervalDays: sm2.intervalDays,
            nextReviewAt: sm2.nextReviewAt,
            reviewState: sm2.reviewState
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
            needsReview: !input.isCorrect,
            easinessFactor: sm2.easinessFactor,
            intervalDays: sm2.intervalDays,
            nextReviewAt: sm2.nextReviewAt,
            reviewState: sm2.reviewState
          };

      return save({
        ...snapshot,
        questionAttempts: {
          ...questionAttempts,
          [input.questionId]: nextRecord
        },
        updatedAt: now
      });
    }
  };
}
