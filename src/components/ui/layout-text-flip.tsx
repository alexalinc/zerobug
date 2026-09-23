"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export function LayoutTextFlip({
  text,
  words,
  className,
  wordClassName,
  intervalMs = 2600,
}: {
  text: string;
  words: string[];
  className?: string;
  wordClassName?: string;
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, words.length]);

  const current = words[index] ?? words[0] ?? "";

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      <span>{text}</span>
      <span className="relative inline-grid overflow-hidden align-baseline">
        <span className="invisible whitespace-nowrap" aria-hidden>
          {words.reduce((a, b) => (a.length >= b.length ? a : b), "")}
        </span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={current}
            initial={{ y: "100%", opacity: 0, filter: "blur(6px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-100%", opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute inset-0 whitespace-nowrap text-[color:var(--brand)]",
              wordClassName,
            )}
          >
            {current}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
