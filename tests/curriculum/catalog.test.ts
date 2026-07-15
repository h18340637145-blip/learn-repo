import assert from "node:assert/strict";
import test from "node:test";

import { curriculum } from "../../content/curriculum";
import { validateCatalog } from "../../lib/curriculum/validate";

test("课程目录固定为 10 个阶段和 80 个知识点", () => {
  assert.equal(curriculum.length, 10);
  assert.equal(curriculum.flatMap((stage) => stage.lessons).length, 80);
  assert.equal(curriculum.filter((stage) => stage.project.kind === "stage-project").length, 10);
  assert.deepEqual(validateCatalog(curriculum), []);
});

test("阶段 01-03 在目录中全部标记为已发布", () => {
  const firstThreeItems = curriculum
    .slice(0, 3)
    .flatMap((stage) => stage.lessons.concat([stage.project]));

  assert.equal(firstThreeItems.length, 27);

  for (const item of firstThreeItems) {
    assert.equal(item.status, "published", `${item.id} 应为 published`);
  }
});

test("阶段 04 保留当前两个已发布课程", () => {
  const stageFourPublished = curriculum[3].lessons.concat([curriculum[3].project])
    .filter((item) => item.status === "published")
    .map((item) => item.id);

  assert.deepEqual(stageFourPublished, [
    "stream-backpressure",
    "project-cli-log-analyzer"
  ]);
});
