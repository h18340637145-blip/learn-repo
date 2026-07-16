import assert from "node:assert/strict";
import test from "node:test";

import { publishedLessons } from "../../content/lesson-registry";
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

test("默认可视化配置每次返回独立 nodes 副本", () => {
  const first = getDefaultVisualizer("http-foundations", "knowledge");
  (first.nodes as string[]).push("污染节点");

  const second = getDefaultVisualizer("http-foundations", "knowledge");

  assert.deepEqual(second.nodes, ["Client", "Headers", "Router", "Handler", "Response"]);
  assert.notEqual(first.nodes, second.nodes);
});

test("重点阶段课程映射到主题化 3D 场景", () => {
  const byId = new Map(publishedLessons.map((lesson) => [lesson.id, lesson]));

  assert.equal(byId.get("http-transaction")?.execution.visualizer.type, "http-pipeline");
  assert.equal(byId.get("api-input-validation")?.execution.visualizer.type, "service-boundary");
  assert.equal(byId.get("concurrency-worker-threads")?.execution.visualizer.type, "worker-pool");
  assert.equal(byId.get("realtime-websocket-handshake")?.execution.visualizer.type, "realtime-mesh");
  assert.equal(byId.get("testing-node-test")?.execution.visualizer.type, "quality-shield");
  assert.equal(byId.get("diagnostics-cpu-profile")?.execution.visualizer.type, "diagnostics-tower");
});
