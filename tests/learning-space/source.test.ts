import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("app/_components/learning-studio.tsx", "utf8");

test("LearningStudio 使用阶段空间组件替代全局课程切换器", () => {
  assert.match(source, /selectedStageId/);
  assert.match(source, /StageSidebar/);
  assert.match(source, /StageSpaceMap/);
  assert.doesNotMatch(source, /className="lesson-switcher"/);
});

test("LearningStudio 将课程 visualizer 传给空间运行实验舱", () => {
  assert.match(source, /SpatialRuntimeVisualizer/);
  assert.match(source, /visualizer=\{execution\.visualizer\}/);
});

test("LearningStudio 提供可点击左侧驾驶舱和课程轨道面板", () => {
  assert.match(source, /onSelectStage=\{selectStage\}/);
  assert.match(source, /className="project-shortcut"/);
  assert.match(source, /className="course-orbital-dashboard"/);
  assert.match(source, /execution\?\.visualizer\?\.title/);
});

test("LearningStudio 在左侧展示路线统计卡", () => {
  assert.match(source, /routeStats/);
  assert.match(source, /route-stats-panel/);
  assert.match(source, /已发布案例/);
  assert.match(source, /互动题/);
  assert.match(source, /知识点/);
  assert.match(source, /阶段项目/);
});

test("LearningStudio 答案选项包含空间粒子层", () => {
  assert.match(source, /answer-particle-field/);
  assert.match(source, /answer-orbit/);
  assert.match(source, /answer-core/);
});

test("LearningStudio 代码面板提供 Chrome 可见标题和空间光晕", () => {
  assert.match(source, /code-panel__title/);
  assert.match(source, /codeLabel/);
  assert.match(source, /code-panel__aurora/);
});

test("LearningStudio 接入游戏化任务 HUD 和成就解锁反馈", () => {
  assert.match(source, /CursorSparks/);
  assert.match(source, /AchievementUnlock/);
  assert.match(source, /className="mission-hud"/);
  assert.match(source, /MISSION STATUS/);
  assert.match(source, /lessonTitle=\{lesson\.title\}/);
});

test("LearningStudio 写入题目级作答记录并展示学习报告", () => {
  assert.match(source, /buildLearningReport/);
  assert.match(source, /recordQuestionAttempt/);
  assert.match(source, /learning-report-panel/);
  assert.match(source, /首次正确率/);
  assert.match(source, /待复习/);
});
