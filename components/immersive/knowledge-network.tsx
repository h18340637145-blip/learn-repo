"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Sphere, Line } from "@react-three/drei";
import * as THREE from "three";

import { curriculum as nodejsCurriculum } from "@/content/curriculum";
import { nextjsCurriculum } from "@/content/curriculum-nextjs";
import { getBrowserProgressRepository } from "@/lib/progress/browser-progress-repository";
import type { CurriculumStage } from "@/lib/curriculum/types";

type GraphNode = {
  id: string;
  title: string;
  summary: string;
  course: "core" | "nodejs" | "nextjs";
  position: [number, number, number];
  completed: boolean;
  featured: boolean;
};

type GraphEdge = {
  id: string;
  source: [number, number, number];
  target: [number, number, number];
  active: boolean;
};

function calculateSpherePoint(index: number, total: number, sphereRadius: number, phase = 0): [number, number, number] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / Math.max(total - 1, 1)) * 2;
  const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = index * goldenAngle + phase;

  return [
    Math.cos(theta) * radiusAtY * sphereRadius,
    y * sphereRadius * 0.78,
    Math.sin(theta) * radiusAtY * sphereRadius,
  ];
}

function getCompactTitle(title: string) {
  return title
    .replace(" 与 ", "·")
    .replace(" 和 ", "·")
    .replace("TypeScript", "TS")
    .replace("JavaScript", "JS")
    .replace("Node.js", "Node")
    .replace("Next.js", "Next");
}

function createOrbitalEdges(nodes: GraphNode[], course: GraphNode["course"]) {
  const courseNodes = nodes.filter((node) => node.course === course);

  return courseNodes.slice(1).map((node, index) => ({
    id: `orbit-${course}-${index}`,
    source: courseNodes[index].position,
    target: node.position,
    active: node.completed || courseNodes[index].completed,
  }));
}

// 生成围绕中心核心的球形知识网络，供首页的独立知识星链使用。
function generateNetwork(
  nodejsStages: readonly CurriculumStage[],
  nextjsStages: readonly CurriculumStage[],
  nodejsCompleted: string[],
  nextjsCompleted: string[]
) {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const rootPos: [number, number, number] = [0, 0, 0];
  nodes.push({
    id: "root",
    title: "NodePath Core",
    summary: "你的学习起点",
    course: "core",
    position: rootPos,
    completed: true,
    featured: true,
  });

  const sphereRadius = 5.28;
  const nodejsTotal = nodejsStages.length;
  const nextjsTotal = nextjsStages.length;

  nodejsStages.forEach((stage, i) => {
    const [x, y, z] = calculateSpherePoint(i, nodejsTotal, sphereRadius, -0.72);
    const pos: [number, number, number] = [x - 0.46, y, z];
    const isCompleted = nodejsCompleted.includes(stage.id);

    nodes.push({
      id: stage.id,
      title: stage.title,
      summary: stage.summary,
      course: "nodejs",
      position: pos,
      completed: isCompleted,
      featured: i === 0 || isCompleted,
    });

    edges.push({
      id: `edge-node-${i}`,
      source: rootPos,
      target: pos,
      active: isCompleted,
    });
  });

  nextjsStages.forEach((stage, i) => {
    const [x, y, z] = calculateSpherePoint(i, nextjsTotal, sphereRadius * 0.92, 1.12);
    const pos: [number, number, number] = [x + 0.46, y, z];
    const isCompleted = nextjsCompleted.includes(stage.id);

    nodes.push({
      id: stage.id,
      title: stage.title,
      summary: stage.summary,
      course: "nextjs",
      position: pos,
      completed: isCompleted,
      featured: i === 0 || isCompleted,
    });

    edges.push({
      id: `edge-next-${i}`,
      source: rootPos,
      target: pos,
      active: isCompleted,
    });
  });

  edges.push(...createOrbitalEdges(nodes, "nodejs"));
  edges.push(...createOrbitalEdges(nodes, "nextjs"));

  return { nodes, edges };
}

function NodeMaterial({ color, hovered, completed }: { color: string; hovered: boolean; completed: boolean }) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      const t = clock.getElapsedTime();
      const pulse = Math.sin(t * 3) * 0.2 + 0.8;
      materialRef.current.emissiveIntensity = hovered ? 1.5 * pulse : completed ? 0.8 : 0.2;
    }
  });

  return (
    <meshStandardMaterial
      ref={materialRef}
      color={color}
      emissive={color}
      emissiveIntensity={0.5}
      transparent
      opacity={0.9}
      roughness={0.2}
      metalness={0.8}
    />
  );
}

function readProgressSignature() {
  const nodejsProgress = getBrowserProgressRepository("nodejs").load();
  const nextjsProgress = getBrowserProgressRepository("nextjs").load();

  return [
    nodejsProgress.completedLessonIds.join(","),
    nextjsProgress.completedLessonIds.join(",")
  ].join("|");
}

