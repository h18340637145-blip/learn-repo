"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  CompletionBurst,
  EnergyRunway,
  ImmersiveBackdrop,
  NebulaProgress
} from "@/components/immersive";
import { StageSidebar, StageSpaceMap } from "@/components/learning-space";
import { SpatialRuntimeVisualizer } from "@/components/visualizers";
import { curriculum } from "@/content/curriculum";
import { publishedLessons } from "@/content/lesson-registry";
import { buildStageSpaces } from "@/lib/curriculum/stage-space";
import type { RunnerFrame, StageId } from "@/lib/curriculum/types";
import { buildRoadmap } from "@/lib/curriculum/view-model";
import { streamAuthoredTrace } from "@/lib/execution/authored-trace";
import { getBrowserProgressRepository } from "@/lib/progress/browser-progress-repository";
import { emptyProgress, type ProgressSnapshot } from "@/lib/progress/types";

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export function LearningStudio() {
  const [lessonIndex, setLessonIndex] = useState(1);
  const [selectedStageId, setSelectedStageId] = useState<StageId>(publishedLessons[1]?.stageId ?? "runtime-cli");
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "wrong" | "success">("idle");
  const [frameIndex, setFrameIndex] = useState(-1);
  const [frame, setFrame] = useState<RunnerFrame | null>(null);
  const [progress, setProgress] = useState<ProgressSnapshot>(emptyProgress);
  const activeRun = useRef<AbortController | null>(null);
  const lesson = publishedLessons[lessonIndex]!;
  const question = lesson.questions[0]!;
  const selectedOption = question.options.find((option) => option.id === selected);
  const frames = lesson.execution.frames;
  const isProject = lesson.kind === "stage-project";
  const codeFile = lesson.files.find((file) => file.name === lesson.entryFile) ?? lesson.files[0]!;
  const roadmap = useMemo(() => buildRoadmap(curriculum, progress), [progress]);
  const stageSpaces = useMemo(
    () => buildStageSpaces(curriculum, publishedLessons, progress),
    [progress]
  );
  const publishedCount = publishedLessons.length;
  const completedCount = progress.completedLessonIds.length + progress.completedProjectIds.length;
  const progressPercent = publishedCount === 0 ? 0 : Math.round((completedCount / publishedCount) * 100);
  const projectLessonIndex = publishedLessons.findIndex((item) => item.kind === "stage-project");
  const activeStageId = lesson.stageId;
  const activeStageSpace = stageSpaces.find((stage) => stage.id === selectedStageId)
    ?? stageSpaces.find((stage) => stage.id === activeStageId)
    ?? stageSpaces[0]!;
  const activeStageProject = activeStageSpace.nodes.find((node) => node.kind === "stage-project");
  const activeStageProjectLessonIndex = activeStageProject?.lessonIndex ?? projectLessonIndex;
  const completionVariant = isProject ? "project" : "lesson";

  function cancelRun() {
    activeRun.current?.abort();
    activeRun.current = null;
  }

  useEffect(() => () => {
    activeRun.current?.abort();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProgress(getBrowserProgressRepository().load());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function openLesson(index: number) {
    cancelRun();
    const next = publishedLessons[index];
    if (!next) return;

    setLessonIndex(index);
    setSelectedStageId(next.stageId);
    setSelected(null);
    setStatus("idle");
    setFrameIndex(-1);
    setFrame(null);
  }

  function selectStage(stageId: StageId) {
    cancelRun();
    setSelectedStageId(stageId);

    const firstLesson = stageSpaces
      .find((stage) => stage.id === stageId)
      ?.nodes.find((node) => node.lessonIndex !== null);

    if (firstLesson?.lessonIndex !== null && firstLesson?.lessonIndex !== undefined) {
      openLesson(firstLesson.lessonIndex);
    }
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
      const repository = getBrowserProgressRepository();
      setProgress((current) => lesson.kind === "stage-project"
        ? repository.completeProject(current, lesson.id)
        : repository.completeLesson(current, lesson.id));
    }
  }

  const nextLesson = () => openLesson((lessonIndex + 1) % publishedLessons.length);

  return (
    <div className={`app-shell visual-${status}`}>
      <ImmersiveBackdrop status={status} progressPercent={progressPercent} />
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
            <span className="progress-number">{progressPercent}%</span>
          </div>
          <div className="progress-track" aria-label={`当前已发布课程进度 ${progressPercent}%`}>
            <span style={{ "--progress": `${progressPercent}%` } as React.CSSProperties} />
          </div>
          <NebulaProgress
            activeStageId={selectedStageId}
            onSelectStage={selectStage}
            progressPercent={progressPercent}
            stages={roadmap}
          />

          <StageSidebar
            activeStageId={selectedStageId}
            onSelectStage={selectStage}
            stages={roadmap}
          />

          <button className="project-shortcut" id="projects" type="button" onClick={() => openLesson(activeStageProjectLessonIndex)}>
            <span className="project-icon">⌘</span>
            <span><span>阶段项目</span><strong>{activeStageProject?.title ?? "阶段项目挑战"}</strong></span>
            <em>进入</em>
          </button>

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

          <StageSpaceMap
            activeLessonId={lesson.id}
            onOpenLesson={openLesson}
            stage={activeStageSpace}
          />

          <section className="course-orbital-dashboard" aria-label="当前学习轨道">
            <div className="orbital-core">
              <span className="orbital-core__ring" aria-hidden="true" />
              <span className="kicker">ORBITAL TRACK</span>
              <strong>{lesson.kind === "stage-project" ? "阶段项目核心" : "知识点运行轨道"}</strong>
              <small>{lesson.execution.visualizer.title}</small>
            </div>
            <div className="orbital-card">
              <span>当前节点</span>
              <strong>{lesson.title}</strong>
              <small>{lesson.execution.visualizer.nodes.join(" → ")}</small>
            </div>
            <div className="orbital-card">
              <span>阶段能量</span>
              <strong>{activeStageSpace.completedCount} / {activeStageSpace.publishedCount}</strong>
              <small>{activeStageSpace.title}</small>
            </div>
            <div className="orbital-card">
              <span>下一步</span>
              <strong>{status === "idle" || status === "wrong" ? "选择预测答案" : status === "running" ? "观察粒子运行" : "总结并继续"}</strong>
              <small>{frames.length} 个运行帧 · {lesson.execution.visualizer.nodes.length} 个空间节点</small>
            </div>
          </section>

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
                    <span className="answer-particle-field" aria-hidden="true" />
                    <span className="answer-orbit" aria-hidden="true" />
                    <span className="answer-letter">{option.id.toUpperCase()}</span>
                    <span className="answer-core"><strong>{option.label}</strong><small>{option.detail}</small></span>
                    {isSelected && status === "wrong" && <span className="answer-mark">×</span>}
                    {isSelected && isCorrect && status !== "idle" && <span className="answer-mark">✓</span>}
                  </button>
                );
              })}
            </div>
            {status === "wrong" && selectedOption && (
              <p className="feedback wrong-feedback">{selectedOption.feedback}</p>
            )}
            {status === "running" && <p className="feedback running-feedback"><span /> Node.js 正在解析并执行案例…</p>}
          </section>

          <EnergyRunway status={status} />

          <section className={`runtime ${status === "success" ? "complete" : ""}`}>
            <div className="runtime-heading">
              <div>
                <span className="panel-label"><span>03</span> 观察运行</span>
                <h2>Runtime Visualizer</h2>
              </div>
              <div className="runtime-status"><i className={status} />{status === "idle" || status === "wrong" ? "等待正确答案" : status === "running" ? `执行步骤 ${frameIndex + 1} / ${frames.length}` : "运行完成"}</div>
            </div>

            <div className="runtime-body">
              <SpatialRuntimeVisualizer
                frame={frame}
                status={status}
                visualizer={lesson.execution.visualizer}
              />
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

          <CompletionBurst visible={status === "success"} variant={completionVariant} />

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
