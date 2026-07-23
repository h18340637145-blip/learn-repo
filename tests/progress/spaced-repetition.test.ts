import assert from "node:assert/strict";
import test from "node:test";

import { calculateSM2NextReview } from "../../lib/progress/spaced-repetition";

test("calculateSM2NextReview 首次回答正确可提升 EF 并推荐 3 天后复习", () => {
  const result = calculateSM2NextReview(true, 1, 2.5, 1);

  assert.equal(result.easinessFactor, 2.6);
  assert.equal(result.intervalDays, 3);
  assert.equal(result.reviewState, "mastered");
  assert.ok(result.nextReviewAt);
});

test("calculateSM2NextReview 首次回答错误降低 EF 并要求 1 天后复习", () => {
  const result = calculateSM2NextReview(false, 1, 2.5, 1);

  assert.ok(result.easinessFactor < 2.5);
  assert.equal(result.intervalDays, 1);
  assert.equal(result.reviewState, "reviewing");
});

test("calculateSM2NextReview 连续多次复习正确间隔时间呈倍数增长", () => {
  const step1 = calculateSM2NextReview(true, 1, 2.5, 1);
  assert.equal(step1.intervalDays, 3);

  const step2 = calculateSM2NextReview(true, 1, step1.easinessFactor, step1.intervalDays);
  assert.equal(step2.intervalDays, 7);

  const step3 = calculateSM2NextReview(true, 1, step2.easinessFactor, step2.intervalDays);
  assert.ok(step3.intervalDays > 7);
});