function NetworkScene() {
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const progressSignature = useSyncExternalStore(
    () => () => {},
    readProgressSignature,
    () => "|"
  );
  const { nodes, edges } = useMemo(() => {
    const [nodejsLessons = "", nextjsLessons = ""] = progressSignature.split("|");
    const nodejsCompletedLessonIds = nodejsLessons.split(",").filter(Boolean);
    const nextjsCompletedLessonIds = nextjsLessons.split(",").filter(Boolean);
    
    const nodejsCompletedStageIds = nodejsCurriculum
      .filter((stage) => stage.lessons.every((lesson) => nodejsCompletedLessonIds.includes(lesson.id)))
      .map((s) => s.id);
      
    const nextjsCompletedStageIds = nextjsCurriculum
      .filter((stage) => stage.lessons.every((lesson) => nextjsCompletedLessonIds.includes(lesson.id)))
      .map((s) => s.id);

    return generateNetwork(nodejsCurriculum, nextjsCurriculum, nodejsCompletedStageIds, nextjsCompletedStageIds);
  }, [progressSignature]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      groupRef.current.rotation.x = 0.15 + Math.sin(time * 0.16) * 0.08;
      groupRef.current.rotation.y = time * 0.14;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.05, -7.9]} rotation={[0.15, 0, 0]} scale={0.9}>
      <ambientLight intensity={0.55} />
      <pointLight position={[7, 6, 7]} intensity={1.2} color="#6ee7ff" />
      <pointLight position={[-7, -4, -6]} intensity={0.9} color="#9fe870" />

      <Sphere args={[6.38, 64, 64]}>
        <meshBasicMaterial color="#6ee7ff" transparent opacity={0.052} wireframe />
      </Sphere>
      <Sphere args={[2.36, 48, 48]}>
        <meshBasicMaterial color="#9fe870" transparent opacity={0.095} />
      </Sphere>

      {edges.map((edge) => (
        <Line
          key={edge.id}
          points={[edge.source, edge.target]}
          color={edge.active ? "#9fe870" : "#2a3b4c"}
          lineWidth={edge.active ? 2 : 1}
          transparent
          opacity={edge.active ? 0.72 : 0.32}
        />
      ))}

      {nodes.map((node) => {
        const isHovered = hoveredNode?.id === node.id;
        const color = node.course === "core" ? "#ffffff" : node.course === "nodejs" ? "#9fe870" : "#6ee7ff";
        const scale = node.course === "core" ? 0.96 : isHovered ? 1.28 : node.completed ? 1.08 : 0.94;
        const shouldShowLabel = node.featured || isHovered;

        return (
          <group key={node.id} position={node.position}>
            <Sphere
              args={[0.58, 48, 48]}
              scale={scale}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredNode(node);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredNode(null);
              }}
            >
              <NodeMaterial color={color} hovered={isHovered} completed={node.completed} />
            </Sphere>

            {shouldShowLabel && (
              <Html distanceFactor={10} center position={[0, 0, 0]}>
                <div
                  className={`knowledge-network__orb-text ${node.course === "nextjs" ? "nextjs" : "nodejs"} ${node.completed ? "completed" : ""}`}
                  style={{ "--node-color": color } as React.CSSProperties}
                >
                  {getCompactTitle(node.title)}
                </div>
              </Html>
            )}
            
            {isHovered && (
              <Html distanceFactor={14} center position={[0, 0.64, 0]}>
                <div
                  className="knowledge-network__tooltip"
                  style={{ "--node-color": color } as React.CSSProperties}
                >
                  <div className="knowledge-network__tooltip-kicker">
                    {node.course === "nodejs" ? "Node.js" : node.course === "nextjs" ? "Next.js" : "Core"}
                  </div>
                  <h3>{node.title}</h3>
                  <p>{node.summary}</p>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

export function KnowledgeNetwork() {
  return (
    <section className="knowledge-network-section" aria-label="知识点连接星链">
      <div className="knowledge-network__heading">
        <span>KNOWLEDGE LINKS</span>
        <strong>知识点连接星链</strong>
        <p>把路线节点沉到主标题下方，单独观察 Node.js 与 Next.js 的知识连接。</p>
      </div>
      <div className="knowledge-network__legend" aria-hidden="true">
        <span><i className="nodejs" /> Node.js 路线</span>
        <span><i className="nextjs" /> Next.js 路线</span>
      </div>
      <div className="knowledge-network-canvas">
        <Canvas camera={{ position: [0, 1.1, 9.5], fov: 52 }} gl={{ alpha: true, antialias: true }}>
          <NetworkScene />
        </Canvas>
      </div>
    </section>
  );
}
