"use client";

import { useState } from "react";

import type { AnswerOption, LessonQuestion } from "@/lib/curriculum/types";

type AnswerStatus = "idle" | "running" | "wrong" | "success";

type QuestionOptionsProps = {
  question: LessonQuestion;
  selectedId: string | null;
  status: AnswerStatus;
  disabled: boolean;
  onChoose: (optionId: string) => void;
};

export function QuestionOptions({ question, selectedId, status, disabled, onChoose }: QuestionOptionsProps) {
  if (question.type === "implementation" || question.type === "repair" || question.type === "completion") {
    return (
      <>
        <QuestionMaterial question={question} />
        <CodeQuestionOptions
          disabled={disabled}
          onChoose={onChoose}
          question={question}
          selectedId={selectedId}
          status={status}
        />
      </>
    );
  }

  if (question.type === "execution-order") {
    return (
      <>
        <QuestionMaterial question={question} />
        <OrderQuestionOptions
          disabled={disabled}
          onChoose={onChoose}
          question={question}
          selectedId={selectedId}
          status={status}
        />
      </>
    );
  }

  return (
    <>
      <QuestionMaterial question={question} />
      <TextQuestionOptions
        disabled={disabled}
        onChoose={onChoose}
        question={question}
        selectedId={selectedId}
        status={status}
      />
    </>
  );
}

function QuestionMaterial({ question }: { question: LessonQuestion }) {
  if (!question.materialTitle && !question.materialCode && !question.expectedOutput && !question.orderItems?.length) {
    return null;
  }

  return (
    <aside className="question-material">
      {question.materialTitle && <span className="question-material__title">{question.materialTitle}</span>}
      {question.materialCode && (
        <pre className="question-material__code" data-language={question.materialLanguage}>
          <code>{question.materialCode}</code>
        </pre>
      )}
      {question.expectedOutput && <p className="expected-output">{question.expectedOutput}</p>}
      {question.orderItems && (
        <ol className="order-items">
          {question.orderItems.map((item) => <li key={item}>{item}</li>)}
        </ol>
      )}
    </aside>
  );
}

function TextQuestionOptions({ question, selectedId, status, disabled, onChoose }: QuestionOptionsProps) {
  return (
    <div className="answer-grid">
      {question.options.map((option) => {
        const state = optionState(option, question.answerId, selectedId, status);

        return (
          <button
            className={`answer ${state}`}
            disabled={disabled}
            key={option.id}
            onClick={() => onChoose(option.id)}
            type="button"
          >
            <span className="answer-particle-field" aria-hidden="true" />
            <span className="answer-orbit" aria-hidden="true" />
            <span className="answer-letter">{option.id.toUpperCase()}</span>
            <span className="answer-core"><strong>{option.label}</strong><small>{option.detail}</small></span>
            <AnswerMark option={option} answerId={question.answerId} selectedId={selectedId} status={status} />
          </button>
        );
      })}
    </div>
  );
}

function OrderQuestionOptions({ question, selectedId, status, disabled, onChoose }: QuestionOptionsProps) {
  return (
    <div className="order-answer-grid">
      {question.options.map((option) => {
        const state = optionState(option, question.answerId, selectedId, status);

        return (
          <button
            className={`order-answer-card ${state}`}
            disabled={disabled}
            key={option.id}
            onClick={() => onChoose(option.id)}
            type="button"
          >
            <span className="answer-letter">{option.id.toUpperCase()}</span>
            <span className="order-answer-card__copy">
              <strong>{option.label}</strong>
              <small>{option.detail}</small>
            </span>
            <AnswerMark option={option} answerId={question.answerId} selectedId={selectedId} status={status} />
          </button>
        );
      })}
    </div>
  );
}

function CodeQuestionOptions({ question, selectedId, status, disabled, onChoose }: QuestionOptionsProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);

  const toggleExpanded = (optionId: string) => {
    setExpandedIds((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
    );
  };

  const fullscreenOption = fullscreenId ? question.options.find(o => o.id === fullscreenId) : null;

  return (
    <>
      <div className="code-answer-grid">
        {question.options.map((option) => {
          const state = optionState(option, question.answerId, selectedId, status);
          const expanded = expandedIds.includes(option.id);

          return (
            <article className={`code-answer-card ${state}`} key={option.id}>
              <button
                className="code-answer-card__select"
                disabled={disabled}
                onClick={() => onChoose(option.id)}
                type="button"
              >
                <span className="answer-particle-field" aria-hidden="true" />
                <span className="answer-letter">{option.id.toUpperCase()}</span>
                <span className="code-answer-card__copy">
                  <strong>{option.label}</strong>
                  <small>{option.summary ?? option.detail}</small>
                </span>
                <AnswerMark option={option} answerId={question.answerId} selectedId={selectedId} status={status} />
              </button>

              {option.code && (
                <div className="code-answer-card__preview">
                  <div className="code-answer-card__actions">
                    <button
                      className="code-answer-card__toggle"
                      onClick={() => toggleExpanded(option.id)}
                      type="button"
                    >
                      {expanded ? "收起代码" : "展开代码"}
                    </button>
                    <button
                      className="code-answer-card__toggle"
                      onClick={() => setFullscreenId(option.id)}
                      type="button"
                    >
                      全屏查看
                    </button>
                  </div>
                  <pre className={`code-answer-card__code ${expanded ? "expanded" : ""}`} data-language={option.language}>
                    <code>{highlightDiffLines(option.code, option.diffLines)}</code>
                  </pre>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {fullscreenOption && fullscreenOption.code && (
        <div className="fullscreen-code-modal">
          <div className="fullscreen-code-header">
            <h3>选项 {fullscreenOption.id.toUpperCase()} 代码详情</h3>
            <button className="fullscreen-code-close" onClick={() => setFullscreenId(null)}>关闭</button>
          </div>
          <div className="fullscreen-code-content">
            <pre data-language={fullscreenOption.language}>
              <code>{highlightDiffLines(fullscreenOption.code, fullscreenOption.diffLines)}</code>
            </pre>
          </div>
        </div>
      )}
    </>
  );
}

function AnswerMark({
  option,
  answerId,
  selectedId,
  status
}: {
  option: AnswerOption;
  answerId: string;
  selectedId: string | null;
  status: AnswerStatus;
}) {
  const selected = selectedId === option.id;
  const correct = option.id === answerId;

  if (selected && status === "wrong") return <span className="answer-mark">×</span>;
  if (selected && correct && status !== "idle") return <span className="answer-mark">✓</span>;
  if (selected && status === "idle") return <span className="answer-mark">●</span>;

  return null;
}

function optionState(option: AnswerOption, answerId: string, selectedId: string | null, status: AnswerStatus) {
  const selected = selectedId === option.id;
  const correct = option.id === answerId;

  if (!selected) return "";
  if (status === "wrong") return "wrong";
  if (correct && status !== "idle") return "correct";
  return "selected";
}

function highlightDiffLines(code: string, diffLines: number[] | undefined) {
  const diffLineSet = new Set(diffLines ?? []);

  return code.split("\n").map((line, index) => {
    const lineNumber = index + 1;
    const prefix = diffLineSet.has(lineNumber) ? "▌ " : "  ";

    return `${prefix}${line}`;
  }).join("\n");
}
