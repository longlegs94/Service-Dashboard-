"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { business } from "@/content/business";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { CountUp } from "@/components/ui/count-up";

export function TrustBar() {
  // A single viewport watcher on the row (not one per stat) gates the
  // count-up start — see CountUp for why per-stat viewport tracking is
  // unreliable when several identical instances mount simultaneously.
  const [started, setStarted] = useState(false);

  return (
    <section className="border-y border-ink-100 bg-ink-50">
      <Container>
        <motion.dl
          className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-4"
          viewport={{ once: true, margin: "-80px" }}
          onViewportEnter={() => setStarted(true)}
        >
          {business.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.05}>
              <div className="border-l-2 border-accent-500 pl-5">
                <dd className="font-display text-3xl font-bold text-ink-900">
                  <CountUp value={stat.value} start={started} />
                </dd>
                <dt className="mt-1 text-sm text-ink-500">{stat.label}</dt>
              </div>
            </Reveal>
          ))}
        </motion.dl>
      </Container>
    </section>
  );
}
