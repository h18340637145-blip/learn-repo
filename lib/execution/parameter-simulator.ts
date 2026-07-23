import type { RunnerFrame } from "../curriculum/types";

export type SimulationParameters = {
  speedMultiplier: number; // e.g. 0.5, 1, 2, 4
  concurrencyLevel: number; // e.g. 1, 2, 4, 8
  stressMode: "normal" | "timeout" | "high-load"; // simulated stress condition
};

export function transformFramesForSimulation(
  originalFrames: readonly RunnerFrame[],
  params: SimulationParameters
): RunnerFrame[] {
  const { speedMultiplier, concurrencyLevel, stressMode } = params;

  let transformed: RunnerFrame[] = originalFrames.map((frame) => {
    // Adjust delay based on speed
    const newDelay = Math.max(50, Math.round(frame.delayMs / speedMultiplier));

    // Multiply logs based on concurrency level if concurrency > 1
    let newLogs = [...frame.log];
    if (concurrencyLevel > 1) {
      newLogs = newLogs.flatMap((logLine) => {
        if (logLine.includes("[") && logLine.includes("]")) {
          return Array.from({ length: Math.min(concurrencyLevel, 4) }, (_, i) =>
            logLine.replace(/\[(.*?)\]/, `[$1 #Worker-${i + 1}]`)
          );
        }
        return [logLine];
      });
    }

    return {
      ...frame,
      delayMs: newDelay,
      log: newLogs
    };
  });

  // Inject stress-mode frames if timeout or high-load is selected
  if (stressMode === "timeout") {
    transformed.push({
      activeLane: 0,
      laneValues: ["超时熔断", "504 Gateway Timeout"],
      log: ["⚠️ [System Alert] 请求超过阈值，触发 Timeout 熔断保护！", "❌ ERR_HTTP_TIMED_OUT"],
      note: "【因果推演】由于超时参数设为极短，服务器已主动切断长连接。",
      delayMs: 300
    });
  } else if (stressMode === "high-load") {
    transformed = transformed.map((frame) => ({
      ...frame,
      laneValues: [...frame.laneValues, `高负载 (Queue: ${concurrencyLevel * 12})`],
      log: [...frame.log, `⚡ [Pressure] 并发量高: ${concurrencyLevel * 100} req/s`]
    }));
  }

  return transformed;
}
