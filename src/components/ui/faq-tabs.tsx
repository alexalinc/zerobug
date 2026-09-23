"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqCategories = Record<string, string>;
export type FaqData = Record<string, FaqItem[]>;

type FAQProps = React.ComponentProps<"section"> & {
  title?: string;
  subtitle?: string;
  categories: FaqCategories;
  faqData: FaqData;
};

export function FAQ({
  title = "Întrebări frecvente",
  subtitle = "FAQ",
  categories,
  faqData,
  className,
  ...props
}: FAQProps) {
  const categoryKeys = Object.keys(categories);
  const [selectedCategory, setSelectedCategory] = useState(
    categoryKeys[0] ?? "",
  );

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-zinc-950 px-4 py-20 text-white md:py-28",
        className,
      )}
      {...props}
    >
      <FAQHeader title={title} subtitle={subtitle} />
      <FAQTabs
        categories={categories}
        selected={selectedCategory}
        setSelected={setSelectedCategory}
      />
      <FAQList faqData={faqData} selected={selectedCategory} />
    </section>
  );
}

function FAQHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center text-center">
      <span className="mb-4 text-sm font-medium tracking-wide text-[color:var(--brand)]">
        {subtitle}
      </span>
      <h2 className="mb-8 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h2>
      <span className="pointer-events-none absolute -top-[280px] left-1/2 z-0 h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.12),transparent_65%)] blur-2xl" />
    </div>
  );
}

function FAQTabs({
  categories,
  selected,
  setSelected,
}: {
  categories: FaqCategories;
  selected: string;
  setSelected: (key: string) => void;
}) {
  return (
    <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {Object.entries(categories).map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => setSelected(key)}
          className={cn(
            "relative overflow-hidden whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-300",
            selected === key
              ? "border-[color:var(--brand)] text-zinc-950"
              : "border-white/15 bg-transparent text-zinc-400 hover:border-white/25 hover:text-white",
          )}
        >
          <span className="relative z-10">{label}</span>
          <AnimatePresence>
            {selected === key ? (
              <motion.span
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 z-0 bg-[color:var(--brand)]"
              />
            ) : null}
          </AnimatePresence>
        </button>
      ))}
    </div>
  );
}

function FAQList({
  faqData,
  selected,
}: {
  faqData: FaqData;
  selected: string;
}) {
  return (
    <div className="relative z-10 mx-auto mt-12 max-w-3xl">
      <AnimatePresence mode="wait">
        {Object.entries(faqData).map(([category, questions]) => {
          if (selected !== category) return null;
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-3"
            >
              {questions.map((faq) => (
                <FAQItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function FAQItem({ question, answer }: FaqItem) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      animate={isOpen ? "open" : "closed"}
      className={cn(
        "rounded-2xl border transition-colors",
        isOpen
          ? "border-white/15 bg-white/[0.04]"
          : "border-white/10 bg-zinc-900/40",
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
      >
        <span
          className={cn(
            "text-base font-medium transition-colors sm:text-lg",
            isOpen ? "text-white" : "text-zinc-300",
          )}
        >
          {question}
        </span>
        <motion.span
          variants={{
            open: { rotate: "45deg" },
            closed: { rotate: "0deg" },
          }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <Plus
            className={cn(
              "h-5 w-5 transition-colors",
              isOpen ? "text-[color:var(--brand)]" : "text-zinc-500",
            )}
          />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : "0px",
          marginBottom: isOpen ? 16 : 0,
        }}
        transition={{ duration: 0.28, ease: "easeInOut" }}
        className="overflow-hidden px-4 sm:px-5"
      >
        <p className="pb-1 text-sm leading-relaxed text-zinc-400 sm:text-base">
          {answer}
        </p>
      </motion.div>
    </motion.div>
  );
}
