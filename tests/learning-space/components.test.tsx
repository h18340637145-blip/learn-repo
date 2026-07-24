import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { StageSidebar, StageSpaceMap } from "../../components/learning-space";
import type { StageSpace } from "../../lib/curriculum/stage-space";
import type { RoadmapStage } from "../../lib/curriculum/view-model";

const roadmap: RoadmapStage[] = [{
  id: "http-foundations",
  number: 5,
  title: "HTTP 基础",
  totalLessons: 8,
  publishedLessons: 8,
  completedLessons: 2,
  state: "active",
  locked: false,
  items: [{ id: "http-transaction", title: "HTTP 事务生命周期", status: "published" }]
}];

const stageSpace: StageSpace = {
  id: "http-foundations",
  number: 5,
  title: "HTTP 基础",
  summary: "理解一次网络事务",
  completedCount: 1,
  publishedCount: 9,
  nodes: [
    { id: "http-transaction", title: "HTTP 事务生命周期", order: 1, kind: "knowledge", status: "published", state: "done", lessonIndex: 29, difficulty: 1 },
    { id: "http-planned", title: "计划中的 HTTP 课程", order: 2, kind: "knowledge", status: "planned", state: "planned", lessonIndex: null, difficulty: 1 },
    { id: "project-static-file-server", title: "流式静态文件服务器", order: 9, kind: "stage-project", status: "published", state: "available", lessonIndex: 37, difficulty: 3 }
  ]
};

test("StageSidebar 渲染阶段入口和当前阶段可点击知识点", () => {
  const html = renderToStaticMarkup(
    <StageSidebar
      activeLessonId="http-transaction"
      activeStageId="http-foundations"
      onOpenLesson={() => {}}
      onSelectStage={() => {}}
      stages={roadmap}
    />
  );

  assert.match(html, /stage-sidebar/);
  assert.match(html, /HTTP 基础/);
  assert.match(html, /aria-current="true"/);
  assert.match(html, /HTTP 事务生命周期/);
  assert.match(html, /class="roadmap-item active"/);
  assert.match(html, /aria-current="step"/);
});

test("StageSpaceMap 渲染当前阶段课程节点和项目节点", () => {
  const html = renderToStaticMarkup(
    <StageSpaceMap activeLessonId="http-transaction" stage={stageSpace} onOpenLesson={() => {}} />
  );

  assert.match(html, /stage-space-map/);
  assert.match(html, /HTTP 事务生命周期/);
  assert.match(html, /流式静态文件服务器/);
  assert.match(html, /stage-node project/);
  assert.match(html, /aria-current="true"/);
  assert.match(html, /disabled/);
});
