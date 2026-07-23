"use client";

import { useState } from "react";
import type { SimulationParameters } from "@/lib/execution/parameter-simulator";

type ParameterPlaygroundProps = {
  onSimulate: (params: SimulationParameters) => void;
  isSimulating: boolean;
};

export function ParameterPlayground({ onSimulate, isSimulating }: ParameterPlaygroundProps) {
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [concurrencyLevel, setConcurrencyLevel] = useState<number>(1);
  const [stressMode, setStressMode] = useState<SimulationParameters["stressMode"]>("normal");

  const handleRun = () => {
    onSimulate({
      speedMultiplier,
      concurrencyLevel,
      stressMode
    });
  };

  return (
    <div
      style={{
        margin: "18px 0",
        padding: "18px 22px",
        background: "radial-gradient(circle at 0% 0%, rgba(110, 231, 255, 0.08), transparent 40%), rgba(9, 13, 18, 0.88)",
        border: "1px solid rgba(110, 231, 255, 0.25)",
        borderRadius: "12px",
        boxShadow: "inset 0 0 24px rgba(110, 231, 255, 0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>⚙️</span>
          <strong style={{ color: "var(--cyan)", fontSize: "14px", fontWeight: "700" }}>
            参数微调与因果演练控制台 (Parameter Playground)
          </strong>
        </div>
        <span style={{ color: "var(--quiet)", fontSize: "11px", fontFamily: "monospace" }}>
          CAUSAL SIMULATOR ACTIVE
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          alignItems: "center"
        }}
      >
        {/* Speed Multiplier */}
        <div>
          <label style={{ display: "block", color: "var(--muted)", fontSize: "11px", marginBottom: "6px" }}>
            ⏱️ 步长速度 (Speed Multiplier): <strong style={{ color: "var(--green-bright)" }}>{speedMultiplier}x</strong>
          </label>
          <div style={{ display: "flex", gap: "6px" }}>
            {[0.5, 1, 2, 4].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeedMultiplier(s)}
                style={{
                  flex: 1,
                  padding: "4px 8px",
                  background: speedMultiplier === s ? "var(--green-dim)" : "var(--panel-2)",
                  border: speedMultiplier === s ? "1px solid var(--green)" : "1px solid var(--line)",
                  color: speedMultiplier === s ? "var(--green-bright)" : "var(--muted)",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Concurrency Level */}
        <div>
          <label style={{ display: "block", color: "var(--muted)", fontSize: "11px", marginBottom: "6px" }}>
            🔀 并发/线程数 (Concurrency): <strong style={{ color: "var(--cyan)" }}>{concurrencyLevel} Workers</strong>
          </label>
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={concurrencyLevel}
            onChange={(e) => setConcurrencyLevel(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--cyan)", cursor: "pointer" }}
          />
        </div>

        {/* Stress Mode */}
        <div>
          <label style={{ display: "block", color: "var(--muted)", fontSize: "11px", marginBottom: "6px" }}>
            ⚡ 模拟边界条件 (Stress Mode)
          </label>
          <select
            value={stressMode}
            onChange={(e) => setStressMode(e.target.value as SimulationParameters["stressMode"])}
            style={{
              width: "100%",
              padding: "6px 10px",
              background: "var(--panel-2)",
              border: "1px solid var(--line)",
              borderRadius: "6px",
              color: "var(--ink)",
              fontSize: "12px",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="normal">🟢 正常流程 (Standard Trace)</option>
            <option value="high-load">🔥 高负载并发 (High Load)</option>
            <option value="timeout">⚠️ 超时熔断测试 (Timeout Stress)</option>
          </select>
        </div>
      </div>

      {/* Trigger Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
        <button
          type="button"
          onClick={handleRun}
          disabled={isSimulating}
          style={{
            padding: "8px 20px",
            background: isSimulating ? "var(--panel-2)" : "linear-gradient(135deg, var(--cyan), var(--violet))",
            border: "none",
            borderRadius: "8px",
            color: "#000",
            fontWeight: "700",
            fontSize: "12px",
            cursor: isSimulating ? "not-allowed" : "pointer",
            boxShadow: "0 0 16px rgba(110, 231, 255, 0.2)"
          }}
        >
          {isSimulating ? "⏳ 动态推演执行中..." : "▶ 应用参数并重新演算"}
        </button>
      </div>
    </div>
  );
}
