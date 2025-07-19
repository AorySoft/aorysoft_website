import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, MapPin, Clock } from 'lucide-react';

const CareersPreview = () => {
  const openPositions = [
    {
      title: 'Senior AI Engineer',
      location: 'Remote / San Francisco',
      type: 'Full-time',
      department: 'Engineering',
    },
    {
      title: 'Frontend Developer',
      location: 'Remote / New York',
      type: 'Full-time',
      department: 'Engineering',
    },
    {
      title: 'Data Scientist',
      location: 'Remote / Austin',
      type: 'Full-time',
      department: 'AI Research',
    },
  ];

  return (
    <section className="py-20 bg-gray-900">
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
            Join Our Team
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Be part of a team that's shaping the future of AI. We're looking for passionate 
            individuals who want to build the next generation of intelligent solutions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white">Why Work at AorySoft?</h3>
              
              <div className="space-y-4">
                {[
                  'Work with cutting-edge AI technologies',
                  'Flexible remote-first culture',
                  'Competitive salary and equity',
                  'Professional development opportunities',
                  'Health, dental, and vision insurance',
                  'Unlimited PTO policy',
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/careers"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
              >
                <span>View All Positions</span>
                <ArrowRight size={20} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Content - Open Positions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Open Positions</h3>
            
            <div className="space-y-4">
              {openPositions.map((position, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <h4 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors duration-200">
                        {position.title}
                      </h4>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{position.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{position.type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>{position.department}</span>
                        </div>
                      </div>
                    </div>
                    
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <ArrowRight size={20} />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* More Positions Link */}
            <div className="text-center pt-4">
              <Link
                to="/careers"
                className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 inline-flex items-center space-x-1"
              >
                <span>View all open positions</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CareersPreview;