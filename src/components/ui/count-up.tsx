"use client";

import { useEffect, useMemo, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

/**
 * Animates the leading numeric portion of a stat string from 0 up to its
 * value once `start` flips true — e.g. "10,000+" counts up to 10,000 then
 * keeps the "+"; "90 days" counts up to 90 then keeps " days". Falls back to
 * rendering the raw string if it doesn't start with a number, and skips the
 * animation (shows the final value immediately) when the user prefers
 * reduced motion.
 *
 * `start` is driven by the caller rather than this component watching its
 * own viewport visibility: framer-motion's viewport tracking (both the
 * `useInView` hook and `whileInView`/`onViewportEnter`) was found to
 * intermittently miss the "entered viewport" event when several instances
 * with identical viewport options mount in the same row (e.g. 4 stats side
 * by side) — 3 of 4 stayed stuck at 0 while 1 counted up fine. Watching
 * visibility once at the row level and passing `start` down avoids the
 * multi-instance race entirely.
 */
export function CountUp({
  value,
  start,
  className = "",
}: {
  value: string;
  start: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  const parsed = useMemo(() => {
    const match = value.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
    if (!match) return null;
    return {
      target: Number(match[1].replace(/,/g, "")),
      hasComma: match[1].includes(","),
      suffix: match[2],
    };
  }, [value]);

  const [display, setDisplay] = useState(parsed ? "0" : value);

  useEffect(() => {
    if (!parsed || !start) return;

    const format = (n: number) => (parsed.hasComma ? n.toLocaleString("en-US") : String(n));

    if (reduceMotion) {
      // Defer to the next frame rather than setState synchronously in the effect body.
      const frame = requestAnimationFrame(() => setDisplay(format(parsed.target)));
      return () => cancelAnimationFrame(frame);
    }

    const controls = animate(0, parsed.target, {
      duration: 1.4,
      ease: [0.21, 0.47, 0.32, 0.98],
      onUpdate: (v) => setDisplay(format(Math.round(v))),
    });
    return () => controls.stop();
  }, [start, reduceMotion, parsed]);

  if (!parsed) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={className}>
      {display}
      {parsed.suffix}
    </span>
  );
}
