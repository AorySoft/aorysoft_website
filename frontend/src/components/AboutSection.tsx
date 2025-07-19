import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, Users } from 'lucide-react';

const AboutSection = () => {
  const values = [
    {
      icon: Target,
      title: 'Mission',
      description: 'To democratize AI technology and make intelligent automation accessible to businesses of all sizes.',
    },
    {
      icon: Eye,
      title: 'Vision',
      description: 'A world where AI amplifies human potential and creates sustainable competitive advantages.',
    },
    {
      icon: Heart,
      title: 'Values',
      description: 'Innovation, integrity, and impact drive everything we do. We believe in ethical AI solutions.',
    },
    {
      icon: Users,
      title: 'Team',
      description: 'A diverse group of AI engineers, developers, and strategists passionate about transforming industries.',
    },
  ];

  return (
    <section id="about" className="py-20 bg-gray-800/50 backdrop-blur-sm">
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
            We're not just another software company. We're AI-first innovators building 
            the future of intelligent automation and seamless integrations.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center group hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <value.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
              <p className="text-gray-400 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Founder's Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-gray-900/80 to-blue-900/20 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 md:p-12"
        >
          <div className="flex flex-col lg:flex-row items-center space-y-8 lg:space-y-0 lg:space-x-12">
            {/* Founder's Image */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0"
            >
              <div className="w-64 h-64 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 p-1">
                <img
                  src="https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Founder"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </motion.div>

            {/* Message Content */}
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-3xl font-bold text-white mb-6">Founder's Message</h3>
              <blockquote className="text-lg text-gray-300 leading-relaxed mb-6 italic">
                "We created AorySoft to help organizations unlock their AI potential — from automation 
                to innovation. In a world where technology moves at lightning speed, we believe that 
                intelligent solutions shouldn't be a luxury reserved for tech giants. Every business 
                deserves access to AI-powered tools that can transform their operations, enhance their 
                customer experiences, and drive sustainable growth."
              </blockquote>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-cyan-400">Talha Ahmed Hashmi</p>
                <p className="text-gray-400">Founder & CEO, AorySoft</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Company Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { number: '2024', label: 'Founded' },
            { number: '15+', label: 'Team Members' },
            { number: '50+', label: 'Projects Completed' },
            { number: '25+', label: 'Happy Clients' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <motion.div
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2"
              >
                {stat.number}
              </motion.div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;