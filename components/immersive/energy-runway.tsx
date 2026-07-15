import { getEnergyRunwayClassName, type LearningVisualStatus } from "@/lib/immersive/visual-state";

type EnergyRunwayProps = {
  status: LearningVisualStatus;
};

export function EnergyRunway({ status }: EnergyRunwayProps) {
  const label = status === "running"
    ? "能量流已接入运行时"
    : status === "success"
      ? "运行回路同步完成"
      : status === "wrong"
        ? "预测扰动已记录"
        : "等待正确预测点火";

  return (
    <div className={getEnergyRunwayClassName(status)} aria-hidden="true">
      <span className="energy-runway__beam" />
      <span className="energy-runway__label">{label}</span>
    </div>
  );
}
