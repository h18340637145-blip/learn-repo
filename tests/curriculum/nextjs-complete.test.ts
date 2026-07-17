import assert from "node:assert/strict";
import test from "node:test";

import { nextjsCurriculum } from "../../content/curriculum-nextjs";
import { nextjsPublishedLessons } from "../../content/lesson-registry";
import { validateLessonSpec } from "../../lib/curriculum/validate";

test("Next.js 题库覆盖完整 10 阶段学习路线", () => {
  assert.equal(nextjsCurriculum.length, 10);

  for (const stage of nextjsCurriculum) {
    assert.equal(stage.lessons.length, 8, `${stage.title} 应包含 8 个知识点`);
    assert.equal(stage.project.status, "published", `${stage.title} 阶段项目应已发布`);
    assert.ok(stage.lessons.every((lesson) => lesson.status === "published"), `${stage.title} 所有知识点应已发布`);
  }

  assert.equal(nextjsPublishedLessons.length, 90);
  assert.deepEqual(nextjsPublishedLessons.flatMap(validateLessonSpec), []);
});

test("Next.js 目录中的每个节点都能打开对应题库", () => {
  const publishedIds = new Set(nextjsPublishedLessons.map((lesson) => lesson.id));
  const catalogIds = nextjsCurriculum.flatMap((stage) => [
    ...stage.lessons.map((lesson) => lesson.id),
    stage.project.id
  ]);

  assert.equal(catalogIds.length, 90);
  assert.deepEqual(catalogIds.filter((id) => !publishedIds.has(id)), []);
});
