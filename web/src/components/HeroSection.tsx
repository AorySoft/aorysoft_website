"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

// Audit fixes folded in:
// - window-in-render particle math replaced with deterministic index-based
//   positions so the component can render on the server (Next.js).
// - Unverified stats (50+ projects / 95% satisfaction) replaced with
//   qualitative pillars until real numbers are confirmed (plan §12).
const particles = Array.from({ length: 50 }, (_, i) => ({
  key: i,
  left: (i * 37) % 100,
  top: (i * 61) % 100,
  dx: ((i * 17) % 40) - 20,
  dy: ((i * 23) % 40) - 20,
  duration: 10 + (i % 11),
}));

const pillars = ["AI Automation", "Intelligent Apps", "Cloud Solutions"];

const HeroSection = () => {
  const handleScrollToPortfolio = () => {
    const element = document.getElementById("portfolio");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-900 to-cyan-900">
        <div className="absolute inset-0 opacity-30">
          {/* Floating particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.key}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{ left: `${particle.left}%`, top: `${particle.top}%` }}
              initial={{ opacity: 0 }}
              animate={{
                x: [0, particle.dx],
                y: [0, particle.dy],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-blue-500/30 rounded-full px-6 py-2 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span className="text-cyan-300 text-sm font-medium">
              AI-Powered Innovation
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold leading-tight"
          >
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              AI-first solutions,
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              real-world impact
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            We automate what others do manually. From strategy to scale — AI,
            intelligent apps, and cloud solutions that transform businesses.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/quote"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
              >
                <span>Get a Quote</span>
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleScrollToPortfolio}
              className="inline-flex items-center space-x-2 border border-cyan-400 text-cyan-400 px-8 py-4 rounded-full text-lg font-semibold hover:bg-cyan-400/10 transition-all duration-300"
            >
              <span>View Portfolio</span>
              <Zap size={20} aria-hidden="true" />
            </motion.button>
          </motion.div>

          {/* Service pillars (replaced unverified stat numbers) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 max-w-4xl mx-auto"
          >
            {pillars.map((pillar) => (
              <div
                key={pillar}
                className="inline-flex items-center space-x-2 bg-gray-900/40 border border-gray-700/60 backdrop-blur-sm rounded-full px-6 py-2"
              >
                <div className="w-2 h-2 bg-cyan-400 rounded-full" aria-hidden="true" />
                <span className="text-gray-300 font-medium">{pillar}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-cyan-400 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-cyan-400 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
