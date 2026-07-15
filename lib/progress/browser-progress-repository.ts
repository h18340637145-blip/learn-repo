import { createLocalProgressRepository } from "./local-progress-repository";
import type { ProgressRepository } from "./types";

export function getBrowserProgressRepository(): ProgressRepository {
  return createLocalProgressRepository(window.localStorage);
}
