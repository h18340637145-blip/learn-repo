import assert from "node:assert/strict";
import test from "node:test";

import { nodejsP1QuestionBank } from "../../content/questions/nodejs-p1-question-bank";
import { nextjsP1QuestionBank } from "../../content/questions/nextjs-p1-question-bank";
import { getLessonsByCourse, nextjsPublishedLessons, publishedLessons } from "../../content/lesson-registry";
import { validateQuestionBank, validateQuestionCoverage } from "../../lib/curriculum/validate";

test("P1 题库补丁只引用已存在课程", () => {
  assert.deepEqual(validateQuestionBank(publishedLessons, nodejsP1QuestionBank), []);
  assert.deepEqual(validateQuestionBank(nextjsPublishedLessons, nextjsP1QuestionBank), []);
});

test("Node.js 已发布课程达到 P1 题库覆盖要求", () => {
  assert.deepEqual(validateQuestionCoverage(getLessonsByCourse("nodejs"), {
    minKnowledgeQuestions: 2,
    minProjectQuestions: 3,
    minStageQuestionTypes: 3
  }), []);
});

test("Next.js 已发布课程达到 P1 题库覆盖要求", () => {
  assert.deepEqual(validateQuestionCoverage(getLessonsByCourse("nextjs"), {
    minKnowledgeQuestions: 2,
    minProjectQuestions: 3,
    minStageQuestionTypes: 3
  }), []);
});
