"use client";

import { useEffect, useRef, useState } from "react";

import { publishedLessons } from "@/content/lesson-registry";
import type { RunnerFrame } from "@/lib/curriculum/types";
import { streamAuthoredTrace } from "@/lib/execution/authored-trace";

const roadmap = [
  { number: "01", title: "Node.js 基础", meta: "6 / 6", state: "done", items: ["运行时与全局对象", "模块系统与缓存"] },
  { number: "02", title: "异步运行时", meta: "3 / 7", state: "active", items: ["Event Loop", "Promise 与异步控制"] },
  { number: "03", title: "文件与数据流", meta: "0 / 6", state: "locked", items: ["Buffer", "Stream 与背压"] },
  { number: "04", title: "网络与 API", meta: "0 / 7", state: "locked", items: ["HTTP Server", "REST API"] },
  { number: "05", title: "工程与质量", meta: "0 / 5", state: "locked", items: ["测试", "性能与安全"] },
];

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export function LearningStudio() {
  const [lessonIndex, setLessonIndex] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "wrong" | "success">("idle");
  const [frameIndex, setFrameIndex] = useState(-1);
  const [frame, setFrame] = useState<RunnerFrame | null>(null);
  const activeRun = useRef<AbortController | null>(null);
  const lesson = publishedLessons[lessonIndex]!;
  const question = lesson.questions[0]!;
  const frames = lesson.execution.frames;
  const lanes = lesson.execution.lanes;
  const isProject = lesson.kind === "stage-project";
  const codeFile = lesson.files.find((file) => file.name === lesson.entryFile) ?? lesson.files[0]!;

  function cancelRun() {
    activeRun.current?.abort();
    activeRun.current = null;
  }

  useEffect(() => () => {
    activeRun.current?.abort();
  }, []);

  function openLesson(index: number) {
    cancelRun();
    setLessonIndex(index);
    setSelected(null);
    setStatus("idle");
    setFrameIndex(-1);
    setFrame(null);
  }

  async function chooseAnswer(answer: string) {
    cancelRun();
    setSelected(answer);
    setFrameIndex(-1);
    setFrame(null);

    if (answer !== question.answerId) {
      setStatus("wrong");
      return;
    }

    const controller = new AbortController();
    activeRun.current = controller;
    setStatus("running");
    let index = 0;
    for await (const nextFrame of streamAuthoredTrace(frames, controller.signal)) {
      if (controller.signal.aborted) return;
      setFrameIndex(index);
      setFrame(nextFrame);
      index += 1;
    }
    await delay(480);
    if (!controller.signal.aborted) {
      activeRun.current = null;
      setStatus("success");
    }
  }

  const nextLesson = () => openLesson((lessonIndex + 1) % publishedLessons.length);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="NodePath 首页">
          <span className="brand-mark">N<span>_</span></span>
          <span>NodePath</span>
        </a>
        <nav className="main-nav" aria-label="主导航">
          <a className="is-current" href="#learn">学习</a>
          <a href="#roadmap">路线</a>
          <a href="#projects">项目</a>
        </nav>
        <div className="top-actions">
          <div className="streak"><span>◆</span> 连续学习 7 天</div>
          <button className="avatar" type="button" aria-label="打开个人中心">HX</button>
        </div>
      </header>

      <div className="workspace" id="top">
        <aside className="sidebar" id="roadmap">
          <div className="sidebar-heading">
            <div>
              <span className="kicker">LEARNING PATH</span>
              <h2>Node.js 全栈路线</h2>
            </div>
            <span className="progress-number">32%</span>
          </div>
          <div className="progress-track" aria-label="总体进度 32%"><span /></div>

          <div className="roadmap-list">
            {roadmap.map((section) => (
              <div className={`roadmap-section ${section.state}`} key={section.number}>
                <div className="roadmap-title">
                  <span className="roadmap-number">{section.state === "done" ? "✓" : section.number}</span>
                  <div><strong>{section.title}</strong><span>{section.meta} 知识点</span></div>
                  <span className="section-state">{section.state === "locked" ? "锁定" : ""}</span>
                </div>
                {section.state !== "locked" && (
                  <div className="roadmap-items">
                    {section.items.map((item) => <span key={item}>{item}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="project-shortcut" id="projects">
            <span className="project-icon">⌘</span>
            <div><span>阶段项目</span><strong>CLI 日志分析器</strong></div>
            <button type="button" onClick={() => openLesson(3)}>开始</button>
          </div>

          <div className="final-project">
            <span className="kicker">FINAL PROJECT</span>
            <strong>实时协作任务平台</strong>
            <p>API · 数据流 · 鉴权 · 测试 · 部署</p>
            <span className="locked-label">完成全部路线后解锁</span>
          </div>
        </aside>

        <main className="lesson" id="learn">
          <section className="lesson-heading">
            <div>
              <span className="lesson-eyebrow">{lesson.eyebrow}</span>
              <h1>{lesson.title}</h1>
              <p>{isProject ? "组合知识点，完成一次真实工程挑战。" : "先预测，再运行；用可视化建立你的运行时心智模型。"}</p>
            </div>
            <div className="lesson-meta"><span>◷ {lesson.durationMinutes} 分钟</span><span>难度 · {lesson.difficulty}</span></div>
          </section>

          <div className="lesson-switcher" aria-label="课程示例">
            {publishedLessons.map((item, index) => (
              <button className={index === lessonIndex ? "active" : ""} key={item.id} onClick={() => openLesson(index)} type="button">
                <span>{item.kind === "stage-project" ? "PROJECT" : `0${index + 1}`}</span>{item.title}
              </button>
            ))}
          </div>

          <div className="learning-grid">
            <article className="concept-panel">
              <div className="panel-label"><span>01</span> 理解概念</div>
              <h2>{isProject ? "项目目标" : "先建立心智模型"}</h2>
              <p>{lesson.concept}</p>
              <ul>{lesson.points.map((point) => <li key={point}>{point}</li>)}</ul>
              <div className="memory-card">
                <span>记忆钩子</span>
                <strong>{lesson.memoryHook}</strong>
              </div>
            </article>

            <article className="code-panel">
              <div className="code-toolbar">
                <div><i /><i /><i /></div>
                <span>{lesson.entryFile}</span>
                <span className="node-version">Node {lesson.nodeVersion}</span>
              </div>
              <pre aria-label="Node.js 案例代码"><code>{codeFile.code}</code></pre>
            </article>
          </div>

          <section className="challenge" aria-live="polite">
            <div className="challenge-title">
              <div><span className="panel-label"><span>02</span> 先做预测</span><h2>{question.prompt}</h2></div>
              <span className="choose-tip">选择后自动运行</span>
            </div>
            <div className="answer-grid">
              {question.options.map((option) => {
                const isSelected = selected === option.id;
                const isCorrect = option.id === question.answerId;
                const state = isSelected ? (status === "wrong" ? "wrong" : status !== "idle" ? "correct" : "") : "";
                return (
                  <button
                    className={`answer ${state}`}
                    disabled={status === "running"}
                    key={option.id}
                    onClick={() => chooseAnswer(option.id)}
                    type="button"
                  >
                    <span className="answer-letter">{option.id.toUpperCase()}</span>
                    <span><strong>{option.label}</strong><small>{option.detail}</small></span>
                    {isSelected && status === "wrong" && <span className="answer-mark">×</span>}
                    {isSelected && isCorrect && status !== "idle" && <span className="answer-mark">✓</span>}
                  </button>
                );
              })}
            </div>
            {status === "wrong" && <p className="feedback wrong-feedback">还差一步：请先判断当前调用栈何时清空，以及哪个队列拥有更高优先级。</p>}
            {status === "running" && <p className="feedback running-feedback"><span /> Node.js 正在解析并执行案例…</p>}
          </section>

          <section className={`runtime ${status === "success" ? "complete" : ""}`}>
            <div className="runtime-heading">
              <div>
                <span className="panel-label"><span>03</span> 观察运行</span>
                <h2>Runtime Visualizer</h2>
              </div>
              <div className="runtime-status"><i className={status} />{status === "idle" || status === "wrong" ? "等待正确答案" : status === "running" ? `执行步骤 ${frameIndex + 1} / ${frames.length}` : "运行完成"}</div>
            </div>

            <div className="runtime-body">
              <div className="runtime-flow">
                {lanes.map((lane, index) => (
                  <div className={`runtime-lane ${frame?.activeLane === index ? "active" : ""}`} key={lane}>
                    <span className="lane-index">0{index + 1}</span>
                    <div><small>{lane}</small><strong>{frame?.laneValues[index] ?? "等待运行"}</strong></div>
                    {index < lanes.length - 1 && <span className="flow-arrow">→</span>}
                  </div>
                ))}
              </div>
              <div className="terminal">
                <div className="terminal-bar"><span>CONSOLE</span><span>{status === "success" ? "exit 0" : `node ${lesson.entryFile}`}</span></div>
                <div className="terminal-output">
                  <span className="command">$ node {lesson.entryFile}</span>
                  {(frame?.log ?? []).map((line, index) => <span key={`${line}-${index}`}><i>{String(index + 1).padStart(2, "0")}</i>{line}</span>)}
                  {status === "running" && <span className="cursor">▋</span>}
                  {!frame && <span className="terminal-placeholder">正确回答后，这里会显示真实执行顺序</span>}
                </div>
              </div>
            </div>

            <div className="runtime-caption">
              <div className="step-dots">
                {frames.map((_, index) => <span className={frameIndex >= index ? "done" : ""} key={index} />)}
              </div>
              <p>{frame?.note ?? "选择正确答案，启动可视化运行过程。"}</p>
            </div>
          </section>

          {status === "success" && (
            <section className="summary-panel">
              <div className="summary-check">✓</div>
              <div className="summary-copy"><span className="kicker">KNOWLEDGE LOCKED IN</span><h2>{isProject ? "项目挑战完成" : "知识点已掌握"}</h2><p>{lesson.summary.join(" · ")}</p></div>
              <button type="button" onClick={nextLesson}>继续下一课 <span>→</span></button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
