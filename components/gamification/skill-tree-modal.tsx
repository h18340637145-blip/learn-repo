"use client";

import { useState } from "react";
import type { CurriculumStage, LessonSpec, CourseId } from "@/lib/curriculum/types";
import type { ProgressSnapshot } from "@/lib/progress/types";
import { calculateStreak } from "@/lib/progress/streak";

type SkillTreeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  curriculum: readonly CurriculumStage[];
  publishedLessons: readonly LessonSpec[];
  progress: ProgressSnapshot;
  courseId: CourseId;
  courseTitle: string;
  onSelectLesson?: (lessonId: string) => void;
};

export function SkillTreeModal({
  isOpen,
  onClose,
  curriculum,
  publishedLessons,
  progress,
  courseId,
  courseTitle,
  onSelectLesson
}: SkillTreeModalProps) {
  const [copiedShare, setCopiedShare] = useState(false);
  const streakInfo = calculateStreak(progress);

  if (!isOpen) return null;

  const publishedSet = new Set(publishedLessons.map((l) => l.id));
  const completedSet = new Set([
    ...progress.completedLessonIds,
    ...progress.completedProjectIds
  ]);
  const completionRate = publishedLessons.length === 0
    ? 0
    : Math.round((completedSet.size / publishedLessons.length) * 100);

  const handleCopyShareCard = () => {
    const text = `🚀 我正在 NodePath 上学习【${courseTitle}】！\n🔥 连续打卡：${streakInfo.currentStreak} 天 (最高 ${streakInfo.bestStreak} 天)\n🎯 已解锁节点：${completedSet.size} 个\n🏆 技能称号：${streakInfo.masteryTitle}\n快来和我一起用 3D 视觉推演掌握全栈技术吧！`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div
      className="skill-tree-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(3, 6, 11, 0.88)",
        backdropFilter: "blur(16px)",
        display: "grid",
        placeItems: "center",
        padding: "24px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1120px",
          maxHeight: "90vh",
          background: "var(--panel)",
          border: "1px solid rgba(124, 92, 255, 0.35)",
          borderRadius: "18px",
          boxShadow: "0 0 50px rgba(124, 92, 255, 0.18), inset 0 0 30px rgba(0, 0, 0, 0.8)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {/* Header with Streak Info */}
        <header
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid var(--line)",
            background: "radial-gradient(circle at 10% 20%, rgba(124, 92, 255, 0.15), transparent 50%), rgba(8, 11, 16, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px"
          }}
        >
          <div>
            <span style={{ color: "var(--violet)", fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.15em" }}>
              GAMEIFIED SKILL TREE · {courseTitle.toUpperCase()} 技能树
            </span>
            <h2 style={{ margin: "4px 0 0", fontSize: "22px", color: "var(--ink)", fontWeight: "700" }}>
              技能星图与打卡成就
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Streak Badge */}
            <div
              style={{
                padding: "8px 14px",
                background: "rgba(255, 173, 102, 0.12)",
                border: "1px solid rgba(255, 173, 102, 0.35)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span style={{ fontSize: "20px" }}>🔥</span>
              <div>
                <div style={{ color: "var(--orange)", fontSize: "12px", fontWeight: "700" }}>
                  连续学习 {streakInfo.currentStreak} 天
                </div>
                <div style={{ color: "var(--quiet)", fontSize: "9px" }}>
                  最高连击: {streakInfo.bestStreak} 天 · 累计 {streakInfo.totalStudyDays} 天
                </div>
              </div>
            </div>

            {/* Mastery Badge */}
            <div
              style={{
                padding: "8px 14px",
                background: "rgba(159, 232, 112, 0.12)",
                border: "1px solid rgba(159, 232, 112, 0.35)",
                borderRadius: "10px"
              }}
            >
              <div style={{ color: "var(--green-bright)", fontSize: "12px", fontWeight: "700" }}>
                🏆 {streakInfo.masteryTitle}
              </div>
              <div style={{ color: "var(--quiet)", fontSize: "9px" }}>
                {courseId.toUpperCase()} 已打通 {completedSet.size} / {publishedLessons.length} 关卡 · {completionRate}%
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid var(--line)",
                color: "var(--muted)",
                borderRadius: "8px",
                padding: "6px 14px",
                cursor: "pointer",
                fontSize: "13px"
              }}
            >
              ✕ 关闭
            </button>
          </div>
        </header>

        {/* Skill Tree Grid Body */}
        <div className="skill-orbit-map" style={{ flex: 1, overflowY: "auto", padding: "28px", display: "flex", flexDirection: "column", gap: "28px" }}>
          {curriculum.map((stage) => {
            const stageLessons = stage.lessons;
            const stageProject = stage.project;
            const allStageLessons = [...stageLessons, stageProject];
            const completedInStage = allStageLessons.filter((l) => completedSet.has(l.id)).length;
            const isStageDone = completedInStage === allStageLessons.length && allStageLessons.length > 0;

            return (
              <div
                className={`skill-stage-orbit ${isStageDone ? "is-complete" : ""}`}
                key={stage.id}
                style={{
                  background: "rgba(10, 14, 20, 0.65)",
                  border: isStageDone ? "1px solid rgba(159, 232, 112, 0.4)" : "1px solid var(--line)",
                  borderRadius: "14px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  position: "relative"
                }}
              >
                {/* Stage Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ color: isStageDone ? "var(--green-bright)" : "var(--cyan)", fontSize: "10px", fontFamily: "monospace" }}>
                      STAGE {String(stage.number).padStart(2, "0")} · {completedInStage} / {allStageLessons.length} 解锁
                    </span>
                    <h3 style={{ margin: "2px 0 0", fontSize: "16px", color: "var(--ink)", fontWeight: "600" }}>
                      {stage.title}
                    </h3>
                  </div>

                  {isStageDone && (
                    <span style={{ color: "var(--green-bright)", fontSize: "12px", fontWeight: "700" }}>
                      ✨ 阶段完整铸造
                    </span>
                  )}
                </div>

                {/* Nodes list */}
                <div
                  className="skill-node-cloud"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "10px"
                  }}
                >
                  {allStageLessons.map((item) => {
                    const isPublished = publishedSet.has(item.id);
                    const isCompleted = completedSet.has(item.id);

                    return (
                      <button
                        className={`skill-node-chip ${isCompleted ? "is-mastered" : isPublished ? "is-live" : "is-locked"}`}
                        key={item.id}
                        disabled={!isPublished}
                        onClick={() => {
                          if (isPublished && onSelectLesson) {
                            onSelectLesson(item.id);
                            onClose();
                          }
                        }}
                        style={{
                          padding: "10px 12px",
                          background: isCompleted
                            ? "rgba(159, 232, 112, 0.1)"
                            : isPublished
                            ? "var(--panel-2)"
                            : "rgba(13, 17, 23, 0.4)",
                          border: isCompleted
                            ? "1px solid rgba(159, 232, 112, 0.4)"
                            : isPublished
                            ? "1px solid var(--line)"
                            : "1px dashed rgba(255,255,255,0.08)",
                          borderRadius: "8px",
                          color: isCompleted
                            ? "var(--green-bright)"
                            : isPublished
                            ? "var(--ink)"
                            : "var(--quiet)",
                          textAlign: "left",
                          cursor: isPublished ? "pointer" : "not-allowed",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          transition: "all 0.18s ease"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "9px", fontFamily: "monospace", opacity: 0.7 }}>
                            {item.kind === "stage-project" ? "PROJECT" : `LESSON ${item.order}`}
                          </span>
                          <span>{isCompleted ? "✅" : isPublished ? "🔓" : "🔒"}</span>
                        </div>
                        <strong style={{ fontSize: "12px", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.title}
                        </strong>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Share Action */}
        <footer
          style={{
            padding: "16px 28px",
            borderTop: "1px solid var(--line)",
            background: "rgba(8, 11, 16, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <span style={{ color: "var(--muted)", fontSize: "12px" }}>
            每日保持学习习惯，解锁更多全栈技术称号！
          </span>

          <button
            onClick={handleCopyShareCard}
            style={{
              padding: "8px 18px",
              background: "linear-gradient(135deg, var(--violet), var(--cyan))",
              border: "none",
              borderRadius: "8px",
              color: "#000",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: "0 0 16px rgba(124, 92, 255, 0.3)"
            }}
          >
            {copiedShare ? "✓ 已复制文案到剪贴板！" : "📣 复制我的学习成就卡片"}
          </button>
        </footer>
      </div>
    </div>
  );
}
