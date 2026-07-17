import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pageSource = readFileSync("app/page.tsx", "utf8");
const networkSource = readFileSync("components/immersive/knowledge-network.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

test("首页知识星链位于课程卡片下方并作为页面底部展厅", () => {
  const heroIndex = pageSource.indexOf("<header className=\"course-hero\">");
  const networkIndex = pageSource.indexOf("<KnowledgeNetwork />");
  const gridIndex = pageSource.indexOf("<section className=\"course-grid\"");
  const footerIndex = pageSource.indexOf("<footer className=\"course-footer\"");

  assert.ok(heroIndex !== -1, "首页应包含 Hero");
  assert.ok(networkIndex !== -1, "首页应包含 KnowledgeNetwork");
  assert.ok(gridIndex !== -1, "首页应包含课程卡片网格");
  assert.ok(footerIndex !== -1, "首页应包含底部说明");
  assert.ok(heroIndex < networkIndex, "知识星链应放在 Hero 文案之后");
  assert.ok(gridIndex < networkIndex, "知识星链应放在课程卡片之后");
  assert.ok(networkIndex < footerIndex, "知识星链应放在 footer 之前，成为页面底部内容块");
});

test("知识星链作为独立内容块而不是全屏悬浮层", () => {
  assert.match(networkSource, /className="knowledge-network-section"/);
  assert.match(networkSource, /className="knowledge-network-canvas"/);
  assert.doesNotMatch(networkSource, /position:\s*"absolute"/);
  assert.doesNotMatch(networkSource, /inset:\s*0/);
});

test("知识星链样式提供独立区块、明显节点和下方布局", () => {
  assert.match(css, /\.knowledge-network-section\s*\{/);
  assert.match(css, /\.knowledge-network-canvas\s*\{/);
  assert.match(css, /\.knowledge-network__legend\s*\{/);
  assert.match(css, /\.knowledge-network__node-label\s*\{/);
  assert.match(css, /margin:\s*72px auto 48px/);
  assert.match(css, /min-height:\s*520px/);
});

test("知识星链使用球形立体连接而不是平面标签堆叠", () => {
  assert.match(networkSource, /function calculateSpherePoint/);
  assert.match(networkSource, /sphereRadius/);
  assert.match(networkSource, /knowledge-network__orb-text/);
  assert.match(networkSource, /args=\{\[0\.58,/);
  assert.match(networkSource, /rotation\.x/);
  assert.match(networkSource, /rotation\.y/);
  assert.match(css, /\.knowledge-network__orb-text\s*\{/);
  assert.match(css, /border-radius:\s*50%/);
});

test("知识核心球放大铺满展厅但知识点球大小保持不变", () => {
  assert.match(networkSource, /const sphereRadius = 5\.[23]\d/);
  assert.match(networkSource, /<Sphere args=\{\[6\.[34]\d, 64, 64\]\}>/);
  assert.match(networkSource, /<Sphere args=\{\[2\.[34]\d, 48, 48\]\}>/);
  assert.match(networkSource, /args=\{\[0\.58, 48, 48\]\}/);
  assert.doesNotMatch(networkSource, /args=\{\[0\.(6|7|8|9)/);
});

test("知识核心球隐藏中心文字", () => {
  assert.doesNotMatch(networkSource, /knowledge-network__sphere-core/);
  assert.doesNotMatch(networkSource, />NodePath Core</);
});
