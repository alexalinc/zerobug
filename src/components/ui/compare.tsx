"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompareProps {
  firstImage?: string;
  secondImage?: string;
  firstContent?: ReactNode;
  secondContent?: ReactNode;
  className?: string;
  firstImageClassName?: string;
  secondImageClassname?: string;
  initialSliderPercentage?: number;
  slideMode?: "hover" | "drag";
  showHandlebar?: boolean;
  autoplay?: boolean;
  autoplayDuration?: number;
}

export function Compare({
  firstImage = "",
  secondImage = "",
  firstContent,
  secondContent,
  className,
  firstImageClassName,
  secondImageClassname,
  initialSliderPercentage = 50,
  slideMode = "hover",
  showHandlebar = true,
  autoplay = false,
  autoplayDuration = 5000,
}: CompareProps) {
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = useCallback(() => {
    if (!autoplay) return;
    autoplayRef.current = setInterval(() => {
      setSliderXPercent((prev) => {
        if (prev >= 100) return 0;
        return prev + 0.5;
      });
    }, autoplayDuration / 200);
  }, [autoplay, autoplayDuration]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  function mouseEnterHandler() {
    setIsMouseOver(true);
    stopAutoplay();
  }

  function mouseLeaveHandler() {
    setIsMouseOver(false);
    if (slideMode === "hover") setSliderXPercent(initialSliderPercentage);
    if (slideMode === "drag") setIsDragging(false);
    startAutoplay();
  }

  const handleStart = useCallback(
    (_clientX: number) => {
      if (slideMode === "drag") setIsDragging(true);
    },
    [slideMode],
  );

  const handleEnd = useCallback(() => {
    if (slideMode === "drag") setIsDragging(false);
  }, [slideMode]);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;
      if (slideMode === "hover" || (slideMode === "drag" && isDragging)) {
        const rect = sliderRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = (x / rect.width) * 100;
        requestAnimationFrame(() => {
          setSliderXPercent(Math.max(0, Math.min(100, percent)));
        });
      }
    },
    [slideMode, isDragging],
  );

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent) => handleStart(e.clientX),
    [handleStart],
  );
  const handleMouseUp = useCallback(() => handleEnd(), [handleEnd]);
  const handleMouseMove = useCallback(
    (e: ReactMouseEvent) => handleMove(e.clientX),
    [handleMove],
  );

  const handleTouchStart = useCallback(
    (e: ReactTouchEvent) => {
      if (!autoplay) handleStart(e.touches[0]?.clientX ?? 0);
    },
    [handleStart, autoplay],
  );
  const handleTouchEnd = useCallback(() => {
    if (!autoplay) handleEnd();
  }, [handleEnd, autoplay]);
  const handleTouchMove = useCallback(
    (e: ReactTouchEvent) => {
      if (!autoplay) handleMove(e.touches[0]?.clientX ?? 0);
    },
    [handleMove, autoplay],
  );

  return (
    <div
      ref={sliderRef}
      className={cn("h-[400px] w-full overflow-hidden", className)}
      style={{
        position: "relative",
        cursor: slideMode === "drag" ? (isDragging ? "grabbing" : "grab") : "col-resize",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={mouseLeaveHandler}
      onMouseEnter={mouseEnterHandler}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <AnimatePresence initial={false}>
        <motion.div
          className="absolute top-0 z-40 m-auto h-full w-px bg-gradient-to-b from-transparent from-[5%] via-[color:var(--brand)] to-transparent to-[95%]"
          style={{ left: `${sliderXPercent}%`, top: 0, zIndex: 40 }}
          transition={{ duration: 0 }}
        >
          <div className="absolute left-1/2 top-1/2 z-30 flex h-full w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center [perspective:800px] [transform-style:preserve-3d]">
            <div
              className={cn(
                "pointer-events-none absolute left-1/2 top-1/2 z-50 h-[80%] w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-50",
                isMouseOver || isDragging ? "opacity-80" : "opacity-40",
              )}
              style={{
                background:
                  "radial-gradient(circle at center, color-mix(in oklab, var(--brand) 45%, transparent), transparent 70%)",
              }}
            />
          </div>
          {showHandlebar ? (
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]">
              <GripVertical className="h-4 w-4 text-[color:var(--brand)]" />
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <motion.div
          className={cn(
            "absolute inset-0 z-20 h-full w-full shrink-0 overflow-hidden rounded-[inherit] select-none",
            firstImageClassName,
          )}
          style={{ clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)` }}
          transition={{ duration: 0 }}
        >
          {firstContent ? (
            <div className="absolute inset-0 h-full w-full">{firstContent}</div>
          ) : firstImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="first"
              src={firstImage}
              className={cn(
                "absolute inset-0 z-20 h-full w-full rounded-[inherit] object-cover select-none",
                firstImageClassName,
              )}
              draggable={false}
            />
          ) : null}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[19] overflow-hidden rounded-[inherit]">
        {secondContent ? (
          <div className="absolute inset-0 h-full w-full">{secondContent}</div>
        ) : secondImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="second"
            src={secondImage}
            className={cn(
              "absolute inset-0 z-[19] h-full w-full rounded-[inherit] object-cover select-none",
              secondImageClassname,
            )}
            draggable={false}
          />
        ) : null}
      </div>
    </div>
  );
}
