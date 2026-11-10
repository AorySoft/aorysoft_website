"use client";

import { motion } from "framer-motion";
import ChoiceGroup from "../ChoiceGroup";
import {
  budgetRanges,
  inputClasses,
  projectTypes,
  timelineOptions,
  type QuoteFormData,
} from "../quoteOptions";

export default function ProjectStep({
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
      key="step-1"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      <div>
        <h2 className="mb-6 font-display text-2xl text-ink">Project Details</h2>
        <div className="space-y-6">
          <ChoiceGroup
            legend="What type of project are you looking to build? *"
            options={projectTypes}
            isSelected={(o) => formData.projectType === o}
            onToggle={(o) => onChange("projectType", o)}
            columns="grid-cols-2 md:grid-cols-4"
          />
          <ChoiceGroup
            legend="What’s your budget range? *"
            options={budgetRanges}
            isSelected={(o) => formData.budget === o}
            onToggle={(o) => onChange("budget", o)}
            columns="grid-cols-2 md:grid-cols-3"
          />
          <ChoiceGroup
            legend="Project timeline *"
            options={timelineOptions}
            isSelected={(o) => formData.timeline === o}
            onToggle={(o) => onChange("timeline", o)}
            columns="grid-cols-2 md:grid-cols-5"
          />
          <div>
            <label
              htmlFor="description"
              className="mb-3 block text-sm font-medium text-ink-muted"
            >
              Project description *
            </label>
            <textarea
              id="description"
              rows={6}
              required
              value={formData.description}
              onChange={(e) => onChange("description", e.target.value)}
              className={`${inputClasses} resize-none`}
              placeholder="Tell us about your project goals, requirements, and any specific features you need..."
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
