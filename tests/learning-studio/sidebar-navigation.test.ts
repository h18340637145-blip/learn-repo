import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("app/learning-studio.tsx", "utf8");

test("左侧路线单元和知识点都能点击跳转到课程", () => {
  assert.match(source, /lessonIndexById/);
  assert.match(source, /openPublishedLessonById/);
  assert.match(source, /activeLessonId=\{lesson\.id\}/);
  assert.match(source, /onOpenLesson=\{openPublishedLessonById\}/);
  assert.match(source, /onSelectStage=\{selectStage\}/);
});
