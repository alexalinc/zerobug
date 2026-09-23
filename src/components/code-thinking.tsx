"use client";

import type { ReactNode } from "react";
import { Compare } from "@/components/ui/compare";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

function CodePanel({
  label,
  file,
  tone,
  lines,
}: {
  label: string;
  file: string;
  tone: "before" | "after";
  lines: { n: number; code: ReactNode }[];
}) {
  const labelColor =
    tone === "before" ? "text-rose-300/90" : "text-[color:var(--brand)]";
  const badgeBg =
    tone === "before"
      ? "bg-rose-500/15 ring-rose-400/20"
      : "bg-[color:var(--brand)]/15 ring-[color:var(--brand)]/25";

  return (
    <div className="flex h-full w-full flex-col bg-[#0b0d10]">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="truncate font-mono text-xs text-zinc-400">{file}</span>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ring-1 ${badgeBg} ${labelColor}`}
        >
          {label}
        </span>
      </div>
      <div className="flex-1 overflow-hidden px-2 py-4 font-mono text-[11px] leading-6 sm:text-xs sm:leading-7 md:text-[13px]">
        {lines.map((line) => (
          <div key={line.n} className="flex gap-3 px-2 hover:bg-white/[0.03]">
            <span className="w-6 shrink-0 select-none text-right text-zinc-600">
              {line.n}
            </span>
            <span className="min-w-0 whitespace-pre text-zinc-300">{line.code}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const kw = (t: string) => <span className="text-violet-300">{t}</span>;
const ty = (t: string) => <span className="text-sky-300">{t}</span>;
const str = (t: string) => <span className="text-emerald-300">{t}</span>;
const cm = (t: string) => <span className="text-zinc-500 italic">{t}</span>;
const fn = (t: string) => <span className="text-amber-200">{t}</span>;
const err = (t: string) => <span className="text-rose-300">{t}</span>;

const BEFORE_LINES = [
  {
    n: 1,
    code: <>{cm("// „merge and hope” — livrare de ieri pe noapte")}</>,
  },
  {
    n: 2,
    code: (
      <>
        {kw("function")} {fn("checkout")}(user, cart) {"{"}
      </>
    ),
  },
  {
    n: 3,
    code: (
      <>
        {"  "}
        {kw("var")} total = cart.items.{fn("reduce")}((a, i) {"=>"} a + i.price, 0)
      </>
    ),
  },
  {
    n: 4,
    code: (
      <>
        {"  "}
        {fn("fetch")}({str("'/api/pay'")}, {"{"}
      </>
    ),
  },
  {
    n: 5,
    code: (
      <>
        {"    "}body: {fn("JSON.stringify")}({"{"} user, total {"}"})
      </>
    ),
  },
  {
    n: 6,
    code: <>{"  })"}</>,
  },
  {
    n: 7,
    code: (
      <>
        {"  "}
        {err("// TODO: validare stoc, TVA, retry — mâine")}
      </>
    ),
  },
  {
    n: 8,
    code: <>{"}"}</>,
  },
  { n: 9, code: <>&nbsp;</> },
  {
    n: 10,
    code: <>{cm("// bug-uri în producție, fără tipuri, fără teste")}</>,
  },
];

const AFTER_LINES = [
  {
    n: 1,
    code: <>{cm("// tipizat, testat, observabil — gata de producție")}</>,
  },
  {
    n: 2,
    code: (
      <>
        {kw("async function")} {fn("checkout")}(
      </>
    ),
  },
  {
    n: 3,
    code: (
      <>
        {"  "}order: {ty("Order")}
      </>
    ),
  },
  {
    n: 4,
    code: (
      <>
        ): {ty("Promise")}
        {"<"}
        {ty("PaymentResult")}
        {">"} {"{"}
      </>
    ),
  },
  {
    n: 5,
    code: (
      <>
        {"  "}
        {kw("const")} total = {fn("calculateTotal")}(order.items);
      </>
    ),
  },
  {
    n: 6,
    code: (
      <>
        {"  "}
        {kw("await")} {fn("assertInventory")}(order.items);
      </>
    ),
  },
  {
    n: 7,
    code: (
      <>
        {"  "}
        {kw("return")} {fn("charge")}(order.customerId, total);
      </>
    ),
  },
  {
    n: 8,
    code: <>{"}"}</>,
  },
  { n: 9, code: <>&nbsp;</> },
  {
    n: 10,
    code: <>{cm("// logging, retry, tipuri — ZeroBug standard")}</>,
  },
];

export function CodeThinking() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 py-20 text-white md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.08),_transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-wide text-[color:var(--brand)]">
            Cum gândim codul
          </p>
          <TextGenerateEffect
            as="h2"
            words="Nu livrăm patch-uri — livrăm sisteme"
            className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl"
            duration={0.35}
          />
          <TextGenerateEffect
            words="Trage slider-ul: de la „merge and hope” la tipuri, teste și fluxuri care țin în producție — OpenAI, Claude, Stripe, Woo, Next."
            className="mx-auto mt-4 text-zinc-400"
            duration={0.3}
          />
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-white/10 bg-zinc-900/50 p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] md:p-3">
          <div className="mb-2 flex items-center justify-between px-2 text-[11px] uppercase tracking-wider text-zinc-500 sm:text-xs">
            <span>Abordare tipică</span>
            <span className="text-[color:var(--brand)]">ZeroBug</span>
          </div>
          <Compare
            slideMode="drag"
            className="h-[320px] w-full rounded-2xl border border-white/10 md:h-[420px]"
            firstContent={
              <CodePanel
                label="Fragile"
                file="checkout.js"
                tone="before"
                lines={BEFORE_LINES}
              />
            }
            secondContent={
              <CodePanel
                label="Production"
                file="checkout.ts"
                tone="after"
                lines={AFTER_LINES}
              />
            }
            showHandlebar
            initialSliderPercentage={48}
          />
          <p className="mt-3 px-2 text-center text-xs text-zinc-500">
            Glisează pentru a compara — hover pe desktop, drag pe mobile.
          </p>
        </div>
      </div>
    </section>
  );
}
