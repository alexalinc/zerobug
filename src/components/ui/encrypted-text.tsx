"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/utils";

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

export function EncryptedText({
  text,
  className,
  as: Tag = "span",
  speed = 28,
}: {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  speed?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!inView) return;

    let frame = 0;
    const total = text.length;
    const id = window.setInterval(() => {
      frame += 1;
      const revealCount = Math.min(total, Math.floor(frame / 1.6));

      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < revealCount) return text[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)] ?? char;
          })
          .join(""),
      );

      if (revealCount >= total) {
        window.clearInterval(id);
        setDisplay(text);
      }
    }, speed);

    return () => window.clearInterval(id);
  }, [inView, speed, text]);

  return (
    <Tag ref={ref as never} className={cn("font-mono tracking-tight", className)}>
      {display}
    </Tag>
  );
}
