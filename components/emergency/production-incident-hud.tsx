"use client";

import React from "react";

export interface ProductionIncidentHUDProps {
  isProject: boolean;
  status: "idle" | "running" | "success" | "wrong";
  lessonTitle: string;
}

export function ProductionIncidentHUD({
  isProject,
  status,
  lessonTitle,
}: ProductionIncidentHUDProps) {
  if (!isProject) return null;

  const isRestored = status === "success";

  return (
    <div className={`emergency-hud-container ${isRestored ? "restored" : status === "wrong" ? "critical" : "active"}`}>
      <div className="hud-banner">
        <div className="hud-status-badge">
          <span className="pulse-dot" />
          <span className="badge-text">
            {isRestored ? "🟢 SYSTEM RESTORED" : status === "wrong" ? "🚨 CRITICAL OUTAGE" : "⚠️ INCIDENT ALERT"}
          </span>
        </div>
        <div className="hud-title-box">
          <span className="hud-label">STAGE PROJECT MISSION</span>
          <h3 className="hud-title">{lessonTitle}</h3>
        </div>
        <div className="hud-timer-box">
          <span className="timer-label">DISPATCH STATUS</span>
          <span className="timer-val">{isRestored ? "RESOLVED (0ms)" : status === "running" ? "PATCHING..." : "EMERGENCY"}</span>
        </div>
      </div>

      <div className="hud-metrics-grid">
        <div className="metric-box">
          <span className="metric-name">CPU Load</span>
          <span className={`metric-value ${isRestored ? "normal" : "alert"}`}>
            {isRestored ? "14%" : status === "wrong" ? "100%" : "98.4%"}
          </span>
        </div>
        <div className="metric-box">
          <span className="metric-name">Heap Memory</span>
          <span className={`metric-value ${isRestored ? "normal" : "alert"}`}>
            {isRestored ? "184MB" : "1.85GB Peak"}
          </span>
        </div>
        <div className="metric-box">
          <span className="metric-name">5xx Error Rate</span>
          <span className={`metric-value ${isRestored ? "normal" : "alert"}`}>
            {isRestored ? "0.00%" : status === "wrong" ? "54.2%" : "38.5%"}
          </span>
        </div>
        <div className="metric-box">
          <span className="metric-name">Health Status</span>
          <span className={`metric-value ${isRestored ? "normal" : "warning"}`}>
            {isRestored ? "100% HEALTHY" : "CRITICAL FAULT"}
          </span>
        </div>
      </div>
    </div>
  );
}
