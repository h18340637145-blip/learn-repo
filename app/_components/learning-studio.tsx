"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import {
  AchievementUnlock,
  CompletionBurst,
  CursorSparks,
  EnergyRunway,
  ImmersiveBackdrop,
  NebulaProgress
} from "@/components/immersive";
import { StageSidebar, StageSpaceMap } from "@/components/learning-space";
import { SpatialRuntimeVisualizer } from "@/components/visualizers";
import { QuestionOptions } from "@/app/_components/question-options";
import { buildStageSpaces } from "@/lib/curriculum/stage-space";
import type { CurriculumStage, LessonSpec, QuestionType, RunnerFrame, StageId } from "@/lib/curriculum/types";
import { buildRoadmap } from "@/lib/curriculum/view-model";
import { streamAuthoredTrace } from "@/lib/execution/authored-trace";
import { getBrowserProgressRepository } from "@/lib/progress/browser-progress-repository";
import { buildLearningReport } from "@/lib/progress/learning-report";
import { emptyProgress, type ProgressSnapshot } from "@/lib/progress/types";

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const questionTypeLabels: Record<QuestionType, string> = {
  "best-practice": "最佳实践",
  completion: "补全代码",
  "concept-match": "概念配对",
  diagnosis: "诊断题",
  "equivalent-code": "等价代码",
  "execution-order": "执行顺序",
  implementation: "实现题",
  prediction: "先做预测",
  repair: "修复题",
  sequence: "流程排序",
  transfer: "迁移应用"
};

type CourseConfig = {
  courseId: "nodejs" | "nextjs";
  courseTitle: string;
  sidebarTitle: string;
  codeLabel: string;
  terminalPrefix: (entryFile: string) => string;
  curriculum: readonly CurriculumStage[];
  publishedLessons: LessonSpec[];
  finalProjectTitle: string;
  finalProjectTags: string;
  peerCourse: { id: string; title: string; href: string };
};

