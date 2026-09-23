"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

type Stat = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  description: string;
};

const STATS: Stat[] = [
  {
    value: 5,
    suffix: "+",
    label: "Ani experiență",
    description:
      "Peste 5 ani în care am construit, migrat și optimizat produse digitale pentru firme din RO.",
  },
  {
    value: 50,
    suffix: "+",
    label: "Clienți mulțumiți",
    description:
      "Startup-uri și companii care revin pentru dezvoltare, mentenanță și automatizări.",
  },
  {
    value: 120,
    suffix: "+",
    label: "Proiecte livrate",
    description:
      "Website-uri, magazine, API-uri, aplicații mobile și integrări AI (OpenAI & Claude) puse în producție.",
  },
  {
    value: 99,
    suffix: "%",
    label: "Uptime mentenanță",
    description:
      "Monitorizare, backup și răspuns rapid — ca site-ul tău să rămână online când contează.",
  },
];

function AnimatedNumber({
  value,
  suffix = "",
  prefix = "",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    mass: 0.8,
    stiffness: 75,
    damping: 20,
  });
  const display = useTransform(spring, (latest) =>
    Math.round(latest).toLocaleString("ro-RO"),
  );

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${v}${suffix}`;
      }
    });
    return unsubscribe;
  }, [display, prefix, suffix]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}0{suffix}
    </span>
  );
}

export function StatsTicker() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-zinc-950 text-white py-20 md:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.1),_transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-[color:var(--brand)]">
            ZeroBug în cifre
          </p>
          <TextGenerateEffect
            as="h2"
            words="De încredere pentru echipe care vor rezultate"
            className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight"
            duration={0.35}
          />
          <TextGenerateEffect
            words="Experiență reală pe web, e-commerce, tracking și AI (OpenAI & Claude) — nu slide-uri, ci livrabile care rulează în producție."
            className="mt-4 text-zinc-400 leading-relaxed"
            duration={0.3}
          />
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.article
              key={stat.label}
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={
                inView
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : undefined
              }
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-900/50 p-6 md:p-7"
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
              <p className="relative text-4xl md:text-5xl font-semibold tracking-tight text-white">
                <AnimatedNumber
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                />
              </p>
              <h3 className="relative mt-3 text-base font-medium text-[color:var(--brand-soft)]">
                {stat.label}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-zinc-400">
                {stat.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
