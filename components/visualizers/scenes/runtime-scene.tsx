"use client";

import { Float, Line, Text } from "@react-three/drei";

import type { RunnerFrame, VisualizerSpec } from "@/lib/curriculum/types";
import type { LearningVisualStatus } from "@/lib/immersive/visual-state";

type RuntimeSceneProps = {
  visualizer: VisualizerSpec;
  status: LearningVisualStatus;
  frame: RunnerFrame | null;
};

const colorByType: Record<VisualizerSpec["type"], string> = {
  "lane-flow": "#9fe870",
  "generic-particle-flow": "#9fe870",
  "stage-project-core": "#6ee7ff",
  "http-pipeline": "#6ee7ff",
  "service-boundary": "#ffd166",
  "worker-pool": "#ffad66",
  "realtime-mesh": "#7c5cff",
  "quality-shield": "#b8ff85",
  "diagnostics-tower": "#ff6bcb"
};

function nodePosition(index: number, total: number): [number, number, number] {
  const x = (index - (total - 1) / 2) * 1.35;
  const y = Math.sin(index * 0.9) * 0.32;
  const z = Math.cos(index * 0.7) * 0.18;

  return [x, y, z];
}

export function RuntimeScene({ visualizer, status, frame }: RuntimeSceneProps) {
  const activeIndex = Math.max(0, frame?.activeLane ?? 0);
  const color = colorByType[visualizer.type];
  const positions = visualizer.nodes.map((_, index) => nodePosition(index, visualizer.nodes.length));

  return (
    <group>
      <Line color="#263b4e" lineWidth={1.5} points={positions} transparent opacity={0.7} />
      {visualizer.nodes.map((node, index) => {
        const [x, y, z] = positions[index]!;
        const active = status !== "idle" && index === activeIndex;
        const completed = status === "success" || frame !== null && index <= activeIndex;

        return (
          <Float floatIntensity={active ? 0.7 : 0.25} key={`${node}-${index}`} rotationIntensity={0.18}>
            <group position={[x, active ? y + 0.25 : y, z]}>
              <mesh>
                <sphereGeometry args={[active ? 0.3 : 0.22, 32, 32]} />
                <meshStandardMaterial
                  color={active || completed ? color : "#2d3846"}
                  emissive={active ? color : "#050608"}
                  emissiveIntensity={active ? 0.75 : completed ? 0.3 : 0.15}
                />
              </mesh>
              {active && (
                <mesh>
                  <torusGeometry args={[0.46, 0.012, 12, 48]} />
                  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
                </mesh>
              )}
              <Text color="#dbe7f5" fontSize={0.16} maxWidth={1.1} position={[0, -0.55, 0]}>
                {node}
              </Text>
            </group>
          </Float>
        );
      })}
    </group>
  );
}
