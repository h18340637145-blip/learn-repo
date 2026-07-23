import assert from "node:assert/strict";
import test from "node:test";

import {
  acceptRunnerFrame,
  completeTracePlayback,
  createRuntimePanelState,
  selectRuntimeTab,
  selectTraceFrame,
  startTracePlayback,
  toggleTracePlayback
} from "../../lib/runtime/runtime-panel-state";

test("运行面板状态支持 Console 与 Browser Tab 切换", () => {
  const initial = createRuntimePanelState();
  const browserState = selectRuntimeTab(initial, "browser");
  const consoleState = selectRuntimeTab(browserState, "console");

  assert.equal(browserState.activeTab, "browser");
  assert.equal(consoleState.activeTab, "console");
});

test("Trace 播放、暂停、完成和重播使用独立 playbackState", () => {
  const playing = startTracePlayback(createRuntimePanelState(), 4);
  const paused = toggleTracePlayback(playing, 4);
  const resumed = toggleTracePlayback(paused, 4);
  const complete = completeTracePlayback(resumed, 4);
  const replaying = toggleTracePlayback(complete, 4);

  assert.equal(playing.playbackState, "playing");
  assert.equal(paused.playbackState, "paused");
  assert.equal(resumed.playbackState, "playing");
  assert.equal(complete.playbackState, "complete");
  assert.equal(complete.frameIndex, 3);
  assert.equal(replaying.playbackState, "playing");
  assert.equal(replaying.frameIndex, -1);
});

test("拖拽选择帧会暂停播放并夹紧到合法帧范围", () => {
  const playing = startTracePlayback(createRuntimePanelState(), 4);
  const selected = selectTraceFrame(playing, 2, 4);
  const clamped = selectTraceFrame(selected, 99, 4);

  assert.equal(selected.playbackState, "paused");
  assert.equal(selected.frameIndex, 2);
  assert.equal(clamped.frameIndex, 3);
});

test("只有播放中状态接收 authored trace 帧，暂停后忽略旧流覆盖", () => {
  const playing = startTracePlayback(createRuntimePanelState(), 4);
  const synced = acceptRunnerFrame(playing, 1, 4);
  const paused = selectTraceFrame(synced, 0, 4);
  const staleIgnored = acceptRunnerFrame(paused, 3, 4);

  assert.equal(synced.frameIndex, 1);
  assert.equal(staleIgnored.playbackState, "paused");
  assert.equal(staleIgnored.frameIndex, 0);
});
