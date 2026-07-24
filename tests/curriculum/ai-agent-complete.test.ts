import assert from "node:assert/strict";
import test from "node:test";

import { aiAgentCourse } from "../../content/curriculum-registry";
import { getLessonsByCourse } from "../../content/lesson-registry";
import { validateLessonSpec } from "../../lib/curriculum/validate";

const aiAgentLessons = getLessonsByCourse("ai-agent");

test("AI Agent 目录覆盖完整 11 阶段学习路线（4 蓝图 + 7 真实回填）", () => {
  assert.equal(aiAgentCourse.stages.length, 11);

  for (const stage of aiAgentCourse.stages) {
    assert.equal(stage.project.status, "published", `${stage.title} 阶段项目应已发布`);
    assert.ok(
      stage.lessons.every((lesson) => lesson.status === "published"),
      `${stage.title} 所有知识点应已发布`
    );
  }

  assert.equal(aiAgentLessons.length, 99, "AI Agent 应有 4 蓝图 (36) + 7 真实阶段 (63) 共 99 个案例");
  assert.deepEqual(aiAgentLessons.flatMap(validateLessonSpec), []);
});

test("AI Agent 每个已发布知识点至少包含 2 道题，阶段项目至少 3 道题", () => {
  for (const lesson of aiAgentLessons) {
    const minimum = lesson.kind === "stage-project" ? 3 : 2;
    assert.ok(
      lesson.questions.length >= minimum,
      `${lesson.id} 应至少包含 ${minimum} 道题，实际为 ${lesson.questions.length}`
    );
  }
});

test("AI Agent 题库补丁生成的题目材料语言均为 ts", () => {
  for (const lesson of aiAgentLessons) {
    for (const question of lesson.questions) {
      if (
        question.id.includes("-repair") ||
        question.id.includes("-diagnosis") ||
        question.id.includes("-completion") ||
        question.id.includes("-execution-order")
      ) {
        if (question.materialLanguage !== undefined) {
          assert.equal(
            question.materialLanguage,
            "ts",
            `${question.id} 材料语言应为 ts，实际为 ${question.materialLanguage}`
          );
        }
      }
    }
  }
});

test("AI Agent 目录中的每个节点都能打开对应题库", () => {
  const publishedIds = new Set(aiAgentLessons.map((lesson) => lesson.id));
  const catalogIds = aiAgentCourse.stages.flatMap((stage) => [
    ...stage.lessons.map((lesson) => lesson.id),
    stage.project.id
  ]);

  assert.deepEqual(catalogIds.filter((id) => !publishedIds.has(id)), []);
});
