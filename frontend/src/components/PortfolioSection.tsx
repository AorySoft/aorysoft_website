import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight, Calendar, Tag } from 'lucide-react';

const PortfolioSection = () => {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  const projects = [
    {
      title: 'HealthCare AI Platform',
      sector: 'Healthcare',
      description: 'Advanced AI-powered patient management system with predictive analytics and automated workflows.',
      image: 'https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg?auto=compress&cs=tinysrgb&w=800',
      technologies: ['Python', 'TensorFlow', 'React', 'AWS'],
      completion: '2024',
      metrics: ['40% reduction in processing time', '95% accuracy rate', '50K+ patients managed'],
    },
    {
      title: 'RetailBot Intelligence',
      sector: 'E-commerce',
      description: 'Intelligent chatbot and recommendation engine that increased sales by 35% through personalized customer interactions.',
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      technologies: ['Node.js', 'MongoDB', 'NLP', 'Azure'],
      completion: '2024',
      metrics: ['35% increase in sales', '60% faster response time', '85% customer satisfaction'],
    },
    {
      title: 'FinTech Analytics Suite',
      sector: 'Financial Services',
      description: 'Real-time financial analytics and fraud detection system processing millions of transactions daily.',
      image: 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=800',
      technologies: ['Python', 'Apache Kafka', 'Redis', 'GCP'],
      completion: '2023',
      metrics: ['99.9% fraud detection rate', '2ms response time', '$2M+ fraud prevented'],
    },
  ];

  return (
    <section id="portfolio" className="py-20 bg-gray-800/30 backdrop-blur-sm">
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
            Featured Projects
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore our latest AI-powered solutions that have transformed businesses 
            across industries and delivered measurable results.
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              onHoverStart={() => setHoveredProject(index)}
              onHoverEnd={() => setHoveredProject(null)}
              className="group cursor-pointer"
            >
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden group-hover:border-cyan-500/50 transition-all duration-300">
                {/* Project Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                  
                  {/* Hover Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredProject === index ? 1 : 0 }}
                    className="absolute inset-0 bg-blue-600/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-white/30 transition-all duration-200"
                    >
                      <span>View Case Study</span>
                      <ExternalLink size={18} />
                    </motion.button>
                  </motion.div>

                  {/* Sector Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-cyan-500/80 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                      {project.sector}
                    </span>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-200">
                      {project.title}
                    </h3>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar size={14} className="mr-1" />
                      {project.completion}
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4 leading-relaxed text-sm">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="bg-gray-800 text-cyan-400 px-2 py-1 rounded-lg text-xs font-medium border border-gray-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Key Metrics */}
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-400 text-sm mb-2">
                      <Tag size={14} className="mr-1" />
                      <span>Key Results:</span>
                    </div>
                    {project.metrics.slice(0, 2).map((metric, metricIndex) => (
                      <div key={metricIndex} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2" />
                        <span className="text-gray-300">{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View Full Portfolio Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
          >
            <span>View Full Portfolio</span>
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default PortfolioSection;