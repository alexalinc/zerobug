"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef } from "react";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80";

export default function AboutSection3() {
  const heroRef = useRef<HTMLDivElement>(null);
  const clipId = useId().replace(/:/g, "");

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const scaleVariants = {
    visible: (i: number) => ({
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      opacity: 0,
    },
  };

  return (
    <section className="bg-[#f9f9f9] px-4 py-8" ref={heroRef}>
      <div className="mx-auto max-w-6xl">
        <div className="relative">
          <div className="absolute -top-3 z-10 flex w-[85%] items-center justify-between sm:-top-2 md:top-0 lg:top-4">
            <div className="flex items-center gap-2 text-xl">
              <span className="animate-spin text-[color:var(--brand-deep)]">
                ✱
              </span>
              <TimelineContent
                as="span"
                animationNum={0}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-sm font-medium text-gray-600"
              >
                CINE SUNTEM
              </TimelineContent>
            </div>
            <div className="flex items-center gap-3">
              <TimelineContent
                as="div"
                animationNum={0}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="hidden items-center gap-2 sm:flex"
              >
                <Image
                  src="/images/logozerobug.png"
                  alt="ZeroBug"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200"
                  unoptimized
                />
              </TimelineContent>
              <div className="flex gap-4">
                <TimelineContent
                  as="a"
                  animationNum={0}
                  timelineRef={heroRef}
                  customVariants={revealVariants}
                  href="mailto:contact@zerobug.ro"
                  className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-gray-100 sm:h-6 sm:w-6 md:h-8 md:w-8"
                  aria-label="Email ZeroBug"
                >
                  <Mail className="h-3.5 w-3.5 text-gray-700 md:h-4 md:w-4" />
                </TimelineContent>
                <TimelineContent
                  as="a"
                  animationNum={1}
                  timelineRef={heroRef}
                  customVariants={revealVariants}
                  href="tel:0773319554"
                  className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-gray-100 sm:h-6 sm:w-6 md:h-8 md:w-8"
                  aria-label="Telefon ZeroBug"
                >
                  <Phone className="h-3.5 w-3.5 text-gray-700 md:h-4 md:w-4" />
                </TimelineContent>
              </div>
            </div>
          </div>

          <TimelineContent
            as="figure"
            animationNum={4}
            timelineRef={heroRef}
            customVariants={scaleVariants}
            className="group relative"
          >
            <svg className="w-full" width="100%" height="100%" viewBox="0 0 100 40">
              <defs>
                <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                  <path
                    d="M0.0998072 1H0.422076H0.749756C0.767072 1 0.774207 0.961783 0.77561 0.942675V0.807325C0.777053 0.743631 0.791844 0.731953 0.799059 0.734076H0.969813C0.996268 0.730255 1.00088 0.693206 0.999875 0.675159V0.0700637C0.999875 0.0254777 0.985045 0.00477707 0.977629 0H0.902473C0.854975 0 0.890448 0.138535 0.850165 0.138535H0.0204424C0.00408849 0.142357 0 0.180467 0 0.199045V0.410828C0 0.449045 0.0136283 0.46603 0.0204424 0.469745H0.0523086C0.0696245 0.471019 0.0735527 0.497877 0.0733523 0.511146V0.915605C0.0723903 0.983121 0.090588 1 0.0998072 1Z"
                    fill="#D9D9D9"
                  />
                </clipPath>
              </defs>
              <image
                clipPath={`url(#${clipId})`}
                preserveAspectRatio="xMidYMid slice"
                width="100%"
                height="100%"
                href={HERO_IMAGE}
              />
            </svg>
          </TimelineContent>

          <div className="flex flex-wrap items-center justify-between py-3 text-sm lg:justify-start">
            <TimelineContent
              as="div"
              animationNum={5}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="flex gap-4"
            >
              <div className="mb-2 flex items-center gap-2 text-xs sm:text-base">
                <span className="font-bold text-[color:var(--brand-deep)]">
                  5+
                </span>
                <span className="text-gray-600">ani de experiență</span>
                <span className="text-gray-300">|</span>
              </div>
              <div className="mb-2 flex items-center gap-2 text-xs sm:text-base">
                <span className="font-bold text-[color:var(--brand-deep)]">
                  120+
                </span>
                <span className="text-gray-600">proiecte livrate</span>
              </div>
            </TimelineContent>
            <div className="bottom-16 right-0 flex flex-row-reverse gap-4 lg:absolute lg:flex-col lg:gap-0">
              <TimelineContent
                as="div"
                animationNum={6}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="mb-2 flex items-center gap-2 text-2xl sm:text-3xl lg:text-4xl"
              >
                <span className="font-semibold text-[color:var(--brand-deep)]">
                  50+
                </span>
                <span className="uppercase text-gray-600">clienți</span>
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={7}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="mb-2 flex items-center gap-2 text-xs sm:text-base"
              >
                <span className="font-bold text-[color:var(--brand-deep)]">
                  99%
                </span>
                <span className="text-gray-600">uptime mentenanță</span>
                <span className="block text-gray-300 lg:hidden">|</span>
              </TimelineContent>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <TextGenerateEffect
              as="h1"
              words="Construim software care reduce costurile și crește rezultatele."
              className="mb-8 text-2xl !leading-[110%] font-semibold text-gray-900 sm:text-4xl md:text-5xl"
              duration={0.4}
            />

            <TimelineContent
              as="div"
              animationNum={9}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="grid gap-8 text-gray-600 md:grid-cols-2"
            >
              <TimelineContent
                as="div"
                animationNum={10}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-xs sm:text-base"
              >
                <p className="text-justify leading-relaxed">
                  ZeroBug este brandul de servicii IT al SC AXP GLOBAL RETAIL
                  SRL. Construim website-uri, magazine, integrări API, aplicații
                  mobile și — în 2026 — punem accent pe AI (OpenAI & Claude) și
                  automatizări.
                </p>
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={11}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-xs sm:text-base"
              >
                <p className="text-justify leading-relaxed">
                  Diferențiatorul nostru: putem livra atât dezvoltarea, cât și
                  tracking-ul Google Ads / eCommerce analytics (POAS, COGS,
                  server-side conversions) — rar găsit într-un singur partener
                  tehnic.
                </p>
              </TimelineContent>
            </TimelineContent>
          </div>

          <div className="md:col-span-1">
            <div className="text-right">
              <TimelineContent
                as="div"
                animationNum={12}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="mb-2 flex items-center justify-end gap-3"
              >
                <Image
                  src="/images/logozerobug.png"
                  alt="ZeroBug"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                  unoptimized
                />
                <span className="text-2xl font-bold text-[color:var(--brand-deep)]">
                  ZeroBug
                </span>
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={13}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="mb-8 text-sm text-gray-600"
              >
                Servicii IT | AI & Automatizări | Mentenanță
              </TimelineContent>

              <TimelineContent
                as="div"
                animationNum={14}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="mb-6"
              >
                <p className="mb-4 font-medium text-gray-900">
                  Pregătit să transformăm ideea ta într-un produs digital solid?
                </p>
              </TimelineContent>

              <TimelineContent
                as="div"
                animationNum={15}
                timelineRef={heroRef}
                customVariants={revealVariants}
              >
                <Link
                  href="/contact"
                  className="ml-auto flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-5 py-3 font-semibold text-white shadow-lg shadow-neutral-900 transition-all duration-300 ease-in-out hover:gap-4 hover:bg-neutral-950"
                >
                  HAI SĂ COLABORĂM <ArrowRight className="h-4 w-4" />
                </Link>
              </TimelineContent>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
