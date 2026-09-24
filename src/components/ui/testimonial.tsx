"use client";

import { TimelineContent } from "@/components/ui/timeline-animation";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import Image from "next/image";
import { useRef } from "react";

const TESTIMONIALS = {
  leftTop: {
    quote:
      "ZeroBug ne-a refăcut magazinul WooCommerce și tracking-ul Google Ads. În 6 săptămâni vedeam clar POAS, nu doar ROAS.",
    name: "Andrei",
    role: "magazin online · retail",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
  },
  leftBottom: {
    quote:
      "Integrarea cu curierul și sync-ul de stocuri ne-a redus timpul pe operațiuni cu aproape jumătate.",
    name: "Elena",
    role: "operațiuni · e-commerce",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  },
  mid: [
    {
      quote:
        "Integrarea Stripe + abonamente a fost livrată curat, cu facturare și webhooks care chiar țin.",
      name: "Mihai",
      role: "produs · SaaS",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    },
    {
      quote:
        "Mentenanța lunară e predictibilă — update-uri, backup, și cineva care răspunde când e urgent.",
      name: "Ioana",
      role: "marketing · brand",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    },
    {
      quote:
        "Au migrat din Magento pe Shopify fără downtime. Stocurile și feed-urile Merchant Center au rămas sincronizate.",
      name: "Radu",
      role: "e-commerce · shop",
      image:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    },
  ],
  rightTop: {
    quote: "Partenerul tehnic pe care îl căutam: web + ads + API, într-un singur loc.",
    name: "Cristina",
    role: "studio · digital",
    image:
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=200&q=80",
  },
  rightBottom: {
    quote:
      "ZeroBug a reconstruit portalul nostru B2B pe Next.js. Prețuri personalizate, ERP sync și un UI pe care echipa de sales îl folosește zilnic.",
    name: "Paul",
    role: "B2B · trade",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
};

function ClientFeedback() {
  const testimonialRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  return (
    <section
      className="relative w-full bg-zinc-950 text-white py-20 md:py-24"
      ref={testimonialRef}
    >
      <div className="mx-auto max-w-6xl px-6">
        <article className="max-w-screen-md mx-auto text-center space-y-3">
          <TextGenerateEffect
            as="h2"
            words="De încredere pentru magazine și echipe de produs"
            className="text-3xl md:text-5xl font-semibold tracking-tight"
            duration={0.35}
          />
          <TextGenerateEffect
            words="Cum văd clienții ZeroBug colaborarea — de la e-commerce și tracking, la API și mentenanță."
            className="mx-auto text-zinc-400 text-base md:text-lg"
            duration={0.35}
          />
        </article>

        <div className="lg:grid lg:grid-cols-3 gap-3 flex flex-col w-full pt-12 pb-4">
          <div className="md:flex lg:flex-col lg:space-y-3 h-full lg:gap-0 gap-3">
            <TimelineContent
              animationNum={0}
              customVariants={revealVariants}
              timelineRef={testimonialRef}
              className="lg:flex-[7] flex-[6] flex flex-col justify-start relative bg-zinc-900 overflow-hidden rounded-2xl border border-white/10 p-5 min-h-[240px]"
            >
              <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:50px_56px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
              <article className="relative z-10">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-semibold text-base md:text-lg">
                      {TESTIMONIALS.leftTop.name}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {TESTIMONIALS.leftTop.role}
                    </p>
                  </div>
                  <Image
                    src={TESTIMONIALS.leftTop.image}
                    alt={TESTIMONIALS.leftTop.name}
                    width={64}
                    height={64}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover"
                    unoptimized
                  />
                </div>
                <p className="mt-5 text-zinc-200 leading-relaxed">
                  &ldquo;{TESTIMONIALS.leftTop.quote}&rdquo;
                </p>
              </article>
            </TimelineContent>

            <TimelineContent
              animationNum={1}
              customVariants={revealVariants}
              timelineRef={testimonialRef}
              className="lg:flex-[3] flex-[4] lg:h-fit flex flex-col justify-between relative bg-[color:var(--brand)] text-zinc-950 overflow-hidden rounded-2xl border border-[color:var(--brand)]/30 p-5"
            >
              <article className="mt-auto">
                <p className="leading-relaxed font-medium">
                  &ldquo;{TESTIMONIALS.leftBottom.quote}&rdquo;
                </p>
                <div className="flex justify-between items-end pt-5 gap-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {TESTIMONIALS.leftBottom.name}
                    </h3>
                    <p className="text-sm text-zinc-800/80">
                      {TESTIMONIALS.leftBottom.role}
                    </p>
                  </div>
                  <Image
                    src={TESTIMONIALS.leftBottom.image}
                    alt={TESTIMONIALS.leftBottom.name}
                    width={64}
                    height={64}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover"
                    unoptimized
                  />
                </div>
              </article>
            </TimelineContent>
          </div>

          <div className="lg:h-full md:flex lg:flex-col h-fit lg:space-y-3 lg:gap-0 gap-3">
            {TESTIMONIALS.mid.map((item, idx) => (
              <TimelineContent
                key={item.name}
                animationNum={2 + idx}
                customVariants={revealVariants}
                timelineRef={testimonialRef}
                className="flex flex-col justify-between relative bg-zinc-900 text-white overflow-hidden rounded-2xl border border-white/10 p-5"
              >
                <article className="mt-auto">
                  <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="flex justify-between items-end pt-5 gap-3">
                    <div>
                      <h3 className="font-semibold text-base md:text-lg">
                        {item.name}
                      </h3>
                      <p className="text-sm text-zinc-500">{item.role}</p>
                    </div>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover"
                      unoptimized
                    />
                  </div>
                </article>
              </TimelineContent>
            ))}
          </div>

          <div className="h-full md:flex lg:flex-col lg:space-y-3 lg:gap-0 gap-3">
            <TimelineContent
              animationNum={5}
              customVariants={revealVariants}
              timelineRef={testimonialRef}
              className="lg:flex-[3] flex-[4] flex flex-col justify-between relative bg-[color:var(--brand)] text-zinc-950 overflow-hidden rounded-2xl border border-[color:var(--brand)]/30 p-5"
            >
              <article className="mt-auto">
                <p className="leading-relaxed font-medium">
                  &ldquo;{TESTIMONIALS.rightTop.quote}&rdquo;
                </p>
                <div className="flex justify-between items-end pt-5 gap-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {TESTIMONIALS.rightTop.name}
                    </h3>
                    <p className="text-sm text-zinc-800/80">
                      {TESTIMONIALS.rightTop.role}
                    </p>
                  </div>
                  <Image
                    src={TESTIMONIALS.rightTop.image}
                    alt={TESTIMONIALS.rightTop.name}
                    width={64}
                    height={64}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover"
                    unoptimized
                  />
                </div>
              </article>
            </TimelineContent>

            <TimelineContent
              animationNum={6}
              customVariants={revealVariants}
              timelineRef={testimonialRef}
              className="lg:flex-[7] flex-[6] flex flex-col justify-between relative bg-zinc-900 overflow-hidden rounded-2xl border border-white/10 p-5 min-h-[240px]"
            >
              <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:50px_56px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
              <article className="mt-auto relative z-10">
                <p className="text-zinc-200 leading-relaxed">
                  &ldquo;{TESTIMONIALS.rightBottom.quote}&rdquo;
                </p>
                <div className="flex justify-between items-end pt-5 gap-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {TESTIMONIALS.rightBottom.name}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {TESTIMONIALS.rightBottom.role}
                    </p>
                  </div>
                  <Image
                    src={TESTIMONIALS.rightBottom.image}
                    alt={TESTIMONIALS.rightBottom.name}
                    width={64}
                    height={64}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover"
                    unoptimized
                  />
                </div>
              </article>
            </TimelineContent>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClientFeedback;
