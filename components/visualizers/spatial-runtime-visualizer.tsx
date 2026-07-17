"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { RunnerFrame, VisualizerSpec } from "@/lib/curriculum/types";
import type { LearningVisualStatus } from "@/lib/immersive/visual-state";
import { VisualizerFallback } from "./visualizer-fallback";

const SpatialRuntimeCanvas = dynamic(
  () => import("./spatial-runtime-canvas").then((mod) => mod.SpatialRuntimeCanvas),
  { ssr: false }
);

const compactRuntimeWidth = 640;

type SpatialRuntimeVisualizerProps = {
  visualizer: VisualizerSpec;
  status: LearningVisualStatus;
  frame: RunnerFrame | null;
};

function hasWebGLSupport() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export function SpatialRuntimeVisualizer(props: SpatialRuntimeVisualizerProps) {
  const visualizerRef = useRef<HTMLDivElement | null>(null);
  const [canUseMotion, setCanUseMotion] = useState(false);

  useEffect(() => {
    let disposed = false;
    let frame = 0;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const smallViewportQuery = window.matchMedia("(max-width: 760px)");

    const updateMotionMode = () => {
      if (disposed) {
        return;
      }

      const reducedMotion = reducedMotionQuery.matches;
      const smallViewport = smallViewportQuery.matches;
      const compactRuntime = (visualizerRef.current?.clientWidth ?? window.innerWidth) < compactRuntimeWidth;
      setCanUseMotion(hasWebGLSupport() && !reducedMotion && !smallViewport && !compactRuntime);
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateMotionMode);
    };

    const resizeObserver = typeof ResizeObserver !== "undefined" && visualizerRef.current
      ? new ResizeObserver(scheduleUpdate)
      : null;

    resizeObserver?.observe(visualizerRef.current!);
    reducedMotionQuery.addEventListener("change", scheduleUpdate);
    smallViewportQuery.addEventListener("change", scheduleUpdate);
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      reducedMotionQuery.removeEventListener("change", scheduleUpdate);
      smallViewportQuery.removeEventListener("change", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return (
    <div className="spatial-runtime-visualizer knowledge-world" ref={visualizerRef}>
      <span className="knowledge-world__ring" aria-hidden="true" />
      {canUseMotion ? <SpatialRuntimeCanvas {...props} /> : <VisualizerFallback {...props} />}
    </div>
  );
}
