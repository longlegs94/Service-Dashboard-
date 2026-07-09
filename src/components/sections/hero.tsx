"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Phone, Star } from "lucide-react";
import { business } from "@/content/business";
import { services } from "@/content/services";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CountUp } from "@/components/ui/count-up";
import { ServiceIcon } from "@/components/ui/service-icon";

export function Hero() {
  const reduceMotion = useReducedMotion();
  // Hero is always above the fold, so the stats count up on mount rather
  // than waiting for a scroll-into-view signal.
  const [statsStarted, setStatsStarted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setStatsStarted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const fadeUp = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] as const },
  });

  return (
    <section className="relative overflow-hidden bg-night-900 text-white">
      <div className="dotgrid-dark dotgrid-drift absolute inset-0" aria-hidden="true" />
      <div className="scanline-layer pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Slowly drifting ambient glow blobs */}
      <motion.div
        className="pointer-events-none absolute -right-40 top-[-20%] h-[560px] w-[560px] rounded-full bg-brand-700/25 blur-3xl"
        aria-hidden="true"
        animate={reduceMotion ? undefined : { x: [0, -36, 0], y: [0, 28, 0] }}
        transition={reduceMotion ? undefined : { duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -left-32 bottom-[-18%] h-[420px] w-[420px] rounded-full bg-accent-500/10 blur-3xl"
        aria-hidden="true"
        animate={reduceMotion ? undefined : { x: [0, 32, 0], y: [0, -22, 0] }}
        transition={reduceMotion ? undefined : { duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      <Container className="relative grid items-center gap-14 pb-16 pt-16 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:pb-24 lg:pt-24">
        <div>
          <motion.p
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-ink-300"
          >
            <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" aria-hidden="true" />
            Family-owned in Surrey since day one
          </motion.p>

          <motion.h1
            {...fadeUp(0.08)}
            className="font-display mt-7 text-[2.75rem] font-bold leading-[1.04] sm:text-6xl lg:text-[4.25rem]"
          >
            Broken appliance?
            <span className="block text-accent-400">Fixed right, fast.</span>
          </motion.h1>

          <motion.p {...fadeUp(0.16)} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
            Fridges, washers, dryers, dishwashers, stoves and freezers — repaired across
            Surrey and the Lower Mainland with flat-rate quotes before we start and a
            90-day warranty after we&apos;re done.
          </motion.p>

          <motion.div {...fadeUp(0.24)} className="mt-9 flex flex-wrap items-center gap-4">
            <Button href="/book" size="lg">
              Book a Repair
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Button>
            <a
              href={business.phoneHref}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/20 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/5"
            >
              <Phone className="h-4 w-4 text-accent-400" aria-hidden="true" />
              {business.phone}
            </a>
          </motion.div>

          <motion.dl
            {...fadeUp(0.32)}
            className="mt-12 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-4"
          >
            {business.stats.map((stat) => (
              <div key={stat.label}>
                <dd className="font-display text-2xl font-bold text-white sm:text-3xl">
                  <CountUp value={stat.value} start={statsStarted} />
                </dd>
                <dt className="mt-1 text-xs leading-snug text-ink-500">{stat.label}</dt>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Appliance index panel — real links, not decoration */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="hidden lg:block"
        >
          {/* Idle float — starts once the entrance animation above has settled */}
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 6, delay: 1, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
              <p className="border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
                What needs fixing today?
              </p>
              <ul>
                {services.map((service) => (
                  <li key={service.slug}>
                    <a
                      href={`/book?appliance=${service.slug}`}
                      className="group flex items-center gap-4 border-b border-white/[0.06] px-6 py-[1.13rem] transition-colors last:border-0 hover:bg-white/[0.06]"
                    >
                      <span className="text-brand-300 transition-colors group-hover:text-accent-400">
                        <ServiceIcon icon={service.icon} className="h-6 w-6" />
                      </span>
                      <span className="flex-1 font-semibold text-white">{service.shortName}</span>
                      <ArrowRight
                        className="h-4 w-4 text-ink-500 transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent-400"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
