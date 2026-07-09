"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Service } from "@/content/services";

type IconKey = Service["icon"];

type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number; rx?: number }
  | { type: "line"; x1: number; y1: number; x2: number; y2: number }
  | { type: "circle"; cx: number; cy: number; r: number; fill?: boolean }
  | { type: "path"; d: string };

/**
 * Hand-drawn appliance line icons, consistent 24×24 / 1.8 stroke style.
 * Shapes are data (not JSX) so the same definitions can render as plain SVG
 * primitives or as motion primitives with a scroll-triggered "draw-on"
 * (pathLength) effect — see the `animate` prop below.
 */
const shapes: Record<IconKey, Shape[]> = {
  fridge: [
    { type: "rect", x: 6, y: 2.5, width: 12, height: 19, rx: 2 },
    { type: "line", x1: 6, y1: 9.5, x2: 18, y2: 9.5 },
    { type: "line", x1: 9, y1: 5.5, x2: 9, y2: 7 },
    { type: "line", x1: 9, y1: 12.5, x2: 9, y2: 15.5 },
  ],
  washer: [
    { type: "rect", x: 3.5, y: 3, width: 17, height: 18, rx: 2 },
    { type: "circle", cx: 12, cy: 13, r: 4.5 },
    { type: "path", d: "M8.5 13c1.2-1 2.3 1 3.5 0s2.3 1 3.5 0" },
    { type: "circle", cx: 7, cy: 6, r: 0.4, fill: true },
    { type: "circle", cx: 10, cy: 6, r: 0.4, fill: true },
    { type: "line", x1: 15, y1: 6, x2: 17.5, y2: 6 },
  ],
  dryer: [
    { type: "rect", x: 3.5, y: 3, width: 17, height: 18, rx: 2 },
    { type: "circle", cx: 12, cy: 13, r: 4.5 },
    { type: "path", d: "M10 11.5c.8 1 .8 2 0 3M13 11c1 1.3 1 2.7 0 4" },
    { type: "circle", cx: 7, cy: 6, r: 0.4, fill: true },
    { type: "line", x1: 14, y1: 6, x2: 17.5, y2: 6 },
  ],
  dishwasher: [
    { type: "rect", x: 3.5, y: 3, width: 17, height: 18, rx: 2 },
    { type: "line", x1: 3.5, y1: 8, x2: 20.5, y2: 8 },
    { type: "circle", cx: 6.5, cy: 5.5, r: 0.4, fill: true },
    { type: "line", x1: 10, y1: 5.5, x2: 17.5, y2: 5.5 },
    { type: "path", d: "M12 11.5v2M12 13.5c-2 0-3.5 1.4-3.5 3.5M12 13.5c2 0 3.5 1.4 3.5 3.5" },
  ],
  stove: [
    { type: "rect", x: 3.5, y: 3, width: 17, height: 18, rx: 2 },
    { type: "line", x1: 3.5, y1: 9, x2: 20.5, y2: 9 },
    { type: "circle", cx: 8, cy: 6, r: 1.4 },
    { type: "circle", cx: 16, cy: 6, r: 1.4 },
    { type: "rect", x: 7, y: 12, width: 10, height: 6, rx: 1 },
  ],
  freezer: [
    { type: "rect", x: 6, y: 2.5, width: 12, height: 19, rx: 2 },
    { type: "line", x1: 6, y1: 13.5, x2: 18, y2: 13.5 },
    { type: "path", d: "M12 5v6M9.5 6.5l5 3M14.5 6.5l-5 3" },
    { type: "line", x1: 9, y1: 16.5, x2: 9, y2: 18.5 },
  ],
};

function StaticShape({ shape }: { shape: Shape }) {
  switch (shape.type) {
    case "rect":
      return <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx} />;
    case "line":
      return <line x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} />;
    case "circle":
      return (
        <circle cx={shape.cx} cy={shape.cy} r={shape.r} fill={shape.fill ? "currentColor" : undefined} />
      );
    case "path":
      return <path d={shape.d} />;
  }
}

function DrawOnShape({ shape, delay }: { shape: Shape; delay: number }) {
  // Filled decoration dots have no visible stroke, so pathLength has nothing
  // to draw — render them as a plain dot that appears once its line finishes.
  if (shape.type === "circle" && shape.fill) {
    return (
      <motion.circle
        cx={shape.cx}
        cy={shape.cy}
        r={shape.r}
        fill="currentColor"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.3, delay: delay + 0.5 }}
      />
    );
  }

  const drawProps = {
    initial: { pathLength: 0, opacity: 0.4 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] as const },
  };

  switch (shape.type) {
    case "rect":
      return (
        <motion.rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx} {...drawProps} />
      );
    case "line":
      return <motion.line x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} {...drawProps} />;
    case "circle":
      return <motion.circle cx={shape.cx} cy={shape.cy} r={shape.r} {...drawProps} />;
    case "path":
      return <motion.path d={shape.d} {...drawProps} />;
  }
}

export function ServiceIcon({
  icon,
  className = "h-7 w-7",
  /** When true, strokes draw themselves in as the icon scrolls into view. */
  animate = false,
}: {
  icon: IconKey;
  className?: string;
  animate?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const iconShapes = shapes[icon];
  const drawEnabled = animate && !reduceMotion;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {iconShapes.map((shape, i) =>
        drawEnabled ? (
          <DrawOnShape key={i} shape={shape} delay={i * 0.09} />
        ) : (
          <StaticShape key={i} shape={shape} />
        )
      )}
    </svg>
  );
}
