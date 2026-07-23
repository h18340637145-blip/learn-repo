export type RuntimeOutputTab = "console" | "browser";

export type TracePlaybackState = "disabled" | "playing" | "paused" | "complete";

export type RuntimePanelState = {
  activeTab: RuntimeOutputTab;
  playbackState: TracePlaybackState;
  frameIndex: number;
};

function clampFrameIndex(index: number, totalFrames: number) {
  if (totalFrames <= 0) return -1;

  return Math.min(Math.max(index, 0), totalFrames - 1);
}

export function createRuntimePanelState(): RuntimePanelState {
  return {
    activeTab: "console",
    playbackState: "disabled",
    frameIndex: -1
  };
}

export function selectRuntimeTab(
  state: RuntimePanelState,
  activeTab: RuntimeOutputTab
): RuntimePanelState {
  return {
    ...state,
    activeTab
  };
}

export function startTracePlayback(
  state: RuntimePanelState,
  totalFrames: number
): RuntimePanelState {
  if (totalFrames <= 0) {
    return disableTracePlayback(state);
  }

  return {
    ...state,
    playbackState: "playing",
    frameIndex: state.playbackState === "complete" ? -1 : clampFrameIndex(state.frameIndex, totalFrames)
  };
}

export function toggleTracePlayback(
  state: RuntimePanelState,
  totalFrames: number
): RuntimePanelState {
  if (state.playbackState === "disabled" || totalFrames <= 0) {
    return disableTracePlayback(state);
  }

  if (state.playbackState === "playing") {
    return {
      ...state,
      playbackState: "paused"
    };
  }

  if (state.playbackState === "complete") {
    return {
      ...state,
      playbackState: "playing",
      frameIndex: -1
    };
  }

  return {
    ...state,
    playbackState: "playing"
  };
}

export function selectTraceFrame(
  state: RuntimePanelState,
  frameIndex: number,
  totalFrames: number
): RuntimePanelState {
  if (totalFrames <= 0) {
    return disableTracePlayback(state);
  }

  return {
    ...state,
    playbackState: "paused",
    frameIndex: clampFrameIndex(frameIndex, totalFrames)
  };
}

export function acceptRunnerFrame(
  state: RuntimePanelState,
  frameIndex: number,
  totalFrames: number
): RuntimePanelState {
  if (state.playbackState !== "playing") {
    return state;
  }

  return {
    ...state,
    frameIndex: clampFrameIndex(frameIndex, totalFrames)
  };
}

export function completeTracePlayback(
  state: RuntimePanelState,
  totalFrames: number
): RuntimePanelState {
  if (totalFrames <= 0) {
    return disableTracePlayback(state);
  }

  return {
    ...state,
    playbackState: "complete",
    frameIndex: totalFrames - 1
  };
}

export function disableTracePlayback(state: RuntimePanelState): RuntimePanelState {
  return {
    ...state,
    playbackState: "disabled",
    frameIndex: -1
  };
}
