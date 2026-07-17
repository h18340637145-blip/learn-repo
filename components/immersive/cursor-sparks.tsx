"use client";

import { useEffect, useRef } from "react";

type CursorSpark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
};

const sparkColors = ["#6ee7ff", "#9fe870", "#7c5cff", "#ff6bcb"];

export function CursorSparks() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context || reduceMotion) {
      return;
    }

    const activeCanvas = canvas;
    const activeContext = context;
    const sparks: CursorSpark[] = [];
    let animationFrame = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;

    function resize() {
      width = activeCanvas.width = window.innerWidth;
      height = activeCanvas.height = window.innerHeight;
    }

    function addSpark(event: MouseEvent) {
      const count = Math.random() > 0.58 ? 2 : 1;

      for (let index = 0; index < count; index += 1) {
        sparks.push({
          x: event.clientX,
          y: event.clientY,
          vx: (Math.random() - 0.5) * 1.8,
          vy: (Math.random() - 0.72) * 1.6,
          size: 0.9 + Math.random() * 2,
          alpha: 0.9,
          decay: 0.018 + Math.random() * 0.026,
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)]!
        });
      }

      if (sparks.length > 96) {
        sparks.splice(0, sparks.length - 96);
      }
    }

    function draw() {
      activeContext.clearRect(0, 0, width, height);

      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const spark = sparks[index]!;
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.alpha -= spark.decay;

        if (spark.alpha <= 0) {
          sparks.splice(index, 1);
          continue;
        }

        activeContext.globalAlpha = spark.alpha;
        activeContext.shadowBlur = 12;
        activeContext.shadowColor = spark.color;
        activeContext.fillStyle = spark.color;
        activeContext.beginPath();
        activeContext.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        activeContext.fill();
      }

      activeContext.globalAlpha = 1;
      activeContext.shadowBlur = 0;
      animationFrame = window.requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", addSpark);
    draw();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", addSpark);
    };
  }, []);

  return <canvas aria-hidden="true" className="cursor-sparks" ref={canvasRef} />;
}
