import assert from "node:assert/strict";
import test from "node:test";

import { buildPathProgress } from "../../lib/curriculum/path-progress";
import type { CatalogLesson, CurriculumStage, DifficultyTier, StageId } from "../../lib/curriculum/types";
import { emptyProgress } from "../../lib/progress/types";

function buildStage(number: number, id: string, lessonCount: number): CurriculumStage {
  const lessons: CatalogLesson[] = Array.from({ length: lessonCount }, (_, i) => ({
    id: `${id}-lesson-${i + 1}`,
    title: `Lesson ${i + 1}`,
    order: i + 1,
    kind: "knowledge",
    status: "published"
  }));

  return {
    id: id as StageId,
    number,
    title: `Stage ${number}`,
    summary: "",
    lessons,
    project: {
      id: `${id}-project`,
      title: "Project",
      order: 9,
      kind: "stage-project",
      status: "published"
    }
  };
}

const stages: CurriculumStage[] = [
  buildStage(0, "python-foundations", 8),
  buildStage(1, "python-data-structures", 8),
  buildStage(2, "python-modules-testing", 8),
  buildStage(3, "python-async-services", 8)
];

const tiers: Record<DifficultyTier, StageId[]> = {
  beginner: ["python-foundations", "python-data-structures"] as StageId[],
  intermediate: ["python-modules-testing"] as StageId[],
  advanced: ["python-async-services"] as StageId[]
};

test("空进度返回三段都为 0", () => {
  const result = buildPathProgress(emptyProgress("python"), stages, tiers);
  assert.equal(result.beginner, 0);
  assert.equal(result.intermediate, 0);
  assert.equal(result.advanced, 0);
});

test("完成一个阶段的所有知识点计入入门段进度", () => {
  // beginner 段包含 2 个阶段，每阶段 8 lessons + 1 project = 9 items，共 18 items
  // 完成 8 lessons = 8/18 ≈ 44%
  const progress = {
    ...emptyProgress("python"),
    completedLessonIds: Array.from({ length: 8 }, (_, i) => `python-foundations-lesson-${i + 1}`)
  };
  const result = buildPathProgress(progress, stages, tiers);
  assert.equal(result.beginner, Math.round((8 / 18) * 100));
});

test("阶段项目完成计入进度百分比", () => {
  // beginner 段共 18 items，完成 8 lessons + 1 project = 9/18 = 50%
  const progress = {
    ...emptyProgress("python"),
    completedLessonIds: Array.from({ length: 8 }, (_, i) => `python-foundations-lesson-${i + 1}`),
    completedProjectIds: ["python-foundations-project"]
  };
  const result = buildPathProgress(progress, stages, tiers);
  assert.equal(result.beginner, 50);
});

test("段内没有已发布节点时返回 0", () => {
  const plannedStages: CurriculumStage[] = stages.map((s) => ({
    ...s,
    lessons: s.lessons.map((l) => ({ ...l, status: "planned" as const })),
    project: { ...s.project, status: "planned" as const }
  }));
  const result = buildPathProgress(emptyProgress("python"), plannedStages, tiers);
  assert.equal(result.beginner, 0);
  assert.equal(result.intermediate, 0);
  assert.equal(result.advanced, 0);
});

test("100% 完成时返回 100", () => {
  const progress = {
    ...emptyProgress("python"),
    completedLessonIds: [
      ...Array.from({ length: 8 }, (_, i) => `python-modules-testing-lesson-${i + 1}`)
    ],
    completedProjectIds: ["python-modules-testing-project"]
  };
  const result = buildPathProgress(progress, stages, tiers);
  // intermediate 段只有 1 个阶段：8 lessons + 1 project = 9/9 = 100%
  assert.equal(result.intermediate, 100);
});
