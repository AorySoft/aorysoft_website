"use client";

import { motion } from "framer-motion";
import { Target, Eye, Heart } from "lucide-react";

// Audit fixes folded in:
// - "Team" value card removed (plan §12: no Team page, no Team references).
// - Unverified stats row (15+ team members / 50+ projects / 25+ clients)
//   removed until real numbers are confirmed (plan §12).
// - Founder's Message block removed entirely (owner decision, Phase 3):
//   no stock photo, no placeholder bio — nothing fabricated.
const values = [
  {
    icon: Target,
    title: "Mission",
    description:
      "To democratize AI technology and make intelligent automation accessible to businesses of all sizes.",
  },
  {
    icon: Eye,
    title: "Vision",
    description:
      "A world where AI amplifies human potential and creates sustainable competitive advantages.",
  },
  {
    icon: Heart,
    title: "Values",
    description:
      "Innovation, integrity, and impact drive everything we do. We believe in ethical AI solutions.",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-gray-800/50 backdrop-blur-sm scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
            About AorySoft
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We&apos;re not just another software company. We&apos;re AI-first
            innovators building the future of intelligent automation and
            seamless integrations.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center group hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <value.icon className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {value.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
