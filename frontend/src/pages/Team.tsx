import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Github, Twitter } from 'lucide-react';

const Team = () => {
  const teamMembers = [
    {
      name: 'Talha Ahmed Hashmi',
      role: 'Founder & CEO',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Visionary leader with 8+ years in AI and automation. Passionate about democratizing AI technology and building solutions that create meaningful impact.',
      expertise: ['AI Strategy', 'Product Vision', 'Business Development'],
      social: {
        linkedin: '#',
        github: '#',
        twitter: '#',
      },
    },
    {
      name: 'Sabih ul Hassan',
      role: 'Founder & CEO',
      image: 'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Technical architect and AI researcher with deep expertise in machine learning and scalable systems. Drives innovation and technical excellence across all projects.',
      expertise: ['Machine Learning', 'System Architecture', 'AI Research'],
      social: {
        linkedin: '#',
        github: '#',
        twitter: '#',
      },
    },
    {
      name: 'Abbas Ghori',
      role: 'Senior AI Engineer & COO',
      image: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Operations expert and senior engineer specializing in AI implementation and process optimization. Ensures seamless project delivery and operational excellence.',
      expertise: ['AI Engineering', 'Operations Management', 'Process Optimization'],
      social: {
        linkedin: '#',
        github: '#',
        twitter: '#',
      },
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-gray-900 to-cyan-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              Meet Our Team
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The brilliant minds behind AorySoft's AI-powered innovations. 
              Our diverse team combines technical expertise with creative vision to deliver exceptional results.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`flex flex-col ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } items-center gap-12`}
              >
                {/* Image */}
                <div className="flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <div className="w-80 h-80 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 p-1">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl opacity-20 -z-10" />
                    <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full opacity-20 -z-10" />
                  </motion.div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left space-y-6">
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-2">{member.name}</h2>
                    <p className="text-xl text-cyan-400 font-semibold">{member.role}</p>
                  </div>

                  <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
                    {member.bio}
                  </p>

                  {/* Expertise */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Expertise</h3>
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                      {member.expertise.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="bg-gray-800 border border-gray-700 text-cyan-400 px-4 py-2 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex space-x-4 justify-center lg:justify-start">
                    <motion.a
                      href={member.social.linkedin}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                    >
                      <Linkedin size={20} />
                    </motion.a>
                    <motion.a
                      href={member.social.github}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                    >
                      <Github size={20} />
                    </motion.a>
                    <motion.a
                      href={member.social.twitter}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 bg-gray-800 hover:bg-blue-500 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                    >
                      <Twitter size={20} />
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold text-white">Want to Join Our Team?</h2>
            <p className="text-xl text-gray-300">
              We're always looking for talented individuals who share our passion for AI innovation.
            </p>
            <motion.a
              href="/careers"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
            >
              View Open Positions
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Team;