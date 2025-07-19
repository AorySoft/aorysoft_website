import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ShoppingCart, Heart, Banknote, GraduationCap, Factory } from 'lucide-react';

const IndustriesSection = () => {
  const industries = [
    {
      icon: Heart,
      title: 'Healthcare',
      description: 'AI-powered patient management, diagnostic tools, and healthcare automation solutions.',
      projects: '12+ Projects',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: ShoppingCart,
      title: 'E-commerce & Retail',
      description: 'Intelligent recommendation engines, inventory management, and customer analytics.',
      projects: '18+ Projects',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Banknote,
      title: 'Financial Services',
      description: 'Fraud detection, algorithmic trading, and risk assessment solutions.',
      projects: '8+ Projects',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Building2,
      title: 'Real Estate',
      description: 'Property valuation, market analysis, and automated property management.',
      projects: '6+ Projects',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: GraduationCap,
      title: 'Education',
      description: 'Personalized learning platforms, student analytics, and educational automation.',
      projects: '10+ Projects',
      color: 'from-orange-500 to-yellow-500',
    },
    {
      icon: Factory,
      title: 'Manufacturing',
      description: 'Predictive maintenance, quality control, and supply chain optimization.',
      projects: '5+ Projects',
      color: 'from-gray-600 to-gray-700',
    },
  ];

  return (
    <section id="industries" className="py-20 bg-gray-800/30 backdrop-blur-sm">
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
            Industries We Serve
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From healthcare to fintech, we deliver AI-powered solutions across diverse industries, 
            helping businesses transform their operations and achieve sustainable growth.
          </p>
        </motion.div>

        {/* Industries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {industries.map((industry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 h-full group-hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${industry.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${industry.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                  <industry.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-200">
                    {industry.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {industry.description}
                  </p>

                  {/* Project Count */}
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-semibold text-sm">
                      {industry.projects}
                    </span>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      →
                    </motion.div>
                  </div>
                </div>

                {/* Bottom Border Effect */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${industry.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Industry Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-gray-900/80 to-blue-900/20 backdrop-blur-sm border border-gray-700 rounded-3xl p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '6+', label: 'Industries Served' },
              { number: '59+', label: 'Total Projects' },
              { number: '98%', label: 'Success Rate' },
              { number: '4.9/5', label: 'Client Rating' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="space-y-2"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default IndustriesSection;