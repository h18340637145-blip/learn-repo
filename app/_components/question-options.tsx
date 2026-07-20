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
  if (question.type === "implementation") {
    return (
      <CodeQuestionOptions
        disabled={disabled}
        onChoose={onChoose}
        question={question}
        selectedId={selectedId}
        status={status}
      />
    );
  }

  return (
    <TextQuestionOptions
      disabled={disabled}
      onChoose={onChoose}
      question={question}
      selectedId={selectedId}
      status={status}
    />
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

function CodeQuestionOptions({ question, selectedId, status, disabled, onChoose }: QuestionOptionsProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpanded = (optionId: string) => {
    setExpandedIds((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
    );
  };

  return (
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
                <button
                  className="code-answer-card__toggle"
                  onClick={() => toggleExpanded(option.id)}
                  type="button"
                >
                  {expanded ? "收起代码" : "展开代码"}
                </button>
                <pre className={`code-answer-card__code ${expanded ? "expanded" : ""}`} data-language={option.language}>
                  <code>{highlightDiffLines(option.code, option.diffLines)}</code>
                </pre>
              </div>
            )}
          </article>
        );
      })}
    </div>
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
