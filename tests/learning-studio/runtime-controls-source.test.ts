import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("app/_components/learning-studio.tsx", "utf8");

test("LearningStudio 不再给 TraceTimelineScrubber 传入空播放函数", () => {
  assert.doesNotMatch(source, /onTogglePlay=\{\(\) => \{\}\}/);
  assert.match(source, /toggleTracePlayback/);
  assert.match(source, /playbackState=/);
});

test("LearningStudio 使用可访问 Tab 和对应面板承载 Console 与 MicroBrowser", () => {
  assert.match(source, /role="tablist"/);
  assert.match(source, /aria-selected=\{activeConsoleTab === "console"\}/);
  assert.match(source, /aria-selected=\{activeConsoleTab === "browser"\}/);
  assert.match(source, /role="tabpanel"/);
});

test("LearningStudio 将 lesson 或 step 的 incident 配置传给 ProductionIncidentHUD", () => {
  assert.match(source, /incident=\{currentStep\?\.incident \?\? lesson\.incident\}/);
});
