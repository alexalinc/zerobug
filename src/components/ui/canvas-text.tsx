"use client";

import { useEffect, useRef } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Canvas text reveal — inspired by Aceternity canvas-text demo.
 * Draws headline glyphs with a sweeping reveal when in view.
 */
export function CanvasText({
  text,
  className,
  color = "#fafafa",
  accent = "#22c55e",
}: {
  text: string;
  className?: string;
  color?: string;
  accent?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: "-12% 0px" });

  useEffect(() => {
    if (!inView) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let start: number | null = null;
    const duration = 1400;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = wrap.clientWidth;
      const height = Math.max(wrap.clientHeight, 64);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (progress: number) => {
      const width = wrap.clientWidth;
      const height = Math.max(wrap.clientHeight, 64);
      ctx.clearRect(0, 0, width, height);

      const fontSize = Math.min(48, Math.max(28, width / 18));
      ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";

      const metrics = ctx.measureText(text);
      const x = 0;
      const y = height / 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width * progress, height);
      ctx.clip();

      const grad = ctx.createLinearGradient(0, 0, metrics.width, 0);
      grad.addColorStop(0, color);
      grad.addColorStop(0.72, color);
      grad.addColorStop(1, accent);
      ctx.fillStyle = grad;
      ctx.fillText(text, x, y);
      ctx.restore();

      // soft leading edge
      if (progress < 1) {
        const edge = width * progress;
        const edgeGrad = ctx.createLinearGradient(edge - 24, 0, edge + 8, 0);
        edgeGrad.addColorStop(0, "rgba(34,197,94,0)");
        edgeGrad.addColorStop(0.5, "rgba(34,197,94,0.35)");
        edgeGrad.addColorStop(1, "rgba(34,197,94,0)");
        ctx.fillStyle = edgeGrad;
        ctx.fillRect(edge - 24, 0, 40, height);
      }
    };

    const tick = (t: number) => {
      if (start == null) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      draw(eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    resize();
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      resize();
      draw(1);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [accent, color, inView, text]);

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)}>
      <span className="invisible block text-3xl font-semibold tracking-tight md:text-5xl">
        {text}
      </span>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        aria-hidden
      />
      <span className="sr-only">{text}</span>
    </div>
  );
}
