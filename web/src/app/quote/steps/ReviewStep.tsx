"use client";

import { motion } from "framer-motion";
import { inputClasses, type QuoteFormData } from "../quoteOptions";

export default function ReviewStep({
  formData,
  onChange,
}: {
  formData: QuoteFormData;
  onChange: <K extends keyof QuoteFormData>(
    field: K,
    value: QuoteFormData[K],
  ) => void;
}) {
  return (
    <motion.div
      key="step-4"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      <div>
        <h2 className="mb-6 font-display text-2xl text-ink">
          Additional Information
        </h2>
        <div>
          <label
            htmlFor="additionalNotes"
            className="mb-2 block text-sm font-medium text-ink-muted"
          >
            Additional notes or requirements
          </label>
          <textarea
            id="additionalNotes"
            rows={6}
            value={formData.additionalNotes}
            onChange={(e) => onChange("additionalNotes", e.target.value)}
            className={`${inputClasses} resize-none`}
            placeholder="Any specific requirements, constraints, or questions you'd like to discuss..."
          />
        </div>
      </div>
    </motion.div>
  );
}
