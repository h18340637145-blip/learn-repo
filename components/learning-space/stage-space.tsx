"use client";

import type { StageSpace } from "@/lib/curriculum/stage-space";

type StageSpaceMapProps = {
  stage: StageSpace;
  activeLessonId: string;
  onOpenLesson: (lessonIndex: number) => void;
};

export function StageSpaceMap({ stage, activeLessonId, onOpenLesson }: StageSpaceMapProps) {
  return (
    <section className="stage-space-map" aria-label={`${stage.title} 课程星图`}>
      <div className="stage-space-map__header">
        <span className="kicker">STAGE {String(stage.number).padStart(2, "0")}</span>
        <h2>{stage.title}</h2>
        <p>{stage.summary}</p>
      </div>
      <div className="stage-orbit" aria-hidden="true" />
      <div className="stage-node-grid">
        {stage.nodes.map((node) => (
          <button
            aria-current={node.id === activeLessonId ? "true" : undefined}
            className={`stage-node ${node.kind === "stage-project" ? "project" : "lesson"} ${node.state}${node.id === activeLessonId ? " active" : ""}`}
            disabled={node.lessonIndex === null}
            key={node.id}
            onClick={() => node.lessonIndex !== null && onOpenLesson(node.lessonIndex)}
            type="button"
          >
            <span>{node.kind === "stage-project" ? "PROJECT" : String(node.order).padStart(2, "0")}</span>
            <strong>{node.title}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
