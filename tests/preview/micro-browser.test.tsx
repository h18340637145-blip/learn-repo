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
