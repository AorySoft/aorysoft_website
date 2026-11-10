"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";

const STEPS = [
  { title: "Discover", text: "Goals, users, and constraints first." },
  { title: "Design", text: "Flows and interfaces shaped before code." },
  { title: "Build", text: "Software and AI systems in small, reviewable steps." },
  { title: "Integrate", text: "Connected to the tools and data you already use." },
  { title: "Operate", text: "Deployed, maintained, and improved." },
] as const;

/** Steps whose node the fill has passed, for a scroll progress value 0–1. */
export function reachedFor(progress: number) {
  return Math.max(0, Math.min(STEPS.length, Math.floor(progress * STEPS.length + 0.35)));
}

/**
 * A signal line that fills as the visitor scrolls through the section, lighting
 * each step as it is reached. Reduced motion is handled in CSS (motion-reduce:)
 * so server and client markup always match: the line shows fully drawn and
 * every step lit, with no scroll-driven change.
 */
export default function ProcessLine() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 85%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const [reached, setReached] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (value) => setReached(reachedFor(value)));

  return (
    <div className="mt-20 md:mt-24">
      <h3 className="font-display text-2xl text-ink md:text-3xl">How a project runs</h3>

      <ol ref={listRef} className="relative mt-10 grid gap-10 pl-8 md:grid-cols-5 md:gap-6 md:pl-0 md:pt-10">
        {/* Rail: vertical on small screens, horizontal from md. */}
        <span className="absolute bottom-2 left-[5px] top-2 w-px bg-line md:inset-x-0 md:bottom-auto md:left-0 md:top-[5px] md:h-px md:w-auto" aria-hidden="true" />
        {/* Scroll-driven fill. */}
        <motion.span
          className="absolute bottom-2 left-[5px] top-2 w-px origin-top bg-signal motion-reduce:hidden md:hidden"
          style={{ scaleY: fill }}
          aria-hidden="true"
        />
        <motion.span
          className="absolute inset-x-0 top-[5px] hidden h-px origin-left bg-gradient-to-r from-signal-deep to-signal md:block motion-reduce:md:hidden"
          style={{ scaleX: fill }}
          aria-hidden="true"
        />
        {/* Reduced motion: the finished line, drawn statically. */}
        <span
          className="absolute bottom-2 left-[5px] top-2 hidden w-px bg-signal motion-reduce:block md:inset-x-0 md:bottom-auto md:left-0 md:top-[5px] md:h-px md:w-auto md:bg-gradient-to-r md:from-signal-deep md:to-signal"
          aria-hidden="true"
        />

        {STEPS.map((step, index) => {
          const lit = index < reached;
          return (
            <li key={step.title} className="relative">
              <span
                className={`absolute -left-8 top-1.5 h-[11px] w-[11px] border transition-[background-color,border-color,box-shadow] duration-300 motion-reduce:border-signal motion-reduce:bg-signal motion-reduce:transition-none md:-top-10 md:left-0 ${
                  lit
                    ? "border-signal bg-signal shadow-[0_0_0_4px_rgb(var(--color-signal)/0.15)]"
                    : "border-line-strong bg-surface"
                }`}
                aria-hidden="true"
              />
              <h4
                className={`font-display text-2xl transition-colors duration-300 motion-reduce:text-ink ${
                  lit ? "text-ink" : "text-ink-muted"
                }`}
              >
                {step.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.text}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
