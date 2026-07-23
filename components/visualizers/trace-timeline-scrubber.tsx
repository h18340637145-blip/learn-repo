"use client";

import React from "react";
import type { TracePlaybackState } from "@/lib/runtime/runtime-panel-state";

export interface TraceTimelineScrubberProps {
  totalFrames: number;
  currentFrameIndex: number;
  playbackState: TracePlaybackState;
  onSelectFrame: (index: number) => void;
  onTogglePlay: () => void;
}

export function TraceTimelineScrubber({
  totalFrames,
  currentFrameIndex,
  playbackState,
  onSelectFrame,
  onTogglePlay,
}: TraceTimelineScrubberProps) {
  if (totalFrames <= 0) return null;

  const isDisabled = playbackState === "disabled";
  const isPlaying = playbackState === "playing";
  const isComplete = playbackState === "complete";
  const currentIndex = Math.min(Math.max(currentFrameIndex, 0), totalFrames - 1);
  const playTitle = isComplete ? "重播轨迹" : isPlaying ? "暂停轨迹" : "播放轨迹";

  const handlePrev = () => {
    if (!isDisabled && currentIndex > 0) {
      onSelectFrame(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (!isDisabled && currentIndex < totalFrames - 1) {
      onSelectFrame(currentIndex + 1);
    }
  };

  return (
    <div className={`trace-scrubber-container playback-${playbackState}`}>
      <div className="scrubber-controls">
        <button
          className="scrubber-btn"
          disabled={isDisabled || currentIndex <= 0}
          onClick={handlePrev}
          title="上一帧"
          type="button"
        >
          ⏮
        </button>

        <button
          className="scrubber-btn play-btn"
          aria-disabled={isDisabled}
          disabled={isDisabled}
          onClick={onTogglePlay}
          title={playTitle}
          type="button"
        >
          {isComplete ? "↻" : isPlaying ? "⏸" : "▶"}
        </button>

        <button
          className="scrubber-btn"
          disabled={isDisabled || currentIndex >= totalFrames - 1}
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
          aria-disabled={isDisabled}
          className="scrubber-slider"
          disabled={isDisabled}
          max={totalFrames - 1}
          min={0}
          onChange={(e) => onSelectFrame(Number(e.target.value))}
          type="range"
          value={currentIndex}
        />
        <div className="scrubber-steps-indicator">
          {Array.from({ length: totalFrames }).map((_, index) => (
            <button
              key={index}
              aria-disabled={isDisabled}
              className={`step-dot ${index === currentIndex ? "active" : index < currentIndex ? "passed" : ""}`}
              disabled={isDisabled}
              onClick={() => onSelectFrame(index)}
              title={`跳转到第 ${index + 1} 帧`}
              type="button"
            />
          ))}
        </div>
      </div>

      <div className="scrubber-counter">
        <span>帧 {currentIndex + 1} / {totalFrames}</span>
      </div>
    </div>
  );
}
