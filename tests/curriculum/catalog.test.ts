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

test("当前 3 个知识点和 CLI 项目在目录中标记为已发布", () => {
  const published = curriculum.flatMap((stage) => [...stage.lessons, stage.project])
    .filter((item) => item.status === "published")
    .map((item) => item.id);

  assert.deepEqual(published, [
    "modules-require-cache",
    "event-loop-order",
    "stream-backpressure",
    "project-cli-log-analyzer"
  ]);
});
