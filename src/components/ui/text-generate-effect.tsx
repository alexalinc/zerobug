"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate, useInView } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.45,
  as: Tag = "p",
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  as?: "p" | "h1" | "h2" | "h3" | "span" | "div";
}) {
  const containerRef = useRef<HTMLElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-10% 0px" });
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    if (!inView) return;
    void animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration,
        delay: stagger(0.08),
      },
    );
  }, [animate, duration, filter, inView]);

  return (
    <Tag ref={containerRef as never} className={cn(className)}>
      <motion.span ref={scope} className="inline">
        {wordsArray.map((word, idx) => (
          <motion.span
            key={`${word}-${idx}`}
            className="inline opacity-0"
            style={{ filter: filter ? "blur(8px)" : "none" }}
          >
            {word}{" "}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
