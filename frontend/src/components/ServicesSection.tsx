import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Zap, BarChart3, Cloud, ArrowRight, X } from 'lucide-react';

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const services = [
    {
      icon: Bot,
      title: 'AI Automation',
      subtitle: 'Intelligent Process Automation',
      description: 'Transform your business operations with cutting-edge AI automation solutions.',
      features: [
        'Robotic Process Automation (RPA)',
        'Intelligent Document Processing',
        'Workflow Optimization',
        'Predictive Analytics',
        'Natural Language Processing',
      ],
      color: 'from-blue-600 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Smart Integrations',
      subtitle: 'Seamless System Connectivity',
      description: 'Connect disparate systems with intelligent integration solutions.',
      features: [
        'API Development & Integration',
        'Cloud Platform Connectivity',
        'Data Synchronization',
        'Legacy System Modernization',
        'Real-time Data Processing',
      ],
      color: 'from-purple-600 to-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Data Analytics',
      subtitle: 'Actionable Business Intelligence',
      description: 'Turn raw data into actionable insights with advanced analytics.',
      features: [
        'Business Intelligence Dashboards',
        'Predictive Modeling',
        'Data Visualization',
        'Machine Learning Models',
        'Custom Analytics Solutions',
      ],
      color: 'from-green-600 to-teal-500',
    },
    {
      icon: Cloud,
      title: 'Cloud Solutions',
      subtitle: 'Scalable Infrastructure',
      description: 'Build robust, scalable applications on modern cloud platforms.',
      features: [
        'Cloud Migration Services',
        'Serverless Architecture',
        'Container Orchestration',
        'DevOps Implementation',
        'Security & Compliance',
      ],
      color: 'from-orange-600 to-red-500',
    },
  ];

  return (
    <section id="services" className="py-20 bg-gray-900">
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
            Our Services
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive AI-powered solutions designed to accelerate your digital transformation 
            and unlock new possibilities for your business.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative group cursor-pointer"
              onClick={() => setSelectedService(index)}
            >
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 h-full group-hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-2">{service.title}</h3>
                <p className="text-cyan-400 text-sm font-medium mb-4">{service.subtitle}</p>
                <p className="text-gray-300 leading-relaxed mb-6">{service.description}</p>

                {/* Learn More Button */}
                <div className="flex items-center text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200">
                  <span className="text-sm font-medium">Learn More</span>
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </div>

                {/* Hover Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-gray-800 border border-gray-700 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${services[selectedService].color} rounded-xl flex items-center justify-center`}>
                    {React.createElement(services[selectedService].icon, { className: "w-6 h-6 text-white" })}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{services[selectedService].title}</h3>
                    <p className="text-cyan-400">{services[selectedService].subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                {services[selectedService].description}
              </p>

              <h4 className="text-lg font-semibold text-white mb-4">Key Features:</h4>
              <ul className="space-y-3">
                {services[selectedService].features.map((feature, idx) => (
                  <li key={idx} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 bg-gradient-to-r ${services[selectedService].color} rounded-full`} />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`mt-8 w-full bg-gradient-to-r ${services[selectedService].color} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300`}
              >
                Get Started with {services[selectedService].title}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ServicesSection;