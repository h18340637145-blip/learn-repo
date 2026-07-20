import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("app/_components/learning-studio.tsx", "utf8");

test("LearningStudio 使用 questionIndex 展示当前题而不是固定第一题", () => {
  assert.match(source, /const \[questionIndex, setQuestionIndex\]/);
  assert.match(source, /lesson\.questions\[questionIndex\]/);
  assert.doesNotMatch(source, /const question = lesson\.questions\[0\]!/);
});

test("答对非最后一道题不会立即写入课程完成", () => {
  assert.match(source, /hasMoreRequiredQuestions/);
  assert.match(source, /setQuestionIndex\(\(current\) => current \+ 1\)/);
  assert.match(source, /if \(hasMoreRequiredQuestions\)/);
});

test("LearningStudio 使用 QuestionOptions 渲染题目选项", () => {
  assert.match(source, /import \{ QuestionOptions \}/);
  assert.match(source, /<QuestionOptions/);
});
