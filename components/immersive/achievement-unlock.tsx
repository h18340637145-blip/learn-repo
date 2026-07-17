import type { CompletionBurstVariant } from "@/lib/immersive/visual-state";

type AchievementUnlockProps = {
  visible: boolean;
  variant: CompletionBurstVariant;
  lessonTitle: string;
};

export function AchievementUnlock({ visible, variant, lessonTitle }: AchievementUnlockProps) {
  const isProject = variant === "project";

  return (
    <aside
      aria-live="polite"
      className={`achievement-unlock ${visible ? "visible" : "hidden"} ${variant}`}
    >
      <span className="achievement-unlock__halo" aria-hidden="true" />
      <div className="achievement-unlock__badge" aria-hidden="true">
        {isProject ? "◆" : "✦"}
      </div>
      <div className="achievement-unlock__copy">
        <span>{isProject ? "阶段徽章已铸造" : "知识芯片已解锁"}</span>
        <strong>{lessonTitle}</strong>
        <small>{isProject ? "项目核心能量写入星图" : "记忆回路同步完成"}</small>
      </div>
    </aside>
  );
}
