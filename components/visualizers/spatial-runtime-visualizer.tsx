"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { RunnerFrame, VisualizerSpec } from "@/lib/curriculum/types";
import type { LearningVisualStatus } from "@/lib/immersive/visual-state";
import { VisualizerFallback } from "./visualizer-fallback";

const SpatialRuntimeCanvas = dynamic(
  () => import("./spatial-runtime-canvas").then((mod) => mod.SpatialRuntimeCanvas),
  { ssr: false }
);

type SpatialRuntimeVisualizerProps = {
  visualizer: VisualizerSpec;
  status: LearningVisualStatus;
  frame: RunnerFrame | null;
};

function hasWebGLSupport() {
  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
}

export function SpatialRuntimeVisualizer(props: SpatialRuntimeVisualizerProps) {
  const [canUseMotion, setCanUseMotion] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const smallViewport = window.matchMedia("(max-width: 760px)").matches;
      setCanUseMotion(hasWebGLSupport() && !reducedMotion && !smallViewport);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="spatial-runtime-visualizer knowledge-world">
      <span className="knowledge-world__ring" aria-hidden="true" />
      {canUseMotion ? <SpatialRuntimeCanvas {...props} /> : <VisualizerFallback {...props} />}
    </div>
  );
}
