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
        const parsed = JSON.parse(raw) as ProgressSnapshot;
        if (parsed.version !== 1 || !Array.isArray(parsed.completedLessonIds)) return emptyProgress(normalizedCourseId);
        return { ...parsed, courseId: normalizedCourseId };
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
    }
  };
}
