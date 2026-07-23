"use client";

import { useState, useMemo } from "react";
import type { LessonSpec, CourseId } from "@/lib/curriculum/types";

type CheatSheetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  lessons: readonly LessonSpec[];
  courseId: CourseId;
  courseTitle: string;
  onSelectLesson?: (lessonId: string) => void;
};

export function CheatSheetModal({
  isOpen,
  onClose,
  lessons,
  courseId,
  courseTitle,
  onSelectLesson
}: CheatSheetModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique stages
  const stages = useMemo(() => {
    const stageMap = new Map<string, string>();
    lessons.forEach(l => {
      if (!stageMap.has(l.stageId)) {
        stageMap.set(l.stageId, l.eyebrow);
      }
    });
    return Array.from(stageMap.entries()).map(([id, eyebrow]) => ({ id, eyebrow }));
  }, [lessons]);

  // Filter lessons based on search and selected stage
  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const matchesStage = selectedStage === "all" || lesson.stageId === selectedStage;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesStage;

      const matchesSearch =
        lesson.title.toLowerCase().includes(q) ||
        lesson.eyebrow.toLowerCase().includes(q) ||
        lesson.memoryHook?.toLowerCase().includes(q) ||
        lesson.summary.some(s => s.toLowerCase().includes(q));

      return matchesStage && matchesSearch;
    });
  }, [lessons, selectedStage, searchQuery]);
  const codeCardCount = useMemo(
    () => filteredLessons.filter((lesson) => lesson.files?.[0]?.code).length,
    [filteredLessons]
  );
  const memoryHookCount = useMemo(
    () => filteredLessons.filter((lesson) => lesson.memoryHook).length,
    [filteredLessons]
  );

  const handleCopyCard = (lesson: LessonSpec) => {
    const codeSnippet = lesson.files && lesson.files[0] ? `\`\`\`${lesson.files[0].name.split('.').pop() || 'js'}\n${lesson.files[0].code}\n\`\`\`` : "";
    const cardText = `📌 **${lesson.eyebrow} - ${lesson.title}**\n💡 **记忆钩子**: ${lesson.memoryHook || '暂无'}\n\n📝 **核心卡片要点**:\n${lesson.summary.map(s => `- ${s}`).join('\n')}\n\n💻 **关键代码**:\n${codeSnippet}\n\n🔗 官方来源: ${lesson.sources.map(s => s.url).join(', ')}`;

    navigator.clipboard.writeText(cardText);
    setCopiedId(lesson.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="cheatsheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(3, 5, 8, 0.85)",
        backdropFilter: "blur(12px)",
        display: "grid",
        placeItems: "center",
        padding: "24px"
      }}
    >
      <div 
        className="cheatsheet-dialog"
        style={{
          width: "100%",
          maxWidth: "1080px",
          maxHeight: "88vh",
          background: "var(--panel)",
          border: "1px solid rgba(110, 231, 255, 0.28)",
          borderRadius: "16px",
          boxShadow: "0 0 48px rgba(110, 231, 255, 0.12), inset 0 0 32px rgba(13, 17, 23, 0.9)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <header className="cheatsheet-command-center" style={{
          padding: "20px 28px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(7, 10, 13, 0.8)"
        }}>
          <div>
            <span style={{ color: "var(--cyan)", fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.15em" }}>
              KNOWLEDGE CHEAT SHEET · {courseTitle.toUpperCase()}
            </span>
            <h2 style={{ margin: "4px 0 0", fontSize: "20px", fontWeight: "700", color: "var(--ink)" }}>
              知识扫描台（共 {filteredLessons.length} 张核心卡片）
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
              fontSize: "14px"
            }}
          >
            ✕ 关闭 (ESC)
          </button>
        </header>

        {/* Filter Controls */}
        <div style={{
          padding: "16px 28px",
          borderBottom: "1px solid var(--line-soft)",
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
          background: "rgba(13, 17, 23, 0.6)"
        }}>
          <div className="tool-command-metrics" aria-label={`${courseTitle} 速查统计`}>
            <span className="card-metric"><strong>{filteredLessons.length}</strong><small>当前卡片</small></span>
            <span className="card-metric"><strong>{codeCardCount}</strong><small>含代码</small></span>
            <span className="card-metric"><strong>{memoryHookCount}</strong><small>记忆钩子</small></span>
            <span className="card-metric"><strong>{courseId.toUpperCase()}</strong><small>路线频道</small></span>
          </div>
          {/* Search bar */}
          <div style={{ flex: "1", minWidth: "260px", position: "relative" }}>
            <input
              type="text"
              placeholder="搜索概念、关键词、记忆口诀..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 14px 8px 36px",
                background: "var(--panel-2)",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                color: "var(--ink)",
                fontSize: "13px",
                outline: "none"
              }}
            />
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: "14px" }}>
              🔍
            </span>
          </div>

          {/* Stage selector */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            style={{
              padding: "8px 14px",
              background: "var(--panel-2)",
              border: "1px solid var(--line)",
              borderRadius: "8px",
              color: "var(--ink)",
              fontSize: "13px",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="all">全部阶段 ({lessons.length} 课)</option>
            {stages.map(s => (
              <option key={s.id} value={s.id}>
                {s.eyebrow}
              </option>
            ))}
          </select>
        </div>

        {/* Content Cards Grid */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px"
        }}>
          {filteredLessons.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 0", color: "var(--muted)" }}>
              未找到匹配的速查卡片
            </div>
          ) : (
            filteredLessons.map(lesson => (
              <div 
                key={lesson.id}
                style={{
                  background: "radial-gradient(circle at 10% 10%, rgba(110, 231, 255, 0.05), transparent 40%), rgba(10, 14, 19, 0.82)",
                  border: "1px solid rgba(159, 232, 112, 0.2)",
                  borderRadius: "12px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  position: "relative"
                }}
              >
                {/* Stage Eyebrow & Title */}
                <div>
                  <span style={{ color: "var(--green)", fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.1em" }}>
                    {lesson.eyebrow}
                  </span>
                  <h3 style={{ margin: "4px 0 0", fontSize: "15px", color: "var(--ink)", fontWeight: "600" }}>
                    {lesson.title}
                  </h3>
                </div>

                {/* Memory Hook */}
                {lesson.memoryHook && (
                  <div style={{
                    padding: "8px 12px",
                    background: "rgba(159, 232, 112, 0.12)",
                    borderLeft: "3px solid var(--green)",
                    borderRadius: "4px",
                    color: "var(--green-bright)",
                    fontSize: "12px",
                    fontWeight: "500",
                    lineHeight: "1.4"
                  }}>
                    💡 {lesson.memoryHook}
                  </div>
                )}

                {/* Summary points */}
                <div style={{ fontSize: "12px", color: "var(--muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <strong style={{ color: "var(--ink)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    核心知识点:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {lesson.summary.map((item, idx) => (
                      <li key={idx} style={{ lineHeight: "1.4" }}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Code Snippet Preview */}
                {lesson.files && lesson.files[0] && (
                  <div style={{ marginTop: "auto", paddingTop: "8px" }}>
                    <div style={{ fontSize: "10px", color: "var(--quiet)", marginBottom: "4px", fontFamily: "monospace" }}>
                      📄 {lesson.files[0].name}
                    </div>
                    <pre style={{
                      margin: 0,
                      padding: "10px",
                      background: "#070a0d",
                      border: "1px solid var(--line)",
                      borderRadius: "6px",
                      fontSize: "11px",
                      color: "var(--cyan)",
                      overflowX: "auto",
                      maxHeight: "120px",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
                    }}>
                      <code>{lesson.files[0].code.trim()}</code>
                    </pre>
                  </div>
                )}

                {/* Footer Actions */}
                <div style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "10px",
                  borderTop: "1px solid var(--line-soft)",
                  marginTop: "8px"
                }}>
                  <button
                    onClick={() => handleCopyCard(lesson)}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--line)",
                      color: copiedId === lesson.id ? "var(--green)" : "var(--muted)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      cursor: "pointer"
                    }}
                  >
                    {copiedId === lesson.id ? "✓ 已复制卡片" : "📋 复制卡片"}
                  </button>

                  {onSelectLesson && (
                    <button
                      onClick={() => {
                        onSelectLesson(lesson.id);
                        onClose();
                      }}
                      style={{
                        background: "var(--green-dim)",
                        border: "1px solid rgba(159, 232, 112, 0.4)",
                        color: "var(--green-bright)",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      练习本课 →
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
