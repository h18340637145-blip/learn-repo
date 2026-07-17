import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("app/learning-studio.tsx", "utf8");

test("左侧路线单元和知识点都能点击跳转到课程", () => {
  assert.match(source, /lessonIndexById/);
  assert.match(source, /openPublishedLessonById/);
  assert.match(source, /openStageFirstLesson/);
  assert.match(source, /className="roadmap-title"/);
  assert.match(source, /className=\{`roadmap-item/);
  assert.match(source, /aria-current=\{item\.id === lesson\.id/);
});
