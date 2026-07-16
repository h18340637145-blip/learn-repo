import assert from "node:assert/strict";
import test from "node:test";

import { curriculum } from "../../content/curriculum";
import { publishedLessons } from "../../content/lesson-registry";
import { buildStageSpaces, getStageSpace } from "../../lib/curriculum/stage-space";
import { emptyProgress } from "../../lib/progress/types";

test("阶段空间只暴露阶段入口，不展开全局课程列表", () => {
  const spaces = buildStageSpaces(curriculum, publishedLessons, emptyProgress());

  assert.equal(spaces.length, 10);
  assert.deepEqual(spaces.map((space) => space.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.ok(spaces.every((space) => space.nodes.length <= 9));
});

test("阶段空间包含当前阶段课程和阶段项目节点", () => {
  const httpSpace = getStageSpace("http-foundations", curriculum, publishedLessons, emptyProgress());

  assert.equal(httpSpace?.title, "HTTP 基础");
  assert.equal(httpSpace?.nodes.length, 9);
  assert.equal(httpSpace?.nodes[0].id, "http-transaction");
  assert.equal(httpSpace?.nodes.at(-1)?.kind, "stage-project");
});

test("完成进度影响课程节点状态", () => {
  const httpSpace = getStageSpace("http-foundations", curriculum, publishedLessons, {
    ...emptyProgress(),
    completedLessonIds: ["http-transaction"]
  });

  assert.equal(httpSpace?.nodes[0].state, "done");
  assert.equal(httpSpace?.nodes[1].state, "available");
});
