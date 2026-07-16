import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { SpatialRuntimeVisualizer, VisualizerFallback } from "../../components/visualizers";
import type { RunnerFrame, VisualizerSpec } from "../../lib/curriculum/types";

const visualizer: VisualizerSpec = {
  type: "http-pipeline",
  title: "HTTP 请求响应管线",
  nodes: ["Client", "Headers", "Router", "Handler", "Response"]
};

const frame: RunnerFrame = {
  activeLane: 1,
  laneValues: ["GET /learn", "Router", "等待"],
  log: ["进入请求"],
  note: "请求进入 Router",
  delayMs: 300
};

test("VisualizerFallback 渲染可读节点和当前状态", () => {
  const html = renderToStaticMarkup(
    <VisualizerFallback frame={frame} status="running" visualizer={visualizer} />
  );

  assert.match(html, /visualizer-fallback running/);
  assert.match(html, /HTTP 请求响应管线/);
  assert.match(html, /Headers/);
  assert.match(html, /请求进入 Router/);
});

test("SpatialRuntimeVisualizer 服务端静态渲染时保留 fallback 结构", () => {
  const html = renderToStaticMarkup(
    <SpatialRuntimeVisualizer frame={frame} status="running" visualizer={visualizer} />
  );

  assert.match(html, /spatial-runtime-visualizer/);
  assert.match(html, /visualizer-fallback/);
});

test("SpatialRuntimeVisualizer 在移动端降级为 fallback", () => {
  const source = readFileSync("components/visualizers/spatial-runtime-visualizer.tsx", "utf8");

  assert.match(source, /\(max-width: 760px\)/);
  assert.match(source, /smallViewport/);
});
