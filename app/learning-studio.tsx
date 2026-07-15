"use client";

import { useRef, useState } from "react";

type RunnerFrame = {
  activeLane: number;
  laneValues: string[];
  log: string[];
  note: string;
};

type Lesson = {
  id: string;
  eyebrow: string;
  title: string;
  duration: string;
  concept: string;
  points: string[];
  code: string;
  question: string;
  options: { id: string; label: string; detail: string }[];
  answer: string;
  lanes: string[];
  frames: RunnerFrame[];
  summary: string[];
  project?: boolean;
};

const lessons: Lesson[] = [
  {
    id: "modules",
    eyebrow: "01.4 · 模块系统",
    title: "require 缓存如何工作？",
    duration: "8 分钟",
    concept:
      "CommonJS 模块在第一次 require 时执行并进入缓存。之后再次加载同一路径，会复用 exports，而不是重新运行模块顶层代码。",
    points: ["首次加载：解析 → 执行 → 缓存", "再次加载：直接读取 require.cache"],
    code: `// counter.js\nconsole.log("模块初始化");\nlet count = 0;\nmodule.exports = () => ++count;\n\n// app.js\nconst a = require("./counter");\nconst b = require("./counter");\nconsole.log(a(), b());`,
    question: "执行 node app.js 后，控制台会打印什么？",
    options: [
      { id: "a", label: "初始化一次；1 2", detail: "模块实例被缓存并共享" },
      { id: "b", label: "初始化两次；1 1", detail: "每次 require 都重新执行" },
      { id: "c", label: "初始化一次；1 1", detail: "函数状态不会被共享" },
    ],
    answer: "a",
    lanes: ["模块加载器", "require.cache", "Console"],
    frames: [
      { activeLane: 0, laneValues: ["执行 counter.js", "空", ""], log: ["模块初始化"], note: "首次 require：执行模块顶层代码。" },
      { activeLane: 1, laneValues: ["返回 exports", "counter.js ✓", ""], log: ["模块初始化"], note: "导出对象和闭包状态一起进入缓存。" },
      { activeLane: 2, laneValues: ["复用 exports", "命中缓存", "1 2"], log: ["模块初始化", "1 2"], note: "a 与 b 指向同一个模块实例。" },
    ],
    summary: ["模块只在首次加载时执行", "缓存键是解析后的绝对文件名", "共享状态要谨慎设计"],
  },
  {
    id: "event-loop",
    eyebrow: "02.3 · 异步运行时",
    title: "读懂 Event Loop 执行顺序",
    duration: "12 分钟",
    concept:
      "同步代码先进入调用栈。当前栈清空后，Node.js 会先处理微任务，再进入事件循环阶段执行计时器回调。",
    points: ["Promise.then 进入微任务队列", "setTimeout 回调进入 timers 阶段"],
    code: `console.log("1");\n\nsetTimeout(() => {\n  console.log("2");\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log("3");\n});`,
    question: "这段代码的日志顺序是什么？",
    options: [
      { id: "a", label: "1 → 2 → 3", detail: "定时器先于微任务" },
      { id: "b", label: "1 → 3 → 2", detail: "同步 → 微任务 → timers" },
      { id: "c", label: "3 → 1 → 2", detail: "Promise 立即抢占调用栈" },
    ],
    answer: "b",
    lanes: ["Call Stack", "Microtask", "Timer Queue"],
    frames: [
      { activeLane: 0, laneValues: ["console.log(\"1\")", "then 回调等待", "timeout 回调等待"], log: ["1"], note: "同步语句直接在调用栈中执行。" },
      { activeLane: 1, laneValues: ["空", "执行 then 回调", "timeout 回调等待"], log: ["1", "3"], note: "调用栈清空后，微任务队列优先清空。" },
      { activeLane: 2, laneValues: ["空", "空", "执行 timeout 回调"], log: ["1", "3", "2"], note: "随后事件循环进入 timers 阶段。" },
    ],
    summary: ["同步代码永远先完成当前调用栈", "微任务在进入下一阶段前清空", "0ms 是最短等待时间，不是立即执行"],
  },
  {
    id: "streams",
    eyebrow: "03.2 · 流与文件",
    title: "用背压保护内存",
    duration: "10 分钟",
    concept:
      "当 writable.write() 返回 false，表示内部缓冲区已达到 highWaterMark。生产者应暂停，等待 drain 事件后再继续写入。",
    points: ["false 是流量信号，不是写入失败", "drain 表示缓冲区恢复可写"],
    code: `function writeChunks(source, target) {\n  let chunk;\n  while ((chunk = source.read()) !== null) {\n    if (!target.write(chunk)) {\n      // 应该在这里做什么？\n      return;\n    }\n  }\n}\n\ntarget.on("drain", () => writeChunks(source, target));`,
    question: "write() 返回 false 时，最合理的处理是什么？",
    options: [
      { id: "a", label: "立即重试 write", detail: "持续占用 CPU" },
      { id: "b", label: "丢弃当前 chunk", detail: "牺牲数据完整性" },
      { id: "c", label: "暂停并等待 drain", detail: "尊重下游消费速度" },
    ],
    answer: "c",
    lanes: ["Readable", "Buffer", "Writable"],
    frames: [
      { activeLane: 0, laneValues: ["读取 chunk #8", "72%", "写入中"], log: ["write(chunk #8)"], note: "生产速度暂时高于消费速度。" },
      { activeLane: 1, laneValues: ["暂停读取", "100% · 背压", "持续消费"], log: ["write() → false"], note: "缓冲区满，生产者主动暂停。" },
      { activeLane: 2, laneValues: ["恢复读取", "34%", "emit: drain"], log: ["write() → false", "drain → resume"], note: "下游释放空间后，通过 drain 恢复数据流。" },
    ],
    summary: ["背压让生产速率匹配消费速率", "pipe() 会自动处理常见背压场景", "大文件优先使用流而不是一次性读入内存"],
  },
  {
    id: "stage-project",
    eyebrow: "阶段项目 01 · 综合训练",
    title: "构建 CLI 日志分析器",
    duration: "25 分钟",
    concept:
      "把模块、文件系统、异步迭代器和错误处理组合起来：逐行读取日志，统计不同级别的消息，再把报告输出到终端。",
    points: ["复用前 3 个章节的知识", "重点：流式处理与模块边界"],
    code: `const fs = require("node:fs");\nconst readline = require("node:readline");\n\nconst input = fs.createReadStream("app.log");\nconst rl = readline.createInterface({ input });\nconst stats = { INFO: 0, WARN: 0, ERROR: 0 };\n\nfor await (const line of rl) {\n  const level = line.split(" ")[0];\n  // 补全统计逻辑\n  ???\n}\n\nconsole.table(stats);`,
    question: "哪段代码既安全，又只统计已知日志级别？",
    options: [
      { id: "a", label: "stats[level]++", detail: "未知级别会产生 NaN" },
      { id: "b", label: "if (level in stats) stats[level]++", detail: "先验证键，再更新计数" },
      { id: "c", label: "stats.INFO++", detail: "所有日志都计入 INFO" },
    ],
    answer: "b",
    lanes: ["文件流", "逐行解析", "统计报告"],
    frames: [
      { activeLane: 0, laneValues: ["读取 1.2 MB", "等待数据", "INFO 0 · WARN 0 · ERROR 0"], log: ["open app.log"], note: "createReadStream 不会一次性占满内存。" },
      { activeLane: 1, laneValues: ["chunk #4", "解析 128 行", "INFO 82 · WARN 31 · ERROR 15"], log: ["128 lines processed"], note: "异步迭代器自然地逐行消费输入。" },
      { activeLane: 2, laneValues: ["读取完成", "键校验通过", "INFO 238 · WARN 76 · ERROR 19"], log: ["128 lines processed", "report ready in 84ms"], note: "最终报告聚合了 333 条有效日志。" },
    ],
    summary: ["模块负责拆分读取、解析和报告", "流避免大文件造成内存峰值", "输入数据必须先验证再参与统计"],
    project: true,
  },
];

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
  const runToken = useRef(0);
  const lesson = lessons[lessonIndex];
  const frame = frameIndex >= 0 ? lesson.frames[frameIndex] : null;

  function openLesson(index: number) {
    runToken.current += 1;
    setLessonIndex(index);
    setSelected(null);
    setStatus("idle");
    setFrameIndex(-1);
  }

  async function chooseAnswer(answer: string) {
    const token = runToken.current + 1;
    runToken.current = token;
    setSelected(answer);
    setFrameIndex(-1);

    if (answer !== lesson.answer) {
      setStatus("wrong");
      return;
    }

    setStatus("running");
    for (let index = 0; index < lesson.frames.length; index += 1) {
      await delay(index === 0 ? 280 : 780);
      if (runToken.current !== token) return;
      setFrameIndex(index);
    }
    await delay(480);
    if (runToken.current === token) setStatus("success");
  }

  const nextLesson = () => openLesson((lessonIndex + 1) % lessons.length);

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
              <p>{lesson.project ? "组合知识点，完成一次真实工程挑战。" : "先预测，再运行；用可视化建立你的运行时心智模型。"}</p>
            </div>
            <div className="lesson-meta"><span>◷ {lesson.duration}</span><span>难度 · {lesson.project ? "进阶" : "基础"}</span></div>
          </section>

          <div className="lesson-switcher" aria-label="课程示例">
            {lessons.map((item, index) => (
              <button className={index === lessonIndex ? "active" : ""} key={item.id} onClick={() => openLesson(index)} type="button">
                <span>{item.project ? "PROJECT" : `0${index + 1}`}</span>{item.title}
              </button>
            ))}
          </div>

          <div className="learning-grid">
            <article className="concept-panel">
              <div className="panel-label"><span>01</span> 理解概念</div>
              <h2>{lesson.project ? "项目目标" : "先建立心智模型"}</h2>
              <p>{lesson.concept}</p>
              <ul>{lesson.points.map((point) => <li key={point}>{point}</li>)}</ul>
              <div className="memory-card">
                <span>记忆钩子</span>
                <strong>{lesson.id === "event-loop" ? "栈清空 → 微任务 → 下一阶段" : lesson.summary[0]}</strong>
              </div>
            </article>

            <article className="code-panel">
              <div className="code-toolbar">
                <div><i /><i /><i /></div>
                <span>{lesson.project ? "analyze.js" : "lesson.js"}</span>
                <span className="node-version">Node v22</span>
              </div>
              <pre aria-label="Node.js 案例代码"><code>{lesson.code}</code></pre>
            </article>
          </div>

          <section className="challenge" aria-live="polite">
            <div className="challenge-title">
              <div><span className="panel-label"><span>02</span> 先做预测</span><h2>{lesson.question}</h2></div>
              <span className="choose-tip">选择后自动运行</span>
            </div>
            <div className="answer-grid">
              {lesson.options.map((option) => {
                const isSelected = selected === option.id;
                const isCorrect = option.id === lesson.answer;
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
              <div className="runtime-status"><i className={status} />{status === "idle" || status === "wrong" ? "等待正确答案" : status === "running" ? `执行步骤 ${frameIndex + 1} / ${lesson.frames.length}` : "运行完成"}</div>
            </div>

            <div className="runtime-body">
              <div className="runtime-flow">
                {lesson.lanes.map((lane, index) => (
                  <div className={`runtime-lane ${frame?.activeLane === index ? "active" : ""}`} key={lane}>
                    <span className="lane-index">0{index + 1}</span>
                    <div><small>{lane}</small><strong>{frame?.laneValues[index] ?? "等待运行"}</strong></div>
                    {index < lesson.lanes.length - 1 && <span className="flow-arrow">→</span>}
                  </div>
                ))}
              </div>
              <div className="terminal">
                <div className="terminal-bar"><span>CONSOLE</span><span>{status === "success" ? "exit 0" : "node lesson.js"}</span></div>
                <div className="terminal-output">
                  <span className="command">$ node {lesson.project ? "analyze.js" : "lesson.js"}</span>
                  {(frame?.log ?? []).map((line, index) => <span key={`${line}-${index}`}><i>{String(index + 1).padStart(2, "0")}</i>{line}</span>)}
                  {status === "running" && <span className="cursor">▋</span>}
                  {!frame && <span className="terminal-placeholder">正确回答后，这里会显示真实执行顺序</span>}
                </div>
              </div>
            </div>

            <div className="runtime-caption">
              <div className="step-dots">
                {lesson.frames.map((_, index) => <span className={frameIndex >= index ? "done" : ""} key={index} />)}
              </div>
              <p>{frame?.note ?? "选择正确答案，启动可视化运行过程。"}</p>
            </div>
          </section>

          {status === "success" && (
            <section className="summary-panel">
              <div className="summary-check">✓</div>
              <div className="summary-copy"><span className="kicker">KNOWLEDGE LOCKED IN</span><h2>{lesson.project ? "项目挑战完成" : "知识点已掌握"}</h2><p>{lesson.summary.join(" · ")}</p></div>
              <button type="button" onClick={nextLesson}>继续下一课 <span>→</span></button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
