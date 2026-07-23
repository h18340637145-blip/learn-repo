import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductionIncidentHUD } from "../../components/emergency/production-incident-hud";

test("ProductionIncidentHUD 在 isProject 为 false 时不渲染", () => {
  const html = renderToStaticMarkup(
    <ProductionIncidentHUD isProject={false} lessonTitle="普通知识点" status="idle" />
  );
  assert.equal(html, "");
});

test("ProductionIncidentHUD 渲染紧急警报与系统指标", () => {
  const html = renderToStaticMarkup(
    <ProductionIncidentHUD isProject={true} lessonTitle="CLI 系统探测器" status="idle" />
  );
  assert.match(html, /emergency-hud-container/);
  assert.match(html, /INCIDENT ALERT/);
  assert.match(html, /CPU Load/);
  assert.match(html, /Heap Memory/);
  assert.match(html, /CLI 系统探测器/);
});

test("ProductionIncidentHUD 在成功阶段展现 RESTORED 绿色复苏状态", () => {
  const html = renderToStaticMarkup(
    <ProductionIncidentHUD isProject={true} lessonTitle="CLI 系统探测器" status="success" />
  );
  assert.match(html, /restored/);
  assert.match(html, /SYSTEM RESTORED/);
  assert.match(html, /100% HEALTHY/);
});

test("ProductionIncidentHUD 支持显式事故配置与四类状态", () => {
  const incident = {
    title: "API 延迟事故",
    summary: "队列积压导致 p95 延迟升高",
    metrics: [
      { label: "p95 Latency", incident: "3200ms", patching: "900ms", critical: "timeout", restored: "120ms" },
      { label: "Queue", incident: "400", patching: "80", critical: "overflow", restored: "0" }
    ],
    recoveryMessage: "限流和缓存恢复正常"
  };

  const incidentHtml = renderToStaticMarkup(
    <ProductionIncidentHUD isProject={true} lessonTitle="任务 API" status="idle" incident={incident} />
  );
  const patchingHtml = renderToStaticMarkup(
    <ProductionIncidentHUD isProject={true} lessonTitle="任务 API" status="running" incident={incident} />
  );
  const criticalHtml = renderToStaticMarkup(
    <ProductionIncidentHUD isProject={true} lessonTitle="任务 API" status="wrong" incident={incident} />
  );
  const restoredHtml = renderToStaticMarkup(
    <ProductionIncidentHUD isProject={true} lessonTitle="任务 API" status="success" incident={incident} />
  );

  assert.match(incidentHtml, /API 延迟事故/);
  assert.match(patchingHtml, /PATCHING/);
  assert.match(criticalHtml, /CRITICAL OUTAGE/);
  assert.match(restoredHtml, /限流和缓存恢复正常/);
  assert.match(restoredHtml, /120ms/);
});
