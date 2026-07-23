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
