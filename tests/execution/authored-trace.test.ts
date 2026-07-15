import assert from "node:assert/strict";
import test from "node:test";

import { streamAuthoredTrace } from "../../lib/execution/authored-trace";
import type { RunnerFrame } from "../../lib/curriculum/types";

const frames: RunnerFrame[] = [
  { activeLane: 0, laneValues: ["一"], log: ["1"], note: "第一步", delayMs: 0 },
  { activeLane: 1, laneValues: ["二"], log: ["1", "2"], note: "第二步", delayMs: 0 }
];

test("按声明顺序产生全部帧", async () => {
  const actual: RunnerFrame[] = [];
  for await (const frame of streamAuthoredTrace(frames)) actual.push(frame);
  assert.deepEqual(actual, frames);
});

test("AbortSignal 取消后不再产生后续帧", async () => {
  const controller = new AbortController();
  const actual: RunnerFrame[] = [];

  for await (const frame of streamAuthoredTrace(frames, controller.signal)) {
    actual.push(frame);
    controller.abort();
  }

  assert.deepEqual(actual, [frames[0]]);
});
