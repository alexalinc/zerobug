"use client";

import type { HTMLMotionProps, Variants } from "motion/react";
import { motion, useInView } from "motion/react";
import type React from "react";
import type { RefObject } from "react";

type TimelineContentProps<T extends keyof HTMLElementTagNameMap = "div"> = {
  children?: React.ReactNode;
  animationNum: number;
  className?: string;
  timelineRef: RefObject<HTMLElement | null>;
  as?: T;
  customVariants?: Variants;
  once?: boolean;
} & Omit<HTMLMotionProps<T>, "ref" | "children" | "as">;

export function TimelineContent<T extends keyof HTMLElementTagNameMap = "div">({
  children,
  animationNum,
  timelineRef,
  className,
  as,
  customVariants,
  once = true,
  ...props
}: TimelineContentProps<T>) {
  const defaultSequenceVariants: Variants = {
    visible: (i: number) => ({
      filter: "blur(0px)",
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.5,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(20px)",
      y: 0,
      opacity: 0,
    },
  };

  const sequenceVariants = customVariants || defaultSequenceVariants;
  const isInView = useInView(timelineRef, { once, amount: 0.2 });
  const MotionComponent = motion[
    (as || "div") as keyof typeof motion
  ] as React.ElementType;

  return (
    <MotionComponent
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={animationNum}
      variants={sequenceVariants}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
