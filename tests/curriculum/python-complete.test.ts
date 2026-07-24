import assert from "node:assert/strict";
import test from "node:test";

import { pythonCourse } from "../../content/curriculum-registry";
import { pythonPublishedLessons } from "../../content/lesson-registry";
import { validateLessonSpec } from "../../lib/curriculum/validate";

test("Python 题库覆盖完整 11 阶段学习路线", () => {
  assert.equal(pythonCourse.stages.length, 11);

  for (const stage of pythonCourse.stages) {
    assert.equal(stage.lessons.length, 8, `${stage.title} 应包含 8 个知识点`);
    assert.equal(stage.project.status, "published", `${stage.title} 阶段项目应已发布`);
    assert.ok(
      stage.lessons.every((lesson) => lesson.status === "published"),
      `${stage.title} 所有知识点应已发布`
    );
  }

  assert.equal(pythonPublishedLessons.length, 99);
  assert.deepEqual(pythonPublishedLessons.flatMap(validateLessonSpec), []);
});

test("Python 每个已发布知识点至少包含 2 道题，阶段项目至少 3 道题", () => {
  for (const lesson of pythonPublishedLessons) {
    const minimum = lesson.kind === "stage-project" ? 3 : 2;
    assert.ok(
      lesson.questions.length >= minimum,
      `${lesson.id} 应至少包含 ${minimum} 道题，实际为 ${lesson.questions.length}`
    );
  }
});

test("Python 题库补丁生成的题目材料语言均为 py", () => {
  for (const lesson of pythonPublishedLessons) {
    for (const question of lesson.questions) {
      if (question.id.includes("-repair") || question.id.includes("-diagnosis") ||
          question.id.includes("-completion") || question.id.includes("-execution-order")) {
        if (question.materialLanguage !== undefined) {
          assert.equal(
            question.materialLanguage,
            "py",
            `${question.id} 材料语言应为 py，实际为 ${question.materialLanguage}`
          );
        }
      }
    }
  }
});

test("Python 目录中的每个节点都能打开对应题库", () => {
  const publishedIds = new Set(pythonPublishedLessons.map((lesson) => lesson.id));
  const catalogIds = pythonCourse.stages.flatMap((stage) => [
    ...stage.lessons.map((lesson) => lesson.id),
    stage.project.id
  ]);

  assert.equal(catalogIds.length, 99);
  assert.deepEqual(catalogIds.filter((id) => !publishedIds.has(id)), []);
});
