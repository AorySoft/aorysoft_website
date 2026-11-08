"use client";

import { motion } from "framer-motion";

// Audit fixes: window-free deterministic floating dots (SSR-safe) and the
// unverified bottom stats row (15+ / 100% / 24-7) removed (plan §12).
const technologies = [
  { name: "Python", category: "Backend", color: "from-yellow-500 to-blue-500" },
  { name: "React", category: "Frontend", color: "from-cyan-400 to-blue-500" },
  { name: "TensorFlow", category: "AI/ML", color: "from-orange-500 to-red-500" },
  { name: "Node.js", category: "Backend", color: "from-green-500 to-emerald-600" },
  { name: "MongoDB", category: "Database", color: "from-green-600 to-green-700" },
  { name: "AWS", category: "Cloud", color: "from-orange-400 to-yellow-500" },
  { name: "Docker", category: "DevOps", color: "from-blue-500 to-cyan-500" },
  { name: "TypeScript", category: "Language", color: "from-blue-600 to-blue-700" },
  { name: "PostgreSQL", category: "Database", color: "from-blue-600 to-indigo-600" },
  { name: "Redis", category: "Cache", color: "from-red-500 to-red-600" },
  { name: "Kubernetes", category: "DevOps", color: "from-blue-500 to-purple-600" },
  { name: "GraphQL", category: "API", color: "from-pink-500 to-purple-600" },
];

const floatingDots = Array.from({ length: 8 }, (_, i) => ({
  key: i,
  x1: (i * 29) % 100,
  y1: (i * 43) % 100,
  x2: (i * 67) % 100,
  y2: (i * 13) % 100,
  x3: (i * 31) % 100,
  y3: (i * 71) % 100,
  duration: 20 + (i * 3),
}));

const TechnologiesSection = () => {
  return (
    <section id="technologies" className="py-20 bg-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
            Our Technology Stack
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We leverage cutting-edge technologies and frameworks to build
            robust, scalable, and intelligent solutions that drive innovation.
          </p>
        </motion.div>

        {/* Technology Grid */}
        <div className="relative">
          {/* Central Hub */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="w-32 h-32 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-16 relative z-10"
          >
            <span className="text-white font-bold text-lg">AI Core</span>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {technologies.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.1,
                  y: -10,
                  transition: { duration: 0.2 },
                }}
                className="group"
              >
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center group-hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden">
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  {/* Tech Circle */}
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 bg-gradient-to-r ${tech.color} rounded-full flex items-center justify-center mx-auto mb-4 relative z-10`}
                  >
                    <span className="text-white font-bold text-sm">
                      {tech.name.substring(0, 2).toUpperCase()}
                    </span>
                  </motion.div>

                  {/* Tech Name */}
                  <h3 className="text-white font-semibold mb-2 relative z-10">
                    {tech.name}
                  </h3>

                  {/* Category Badge */}
                  <span className="inline-block bg-gray-700 text-cyan-400 text-xs px-3 py-1 rounded-full relative z-10">
                    {tech.category}
                  </span>

                  {/* Hover Effect Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Floating Elements */}
          <div className="absolute inset-0 pointer-events-none">
            {floatingDots.map((dot) => (
              <motion.div
                key={dot.key}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-30"
                initial={{ x: `${dot.x1}%`, y: `${dot.y1}%` }}
                animate={{
                  x: [`${dot.x1}%`, `${dot.x2}%`, `${dot.x3}%`],
                  y: [`${dot.y1}%`, `${dot.y2}%`, `${dot.y3}%`],
                }}
                transition={{
                  duration: dot.duration,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnologiesSection;
