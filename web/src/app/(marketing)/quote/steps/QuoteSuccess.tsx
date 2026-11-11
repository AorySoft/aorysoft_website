"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import type { FormState } from "@/lib/public-forms/state";

export default function QuoteSuccess({ state }: { state: FormState }) {
  return (
    <motion.div
      key="step-5"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 text-center"
    >
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-atelier border border-line bg-surface-raised text-signal">
        <CheckCircle className="h-10 w-10" aria-hidden="true" />
      </div>
      <div>
        <h2 className="mb-4 font-display text-3xl text-ink">Request received</h2>
        <p className="mx-auto max-w-2xl text-xl text-ink-muted">
          {state.status === "success"
            ? state.message
            : "Thanks! Your quote request has been submitted."}
        </p>
        <p className="mt-4 text-ink-subtle">
          Prefer email? Write to{" "}
          <a
            href="mailto:info@aorysoft.com"
            className="text-signal underline underline-offset-4"
          >
            info@aorysoft.com
          </a>
          .
        </p>
      </div>
    </motion.div>
  );
}
