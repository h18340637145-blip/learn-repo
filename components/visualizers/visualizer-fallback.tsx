import type { RunnerFrame, VisualizerSpec } from "@/lib/curriculum/types";
import type { LearningVisualStatus } from "@/lib/immersive/visual-state";

type VisualizerFallbackProps = {
  visualizer: VisualizerSpec;
  status: LearningVisualStatus;
  frame: RunnerFrame | null;
};

export function VisualizerFallback({ visualizer, status, frame }: VisualizerFallbackProps) {
  const activeIndex = Math.max(0, frame?.activeLane ?? 0);

  return (
    <div className={`visualizer-fallback ${status}`}>
      <div className="visualizer-fallback__header">
        <span>3D FALLBACK</span>
        <strong>{visualizer.title}</strong>
      </div>
      <div className="visualizer-fallback__nodes" aria-label="运行节点序列">
        {visualizer.nodes.map((node, index) => (
          <span className={index === activeIndex ? "active" : ""} key={`${node}-${index}`}>
            {node}
          </span>
        ))}
      </div>
      <p>{frame?.note ?? "答对后将显示运行路径。"}</p>
    </div>
  );
}
