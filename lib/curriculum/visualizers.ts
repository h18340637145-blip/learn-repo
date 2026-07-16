import type { LessonKind, StageId, VisualizerSpec } from "./types";

const stageVisualizers: Partial<Record<StageId, VisualizerSpec>> = {
  "http-foundations": { type: "http-pipeline", title: "HTTP 请求响应管线", nodes: ["Client", "Headers", "Router", "Handler", "Response"] },
  "api-design": { type: "service-boundary", title: "服务边界与可靠 API", nodes: ["Resource", "Validation", "Error Model", "Logging", "Shutdown"] },
  "process-concurrency": { type: "worker-pool", title: "进程与并发工作池", nodes: ["Main Thread", "libuv Pool", "Worker", "IPC", "Result"] },
  realtime: { type: "realtime-mesh", title: "实时连接星网", nodes: ["Client", "Handshake", "Heartbeat", "Broadcast", "Recovery"] },
  "testing-security": { type: "quality-shield", title: "测试与安全边界", nodes: ["Test", "Assertion", "Mock", "Secret Boundary", "Risk"] },
  "diagnostics-production": { type: "diagnostics-tower", title: "诊断与生产观测塔", nodes: ["Inspector", "CPU", "Heap", "GC", "Release"] }
};

export function getDefaultVisualizer(stageId: StageId, kind: LessonKind): VisualizerSpec {
  if (kind === "stage-project") {
    return { type: "stage-project-core", title: "阶段项目核心", nodes: ["需求", "实现", "运行", "验证", "总结"] };
  }

  return stageVisualizers[stageId] ?? { type: "generic-particle-flow", title: "通用运行粒子流", nodes: ["输入", "执行", "输出"] };
}
