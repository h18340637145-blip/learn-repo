import assert from "node:assert/strict";
import test from "node:test";

import { curriculum } from "../../content/curriculum";
import { validateCatalog } from "../../lib/curriculum/validate";

test("课程目录包含 00 基础训练营和 10 个正式阶段", () => {
  assert.equal(curriculum.length, 11);
  assert.equal(curriculum[0].id, "foundations");
  assert.equal(curriculum[0].number, 0);
  assert.equal(curriculum[0].lessons.length, 8);
  assert.equal(curriculum.flatMap((stage) => stage.lessons).length, 88);
  assert.equal(curriculum.filter((stage) => stage.project.kind === "stage-project").length, 11);
  assert.deepEqual(validateCatalog(curriculum), []);
});

test("阶段 00 基础训练营在目录中全部标记为已发布", () => {
  const foundationsItems = curriculum[0].lessons.concat([curriculum[0].project]);

  assert.equal(foundationsItems.length, 9);

  for (const item of foundationsItems) {
    assert.equal(item.status, "published", `${item.id} 应为 published`);
  }
});

test("阶段 01-03 在目录中全部标记为已发布", () => {
  const firstThreeItems = curriculum
    .slice(1, 4)
    .flatMap((stage) => stage.lessons.concat([stage.project]));

  assert.equal(firstThreeItems.length, 27);

  for (const item of firstThreeItems) {
    assert.equal(item.status, "published", `${item.id} 应为 published`);
  }
});

test("阶段 04 保留当前两个已发布课程", () => {
  const stageFourPublished = curriculum[4].lessons.concat([curriculum[4].project])
    .filter((item) => item.status === "published")
    .map((item) => item.id);

  assert.deepEqual(stageFourPublished, [
    "stream-backpressure",
    "project-cli-log-analyzer"
  ]);
});

test("阶段 05-10 在目录中全部标记为已发布", () => {
  const lateStageItems = curriculum
    .slice(5, 11)
    .flatMap((stage) => stage.lessons.concat([stage.project]));

  assert.equal(lateStageItems.length, 54);

  for (const item of lateStageItems) {
    assert.equal(item.status, "published", `${item.id} 应为 published`);
  }
});
