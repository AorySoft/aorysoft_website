"use client";

import { useActionState, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from "lucide-react";
import TurnstileField from "@/components/TurnstileField";
import { submitContact } from "@/lib/public-forms/actions";
import { idleFormState } from "@/lib/public-forms/state";

// The form posts to the server action, which runs the full §7 pipeline:
// honeypot → Turnstile → rate limit → validation → service-role insert →
// Resend notification. The browser never sees the service key or the Resend
// key; failures come back as a generic, visitor-safe message.
type FormData = {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
};

// TODO(Phase 0): replace with the real contact details.
const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    details: "info@aorysoft.com",
    subdesc: "We respond within 24 hours",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: "+1 (555) 123-4567",
    subdesc: "Mon-Fri from 8am to 5pm",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    details: "123 Innovation Drive, Tech City, TC 12345",
    subdesc: "Our headquarters",
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: "Monday - Friday: 8:00 AM - 5:00 PM",
    subdesc: "Saturday: 9:00 AM - 1:00 PM",
  },
];

const ContactContent = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });
  const [state, formAction, pending] = useActionState(
    submitContact,
    idleFormState,
  );
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Turnstile token arrives from the widget; empty when unconfigured.
  const turnstileConfigured = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
  const turnstileMissing = turnstileConfigured && !turnstileToken;
  const inputClasses =
    "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200";

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-gray-900 to-cyan-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              Get In Touch
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ready to transform your business with AI? Let&apos;s discuss your
              project and explore how AorySoft can help you achieve your goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center group hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <info.icon className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {info.title}
                </h3>
                <p className="text-gray-300 mb-2">{info.details}</p>
                <p className="text-gray-500 text-sm">{info.subdesc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Office Info */}
      <section className="py-20 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-8">
                <h2 className="text-3xl font-bold text-white mb-8">
                  Send us a message
                </h2>
                <form action={formAction} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className={inputClasses}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className={inputClasses}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className={inputClasses}
                      placeholder="Your Company"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={inputClasses}
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="project">Project Discussion</option>
                      <option value="partnership">Partnership</option>
                      <option value="support">Support</option>
                      <option value="careers">Careers</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className={`${inputClasses} resize-none`}
                      placeholder="Tell us about your project..."
                    />
                  </div>

                  <TurnstileField onTokenChange={setTurnstileToken} />

                  {/* Honeypot: hidden from humans, bots tend to fill it.
                      The server action treats a filled honeypot as success
                      without writing anything. */}
                  <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
                    <label htmlFor="contact-website">Website</label>
                    <input
                      type="text"
                      id="contact-website"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      defaultValue=""
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: pending || turnstileMissing ? 1 : 1.02 }}
                    whileTap={{ scale: pending || turnstileMissing ? 1 : 0.98 }}
                    disabled={pending || turnstileMissing}
                    aria-busy={pending}
                    className={`w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                      pending || turnstileMissing
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:shadow-2xl hover:shadow-blue-500/50"
                    }`}
                  >
                    {pending ? (
                      <>
                        <Loader2 className="animate-spin" size={20} aria-hidden="true" />
                        <span>Sending…</span>
                      </>
                    ) : (
                      <>
                        <Send size={20} aria-hidden="true" />
                        <span>Send Message</span>
                      </>
                    )}
                  </motion.button>

                  {turnstileMissing && (
                    <p className="text-sm text-amber-300">
                      Completing the security check is required before sending.
                    </p>
                  )}

                  {state.status === "error" && (
                    <div
                      role="alert"
                      className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-1"
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

                  {state.status === "success" && (
                    <p
                      role="status"
                      className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4"
                    >
                      {state.message}
                    </p>
                  )}
                </form>
              </div>
            </motion.div>

            {/* Map/Office Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Map Placeholder */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin
                    className="w-16 h-16 text-cyan-400 mx-auto mb-4"
                    aria-hidden="true"
                  />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Our Location
                  </h3>
                  <p className="text-gray-300">123 Innovation Drive</p>
                  <p className="text-gray-300">Tech City, TC 12345</p>
                </div>
              </div>

              {/* Office Hours */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Office Hours
                </h3>
                <div className="space-y-4">
                  {[
                    { day: "Monday - Friday", hours: "8:00 AM - 5:00 PM" },
                    { day: "Saturday", hours: "9:00 AM - 1:00 PM" },
                    { day: "Sunday", hours: "Closed" },
                  ].map((schedule) => (
                    <div
                      key={schedule.day}
                      className="flex justify-between items-center py-2"
                    >
                      <span className="text-gray-300">{schedule.day}</span>
                      <span className="text-cyan-400 font-semibold">
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Contact */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Need Immediate Help?
                </h3>
                <p className="text-gray-300 mb-6">
                  For urgent matters or immediate assistance, don&apos;t
                  hesitate to call us directly.
                </p>
                <motion.a
                  href="tel:+15551234567"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                >
                  <Phone size={18} aria-hidden="true" />
                  <span>Call Now</span>
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactContent;
