"use client";

import { Canvas } from "@react-three/fiber";

import type { RunnerFrame, VisualizerSpec } from "@/lib/curriculum/types";
import type { LearningVisualStatus } from "@/lib/immersive/visual-state";
import { RuntimeScene } from "./scenes/runtime-scene";
import { VisualizerFallback } from "./visualizer-fallback";

type SpatialRuntimeCanvasProps = {
  visualizer: VisualizerSpec;
  status: LearningVisualStatus;
  frame: RunnerFrame | null;
};

export function SpatialRuntimeCanvas(props: SpatialRuntimeCanvasProps) {
  return (
    <Canvas
      className="spatial-runtime-canvas"
      camera={{ position: [0, 2.8, 7], fov: 46 }}
      dpr={[1, 1.5]}
      fallback={<VisualizerFallback {...props} />}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor("#080b0f", 1);
      }}
    >
      <ambientLight intensity={0.55} />
      <pointLight color="#9fe870" intensity={1.2} position={[2, 3, 4]} />
      <RuntimeScene {...props} />
    </Canvas>
  );
}
