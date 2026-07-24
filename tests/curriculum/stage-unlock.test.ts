import assert from "node:assert/strict";
import test from "node:test";

import { STAGE_UNLOCK_THRESHOLD, getUnlockRequirement, isStageUnlocked } from "../../lib/curriculum/stage-unlock";
import type { CatalogLesson, CurriculumStage, StageId } from "../../lib/curriculum/types";
import { emptyProgress, type ProgressSnapshot } from "../../lib/progress/types";

function buildStage(number: number, id: string, lessonCount: number): CurriculumStage {
  const lessons: CatalogLesson[] = Array.from({ length: lessonCount }, (_, i) => ({
    id: `${id}-lesson-${i + 1}`,
    title: `Lesson ${i + 1}`,
    order: i + 1,
    kind: "knowledge",
    status: "published"
  }));

  return {
    id: id as StageId,
    number,
    title: `Stage ${number}`,
    summary: "",
    lessons,
    project: {
      id: `${id}-project`,
      title: "Project",
      order: 9,
      kind: "stage-project",
      status: "published"
    }
  };
}

const mockStages: CurriculumStage[] = [
  buildStage(0, "python-foundations", 8),
  buildStage(1, "python-data-structures", 8),
  buildStage(2, "python-modules-testing", 8)
];

test("STAGE_UNLOCK_THRESHOLD 是 0.7", () => {
  assert.equal(STAGE_UNLOCK_THRESHOLD, 0.7);
});

test("阶段 0 始终解锁", () => {
  const progress = emptyProgress("python");
  assert.equal(isStageUnlocked(0, progress, mockStages), true);
});

test("阶段 1 在阶段 0 完成不足 70% 时锁定", () => {
  // 5/8 = 62.5% < 70%
  const progress: ProgressSnapshot = {
    ...emptyProgress("python"),
    completedLessonIds: [
      "python-foundations-lesson-1",
      "python-foundations-lesson-2",
      "python-foundations-lesson-3",
      "python-foundations-lesson-4",
      "python-foundations-lesson-5"
    ]
  };
  assert.equal(isStageUnlocked(1, progress, mockStages), false);
});

test("阶段 1 在阶段 0 完成 ≥ 70% 时解锁", () => {
  // ceil(8 * 0.7) = 6
  const progress: ProgressSnapshot = {
    ...emptyProgress("python"),
    completedLessonIds: [
      "python-foundations-lesson-1",
      "python-foundations-lesson-2",
      "python-foundations-lesson-3",
      "python-foundations-lesson-4",
      "python-foundations-lesson-5",
      "python-foundations-lesson-6"
    ]
  };
  assert.equal(isStageUnlocked(1, progress, mockStages), true);
});

test("阶段项目完成不计入解锁判断", () => {
  const progress: ProgressSnapshot = {
    ...emptyProgress("python"),
    completedLessonIds: [
      "python-foundations-lesson-1",
      "python-foundations-lesson-2",
      "python-foundations-lesson-3",
      "python-foundations-lesson-4",
      "python-foundations-lesson-5"
    ],
    completedProjectIds: ["python-foundations-project"]
  };
  assert.equal(isStageUnlocked(1, progress, mockStages), false);
});

test("前置阶段无已发布知识点时视为解锁", () => {
  const stages = [
    {
      ...mockStages[0],
      lessons: mockStages[0].lessons.map((l) => ({ ...l, status: "planned" as const }))
    },
    mockStages[1]
  ];
  const progress = emptyProgress("python");
  assert.equal(isStageUnlocked(1, progress, stages), true);
});

test("getUnlockRequirement 返回锁定阶段的剩余数", () => {
  const progress: ProgressSnapshot = {
    ...emptyProgress("python"),
    completedLessonIds: [
      "python-foundations-lesson-1",
      "python-foundations-lesson-2"
    ]
  };
  const req = getUnlockRequirement(1, progress, mockStages);
  assert.deepEqual(req, { required: 6, completed: 2, remaining: 4 });
});

test("getUnlockRequirement 对阶段 0 返回 null", () => {
  const progress = emptyProgress("python");
  assert.equal(getUnlockRequirement(0, progress, mockStages), null);
});
