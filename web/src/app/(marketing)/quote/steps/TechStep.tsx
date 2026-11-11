"use client";

import { motion } from "framer-motion";
import ChoiceGroup from "../ChoiceGroup";
import {
  integrationOptions,
  techOptions,
  type QuoteFormData,
} from "../quoteOptions";

export default function TechStep({
  formData,
  onToggle,
}: {
  formData: QuoteFormData;
  onToggle: (field: "technologies" | "integrations", value: string) => void;
}) {
  return (
    <motion.div
      key="step-2"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      <div>
        <h2 className="mb-6 font-display text-2xl text-ink">
          Technical Requirements
        </h2>
        <div className="space-y-6">
          <ChoiceGroup
            legend="Preferred technologies (select all that apply)"
            options={techOptions}
            isSelected={(o) => formData.technologies.includes(o)}
            onToggle={(o) => onToggle("technologies", o)}
            columns="grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
          />
          <ChoiceGroup
            legend="Required integrations (select all that apply)"
            options={integrationOptions}
            isSelected={(o) => formData.integrations.includes(o)}
            onToggle={(o) => onToggle("integrations", o)}
            columns="grid-cols-2 md:grid-cols-4"
          />
        </div>
      </div>
    </motion.div>
  );
}
