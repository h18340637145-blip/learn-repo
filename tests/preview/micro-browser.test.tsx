import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MicroBrowser } from "../../components/preview/micro-browser";

test("MicroBrowser 渲染正确的地址栏与状态指示", () => {
  const html = renderToStaticMarkup(
    <MicroBrowser
      status="success"
      entryFile="server.ts"
      courseTitle="Node.js"
      lessonTitle="HTTP 基础"
      spec={{
        url: "http://localhost:8080/api/users",
        statusCode: 200,
        contentType: "application/json",
        jsonOutput: { users: ["Alice", "Bob"] },
      }}
    />
  );

  assert.match(html, /micro-browser-container/);
  assert.match(html, /localhost:8080\/api\/users/);
  assert.match(html, /200 OK/);
  assert.match(html, /JSON RESPONSE/);
  assert.match(html, /Alice/);
});

test("MicroBrowser 处于 idle 或 wrong 状态时显示提示页", () => {
  const wrongHtml = renderToStaticMarkup(
    <MicroBrowser status="wrong" entryFile="index.js" />
  );
  assert.match(wrongHtml, /响应错误/);

  const idleHtml = renderToStaticMarkup(
    <MicroBrowser status="idle" entryFile="index.js" />
  );
  assert.match(idleHtml, /服务器等待请求中/);
});

test("MicroBrowser 展示 running 和 success 的明确预览状态", () => {
  const runningHtml = renderToStaticMarkup(
    <MicroBrowser status="running" entryFile="server.js" logs={["listen 8080"]} />
  );
  assert.match(runningHtml, /响应流式传输中/);
  assert.match(runningHtml, /listen 8080/);

  const successHtml = renderToStaticMarkup(
    <MicroBrowser status="success" entryFile="server.js" logs={["done"]} />
  );
  assert.match(successHtml, /JSON RESPONSE/);
  assert.match(successHtml, /sampleOutput/);
});

test("MicroBrowser 暴露 Headers 抽屉按钮与可访问预览区域语义", () => {
  const html = renderToStaticMarkup(
    <MicroBrowser status="success" entryFile="server.js" />
  );

  assert.match(html, /aria-label="微型浏览器响应预览"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /Headers/);
});
