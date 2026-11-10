"use client";

import { useState } from "react";
import {
  initialData,
  TOTAL_STEPS,
  type QuoteFormData,
} from "./quoteOptions";
import { idleFormState, type FormState } from "@/lib/public-forms/state";
import { submitQuote } from "@/lib/public-forms/actions";
import { buildQuotePayload } from "./buildQuotePayload";

export function useQuoteWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuoteFormData>(initialData);
  const [state, setState] = useState<FormState>(idleFormState);
  const [pending, setPending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const progress = (currentStep / TOTAL_STEPS) * 100;
  const turnstileConfigured = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
  const turnstileMissing = turnstileConfigured && !turnstileToken;

  const handleInputChange = <K extends keyof QuoteFormData>(
    field: K,
    value: QuoteFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (
    field: "technologies" | "integrations",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const stepIsValid =
    currentStep === 1
      ? Boolean(
          formData.projectType &&
            formData.budget &&
            formData.timeline &&
            formData.description.trim(),
        )
      : currentStep === 3
        ? Boolean(formData.name.trim() && formData.email.trim())
        : true;

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS && stepIsValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (currentStep !== TOTAL_STEPS) {
      if (stepIsValid) nextStep();
      return;
    }
    if (pending || turnstileMissing) return;

    const payload = buildQuotePayload(event.currentTarget, formData);
    setPending(true);
    setState(idleFormState);
    try {
      const result = await submitQuote(idleFormState, payload);
      setState(result);
      if (result.status === "success") setCurrentStep(5);
    } catch (error) {
      console.error("quote submit failed", error);
      setState({
        status: "error",
        message: "We could not send your request right now. Please try again.",
      });
    } finally {
      setPending(false);
    }
  };

  return {
    currentStep,
    formData,
    state,
    pending,
    progress,
    turnstileMissing,
    totalSteps: TOTAL_STEPS,
    stepIsValid,
    handleInputChange,
    handleArrayToggle,
    nextStep,
    prevStep,
    handleFormSubmit,
    setTurnstileToken,
  };
}
