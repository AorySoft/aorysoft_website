"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import TurnstileField from "@/components/TurnstileField";
import { submitQuote } from "@/lib/public-forms/actions";
import { idleFormState, type FormState } from "@/lib/public-forms/state";

// Phase 4: the final step posts to the server action, which runs the §7
// pipeline (honeypot → Turnstile → rate limit → validation → service-role
// insert → Resend notification). The browser never holds the service key or
// the Resend key, and failures surface as a generic, visitor-safe message.
// Audit/plan fixes folded in:
// - Properly typed state (was `any`-driven with implicit untyped arrays).
// - Fake file-upload control dropped (plan §7: YAGNI until attachments needed).
// - Per-step validation: "Next" stays disabled until required fields are valid.
// - Submit now performs the real submission instead of a fake success.
type QuoteFormData = {
  projectType: string;
  budget: string;
  timeline: string;
  description: string;
  technologies: string[];
  integrations: string[];
  scalability: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  additionalNotes: string;
};

const initialData: QuoteFormData = {
  projectType: "",
  budget: "",
  timeline: "",
  description: "",
  technologies: [],
  integrations: [],
  scalability: "",
  name: "",
  email: "",
  company: "",
  phone: "",
  additionalNotes: "",
};

const projectTypes = [
  "AI/ML Development",
  "Process Automation",
  "Data Analytics",
  "Web Application",
  "Mobile Application",
  "Cloud Migration",
  "API Integration",
  "Custom Software",
];

const budgetRanges = [
  "Under $10,000",
  "$10,000 - $25,000",
  "$25,000 - $50,000",
  "$50,000 - $100,000",
  "$100,000+",
  "Let's discuss",
];

const timelineOptions = [
  "1-3 months",
  "3-6 months",
  "6-12 months",
  "12+ months",
  "Flexible",
];

const techOptions = [
  "Python",
  "JavaScript",
  "React",
  "Node.js",
  "TensorFlow",
  "PyTorch",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "MongoDB",
  "PostgreSQL",
];

const integrationOptions = [
  "CRM Systems",
  "ERP Systems",
  "Payment Gateways",
  "Social Media APIs",
  "Marketing Tools",
  "Analytics Platforms",
  "Email Services",
  "Cloud Storage",
];

const inputClasses =
  "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200";

const choiceClasses = (active: boolean) =>
  `p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
    active
      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
      : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
  }`;

const QuoteForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuoteFormData>(initialData);
  const [state, setState] = useState<FormState>(idleFormState);
  const [pending, setPending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;
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

  // Per-step validation gates the Next button.
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
    if (currentStep < totalSteps && stepIsValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Submits the quote. Runs as a form submit (not a bare onClick) so the
   * honeypot and Turnstile inputs inside the form are included in the payload.
   */
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Enter key on a mid-wizard step must not submit early.
    if (currentStep !== totalSteps) {
      if (stepIsValid) nextStep();
      return;
    }
    if (pending || turnstileMissing) return;

    const payload = new FormData(event.currentTarget);
    // The wizard's fields are React-controlled and its pick-lists are <button>
    // elements, so neither carries a name attribute. Copy the real values in
    // explicitly — only the honeypot and Turnstile inputs come from the DOM.
    for (const field of [
      "name",
      "email",
      "company",
      "phone",
      "projectType",
      "budget",
      "timeline",
      "description",
      "scalability",
      "additionalNotes",
    ] as const) {
      payload.set(field, formData[field] ?? "");
    }
    // Multi-selects are repeated keys (the server reads them with getAll).
    for (const value of formData.technologies) payload.append("technologies", value);
    for (const value of formData.integrations) payload.append("integrations", value);

    setPending(true);
    setState(idleFormState);
    try {
      const result = await submitQuote(idleFormState, payload);
      setState(result);
      if (result.status === "success") setCurrentStep(5);
    } catch (error) {
      // Network/RPC failure: log for the developer, show a safe message.
      console.error("quote submit failed", error);
      setState({
        status: "error",
        message: "We could not send your request right now. Please try again.",
      });
    } finally {
      setPending(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Project Details
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    What type of project are you looking to build? *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {projectTypes.map((type) => (
                      <motion.button
                        key={type}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleInputChange("projectType", type)}
                        className={choiceClasses(formData.projectType === type)}
                      >
                        {type}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    What&apos;s your budget range? *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {budgetRanges.map((range) => (
                      <motion.button
                        key={range}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleInputChange("budget", range)}
                        className={choiceClasses(formData.budget === range)}
                      >
                        {range}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Project timeline *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {timelineOptions.map((timeline) => (
                      <motion.button
                        key={timeline}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleInputChange("timeline", timeline)}
                        className={choiceClasses(
                          formData.timeline === timeline,
                        )}
                      >
                        {timeline}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-300 mb-3"
                  >
                    Project description *
                  </label>
                  <textarea
                    id="description"
                    rows={6}
                    required
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className={`${inputClasses} resize-none`}
                    placeholder="Tell us about your project goals, requirements, and any specific features you need..."
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Technical Requirements
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Preferred technologies (select all that apply)
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {techOptions.map((tech) => (
                      <motion.button
                        key={tech}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleArrayToggle("technologies", tech)}
                        className={choiceClasses(
                          formData.technologies.includes(tech),
                        )}
                      >
                        {tech}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Required integrations (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {integrationOptions.map((integration) => (
                      <motion.button
                        key={integration}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handleArrayToggle("integrations", integration)
                        }
                        className={choiceClasses(
                          formData.integrations.includes(integration),
                        )}
                      >
                        {integration}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="quote-name"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="quote-name"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={inputClasses}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="quote-email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="quote-email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      handleInputChange("email", e.target.value)
                    }
                    className={inputClasses}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="quote-company"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="quote-company"
                    value={formData.company}
                    onChange={(e) =>
                      handleInputChange("company", e.target.value)
                    }
                    className={inputClasses}
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <label
                    htmlFor="quote-phone"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="quote-phone"
                    value={formData.phone}
                    onChange={(e) =>
                      handleInputChange("phone", e.target.value)
                    }
                    className={inputClasses}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Additional Information
              </h3>

              <div>
                <label
                  htmlFor="additionalNotes"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Additional notes or requirements
                </label>
                <textarea
                  id="additionalNotes"
                  rows={6}
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    handleInputChange("additionalNotes", e.target.value)
                  }
                  className={`${inputClasses} resize-none`}
                  placeholder="Any specific requirements, constraints, or questions you'd like to discuss..."
                />
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step-5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Request received
              </h3>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {state.status === "success"
                  ? state.message
                  : "Thanks! Your quote request has been submitted."}
              </p>
              <p className="text-gray-400 mt-4">
                Prefer email? Write to{" "}
                <a
                  href="mailto:info@aorysoft.com"
                  className="text-cyan-400 underline underline-offset-4"
                >
                  info@aorysoft.com
                </a>{" "}
                and we&apos;ll reply within 24 hours.
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-gray-900 to-cyan-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              Get Your Quote
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tell us about your project and we&apos;ll provide you with a
              detailed proposal. Our multi-step form helps us understand your
              needs better.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Progress Bar */}
      {currentStep <= totalSteps && (
        <section className="py-8 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-400">
                <span>
                  Step {currentStep} of {totalSteps}
                </span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div
                className="w-full bg-gray-800 rounded-full h-2"
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <motion.div
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Form Content */}
      <section className="py-20 bg-gray-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 md:p-12">
            <form onSubmit={handleFormSubmit}>
              {renderStepContent()}

              {/* Honeypot — visually hidden from humans; bots fill it and the
                  server action silently drops the submission. */}
              <div
                aria-hidden="true"
                className="absolute -left-[9999px] h-px w-px overflow-hidden"
              >
                <label htmlFor="quote-website">Website</label>
                <input
                  type="text"
                  id="quote-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  defaultValue=""
                />
              </div>

              {/* Token field; renders an empty hidden input when Turnstile is
                  not configured, so the server-side check skips cleanly. */}
              <TurnstileField onTokenChange={setTurnstileToken} />

              {/* Navigation Buttons */}
              {currentStep <= totalSteps && (
                <div className="flex justify-between mt-12">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      currentStep === 1
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
                  >
                    <ArrowLeft size={18} aria-hidden="true" />
                    <span>Previous</span>
                  </motion.button>

                  <motion.button
                    type="submit"
                    whileHover={{
                      scale: pending || (currentStep < totalSteps && !stepIsValid) || turnstileMissing ? 1 : 1.05,
                    }}
                    whileTap={{
                      scale: pending || (currentStep < totalSteps && !stepIsValid) || turnstileMissing ? 1 : 0.95,
                    }}
                    disabled={
                      pending ||
                      turnstileMissing ||
                      (currentStep < totalSteps && !stepIsValid)
                    }
                    aria-busy={pending}
                    className={`flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      pending ||
                      turnstileMissing ||
                      (currentStep < totalSteps && !stepIsValid)
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:shadow-lg hover:shadow-blue-500/50"
                    }`}
                  >
                    <span>
                      {pending
                        ? "Sending…"
                        : currentStep === totalSteps
                          ? "Submit Quote Request"
                          : "Next"}
                    </span>
                    {pending ? (
                      <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                    ) : (
                      <ArrowRight size={18} aria-hidden="true" />
                    )}
                  </motion.button>
                </div>
              )}

              {state.status === "error" && currentStep === totalSteps && (
                <div
                  role="alert"
                  className="mt-6 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-1"
                >
                  <p>{state.message}</p>
                  {state.fieldErrors && (
                    <ul className="list-disc list-inside space-y-1">
                      {Object.entries(state.fieldErrors).map(([field, message]) => (
                        <li key={field}>{message}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {turnstileMissing && currentStep === totalSteps && (
                <p className="mt-4 text-sm text-amber-300 text-right">
                  Completing the security check is required before submitting.
                </p>
              )}

              {currentStep < totalSteps && !stepIsValid && (
                <p className="text-sm text-gray-500 mt-4 text-right">
                  Fill the required (*) fields to continue.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuoteForm;
