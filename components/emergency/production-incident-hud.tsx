"use client";

import React from "react";
import type { ProductionIncidentSpec } from "@/lib/curriculum/types";

type IncidentPhase = "incident" | "patching" | "critical" | "restored";

export interface ProductionIncidentHUDProps {
  isProject: boolean;
  status: "idle" | "running" | "success" | "wrong";
  lessonTitle: string;
  incident?: ProductionIncidentSpec;
}

export function ProductionIncidentHUD({
  isProject,
  status,
  lessonTitle,
  incident,
}: ProductionIncidentHUDProps) {
  if (!isProject) return null;

  const phase: IncidentPhase = status === "success"
    ? "restored"
    : status === "wrong"
      ? "critical"
      : status === "running"
        ? "patching"
        : "incident";
  const isRestored = phase === "restored";
  const activeIncident = incident ?? createDefaultIncident(lessonTitle);
  const phaseLabel: Record<IncidentPhase, string> = {
    incident: "⚠️ INCIDENT ALERT",
    patching: "🛠 PATCHING",
    critical: "🚨 CRITICAL OUTAGE",
    restored: "🟢 SYSTEM RESTORED"
  };
  const dispatchStatus: Record<IncidentPhase, string> = {
    incident: "EMERGENCY",
    patching: "PATCHING...",
    critical: "ESCALATED",
    restored: "RESOLVED (0ms)"
  };

  return (
    <div className={`emergency-hud-container ${phase} ${isRestored ? "restored" : phase === "critical" ? "critical" : "active"}`}>
      <div className="hud-banner">
        <div className="hud-status-badge">
          <span className="pulse-dot" />
          <span className="badge-text">
            {phaseLabel[phase]}
          </span>
        </div>
        <div className="hud-title-box">
          <span className="hud-label">STAGE PROJECT MISSION</span>
          <h3 className="hud-title">{activeIncident.title ?? lessonTitle}</h3>
          <p className="hud-summary">{activeIncident.summary}</p>
        </div>
        <div className="hud-timer-box">
          <span className="timer-label">DISPATCH STATUS</span>
          <span className="timer-val">{dispatchStatus[phase]}</span>
        </div>
      </div>

      <div className="hud-metrics-grid">
        {activeIncident.metrics.map((metric) => (
          <div className="metric-box" key={metric.label}>
            <span className="metric-name">{metric.label}</span>
            <span className={`metric-value ${isRestored ? "normal" : phase === "critical" ? "alert" : "warning"}`}>
              {metric[phase]}
            </span>
          </div>
        ))}
      </div>

      {(activeIncident.recoveryMessage || activeIncident.runbook?.length) && (
        <div className="hud-runbook">
          {isRestored && activeIncident.recoveryMessage && (
            <p className="hud-recovery-message">{activeIncident.recoveryMessage}</p>
          )}
          {activeIncident.runbook?.length ? (
            <ol>
              {activeIncident.runbook.map((item) => <li key={item}>{item}</li>)}
            </ol>
          ) : null}
        </div>
      )}
    </div>
  );
}

function createDefaultIncident(lessonTitle: string): ProductionIncidentSpec {
  return {
    title: lessonTitle,
    summary: `围绕「${lessonTitle}」生成的确定性生产事故演练：先定位异常，再用当前阶段项目的 authored trace 验证恢复路径。`,
    metrics: [
      {
        label: "CPU Load",
        incident: "98.4%",
        patching: "62%",
        critical: "100%",
        restored: "14%"
      },
      {
        label: "Heap Memory",
        incident: "1.85GB Peak",
        patching: "720MB",
        critical: "2.20GB Peak",
        restored: "184MB"
      },
      {
        label: "5xx Error Rate",
        incident: "38.5%",
        patching: "9.8%",
        critical: "54.2%",
        restored: "0.00%"
      },
      {
        label: "Health Status",
        incident: "CRITICAL FAULT",
        patching: "DEGRADED",
        critical: "SERVICE DOWN",
        restored: "100% HEALTHY"
      }
    ],
    recoveryMessage: "系统指标恢复到安全阈值，阶段项目演练完成。",
    runbook: ["确认告警信号", "应用修复策略", "观察恢复指标"]
  };
}
