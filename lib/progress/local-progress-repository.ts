import { emptyProgress, type ProgressRepository, type ProgressSnapshot } from "./types";

const key = "nodepath.progress.v1";
const unique = (values: string[]) => [...new Set(values)];

export function createLocalProgressRepository(storage: Storage): ProgressRepository {
  const save = (snapshot: ProgressSnapshot) => {
    storage.setItem(key, JSON.stringify(snapshot));
    return snapshot;
  };

  return {
    load() {
      try {
        const raw = storage.getItem(key);
        if (!raw) return emptyProgress();
        const parsed = JSON.parse(raw) as ProgressSnapshot;
        if (parsed.version !== 1 || !Array.isArray(parsed.completedLessonIds)) return emptyProgress();
        return parsed;
      } catch {
        return emptyProgress();
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