export function CourseLearningStudio({ config }: { config: CourseConfig }) {
  const { courseId, courseTitle, sidebarTitle, codeLabel, terminalPrefix, curriculum, publishedLessons, finalProjectTitle, finalProjectTags, peerCourse } = config;
  const [lessonIndex, setLessonIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedStageId, setSelectedStageId] = useState<StageId>(publishedLessons[0]?.stageId ?? curriculum[0].id);
  const [selectedByQuestion, setSelectedByQuestion] = useState<Record<string, string>>({});
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "running" | "wrong" | "success">("idle");
  const [frameIndex, setFrameIndex] = useState(-1);
  const [frame, setFrame] = useState<RunnerFrame | null>(null);
  const [progress, setProgress] = useState<ProgressSnapshot>(() => emptyProgress(courseId));
  const progressRef = useRef<ProgressSnapshot>(emptyProgress(courseId));
  const activeRun = useRef<AbortController | null>(null);
  const lesson = publishedLessons[lessonIndex]!;
  const isProject = lesson.kind === "stage-project";
  const isMultiStepProject = isProject && lesson.steps && lesson.steps.length > 0;
  const currentStep = isMultiStepProject ? lesson.steps![questionIndex] : null;
  const questionsList = isMultiStepProject ? lesson.steps!.map(s => s.question) : lesson.questions;
  const question = currentStep ? currentStep.question : (lesson.questions[questionIndex] ?? lesson.questions[0]!);
  const selected = selectedByQuestion[question.id] ?? null;
  const selectedOption = question.options.find((option) => option.id === selected);
  const requiredQuestions = questionsList.filter((item) => item.required !== false);
  const currentQuestionAnswered = answeredQuestionIds.includes(question.id);
  const answeredRequiredCount = requiredQuestions.filter((item) => answeredQuestionIds.includes(item.id)).length;
  const nextRequiredQuestionIndex = questionsList.findIndex(
    (item, index) => index > questionIndex && item.required !== false && !answeredQuestionIds.includes(item.id)
  );
  const hasMoreRequiredQuestions = nextRequiredQuestionIndex !== -1;
  const frames = currentStep?.execution?.frames ?? lesson.execution.frames;
  const codeFile = currentStep 
    ? (currentStep.files.find((file) => file.name === currentStep.entryFile) ?? currentStep.files[0]!)
    : (lesson.files.find((file) => file.name === lesson.entryFile) ?? lesson.files[0]!);
  const entryFile = currentStep ? currentStep.entryFile : lesson.entryFile;
  const roadmap = useMemo(() => buildRoadmap(curriculum, progress), [curriculum, progress]);
  const stageSpaces = useMemo(
    () => buildStageSpaces(curriculum, publishedLessons, progress),
    [curriculum, publishedLessons, progress]
  );
  const lessonIndexById = useMemo(
    () => new Map(publishedLessons.map((item, index) => [item.id, index])),
    [publishedLessons]
  );
  const publishedCount = publishedLessons.length;
  const routeStats = useMemo(() => ({
    knowledgeCount: curriculum.reduce((total, stage) => total + stage.lessons.length, 0),
    projectCount: curriculum.length,
    publishedCaseCount: publishedLessons.length,
    questionCount: publishedLessons.reduce((total, item) => {
      const qCount = item.steps ? item.steps.length : item.questions.length;
      return total + qCount;
    }, 0)
  }), [curriculum, publishedLessons]);
  const learningReport = useMemo(
    () => buildLearningReport(progress, publishedLessons),
    [progress, publishedLessons]
  );
  const lastAnsweredLabel = learningReport.lastAnsweredAt
    ? new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
        .format(new Date(learningReport.lastAnsweredAt))
    : "等待首次作答";
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
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loadedProgress = getBrowserProgressRepository(courseId).load();
      progressRef.current = loadedProgress;
      setProgress(loadedProgress);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [courseId]);

  function openLesson(index: number) {
    cancelRun();
    const next = publishedLessons[index];
    if (!next) return;

    setLessonIndex(index);
    setQuestionIndex(0);
    setSelectedStageId(next.stageId);
    setSelectedByQuestion({});
    setAnsweredQuestionIds([]);
    setStatus("idle");
    setFrameIndex(-1);
    setFrame(null);
  }

  function openPublishedLessonById(id: string) {
    const targetIndex = lessonIndexById.get(id);

    if (targetIndex === undefined) return;

    openLesson(targetIndex);
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
    setSelectedByQuestion((current) => ({ ...current, [question.id]: answer }));
    setFrameIndex(-1);
    setFrame(null);

    const repository = getBrowserProgressRepository(courseId);
    const latestProgress = repository.load();
    progressRef.current = latestProgress;
    const nextProgress = repository.recordQuestionAttempt(latestProgress, {
      lessonId: lesson.id,
      stageId: lesson.stageId,
      questionId: question.id,
      selectedOptionId: answer,
      isCorrect: answer === question.answerId
    });
    progressRef.current = nextProgress;
    setProgress(nextProgress);

    if (answer !== question.answerId) {
      setStatus("wrong");
      return;
    }

    const nextAnsweredQuestionIds = Array.from(new Set([...answeredQuestionIds, question.id]));
    setAnsweredQuestionIds(nextAnsweredQuestionIds);

    const nextUnansweredRequiredQuestionIndex = questionsList.findIndex(
      (item, index) => index > questionIndex && item.required !== false && !nextAnsweredQuestionIds.includes(item.id)
    );
    const hasMoreRequiredQuestions = nextUnansweredRequiredQuestionIndex !== -1;

    if (hasMoreRequiredQuestions) {
      setStatus("idle");
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
      setProgress((current) => {
        const completedProgress = lesson.kind === "stage-project"
          ? repository.completeProject(current, lesson.id)
          : repository.completeLesson(current, lesson.id);
        progressRef.current = completedProgress;
        return completedProgress;
      });
    }
  }

  const nextLesson = () => openLesson((lessonIndex + 1) % publishedLessons.length);

  function goToNextQuestion() {
    if (!hasMoreRequiredQuestions) return;

    setQuestionIndex((current) => current + 1);
    setStatus("idle");
    setFrameIndex(-1);
    setFrame(null);

    // 切换到下一题时，自动滚动回“理解概念”处，避免用户需要手动上滑
    setTimeout(() => {
      document.getElementById("concept-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <div className={`app-shell visual-${status}`}>
      <ImmersiveBackdrop status={status} progressPercent={progressPercent} />
      <CursorSparks />
      <span className="hud-scanline" aria-hidden="true" />
      <header className="topbar">
        <Link className="brand" href="/" aria-label="NodePath 首页">
          <span className="brand-mark">N<span>_</span></span>
          <span>NodePath</span>
        </Link>
        <nav className="main-nav" aria-label="主导航">
          <Link className="is-current" href={`/${courseId}`}>{courseTitle}</Link>
          <Link href={peerCourse.href}>{peerCourse.title}</Link>
          <a href="#roadmap">路线</a>
          <a href="#projects">项目</a>
        </nav>
        <div className="top-actions">
          <div className="mission-hud">
            <span>MISSION STATUS</span>
            <strong>{status === "success" ? "知识芯片已解锁" : status === "running" ? "运行解码中" : "等待预测输入"}</strong>
          </div>
          <button className="avatar" type="button" aria-label="打开个人中心">HX</button>
        </div>
      </header>

      <div className="workspace" id="top">
        <aside className="sidebar" id="roadmap">
          <div className="sidebar-heading">
            <div>
              <span className="kicker">LEARNING PATH</span>
              <h2>{sidebarTitle}</h2>
            </div>
            <span className="progress-number">{progressPercent}%</span>
          </div>
          <div className="progress-track" aria-label={`当前已发布课程进度 ${progressPercent}%`}>
            <span style={{ "--progress": `${progressPercent}%` } as React.CSSProperties} />
          </div>

          <section className="route-stats-panel" aria-label={`${courseTitle} 路线统计`}>
            <span className="kicker">{courseTitle} 路线</span>
            <div className="route-stats-grid">
              <span><strong>{routeStats.publishedCaseCount}</strong><small>已发布案例</small></span>
              <span><strong>{routeStats.questionCount}</strong><small>互动题</small></span>
              <span><strong>{routeStats.knowledgeCount}</strong><small>知识点</small></span>
              <span><strong>{routeStats.projectCount}</strong><small>阶段项目</small></span>
            </div>
          </section>

          <section className="learning-report-panel" aria-label={`${courseTitle} 学习报告`}>
            <span className="kicker">LEARNING REPORT</span>
            <div className="learning-report-grid">
              <span><strong>{learningReport.answeredQuestions}</strong><small>已作答题</small></span>
              <span><strong>{learningReport.firstTryAccuracy}%</strong><small>首次正确率</small></span>
              <span><strong>{learningReport.reviewQuestions}</strong><small>待复习</small></span>
              <span><strong>{lastAnsweredLabel}</strong><small>最近学习</small></span>
            </div>
            <p>{learningReport.answeredQuestions} / {learningReport.totalQuestions} 道互动题已经留下学习记录。</p>
          </section>

          <NebulaProgress
            activeStageId={selectedStageId}
            onSelectStage={selectStage}
            progressPercent={progressPercent}
            stages={roadmap}
          />

          <StageSidebar
            activeStageId={selectedStageId}
            activeLessonId={lesson.id}
            onOpenLesson={openPublishedLessonById}
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
            <strong>{finalProjectTitle}</strong>
            <p>{finalProjectTags}</p>
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
            <article className="concept-panel" id="concept-panel">
              <div className="panel-label"><span>01</span> {isMultiStepProject ? "项目任务" : "理解概念"}</div>
              <h2>{isMultiStepProject ? currentStep!.title : (isProject ? "项目目标" : "先建立心智模型")}</h2>
              <p>{isMultiStepProject ? currentStep!.context : lesson.concept}</p>
              {!isMultiStepProject && <ul>{lesson.points.map((point) => <li key={point}>{point}</li>)}</ul>}
              {!isMultiStepProject && (
                <div className="memory-card">
                  <span>记忆钩子</span>
                  <strong>{lesson.memoryHook}</strong>
                </div>
              )}
            </article>

            <article className="code-panel">
              <span className="code-panel__aurora" aria-hidden="true" />
              <div className="code-panel__title">
                <span>{codeLabel}</span>
                <strong>{entryFile}</strong>
              </div>
              <div className="code-toolbar">
                <div><i /><i /><i /></div>
                <span>{entryFile}</span>
                <span className="node-version">{lesson.nodeVersion}</span>
              </div>
              <pre aria-label={codeLabel}><code>{codeFile.code}</code></pre>
            </article>
          </div>

          <section className="challenge" aria-live="polite" data-particle-layer="answer-particle-field answer-orbit answer-core">
            <div className="challenge-title">
              <div>
                <span className="panel-label">
                  <span>02</span> 第 {questionIndex + 1} / {questionsList.length} 题 · {questionTypeLabels[question.type]}
                </span>
                <h2>{question.prompt}</h2>
              </div>
              <span className="choose-tip">选择后自动运行</span>
            </div>
            <QuestionOptions
              disabled={status === "running" || currentQuestionAnswered || status === "wrong"}
              onChoose={chooseAnswer}
              question={question}
              selectedId={selected}
              status={currentQuestionAnswered ? "success" : status}
            />
            {status === "wrong" && selectedOption && (
              <div className="feedback wrong-feedback">
                <p><strong>错误：</strong>{selectedOption.feedback}</p>
                <button className="retry-button" onClick={() => setStatus("idle")} type="button">
                  重新作答
                </button>
              </div>
            )}
            {status === "running" && <p className="feedback running-feedback"><span /> {courseTitle} 正在解析并执行案例…</p>}
            {(status === "success" || currentQuestionAnswered) && selectedOption && (
              <div className="feedback success-feedback">
                <div>
                  <h3>解析详情：</h3>
                  <p><strong>反馈：</strong>{selectedOption.feedback}</p>
                  <p><strong>深度解析：</strong>{question.correctExplanation}</p>
                </div>
                {hasMoreRequiredQuestions && (
                  <button className="next-question-button" onClick={goToNextQuestion} type="button">
                    进入下一题 <span>{answeredRequiredCount} / {requiredQuestions.length}</span>
                  </button>
                )}
              </div>
            )}
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
                <div className="terminal-bar"><span>CONSOLE</span><span>{status === "success" ? "exit 0" : terminalPrefix(entryFile)}</span></div>
                <div className="terminal-output">
                  <span className="command">{terminalPrefix(entryFile)}</span>
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
          <AchievementUnlock
            lessonTitle={lesson.title}
            visible={status === "success"}
            variant={completionVariant}
          />

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
