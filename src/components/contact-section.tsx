"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { Mail, Phone, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MeshGradientShader } from "@/components/ui/mesh-gradient-shader";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { cn } from "@/lib/utils";
import { getAdsClickIdsForLead } from "@/lib/gclid";

const TESTIMONIALS = [
  {
    quote:
      "ZeroBug ne-a refăcut magazinul WooCommerce și tracking-ul Google Ads. În 6 săptămâni vedeam clar POAS, nu doar ROAS.",
    name: "Andrei",
    role: "magazin online · retail",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Integrarea cu curierul și sync-ul de stocuri ne-a redus timpul pe operațiuni cu aproape jumătate.",
    name: "Elena",
    role: "operațiuni · e-commerce",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Mentenanța lunară e predictibilă — update-uri, backup, și cineva care răspunde când e urgent.",
    name: "Ioana",
    role: "marketing · brand",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
  },
];

function messageFromSearchParams(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  const serviciu = params.get("serviciu")?.trim();
  const categorie = params.get("categorie")?.trim();
  const oras = params.get("oras")?.trim();
  if (!serviciu && !categorie && !oras) return "";
  const parts = [
    serviciu ? `Serviciu: ${serviciu}` : null,
    categorie ? `Categorie: ${categorie}` : null,
    oras ? `Oraș: ${oras}` : null,
    "",
    "Detalii proiect:",
  ].filter((p): p is string => p !== null);
  return parts.join("\n");
}

export function ContactSection() {
  const createLead = useMutation(api.leads.create);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [prefillMessage, setPrefillMessage] = useState("");

  useEffect(() => {
    setPrefillMessage(messageFromSearchParams());
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    const fd = new FormData(e.currentTarget);
    try {
      const adsIds = getAdsClickIdsForLead();
      await createLead({
        type: "contact",
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        company: String(fd.get("company") || "") || undefined,
        message: String(fd.get("message") || "") || undefined,
        ...adsIds,
      });
      setStatus("ok");
      e.currentTarget.reset();
    } catch {
      setStatus("err");
    } finally {
      setLoading(false);
    }
  }

  const current = TESTIMONIALS[active]!;

  return (
    <section className="relative min-h-[calc(100vh-6rem)] bg-zinc-950 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl lg:grid-cols-2">
        {/* Shader + testimonials */}
        <div className="relative order-2 min-h-[420px] overflow-hidden lg:order-1 lg:min-h-full">
          <div className="absolute inset-3 overflow-hidden rounded-[2rem] md:inset-4 lg:inset-6">
            <MeshGradientShader />
            <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.35%22/></svg>')] opacity-30 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-10">
              <div className="relative w-full max-w-md">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.name}
                    initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
                    transition={{ duration: 0.45 }}
                    className="rounded-3xl border border-white/15 bg-black/35 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
                  >
                    <Quote className="h-8 w-8 text-white/40" />
                    <p className="mt-4 text-base leading-relaxed text-white sm:text-lg">
                      {current.quote}
                    </p>
                    <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                      <Image
                        src={current.image}
                        alt={current.name}
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full object-cover ring-1 ring-white/20"
                        unoptimized
                      />
                      <div>
                        <p className="font-semibold text-white">{current.name}</p>
                        <p className="text-sm text-white/55">{current.role}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-6 flex justify-center gap-2">
                  {TESTIMONIALS.map((t, i) => (
                    <button
                      key={t.name}
                      type="button"
                      aria-label={`Testimonial ${i + 1}`}
                      onClick={() => setActive(i)}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        i === active
                          ? "w-6 bg-white"
                          : "w-1.5 bg-white/35 hover:bg-white/55",
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-3 text-xs text-white/70 sm:bottom-8 sm:left-8 sm:right-8">
                <a
                  href="mailto:contact@zerobug.ro"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur-md hover:bg-black/40"
                >
                  <Mail className="h-3.5 w-3.5" />
                  contact@zerobug.ro
                </a>
                <a
                  href="tel:0773319554"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur-md hover:bg-black/40"
                >
                  <Phone className="h-3.5 w-3.5" />
                  0773 319 554
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="order-1 flex items-center px-6 py-12 sm:px-10 lg:order-2 lg:py-16 xl:px-16">
          <div className="mx-auto w-full max-w-md">
            <TextGenerateEffect
              as="h1"
              words="Contactează-ne"
              className="text-4xl font-semibold tracking-tight text-white md:text-5xl"
              duration={0.4}
            />
            <TextGenerateEffect
              words="Scrie-ne și revenim rapid — de obicei în aceeași zi lucrătoare."
              className="mt-3 text-zinc-400 leading-relaxed"
              duration={0.3}
            />

            <form onSubmit={onSubmit} className="mt-10 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-400">
                  Nume complet
                </Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Numele tău"
                  className="h-12 rounded-xl border-white/10 bg-zinc-900/80 text-white placeholder:text-zinc-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-400">
                  Adresă email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="email@firma.ro"
                  className="h-12 rounded-xl border-white/10 bg-zinc-900/80 text-white placeholder:text-zinc-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-zinc-400">
                  Firmă
                </Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Denumire firmă (opțional)"
                  className="h-12 rounded-xl border-white/10 bg-zinc-900/80 text-white placeholder:text-zinc-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-zinc-400">
                  Mesaj
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  defaultValue={prefillMessage}
                  key={prefillMessage || "empty"}
                  placeholder="Cum te putem ajuta?"
                  className="resize-none rounded-xl border-white/10 bg-zinc-900/80 text-white placeholder:text-zinc-600"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-2 h-12 w-full rounded-full bg-white text-zinc-950 hover:bg-zinc-200 font-semibold"
              >
                {loading ? "Se trimite..." : "Trimite"}
              </Button>

              {status === "ok" && (
                <p className="text-sm text-emerald-400">
                  Mulțumim! Mesajul a fost trimis către echipa ZeroBug.
                </p>
              )}
              {status === "err" && (
                <p className="text-sm text-red-400">
                  Eroare la trimitere. Încearcă din nou sau scrie la
                  contact@zerobug.ro.
                </p>
              )}
            </form>

            <p className="mt-8 text-xs leading-relaxed text-zinc-600">
              SC AXP GLOBAL RETAIL SRL · CUI RO48715417 · Str. Principala nr.
              1290
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
