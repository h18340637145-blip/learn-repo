import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  CompletionBurst,
  EnergyRunway,
  NebulaProgress
} from "../../components/immersive";
import type { RoadmapStage } from "../../lib/curriculum/view-model";

const stages: RoadmapStage[] = [
  {
    id: "runtime-cli",
    number: 1,
    title: "运行时与命令行",
    totalLessons: 8,
    publishedLessons: 8,
    completedLessons: 8,
    state: "done",
    items: []
  },
  {
    id: "async-events",
    number: 3,
    title: "异步运行时与事件",
    totalLessons: 8,
    publishedLessons: 8,
    completedLessons: 4,
    state: "active",
    items: []
  }
];

test("NebulaProgress 渲染阶段星域和总进度", () => {
  const html = renderToStaticMarkup(
    <NebulaProgress stages={stages} activeStageId="async-events" progressPercent={42} />
  );

  assert.match(html, /nebula-progress/);
  assert.match(html, /运行时与命令行/);
  assert.match(html, /异步运行时与事件/);
  assert.match(html, /42%/);
  assert.match(html, /nebula-stage active/);
});

test("EnergyRunway 输出状态类名", () => {
  const html = renderToStaticMarkup(<EnergyRunway status="running" />);
  assert.match(html, /energy-runway running/);
  assert.match(html, /能量流已接入运行时/);
});

test("CompletionBurst 输出项目完成反馈", () => {
  const html = renderToStaticMarkup(<CompletionBurst visible variant="project" />);
  assert.match(html, /completion-burst visible project/);
  assert.match(html, /阶段核心已激活/);
});
