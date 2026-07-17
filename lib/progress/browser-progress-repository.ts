import { createLocalProgressRepository } from "./local-progress-repository";
import type { CourseId } from "../curriculum/types";
import type { ProgressRepository } from "./types";

export function getBrowserProgressRepository(courseId?: CourseId): ProgressRepository {
  return createLocalProgressRepository(window.localStorage, courseId);
}
