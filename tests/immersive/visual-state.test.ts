import assert from "node:assert/strict";
import test from "node:test";

import {
  getBackdropIntensity,
  getCompletionBurstModel,
  getEnergyRunwayClassName,
  getNebulaStageState
} from "../../lib/immersive/visual-state";
import type { RoadmapStage } from "../../lib/curriculum/view-model";

const activeStage: RoadmapStage = {
  id: "async-events",
  number: 3,
  title: "异步运行时与事件",
  totalLessons: 8,
  publishedLessons: 8,
  completedLessons: 4,
  state: "active",
  locked: false,
  items: []
};

test("背景粒子强度跟随学习状态变化，并支持减少动态效果", () => {
  assert.equal(getBackdropIntensity("idle", false), 0.45);
  assert.equal(getBackdropIntensity("running", false), 0.82);
  assert.equal(getBackdropIntensity("success", false), 1);
  assert.equal(getBackdropIntensity("running", true), 0);
});

test("星云阶段状态标记当前阶段、完成度和项目核心", () => {
  assert.deepEqual(getNebulaStageState(activeStage, "async-events"), {
    className: "nebula-stage active",
    completionPercent: 50,
    hasCoreGlow: false,
    label: "03"
  });
});

test("能量通道根据状态输出稳定类名", () => {
  assert.equal(getEnergyRunwayClassName("idle"), "energy-runway idle");
  assert.equal(getEnergyRunwayClassName("wrong"), "energy-runway wrong");
  assert.equal(getEnergyRunwayClassName("running"), "energy-runway running");
  assert.equal(getEnergyRunwayClassName("success"), "energy-runway success");
});

test("完成爆发区分课程和阶段项目", () => {
  assert.deepEqual(getCompletionBurstModel(true, "lesson"), {
    className: "completion-burst visible lesson",
    title: "知识星体已点亮",
    subtitle: "运行完成，记忆回路已同步。"
  });

  assert.deepEqual(getCompletionBurstModel(true, "project"), {
    className: "completion-burst visible project",
    title: "阶段核心已激活",
    subtitle: "项目挑战完成，星域能量环已扩散。"
  });
});
