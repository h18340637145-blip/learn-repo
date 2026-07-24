import assert from "node:assert/strict";
import test from "node:test";

import { curriculum } from "../../content/curriculum";
import { buildRoadmap } from "../../lib/curriculum/view-model";

test("阶段展示计划总数和已发布数量", () => {
  const roadmap = buildRoadmap(curriculum, {
    version: 1,
    courseId: "nodejs",
    // 完成前置阶段 0/1 各 6 个知识点以解锁阶段 2
    completedLessonIds: [
      "foundations-node-javascript",
      "foundations-types-typeof",
      "foundations-collections",
      "foundations-functions",
      "foundations-branches-loops",
      "foundations-try-catch",
      "runtime-introduction",
      "runtime-browser-differences",
      "runtime-v8",
      "runtime-lts",
      "cli-run-scripts",
      "cli-repl",
      "modules-require-cache"
    ],
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
  assert.equal(modulesStage?.locked, false);
});
