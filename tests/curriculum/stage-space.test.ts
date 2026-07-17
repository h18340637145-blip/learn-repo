import assert from "node:assert/strict";
import test from "node:test";

import { curriculum } from "../../content/curriculum";
import { publishedLessons } from "../../content/lesson-registry";
import { buildStageSpaces, getStageSpace } from "../../lib/curriculum/stage-space";
import { emptyProgress } from "../../lib/progress/types";

test("阶段空间只暴露阶段入口，不展开全局课程列表", () => {
  const spaces = buildStageSpaces(curriculum, publishedLessons, emptyProgress());

  assert.equal(spaces.length, 11);
  assert.deepEqual(spaces.map((space) => space.number), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
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

test("完成阶段项目时项目节点状态为 done", () => {
  const httpSpace = getStageSpace("http-foundations", curriculum, publishedLessons, {
    ...emptyProgress(),
    completedProjectIds: ["project-static-file-server"]
  });

  const projectNode = httpSpace?.nodes.at(-1);

  assert.equal(projectNode?.id, "project-static-file-server");
  assert.equal(projectNode?.kind, "stage-project");
  assert.equal(projectNode?.state, "done");
});

test("缺失 published lesson 不可打开且不计入 publishedCount", () => {
  const missingLessonId = "http-transaction";
  const lessonsWithoutMissing = publishedLessons.filter((lesson) => lesson.id !== missingLessonId);
  const httpSpace = getStageSpace("http-foundations", curriculum, lessonsWithoutMissing, {
    ...emptyProgress(),
    completedLessonIds: [missingLessonId]
  });

  const missingNode = httpSpace?.nodes[0];

  assert.equal(missingNode?.id, missingLessonId);
  assert.equal(missingNode?.status, "published");
  assert.equal(missingNode?.lessonIndex, null);
  assert.equal(missingNode?.state, "planned");
  assert.equal(httpSpace?.publishedCount, 8);
  assert.equal(httpSpace?.completedCount, 0);
});

test("lessonIndex 对应 publishedLessons 中的课程索引", () => {
  const lessonId = "http-request-body";
  const expectedIndex = publishedLessons.findIndex((lesson) => lesson.id === lessonId);
  const httpSpace = getStageSpace("http-foundations", curriculum, publishedLessons, emptyProgress());
  const requestBodyNode = httpSpace?.nodes.find((node) => node.id === lessonId);

  assert.notEqual(expectedIndex, -1);
  assert.equal(requestBodyNode?.lessonIndex, expectedIndex);
});
