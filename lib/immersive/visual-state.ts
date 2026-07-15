import type { RoadmapStage } from "../curriculum/view-model";

export type LearningVisualStatus = "idle" | "running" | "wrong" | "success";
export type CompletionBurstVariant = "lesson" | "project";

export function getBackdropIntensity(status: LearningVisualStatus, reduceMotion: boolean): number {
  if (reduceMotion) return 0;
  if (status === "success") return 1;
  if (status === "running") return 0.82;
  if (status === "wrong") return 0.28;
  return 0.45;
}

export function getEnergyRunwayClassName(status: LearningVisualStatus): string {
  return `energy-runway ${status}`;
}

export function getNebulaStageState(stage: RoadmapStage, activeStageId: string) {
  const completionPercent = stage.totalLessons === 0
    ? 0
    : Math.round((stage.completedLessons / stage.totalLessons) * 100);
  const stateClass = stage.id === activeStageId ? "active" : stage.state;

  return {
    className: `nebula-stage ${stateClass}`,
    completionPercent,
    hasCoreGlow: stage.state === "done" && completionPercent === 100,
    label: String(stage.number).padStart(2, "0")
  };
}

export function getCompletionBurstModel(visible: boolean, variant: CompletionBurstVariant) {
  const isProject = variant === "project";

  return {
    className: `completion-burst ${visible ? "visible" : "hidden"} ${variant}`,
    title: isProject ? "阶段核心已激活" : "知识星体已点亮",
    subtitle: isProject ? "项目挑战完成，星域能量环已扩散。" : "运行完成，记忆回路已同步。"
  };
}
