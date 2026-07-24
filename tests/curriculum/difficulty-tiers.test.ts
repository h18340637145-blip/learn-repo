import assert from "node:assert/strict";
import test from "node:test";

import {
  filterCoursesByTier,
  getDefaultDifficultyTiers,
  resolveDifficultyTiers
} from "../../lib/curriculum/difficulty-tiers";
import type { CatalogLesson, CourseSpec, CurriculumStage, StageId } from "../../lib/curriculum/types";

function buildStage(number: number, id: string, publishedLessons = 8): CurriculumStage {
  const lessons: CatalogLesson[] = Array.from({ length: 8 }, (_, i) => ({
    id: `${id}-lesson-${i + 1}`,
    title: `Lesson ${i + 1}`,
    order: i + 1,
    kind: "knowledge",
    status: i < publishedLessons ? "published" : "planned"
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
      status: publishedLessons > 0 ? "published" : "planned"
    }
  };
}

function buildCourse(stages: CurriculumStage[]): CourseSpec {
  return {
    id: "python",
    domainId: "language",
    slug: "python",
    title: "Python",
    description: "",
    icon: "🐍",
    status: "published",
    runtimeSurfaces: ["console"],
    stages
  };
}

test("getDefaultDifficultyTiers 按 4/4/剩余 分配 11 个阶段", () => {
  const stageIds = Array.from({ length: 11 }, (_, i) => `stage-${i}` as StageId);
  const tiers = getDefaultDifficultyTiers(stageIds);
  assert.deepEqual(tiers.beginner, stageIds.slice(0, 4));
  assert.deepEqual(tiers.intermediate, stageIds.slice(4, 8));
  assert.deepEqual(tiers.advanced, stageIds.slice(8, 11));
});

test("getDefaultDifficultyTiers 少于 4 个阶段时全部归入入门", () => {
  const stageIds = ["s0", "s1", "s2"] as unknown as StageId[];
  const tiers = getDefaultDifficultyTiers(stageIds);
  assert.deepEqual(tiers.beginner, stageIds);
  assert.deepEqual(tiers.intermediate, []);
  assert.deepEqual(tiers.advanced, []);
});

test("resolveDifficultyTiers 优先返回显式配置", () => {
  const stages = [buildStage(0, "python-foundations")];
  const course: CourseSpec = {
    ...buildCourse(stages),
    difficultyTiers: {
      beginner: ["python-foundations" as StageId],
      intermediate: [],
      advanced: []
    }
  };
  const tiers = resolveDifficultyTiers(course);
  assert.deepEqual(tiers.beginner, ["python-foundations"]);
});

test("resolveDifficultyTiers 未配置时按阶段顺序推导", () => {
  const stages = Array.from({ length: 11 }, (_, i) => buildStage(i, `stage-${i}`));
  const course = buildCourse(stages);
  const tiers = resolveDifficultyTiers(course);
  assert.equal(tiers.beginner.length, 4);
  assert.equal(tiers.intermediate.length, 4);
  assert.equal(tiers.advanced.length, 3);
});

test("filterCoursesByTier all 返回全部课程", () => {
  const stages = [buildStage(0, "python-foundations")];
  const course = buildCourse(stages);
  const result = filterCoursesByTier([course], "all");
  assert.equal(result.length, 1);
});

test("filterCoursesByTier 过滤没有已发布节点的段", () => {
  const stages: CurriculumStage[] = [
    buildStage(0, "python-foundations", 8),
    buildStage(4, "python-file-batch", 0)
  ];
  const course: CourseSpec = {
    ...buildCourse(stages),
    difficultyTiers: {
      beginner: ["python-foundations" as StageId],
      intermediate: ["python-file-batch" as StageId],
      advanced: []
    }
  };

  assert.equal(filterCoursesByTier([course], "beginner").length, 1);
  assert.equal(filterCoursesByTier([course], "intermediate").length, 0);
  assert.equal(filterCoursesByTier([course], "advanced").length, 0);
});
