"use client";

import type { StageId } from "@/lib/curriculum/types";
import type { RoadmapStage } from "@/lib/curriculum/view-model";

type StageSidebarProps = {
  stages: readonly RoadmapStage[];
  activeStageId: StageId;
  onSelectStage: (stageId: StageId) => void;
};

export function StageSidebar({ stages, activeStageId, onSelectStage }: StageSidebarProps) {
  return (
    <div className="stage-sidebar" aria-label="学习阶段">
      {stages.map((stage) => {
        const stageId = stage.id as StageId;
        const isActive = stageId === activeStageId;

        return (
          <button
            className={`stage-entry ${stage.state}${isActive ? " selected" : ""}`}
            key={stage.id}
            onClick={() => onSelectStage(stageId)}
            type="button"
          >
            <span className="stage-entry__number">{String(stage.number).padStart(2, "0")}</span>
            <span className="stage-entry__copy">
              <strong>{stage.title}</strong>
              <small>{stage.completedLessons} / {stage.publishedLessons} 已掌握</small>
            </span>
            <span className="stage-entry__pulse" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
