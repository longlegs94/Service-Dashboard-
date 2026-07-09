"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

type ApplianceNode = {
  key: string;
  cx: number;
  cy: number;
  /** x of the vertical leg of the elbow connector running from the hub. */
  elbowX: number;
  glyph: ReactNode;
};

const HUB = { x: 240, y: 170 };

const nodes: ApplianceNode[] = [
  {
    key: "fridge",
    cx: 70,
    cy: 70,
    elbowX: 155,
    glyph: (
      <>
        <rect x="6" y="2" width="28" height="44" rx="4" />
        <line x1="6" y1="18" x2="34" y2="18" />
        <line x1="12" y1="8" x2="12" y2="13" />
      </>
    ),
  },
  {
    key: "washer",
    cx: 410,
    cy: 70,
    elbowX: 325,
    glyph: (
      <>
        <rect x="2" y="4" width="36" height="40" rx="4" />
        <circle cx="20" cy="26" r="10" />
        <circle cx="20" cy="26" r="4" />
      </>
    ),
  },
  {
    key: "stove",
    cx: 70,
    cy: 270,
    elbowX: 155,
    glyph: (
      <>
        <rect x="2" y="6" width="36" height="36" rx="4" />
        <circle cx="12" cy="14" r="3" />
        <circle cx="28" cy="14" r="3" />
        <rect x="9" y="24" width="22" height="12" rx="2" />
      </>
    ),
  },
  {
    key: "dishwasher",
    cx: 410,
    cy: 270,
    elbowX: 325,
    glyph: (
      <>
        <rect x="2" y="4" width="36" height="40" rx="4" />
        <line x1="2" y1="14" x2="38" y2="14" />
        <circle cx="8" cy="9" r="1" fill="#93c5fd" stroke="none" />
        <path d="M20 24v4M20 28c-4 0-7 3-7 7M20 28c4 0 7 3 7 7" />
      </>
    ),
  },
];

/**
 * Hand-authored "connected home appliances" line-art scene for the AI-promo
 * section — a hub (the AI helper) wired to each appliance by circuit-style
 * elbow connectors. Idle float and the travelling signal dots only switch on
 * once the illustration has scrolled into view, and never when the user
 * prefers reduced motion, so nothing animates off-screen or against that
 * preference.
 */
export function ConnectedHomeIllustration({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();
  const live = inView && !reduceMotion;

  return (
    <svg ref={ref} viewBox="0 0 480 340" className={className} fill="none" aria-hidden="true">
      {/* Circuit-style connector traces from the hub to each appliance */}
      {nodes.map((n) => (
        <path
          key={`line-${n.key}`}
          d={`M${HUB.x} ${HUB.y} L${n.elbowX} ${HUB.y} L${n.elbowX} ${n.cy} L${n.cx} ${n.cy}`}
          stroke="#93c5fd"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
      ))}

      {/* Hub — the AI helper */}
      <circle cx={HUB.x} cy={HUB.y} r="34" fill="#0a1228" stroke="#2563eb" strokeWidth="1.8" />
      {live && (
        <>
          <motion.circle
            cx={HUB.x}
            cy={HUB.y}
            r="34"
            stroke="#2563eb"
            strokeOpacity="0.5"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
            style={{ transformOrigin: `${HUB.x}px ${HUB.y}px` }}
          />
          <motion.circle
            cx={HUB.x}
            cy={HUB.y}
            r="34"
            stroke="#2563eb"
            strokeOpacity="0.5"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut", delay: 1.3 }}
            style={{ transformOrigin: `${HUB.x}px ${HUB.y}px` }}
          />
        </>
      )}
      <path
        d={`M${HUB.x} ${HUB.y - 15} L${HUB.x + 12} ${HUB.y} L${HUB.x} ${HUB.y + 15} L${HUB.x - 12} ${HUB.y} Z`}
        fill="#f97316"
        stroke="none"
      />

      {/* Signal pulses travelling from the hub to each appliance */}
      {live &&
        nodes.map((n, i) => (
          <motion.circle
            key={`pulse-${n.key}`}
            r="3.5"
            fill="#f97316"
            initial={{ opacity: 0 }}
            animate={{
              cx: [HUB.x, n.elbowX, n.elbowX, n.cx],
              cy: [HUB.y, HUB.y, n.cy, n.cy],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              repeatDelay: 0.8,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}

      {/* Appliance nodes */}
      {nodes.map((n, i) => {
        const box = (
          <g
            transform={`translate(${n.cx - 20} ${n.cy - 24})`}
            stroke="#93c5fd"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect
              x="-8"
              y="-10"
              width="56"
              height="66"
              rx="10"
              fill="#0a1228"
              stroke="#2563eb"
              strokeOpacity="0.5"
              strokeWidth="1"
            />
            {n.glyph}
          </g>
        );

        if (!live) {
          return <g key={n.key}>{box}</g>;
        }

        return (
          <motion.g
            key={n.key}
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 5 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            {box}
          </motion.g>
        );
      })}
    </svg>
  );
}
