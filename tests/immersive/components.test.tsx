import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  AchievementUnlock,
  CompletionBurst,
  CursorSparks,
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
  assert.match(html, /nebula-stage active selected/);
});

test("NebulaProgress 支持点击阶段星体", () => {
  const html = renderToStaticMarkup(
    <NebulaProgress
      stages={stages}
      activeStageId="async-events"
      progressPercent={42}
      onSelectStage={() => {}}
    />
  );

  assert.match(html, /button/);
  assert.match(html, /aria-label="进入运行时与命令行阶段"/);
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

test("CursorSparks 输出鼠标火花画布", () => {
  const html = renderToStaticMarkup(<CursorSparks />);

  assert.match(html, /cursor-sparks/);
  assert.match(html, /aria-hidden="true"/);
});

test("AchievementUnlock 输出游戏化成就解锁反馈", () => {
  const lessonHtml = renderToStaticMarkup(
    <AchievementUnlock lessonTitle="Node.js 与浏览器的边界" visible variant="lesson" />
  );
  const projectHtml = renderToStaticMarkup(
    <AchievementUnlock lessonTitle="CLI 系统信息探测器" visible variant="project" />
  );

  assert.match(lessonHtml, /achievement-unlock visible lesson/);
  assert.match(lessonHtml, /知识芯片已解锁/);
  assert.match(lessonHtml, /Node\.js 与浏览器的边界/);
  assert.match(projectHtml, /阶段徽章已铸造/);
});
