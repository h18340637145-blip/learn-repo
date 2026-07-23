"use client";

import { useState } from "react";
import type { LessonSpec } from "@/lib/curriculum/types";
import type { ProgressSnapshot, QuestionAttemptInput } from "@/lib/progress/types";
import { getReviewDeck, type ReviewCardItem } from "@/lib/progress/spaced-repetition";
import { QuestionOptions } from "@/app/_components/question-options";

type DailyReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  progress: ProgressSnapshot;
  publishedLessons: readonly LessonSpec[];
  onRecordAttempt: (input: QuestionAttemptInput) => void;
};

export function DailyReviewModal({
  isOpen,
  onClose,
  progress,
  publishedLessons,
  onRecordAttempt
}: DailyReviewModalProps) {
  const [deck, setDeck] = useState<ReviewCardItem[]>(() =>
    getReviewDeck(progress, publishedLessons, 10)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answeredState, setAnsweredState] = useState<"idle" | "correct" | "wrong">("idle");

  if (!isOpen) return null;

  // Refresh deck on opening if empty
  const activeItem = deck[currentIndex];

  const handleSelectOption = (optionId: string) => {
    if (answeredState !== "idle" || !activeItem) return;

    setSelectedOptionId(optionId);
    const isCorrect = optionId === activeItem.question.answerId;

    setAnsweredState(isCorrect ? "correct" : "wrong");

    // Record progress attempt
    onRecordAttempt({
      questionId: activeItem.question.id,
      lessonId: activeItem.lesson.id,
      stageId: activeItem.lesson.stageId,
      selectedOptionId: optionId,
      isCorrect
    });
  };

  const handleNextCard = () => {
    setSelectedOptionId(null);
    setAnsweredState("idle");
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestartDeck = () => {
    const newDeck = getReviewDeck(progress, publishedLessons, 10);
    setDeck(newDeck);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setAnsweredState("idle");
  };

  const isCompleted = currentIndex >= deck.length;
  const answeredCount = Math.min(currentIndex, deck.length);
  const progressPercent = deck.length === 0 ? 100 : Math.round((answeredCount / deck.length) * 100);
  const mistakeCount = deck.filter((item) => item.reason === "needs-review").length;
  const dueCount = deck.filter((item) => item.reason === "ebbinghaus-due").length;

  return (
    <div
      className="review-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(4, 7, 12, 0.88)",
        backdropFilter: "blur(14px)",
        display: "grid",
        placeItems: "center",
        padding: "24px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          maxHeight: "90vh",
          background: "var(--panel)",
          border: "1px solid rgba(159, 232, 112, 0.3)",
          borderRadius: "18px",
          boxShadow: "0 0 50px rgba(159, 232, 112, 0.15), inset 0 0 30px rgba(0,0,0,0.8)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <header
          className="review-command-center"
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(10, 14, 20, 0.8)"
          }}
        >
          <div>
            <span
              style={{
                color: "var(--green-bright)",
                fontSize: "10px",
                fontFamily: "monospace",
                letterSpacing: "0.15em"
              }}
            >
              SPACED REPETITION · 每日艾宾浩斯复习卡
            </span>
            <h2 style={{ margin: "4px 0 0", fontSize: "18px", color: "var(--ink)", fontWeight: "700" }}>
              {isCompleted ? "🎉 总结与完成" : `今日复习任务 · 第 ${currentIndex + 1} / ${deck.length} 题`}
            </h2>
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
        </header>

        <div className="review-progress-rail" aria-label={`今日复习任务进度 ${progressPercent}%`}>
          <span style={{ "--review-progress": `${progressPercent}%` } as React.CSSProperties} />
          <div>
            <strong>{answeredCount} / {deck.length}</strong>
            <small>已完成</small>
          </div>
          <div>
            <strong>{mistakeCount}</strong>
            <small>错题强化</small>
          </div>
          <div>
            <strong>{dueCount}</strong>
            <small>到期复习</small>
          </div>
        </div>

        {/* Card Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
          {deck.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--muted)" }}>
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>🌟</div>
              <h3 style={{ color: "var(--green-bright)" }}>太棒了！今日暂无待复习错题</h3>
              <p style={{ fontSize: "13px" }}>你的艾宾浩斯记忆曲线状态极佳，请继续进行新课程练习！</p>
            </div>
          ) : isCompleted ? (
            <div style={{ textAlign: "center", padding: "36px 0" }}>
              <div style={{ fontSize: "42px", marginBottom: "12px" }}>🏆</div>
              <h3 style={{ color: "var(--green-bright)", fontSize: "22px", margin: "0 0 12px" }}>
                强化轮播已完成！
              </h3>
              <p style={{ color: "var(--muted)", fontSize: "14px", maxWidth: "480px", margin: "0 auto 24px" }}>
                你已成功巩固了 {deck.length} 道容易遗忘的难题。定期强化能显著提升脑海中的记忆留存！
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  onClick={handleRestartDeck}
                  style={{
                    padding: "10px 20px",
                    background: "var(--green-dim)",
                    border: "1px solid var(--green)",
                    color: "var(--green-bright)",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  🔄 再练一轮
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: "10px 20px",
                    background: "var(--panel-2)",
                    border: "1px solid var(--line)",
                    color: "var(--ink)",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  返回学习工作台
                </button>
              </div>
            </div>
          ) : activeItem && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Question Context Badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "rgba(110, 231, 255, 0.12)",
                    color: "var(--cyan)",
                    fontSize: "11px",
                    fontFamily: "monospace"
                  }}
                >
                  来自课程: {activeItem.lesson.eyebrow} · {activeItem.lesson.title}
                </span>

                <span
                  style={{
                    color: activeItem.reason === "needs-review" ? "var(--orange)" : "var(--green)",
                    fontSize: "11px",
                    fontWeight: "500"
                  }}
                >
                  {activeItem.reason === "needs-review" ? "⚠️ 错题强化" : "⏱️ 艾宾浩斯复习到期"}
                </span>
              </div>

              {/* Prompt */}
              <h3 style={{ fontSize: "16px", color: "var(--ink)", margin: 0, lineHeight: "1.5" }}>
                {activeItem.question.prompt}
              </h3>

              {/* Options */}
              <QuestionOptions
                question={activeItem.question}
                selectedId={selectedOptionId}
                status={answeredState === "idle" ? "idle" : answeredState === "correct" ? "success" : "wrong"}
                disabled={answeredState !== "idle"}
                onChoose={handleSelectOption}
              />

              {/* Feedback Alert */}
              {answeredState !== "idle" && (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: answeredState === "correct" ? "rgba(159, 232, 112, 0.14)" : "rgba(255, 107, 107, 0.14)",
                    border: `1px solid ${answeredState === "correct" ? "var(--green)" : "var(--red)"}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}
                >
                  <div style={{ fontWeight: "700", color: answeredState === "correct" ? "var(--green-bright)" : "var(--red)", fontSize: "14px" }}>
                    {answeredState === "correct" ? "✓ 作答正确！已强化此题记忆。" : "✕ 作答错误，请阅读以下反馈："}
                  </div>

                  <p style={{ margin: 0, fontSize: "13px", color: "var(--ink)", lineHeight: "1.6" }}>
                    {activeItem.question.options.find(o => o.id === selectedOptionId)?.feedback || activeItem.question.correctExplanation}
                  </p>

                  <button
                    onClick={handleNextCard}
                    style={{
                      alignSelf: "flex-end",
                      marginTop: "8px",
                      padding: "8px 18px",
                      background: "var(--green)",
                      color: "var(--panel)",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    {currentIndex === deck.length - 1 ? "完成复习 →" : "下一题 →"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
