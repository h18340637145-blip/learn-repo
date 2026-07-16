import assert from "node:assert/strict";
import test from "node:test";

import { publishedLessons } from "../../content/lesson-registry";
import { createAdvancedLesson } from "../../content/lessons/advanced-lesson-factory";
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

test("高级课程显式传入的可视化配置会克隆节点列表", () => {
  const customVisualizer = {
    type: "service-boundary" as const,
    title: "自定义服务边界",
    nodes: ["请求", "校验", "响应"]
  };

  const firstLesson = createAdvancedLesson({
    id: "custom-visualizer-lesson",
    stageId: "api-design",
    order: 1,
    title: "自定义视觉器课程",
    concept: "课程可以覆盖默认视觉器。",
    points: ["显式配置优先于阶段默认配置"],
    memoryHook: "自定义视觉器需要隔离节点数组。",
    code: "console.log('custom visualizer');",
    entryFile: "index.js",
    prompt: "课程应该使用哪个视觉器？",
    correct: "使用自定义视觉器",
    wrongA: "总是使用默认视觉器",
    wrongB: "不生成视觉器",
    correctFeedback: "显式传入的 visualizer 会优先使用。",
    wrongAFeedback: "只有没有显式配置时才使用默认视觉器。",
    wrongBFeedback: "课程始终需要运行可视化配置。",
    lanes: ["输入", "处理", "输出"],
    frameValues: ["收到请求", "完成校验", "返回响应"],
    log: ["收到请求", "完成校验", "返回响应"],
    summary: ["自定义视觉器保持课程表达和数据隔离。"],
    sourceTitle: "Node.js 文档",
    sourceUrl: "https://nodejs.org/api/",
    visualizer: customVisualizer,
    kind: "knowledge"
  });

  assert.equal(firstLesson.execution.visualizer.type, customVisualizer.type);
  assert.equal(firstLesson.execution.visualizer.title, customVisualizer.title);
  assert.deepEqual(firstLesson.execution.visualizer.nodes, customVisualizer.nodes);
  assert.notEqual(firstLesson.execution.visualizer.nodes, customVisualizer.nodes);

  (firstLesson.execution.visualizer.nodes as string[]).push("污染节点");

  assert.deepEqual(customVisualizer.nodes, ["请求", "校验", "响应"]);

  const secondLesson = createAdvancedLesson({
    id: "custom-visualizer-lesson-next",
    stageId: "api-design",
    order: 2,
    title: "第二个自定义视觉器课程",
    concept: "再次创建课程时应从原始自定义配置克隆。",
    points: ["上一次返回值的变更不能影响下一次创建"],
    memoryHook: "每次创建都拿到独立节点数组。",
    code: "console.log('custom visualizer next');",
    entryFile: "index.js",
    prompt: "第二次创建应该包含污染节点吗？",
    correct: "不应该包含",
    wrongA: "应该包含",
    wrongB: "应该丢失所有节点",
    correctFeedback: "每次创建都会克隆自定义节点列表。",
    wrongAFeedback: "共享节点数组会把上一次返回值的修改带进来。",
    wrongBFeedback: "克隆不会丢失原始节点。",
    lanes: ["输入", "处理", "输出"],
    frameValues: ["收到请求", "完成校验", "返回响应"],
    log: ["收到请求", "完成校验", "返回响应"],
    summary: ["第二次创建仍然保持干净节点。"],
    sourceTitle: "Node.js 文档",
    sourceUrl: "https://nodejs.org/api/",
    visualizer: customVisualizer,
    kind: "knowledge"
  });

  assert.deepEqual(secondLesson.execution.visualizer.nodes, ["请求", "校验", "响应"]);
  assert.notEqual(secondLesson.execution.visualizer.nodes, customVisualizer.nodes);
  assert.notEqual(secondLesson.execution.visualizer.nodes, firstLesson.execution.visualizer.nodes);
});
