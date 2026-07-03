"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Phone, ShieldCheck, Star } from "lucide-react";
import { business } from "@/content/business";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Hero() {
  const reduceMotion = useReducedMotion();
  const fadeUp = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] as const },
  });

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full bg-brand-100/60 blur-3xl"
        aria-hidden="true"
      />
      <Container className="relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
        <div>
          <motion.p
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-semibold text-brand-700 shadow-soft"
          >
            <Star className="h-4 w-4 fill-accent-400 text-accent-400" aria-hidden="true" />
            Family-owned in Surrey, BC
          </motion.p>

          <motion.h1
            {...fadeUp(0.08)}
            className="mt-6 text-4xl font-bold leading-tight tracking-tight text-ink-900 sm:text-5xl lg:text-[3.4rem]"
          >
            Appliance repair,{" "}
            <span className="text-brand-700">done right</span> the first time.
          </motion.h1>

          <motion.p {...fadeUp(0.16)} className="mt-5 max-w-xl text-lg leading-relaxed text-ink-500">
            Fridges, washers, dryers, dishwashers, stoves, and freezers — repaired fast across
            Surrey and the Lower Mainland with upfront pricing and a 90-day warranty.
          </motion.p>

          <motion.div {...fadeUp(0.24)} className="mt-8 flex flex-wrap items-center gap-4">
            <Button href="/book" size="lg">
              Book a Repair
            </Button>
            <Button href={business.phoneHref} variant="outline" size="lg">
              <Phone className="h-4 w-4 text-brand-600" aria-hidden="true" />
              {business.phone}
            </Button>
          </motion.div>

          <motion.ul {...fadeUp(0.32)} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-700">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" /> 90-day warranty
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-brand-600" aria-hidden="true" /> Upfront flat-rate quotes
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-brand-600" aria-hidden="true" /> Same-week service
            </li>
          </motion.ul>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lift">
            <Image
              src="/images/hero.jpg"
              alt="Illustrated collage of home appliances repaired by HomePro Appliances"
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 left-6 flex items-center gap-3 rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-lift">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink-900">10,000+ repairs completed</p>
              <p className="text-xs text-ink-500">Licensed & insured technicians</p>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
