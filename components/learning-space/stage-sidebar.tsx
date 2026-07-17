"use client";

import type { StageId } from "@/lib/curriculum/types";
import type { RoadmapStage } from "@/lib/curriculum/view-model";

type StageSidebarProps = {
  stages: readonly RoadmapStage[];
  activeStageId: StageId;
  activeLessonId: string;
  onSelectStage: (stageId: StageId) => void;
  onOpenLesson: (lessonId: string) => void;
};

export function StageSidebar({
  stages,
  activeStageId,
  activeLessonId,
  onSelectStage,
  onOpenLesson
}: StageSidebarProps) {
  return (
    <div className="stage-sidebar" aria-label="学习阶段">
      {stages.map((stage) => {
        const isActive = stage.id === activeStageId;
        const publishedItems = stage.items.filter((item) => item.status === "published");

        return (
          <section
            className={`stage-entry ${stage.state}${isActive ? " selected" : ""}`}
            key={stage.id}
          >
            <button
              aria-current={isActive ? "true" : undefined}
              className="stage-entry__button"
              onClick={() => onSelectStage(stage.id)}
              type="button"
            >
              <span className="stage-entry__number">{String(stage.number).padStart(2, "0")}</span>
              <span className="stage-entry__copy">
                <strong>{stage.title}</strong>
                <small>{stage.completedLessons} / {stage.publishedLessons} 已掌握</small>
              </span>
              <span className="stage-entry__pulse" aria-hidden="true" />
            </button>
            {isActive && publishedItems.length > 0 && (
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
      })}
    </div>
  );
}
