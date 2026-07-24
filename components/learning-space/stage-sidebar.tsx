"use client";

import type { DifficultyTier, StageId } from "@/lib/curriculum/types";
import type { RoadmapStage } from "@/lib/curriculum/view-model";

type StageSidebarProps = {
  stages: readonly RoadmapStage[];
  activeStageId: StageId;
  activeLessonId: string;
  onSelectStage: (stageId: StageId) => void;
  onOpenLesson: (lessonId: string) => void;
  tiers?: Record<DifficultyTier, StageId[]>;
  pathProgress?: Record<DifficultyTier, number>;
};

const TIER_META: Record<DifficultyTier, { label: string; description: string }> = {
  beginner: { label: "入门", description: "建立核心心智模型" },
  intermediate: { label: "深入", description: "掌握运行边界与工程细节" },
  advanced: { label: "实战", description: "面向真实场景的综合挑战" }
};

function renderStageEntry(
  stage: RoadmapStage,
  activeStageId: StageId,
  activeLessonId: string,
  onSelectStage: (stageId: StageId) => void,
  onOpenLesson: (lessonId: string) => void
) {
  const isActive = stage.id === activeStageId;
  const publishedItems = stage.items.filter((item) => item.status === "published");
  const isLocked = stage.locked && stage.state === "locked";

  return (
    <section
      className={`stage-entry ${stage.state}${isActive ? " selected" : ""}${isLocked ? " locked" : ""}`}
      key={stage.id}
    >
      <button
        aria-current={isActive ? "true" : undefined}
        aria-disabled={isLocked ? "true" : undefined}
        className="stage-entry__button"
        onClick={() => onSelectStage(stage.id)}
        type="button"
      >
        <span className="stage-entry__number">{String(stage.number).padStart(2, "0")}</span>
        <span className="stage-entry__copy">
          <strong>{stage.title}</strong>
          {isLocked && stage.unlockHint ? (
            <small>🔒 再完成 {stage.unlockHint.remaining} 个知识点解锁</small>
          ) : (
            <small>{stage.completedLessons} / {stage.publishedLessons} 已掌握</small>
          )}
        </span>
        <span className="stage-entry__pulse" aria-hidden="true" />
      </button>
      {isActive && !isLocked && publishedItems.length > 0 && (
        <div className="roadmap-items" aria-label={`${stage.title} 知识点`}>
          {publishedItems.map((item) => (
            <button
              aria-current={item.id === activeLessonId ? "step" : undefined}
              className={`roadmap-item${item.id === activeLessonId ? " active" : ""}`}
              key={item.id}
              onClick={() => onOpenLesson(item.id)}
              type="button"
            >
              {item.title}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export function StageSidebar({
  stages,
  activeStageId,
  activeLessonId,
  onSelectStage,
  onOpenLesson,
  tiers,
  pathProgress
}: StageSidebarProps) {
  if (!tiers) {
    return (
      <div className="stage-sidebar" aria-label="学习阶段">
        {stages.map((stage) =>
          renderStageEntry(stage, activeStageId, activeLessonId, onSelectStage, onOpenLesson)
        )}
      </div>
    );
  }

  const stageById = new Map(stages.map((stage) => [stage.id, stage]));
  const tierOrder: DifficultyTier[] = ["beginner", "intermediate", "advanced"];

  return (
    <div className="stage-sidebar tiered" aria-label="学习阶段">
      {tierOrder.map((tier) => {
        const stageIds = tiers[tier] ?? [];
        const tierStages = stageIds
          .map((id) => stageById.get(id))
          .filter((stage): stage is RoadmapStage => Boolean(stage));

        if (tierStages.length === 0) {
          return null;
        }

        const percent = pathProgress?.[tier] ?? 0;
        const meta = TIER_META[tier];

        return (
          <div className={`tier-zone tier-zone--${tier}`} key={tier}>
            <header className="tier-zone__header">
              <div className="tier-zone__title">
                <span className="tier-zone__label">{meta.label}</span>
                <small>{meta.description}</small>
              </div>
              <div
                className="tier-zone__progress"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                aria-label={`${meta.label}进度 ${percent}%`}
              >
                <span className="tier-zone__progress-fill" style={{ width: `${percent}%` }} />
                <em>{percent}%</em>
              </div>
            </header>
            <div className="tier-zone__stages">
              {tierStages.map((stage) =>
                renderStageEntry(stage, activeStageId, activeLessonId, onSelectStage, onOpenLesson)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
