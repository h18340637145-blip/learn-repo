"use client";

import { useMemo } from "react";
import { Float, Line, Text } from "@react-three/drei";
import { AdditiveBlending } from "three";
import { RenderMode } from "three.quarks";

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
  "diagnostics-tower": "#ff6bcb",
  // Next.js visualizers
  "nextjs-render-pipeline": "#6ee7ff",
  "nextjs-routing-tree": "#9fe870",
  "nextjs-component-boundary": "#ffd166",
  "nextjs-data-flow": "#7c5cff",
  "nextjs-middleware-chain": "#ffad66",
  "nextjs-build-output": "#b8ff85",
  "frontend-error-stack": "#ff6bcb",
  "browser-network-debug": "#6ee7ff",
  "memory-stack": "#9fe870",
  "android-system-trace": "#b8ff85",
  "agent-trace": "#7c5cff",
  "math-graph-lab": "#ffd166",
  "transformer-attention": "#ffad66"
};

function nodePosition(index: number, total: number): [number, number, number] {
  const x = (index - (total - 1) / 2) * 1.35;
  const y = Math.sin(index * 0.9) * 0.32;
  const z = Math.cos(index * 0.7) * 0.18;

  return [x, y, z];
}

function KnowledgeOrbit({ nodes, color, activeIndex }: {
  nodes: readonly string[];
  color: string;
  activeIndex: number;
}) {
  const radius = Math.max(2.35, nodes.length * 0.34);

  return (
    <group rotation={[0.24, 0, -0.08]}>
      <mesh>
        <torusGeometry args={[radius, 0.006, 10, 128]} />
        <meshStandardMaterial color="#213244" emissive={color} emissiveIntensity={0.18} transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.72, 0.004, 10, 96]} />
        <meshStandardMaterial color="#172636" emissive="#6ee7ff" emissiveIntensity={0.12} transparent opacity={0.45} />
      </mesh>
      {nodes.map((node, index) => {
        const angle = (index / nodes.length) * Math.PI * 2;
        const active = index === activeIndex;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius * 0.42;
        const y = Math.sin(angle * 1.7) * 0.34 + 0.62;

        return (
          <Float floatIntensity={active ? 0.55 : 0.2} key={`knowledge-${node}-${index}`} rotationIntensity={0.12}>
            <group position={[x, y, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
              <mesh>
                <sphereGeometry args={[active ? 0.08 : 0.045, 18, 18]} />
                <meshStandardMaterial color={active ? color : "#6ee7ff"} emissive={active ? color : "#6ee7ff"} emissiveIntensity={active ? 0.9 : 0.25} />
              </mesh>
              <Text
                anchorX="center"
                color={active ? "#ffffff" : "#9fb0c4"}
                fontSize={active ? 0.14 : 0.105}
                maxWidth={0.86}
                outlineColor="#071017"
                outlineWidth={0.006}
                position={[0, 0.22, 0]}
              >
                {node}
              </Text>
            </group>
          </Float>
        );
      })}
    </group>
  );
}

function QuarksParticleAura({ color, status, activeIndex }: {
  color: string;
  status: LearningVisualStatus;
  activeIndex: number;
}) {
  const positions = useMemo(() => {
    const items: number[] = [];
    const count = 72;
    const phase = activeIndex * 0.19;

    for (let index = 0; index < count; index += 1) {
      const angle = index * 0.72 + phase;
      const radius = 1.1 + (index % 9) * 0.22;
      items.push(
        Math.cos(angle) * radius,
        Math.sin(index * 1.37) * 0.72 + (status === "running" ? 0.18 : 0),
        Math.sin(angle) * radius * 0.54 - 0.42
      );
    }

    return new Float32Array(items);
  }, [status, activeIndex]);

  const quarksRenderMode = RenderMode.BillBoard;
  const particleEngines = "three.quarks + ThreeNebula + Proton";

  return (
    <points userData={{ particleEngines, quarksRenderMode }}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        blending={AdditiveBlending}
        color={color}
        depthWrite={false}
        opacity={status === "running" ? 0.84 : 0.44}
        size={status === "success" ? 0.06 : 0.045}
        transparent
      />
    </points>
  );
}

export function RuntimeScene({ visualizer, status, frame }: RuntimeSceneProps) {
  const activeIndex = Math.max(0, frame?.activeLane ?? 0);
  const color = colorByType[visualizer.type];
  const positions = visualizer.nodes.map((_, index) => nodePosition(index, visualizer.nodes.length));

  return (
    <group>
      <KnowledgeOrbit activeIndex={activeIndex} color={color} nodes={visualizer.nodes} />
      <QuarksParticleAura activeIndex={activeIndex} color={color} status={status} />
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
