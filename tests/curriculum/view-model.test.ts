import assert from "node:assert/strict";
import test from "node:test";

import { curriculum } from "../../content/curriculum";
import { buildRoadmap } from "../../lib/curriculum/view-model";

test("阶段展示计划总数和已发布数量", () => {
  const roadmap = buildRoadmap(curriculum, {
    version: 1,
    courseId: "nodejs",
    completedLessonIds: ["modules-require-cache"],
    completedProjectIds: [],
    reviewLessonIds: [],
    questionAttempts: {},
    updatedAt: null
  });

  const modulesStage = roadmap.find((stage) => stage.id === "modules-packages");

  assert.equal(modulesStage?.totalLessons, 8);
  assert.equal(modulesStage?.publishedLessons, 8);
  assert.equal(modulesStage?.completedLessons, 1);
  assert.equal(modulesStage?.state, "active");
});
