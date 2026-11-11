"use client";

import { MotionConfig } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import TurnstileField from "@/components/TurnstileField";
import HoneypotField from "@/components/HoneypotField";
import QuoteProgress from "./QuoteProgress";
import { useQuoteWizard } from "./useQuoteWizard";
import ProjectStep from "./steps/ProjectStep";
import TechStep from "./steps/TechStep";
import ContactStep from "./steps/ContactStep";
import ReviewStep from "./steps/ReviewStep";
import QuoteSuccess from "./steps/QuoteSuccess";

const QuoteForm = () => {
  const {
    currentStep,
    formData,
    state,
    pending,
    progress,
    turnstileMissing,
    totalSteps,
    stepIsValid,
    handleInputChange,
    handleArrayToggle,
    prevStep,
    handleFormSubmit,
    setTurnstileToken,
  } = useQuoteWizard();

  const stepContent =
    currentStep === 1 ? (
      <ProjectStep formData={formData} onChange={handleInputChange} />
    ) : currentStep === 2 ? (
      <TechStep formData={formData} onToggle={handleArrayToggle} />
    ) : currentStep === 3 ? (
      <ContactStep
        formData={formData}
        onChange={handleInputChange}
        fieldErrors={state.fieldErrors}
      />
    ) : currentStep === 4 ? (
      <ReviewStep formData={formData} onChange={handleInputChange} />
    ) : currentStep === 5 ? (
      <QuoteSuccess state={state} />
    ) : null;

  return (
    <MotionConfig reducedMotion="user">
      <div>
        {/* The page hero (h1) is server-rendered in quote/page.tsx. */}
        {currentStep <= totalSteps && (
          <QuoteProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
            progress={progress}
          />
        )}

        <section className="section-y">
          <div className="shell">
            <div className="surface-panel relative max-w-3xl p-6 md:p-10">
              <form onSubmit={handleFormSubmit}>
                {stepContent}

                <HoneypotField id="quote-website" />
                <TurnstileField onTokenChange={setTurnstileToken} />

                {currentStep <= totalSteps && (
                  <div className="mt-[clamp(1.75rem,5svh,3rem)] flex justify-between gap-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className={`btn-secondary ${
                        currentStep === 1 ? "cursor-not-allowed opacity-40" : ""
                      }`}
                    >
                      <ArrowLeft size={18} aria-hidden="true" />
                      <span>Previous</span>
                    </button>

                    <button
                      type="submit"
                      disabled={
                        pending ||
                        turnstileMissing ||
                        (currentStep < totalSteps && !stepIsValid)
                      }
                      aria-busy={pending}
                      className="btn-primary"
                    >
                      <span>
                        {pending
                          ? "Sending…"
                          : currentStep === totalSteps
                            ? "Submit Quote Request"
                            : "Next"}
                      </span>
                      {pending ? (
                        <Loader2
                          className="animate-spin"
                          size={18}
                          aria-hidden="true"
                        />
                      ) : (
                        <ArrowRight size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                )}

                {state.status === "error" &&
                  (currentStep === totalSteps || currentStep === 3) && (
                  <div
                    role="alert"
                    className="mt-6 space-y-1 rounded-atelier-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
                  >
                    <p>{state.message}</p>
                    {state.fieldErrors && currentStep === totalSteps ? (
                      <ul className="list-inside list-disc space-y-1">
                        {Object.entries(state.fieldErrors).map(
                          ([field, message]) => (
                            <li key={field}>{message}</li>
                          ),
                        )}
                      </ul>
                    ) : null}
                  </div>
                )}

                {turnstileMissing && currentStep === totalSteps && (
                  <p className="mt-4 text-right text-sm text-amber-300">
                    Completing the security check is required before submitting.
                  </p>
                )}

                {currentStep < totalSteps && !stepIsValid && (
                  <p className="mt-4 text-right text-sm text-ink-subtle">
                    Fill the required (*) fields to continue.
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>
      </div>
    </MotionConfig>
  );
};

export default QuoteForm;
