import assert from "node:assert/strict";
import test from "node:test";

import { curriculum } from "../../content/curriculum";
import { buildRoadmap } from "../../lib/curriculum/view-model";

test("阶段展示计划总数和已发布数量", () => {
  const roadmap = buildRoadmap(curriculum, {
    version: 1,
    completedLessonIds: ["modules-require-cache"],
    completedProjectIds: [],
    reviewLessonIds: [],
    updatedAt: null
  });

  assert.equal(roadmap[1].totalLessons, 8);
  assert.equal(roadmap[1].publishedLessons, 1);
  assert.equal(roadmap[1].completedLessons, 1);
  assert.equal(roadmap[1].state, "active");
});
