"use client";

import { motion } from "framer-motion";

export default function QuoteProgress({
  currentStep,
  totalSteps,
  progress,
}: {
  currentStep: number;
  totalSteps: number;
  progress: number;
}) {
  return (
    <section className="border-b border-line py-[clamp(1rem,3svh,2rem)]">
      <div className="shell">
        <div className="max-w-3xl space-y-4">
          <div className="flex justify-between text-sm text-ink-subtle">
            <span>
              Step {currentStep} of {totalSteps}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div
            className="h-1.5 w-full rounded-atelier bg-surface-raised"
            role="progressbar"
            aria-label="Quote form progress"
            aria-valuetext={`Step ${currentStep} of ${totalSteps}`}
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="h-1.5 w-full origin-left rounded-atelier bg-signal"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
