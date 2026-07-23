"use client";

import React from "react";

export interface TraceTimelineScrubberProps {
  totalFrames: number;
  currentFrameIndex: number;
  isPlaying: boolean;
  onSelectFrame: (index: number) => void;
  onTogglePlay: () => void;
}

export function TraceTimelineScrubber({
  totalFrames,
  currentFrameIndex,
  isPlaying,
  onSelectFrame,
  onTogglePlay,
}: TraceTimelineScrubberProps) {
  if (totalFrames <= 0) return null;

  const handlePrev = () => {
    if (currentFrameIndex > 0) {
      onSelectFrame(currentFrameIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentFrameIndex < totalFrames - 1) {
      onSelectFrame(currentFrameIndex + 1);
    }
  };

  return (
    <div className="trace-scrubber-container">
      <div className="scrubber-controls">
        <button
          className="scrubber-btn"
          disabled={currentFrameIndex <= 0}
          onClick={handlePrev}
          title="上一帧"
          type="button"
        >
          ⏮
        </button>

        <button
          className="scrubber-btn play-btn"
          onClick={onTogglePlay}
          title={isPlaying ? "暂停轨迹" : "播放轨迹"}
          type="button"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        <button
          className="scrubber-btn"
          disabled={currentFrameIndex >= totalFrames - 1}
          onClick={handleNext}
          title="下一帧"
          type="button"
        >
          ⏭
        </button>
      </div>

      <div className="scrubber-track-wrapper">
        <input
          aria-label="轨迹执行时间轴"
          className="scrubber-slider"
          max={totalFrames - 1}
          min={0}
          onChange={(e) => onSelectFrame(Number(e.target.value))}
          type="range"
          value={currentFrameIndex}
        />
        <div className="scrubber-steps-indicator">
          {Array.from({ length: totalFrames }).map((_, index) => (
            <button
              key={index}
              className={`step-dot ${index === currentFrameIndex ? "active" : index < currentFrameIndex ? "passed" : ""}`}
              onClick={() => onSelectFrame(index)}
              title={`跳转到第 ${index + 1} 帧`}
              type="button"
            />
          ))}
        </div>
      </div>

      <div className="scrubber-counter">
        <span>帧 {currentFrameIndex + 1} / {totalFrames}</span>
      </div>
    </div>
  );
}
