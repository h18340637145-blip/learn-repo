import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { TraceTimelineScrubber } from "../../components/visualizers/trace-timeline-scrubber";

test("TraceTimelineScrubber 渲染帧控制与拖拽条", () => {
  const html = renderToStaticMarkup(
    <TraceTimelineScrubber
      currentFrameIndex={1}
      isPlaying={false}
      onSelectFrame={() => {}}
      onTogglePlay={() => {}}
      totalFrames={4}
    />
  );

  assert.match(html, /trace-scrubber-container/);
  assert.match(html, /帧 2 \/ 4/);
  assert.match(html, /▶/);
  assert.match(html, /scrubber-slider/);
});

test("TraceTimelineScrubber 在 isPlaying 为 true 时显示暂停按钮", () => {
  const html = renderToStaticMarkup(
    <TraceTimelineScrubber
      currentFrameIndex={0}
      isPlaying={true}
      onSelectFrame={() => {}}
      onTogglePlay={() => {}}
      totalFrames={3}
    />
  );

  assert.match(html, /⏸/);
});
