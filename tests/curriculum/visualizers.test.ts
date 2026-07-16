import assert from "node:assert/strict";
import test from "node:test";

import { getDefaultVisualizer } from "../../lib/curriculum/visualizers";

test("不同阶段生成对应的默认可视化类型", () => {
  assert.equal(getDefaultVisualizer("http-foundations", "knowledge").type, "http-pipeline");
  assert.equal(getDefaultVisualizer("api-design", "knowledge").type, "service-boundary");
  assert.equal(getDefaultVisualizer("process-concurrency", "knowledge").type, "worker-pool");
  assert.equal(getDefaultVisualizer("realtime", "knowledge").type, "realtime-mesh");
  assert.equal(getDefaultVisualizer("testing-security", "knowledge").type, "quality-shield");
  assert.equal(getDefaultVisualizer("diagnostics-production", "knowledge").type, "diagnostics-tower");
});

test("普通阶段和阶段项目都有可用的 fallback 可视化配置", () => {
  assert.deepEqual(getDefaultVisualizer("runtime-cli", "knowledge"), {
    type: "generic-particle-flow",
    title: "通用运行粒子流",
    nodes: ["输入", "执行", "输出"]
  });

  assert.equal(getDefaultVisualizer("files-streams", "stage-project").type, "stage-project-core");
});
