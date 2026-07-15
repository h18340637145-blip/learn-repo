import type { CSSProperties } from "react";

import type { RoadmapStage } from "@/lib/curriculum/view-model";
import { getNebulaStageState } from "@/lib/immersive/visual-state";

type NebulaProgressProps = {
  stages: RoadmapStage[];
  activeStageId: string;
  progressPercent: number;
};

export function NebulaProgress({ stages, activeStageId, progressPercent }: NebulaProgressProps) {
  return (
    <section className="nebula-progress" aria-label={`知识星云进度 ${progressPercent}%`}>
      <div className="nebula-progress__core">
        <span className="kicker">KNOWLEDGE NEBULA</span>
        <strong>{progressPercent}%</strong>
        <small>learning energy</small>
      </div>
      <div className="nebula-progress__stages">
        {stages.map((stage) => {
          const state = getNebulaStageState(stage, activeStageId);

          return (
            <div
              className={state.className}
              key={stage.id}
              style={{ "--stage-progress": `${state.completionPercent}%` } as CSSProperties}
            >
              <span className="nebula-stage__index">{state.label}</span>
              <span className="nebula-stage__star" />
              <span className="nebula-stage__title">{stage.title}</span>
              {state.hasCoreGlow && <span className="nebula-stage__core" />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
