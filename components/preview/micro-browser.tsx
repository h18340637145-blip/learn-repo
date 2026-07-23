"use client";

import React, { useState } from "react";
import { MicroBrowserSpec } from "@/lib/curriculum/types";

export interface MicroBrowserProps {
  spec?: MicroBrowserSpec;
  status: "idle" | "running" | "success" | "wrong";
  entryFile?: string;
  courseTitle?: string;
  lessonTitle?: string;
  logs?: string[];
}

export function MicroBrowser({
  spec,
  status,
  entryFile = "index.js",
  courseTitle = "Node.js",
  lessonTitle = "预览结果",
  logs = [],
}: MicroBrowserProps) {
  const [showHeaders, setShowHeaders] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Derive smart default preview if spec is not explicitly provided
  const derivedUrl = spec?.url ?? (entryFile.endsWith(".tsx") || entryFile.endsWith(".ts")
    ? `http://localhost:3000/${entryFile.replace(/\.(tsx|ts|js)$/, "")}`
    : `http://localhost:8080/api/v1/${lessonTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}`);

  const statusCode = spec?.statusCode ?? (status === "wrong" ? 500 : 200);
  const contentType = spec?.contentType ?? (entryFile.endsWith(".tsx") ? "ui-card" : "application/json");
  const headers = spec?.headers ?? {
    "content-type": contentType === "application/json" ? "application/json; charset=utf-8" : "text/html; charset=utf-8",
    "x-powered-by": courseTitle.includes("Next") ? "Next.js 16" : "Node.js v22",
    "cache-control": "no-store, max-age=0",
    "x-runtime-ms": "12ms",
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const renderContent = () => {
    if (status === "idle" || status === "wrong") {
      return (
        <div className="micro-browser-empty">
          <div className="empty-icon">🌐</div>
          <p className="empty-title">{status === "wrong" ? "响应错误 (500 Internal Error)" : "服务器等待请求中..."}</p>
          <p className="empty-sub">
            {status === "wrong"
              ? "检查题目的代码修复方案，重新运行以修复该响应。"
              : "回答正确题目后，微型浏览器将渲染真实的 HTTP 响应结构与 UI 切面。"}
          </p>
        </div>
      );
    }

    if (spec?.renderedHtml) {
      return (
        <div className="micro-browser-html">
          <div dangerouslySetInnerHTML={{ __html: spec.renderedHtml }} />
        </div>
      );
    }

    if (contentType === "application/json" || spec?.jsonOutput) {
      const jsonData = spec?.jsonOutput ?? {
        status: "success",
        code: 200,
        timestamp: new Date().toISOString(),
        lesson: lessonTitle,
        runtime: courseTitle,
        logsCount: logs.length,
        sampleOutput: logs.slice(0, 3),
      };

      return (
        <div className="micro-browser-json">
          <div className="json-header">
            <span className="badge-json">JSON RESPONSE</span>
            <span className="bytes">{JSON.stringify(jsonData).length} bytes</span>
          </div>
          <pre className="json-body">{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
      );
    }

    // Default UI Card Mockup
    return (
      <div className="micro-browser-card">
        <div className="card-banner">
          <span className="card-badge">{courseTitle.includes("Next") ? "App Router Page" : "Micro Server Output"}</span>
          <h4>{lessonTitle}</h4>
        </div>
        <div className="card-body">
          <div className="metrics-row">
            <div className="metric">
              <span className="metric-label">Status</span>
              <span className="metric-val green">200 OK</span>
            </div>
            <div className="metric">
              <span className="metric-label">Entry</span>
              <span className="metric-val">{entryFile}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Execution</span>
              <span className="metric-val purple">{status === "running" ? "Streaming..." : "Done"}</span>
            </div>
          </div>
          <div className="logs-preview">
            <div className="preview-label">Live Output Stream</div>
            {logs.length > 0 ? (
              logs.map((log, i) => (
                <div key={i} className="log-line">
                  <span className="line-num">{i + 1}</span>
                  <code>{log}</code>
                </div>
              ))
            ) : (
              <div className="log-line text-muted">No console output recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`micro-browser-container ${isRefreshing ? "refreshing" : ""}`}>
      {/* Top Address Bar */}
      <div className="micro-browser-bar">
        <div className="browser-controls">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </div>
        <button
          className="refresh-btn"
          onClick={handleRefresh}
          title="重新加载响应"
          type="button"
        >
          ↻
        </button>
        <div className="url-bar">
          <span className="protocol">{derivedUrl.startsWith("https") ? "🔒 https://" : "http://"}</span>
          <span className="url-text">{derivedUrl.replace(/^https?:\/\//, "")}</span>
        </div>
        <div className={`status-badge ${statusCode >= 400 ? "error" : "success"}`}>
          {statusCode} {statusCode === 200 ? "OK" : "ERROR"}
        </div>
        <button
          className={`headers-toggle ${showHeaders ? "active" : ""}`}
          onClick={() => setShowHeaders(!showHeaders)}
          type="button"
        >
          {showHeaders ? "隐藏 Header" : "Headers"}
        </button>
      </div>

      {/* Response Headers Drawer */}
      {showHeaders && (
        <div className="micro-browser-headers">
          <div className="headers-title">HTTP Response Headers</div>
          <div className="headers-list">
            {Object.entries(headers).map(([key, value]) => (
              <div key={key} className="header-row">
                <span className="header-name">{key}:</span>
                <span className="header-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="micro-browser-viewport">{renderContent()}</div>
    </div>
  );
}
