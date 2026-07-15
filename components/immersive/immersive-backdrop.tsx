"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

import { getBackdropIntensity, type LearningVisualStatus } from "@/lib/immersive/visual-state";

type ImmersiveBackdropProps = {
  status: LearningVisualStatus;
  progressPercent: number;
};

export function ImmersiveBackdrop({ status, progressPercent }: ImmersiveBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intensity = getBackdropIntensity(status, reduceMotion);
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || intensity === 0) return;

    const activeCanvas = canvas;
    const activeContext = context;
    let animationFrame = 0;
    let tick = 0;
    const particles = Array.from({ length: Math.min(90, Math.max(32, Math.round(window.innerWidth / 18))) }, (_, index) => ({
      x: (index * 97) % window.innerWidth,
      y: (index * 53) % window.innerHeight,
      speed: 0.18 + (index % 7) * 0.035,
      size: 0.8 + (index % 5) * 0.22
    }));

    function resize() {
      activeCanvas.width = window.innerWidth;
      activeCanvas.height = window.innerHeight;
    }

    function draw() {
      tick += 1;
      activeContext.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
      activeContext.fillStyle = `rgba(159, 232, 112, ${0.18 * intensity})`;
      for (const particle of particles) {
        particle.y = (particle.y + particle.speed * intensity) % activeCanvas.height;
        const drift = Math.sin((tick + particle.x) / 90) * 8 * intensity;
        activeContext.beginPath();
        activeContext.arc(particle.x + drift, particle.y, particle.size, 0, Math.PI * 2);
        activeContext.fill();
      }
      animationFrame = window.requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, [status]);

  return (
    <div className={`space-backdrop ${status}`} aria-hidden="true" style={{ "--learning-energy": `${progressPercent}%` } as CSSProperties}>
      <canvas className="space-canvas" ref={canvasRef} />
      <span className="space-nebula space-nebula--green" />
      <span className="space-nebula space-nebula--violet" />
      <span className="cockpit-grid" />
    </div>
  );
}
