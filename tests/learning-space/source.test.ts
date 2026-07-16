import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("app/learning-studio.tsx", "utf8");

test("LearningStudio 使用阶段空间组件替代全局课程切换器", () => {
  assert.match(source, /selectedStageId/);
  assert.match(source, /StageSidebar/);
  assert.match(source, /StageSpaceMap/);
  assert.doesNotMatch(source, /publishedLessons\.map\(\(item, index\)/);
});

test("LearningStudio 将课程 visualizer 传给空间运行实验舱", () => {
  assert.match(source, /SpatialRuntimeVisualizer/);
  assert.match(source, /visualizer=\{lesson\.execution\.visualizer\}/);
});
