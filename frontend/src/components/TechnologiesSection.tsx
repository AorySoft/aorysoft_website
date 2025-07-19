import React from 'react';
import { motion } from 'framer-motion';

const TechnologiesSection = () => {
  const technologies = [
    { name: 'Python', category: 'Backend', color: 'from-yellow-500 to-blue-500' },
    { name: 'React', category: 'Frontend', color: 'from-cyan-400 to-blue-500' },
    { name: 'TensorFlow', category: 'AI/ML', color: 'from-orange-500 to-red-500' },
    { name: 'Node.js', category: 'Backend', color: 'from-green-500 to-emerald-600' },
    { name: 'MongoDB', category: 'Database', color: 'from-green-600 to-green-700' },
    { name: 'AWS', category: 'Cloud', color: 'from-orange-400 to-yellow-500' },
    { name: 'Docker', category: 'DevOps', color: 'from-blue-500 to-cyan-500' },
    { name: 'TypeScript', category: 'Language', color: 'from-blue-600 to-blue-700' },
    { name: 'PostgreSQL', category: 'Database', color: 'from-blue-600 to-indigo-600' },
    { name: 'Redis', category: 'Cache', color: 'from-red-500 to-red-600' },
    { name: 'Kubernetes', category: 'DevOps', color: 'from-blue-500 to-purple-600' },
    { name: 'GraphQL', category: 'API', color: 'from-pink-500 to-purple-600' },
  ];

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
            We leverage cutting-edge technologies and frameworks to build robust, 
            scalable, and intelligent solutions that drive innovation.
          </p>
        </motion.div>

        {/* Orbiting Technologies */}
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

          {/* Technology Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.1, 
                  y: -10,
                  transition: { duration: 0.2 }
                }}
                className="group"
              >
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center group-hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Tech Icon/Circle */}
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
                  <h3 className="text-white font-semibold mb-2 relative z-10">{tech.name}</h3>
                  
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
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-30"
                initial={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                }}
                animate={{
                  x: [
                    Math.random() * 100 + '%',
                    Math.random() * 100 + '%',
                    Math.random() * 100 + '%',
                  ],
                  y: [
                    Math.random() * 100 + '%',
                    Math.random() * 100 + '%',
                    Math.random() * 100 + '%',
                  ],
                }}
                transition={{
                  duration: Math.random() * 20 + 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          {[
            { number: '15+', label: 'Technologies Mastered' },
            { number: '100%', label: 'Cloud Native Solutions' },
            { number: '24/7', label: 'Continuous Integration' },
          ].map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TechnologiesSection;