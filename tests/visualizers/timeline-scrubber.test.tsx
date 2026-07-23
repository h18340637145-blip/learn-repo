import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { TraceTimelineScrubber } from "../../components/visualizers/trace-timeline-scrubber";

test("TraceTimelineScrubber 渲染帧控制与拖拽条", () => {
  const html = renderToStaticMarkup(
    <TraceTimelineScrubber
      currentFrameIndex={1}
      onSelectFrame={() => {}}
      onTogglePlay={() => {}}
      playbackState="paused"
      totalFrames={4}
    />
  );

  assert.match(html, /trace-scrubber-container/);
  assert.match(html, /帧 2 \/ 4/);
  assert.match(html, /▶/);
  assert.match(html, /scrubber-slider/);
});

test("TraceTimelineScrubber 在播放、暂停和完成状态展示正确动作", () => {
  const html = renderToStaticMarkup(
    <TraceTimelineScrubber
      currentFrameIndex={0}
      onSelectFrame={() => {}}
      onTogglePlay={() => {}}
      playbackState="playing"
      totalFrames={3}
    />
  );
  const completeHtml = renderToStaticMarkup(
    <TraceTimelineScrubber
      currentFrameIndex={2}
      onSelectFrame={() => {}}
      onTogglePlay={() => {}}
      playbackState="complete"
      totalFrames={3}
    />
  );

  assert.match(html, /⏸/);
  assert.match(completeHtml, /↻/);
  assert.match(completeHtml, /重播轨迹/);
});

test("TraceTimelineScrubber 在 disabled 状态禁用播放和拖拽", () => {
  const html = renderToStaticMarkup(
    <TraceTimelineScrubber
      currentFrameIndex={0}
      onSelectFrame={() => {}}
      onTogglePlay={() => {}}
      playbackState="disabled"
      totalFrames={3}
    />
  );

  assert.match(html, /disabled=""/);
  assert.match(html, /aria-disabled="true"/);
});
