import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';

const Careers = () => {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  const benefits = [
    'Competitive salary and equity packages',
    'Comprehensive health, dental, and vision insurance',
    'Flexible remote-first work environment',
    'Unlimited PTO policy',
    'Professional development budget',
    'State-of-the-art equipment and tools',
    'Regular team building events',
    'Career growth and mentorship programs',
  ];

  const openPositions = [
    {
      id: 1,
      title: 'Senior AI Engineer',
      department: 'Engineering',
      location: 'Remote / San Francisco',
      type: 'Full-time',
      experience: '5+ years',
      description: 'Lead the development of cutting-edge AI solutions and mentor junior engineers.',
      requirements: [
        'Master\'s degree in Computer Science, AI, or related field',
        '5+ years of experience in AI/ML development',
        'Proficiency in Python, TensorFlow, PyTorch',
        'Experience with cloud platforms (AWS, GCP, Azure)',
        'Strong problem-solving and communication skills',
      ],
      responsibilities: [
        'Design and implement AI algorithms and models',
        'Lead technical architecture decisions',
        'Mentor junior team members',
        'Collaborate with cross-functional teams',
        'Stay updated with latest AI research and technologies',
      ],
    },
    {
      id: 2,
      title: 'Frontend Developer',
      department: 'Engineering',
      location: 'Remote / New York',
      type: 'Full-time',
      experience: '3+ years',
      description: 'Build beautiful and responsive user interfaces for our AI-powered applications.',
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '3+ years of frontend development experience',
        'Expertise in React, TypeScript, and modern CSS',
        'Experience with responsive design and accessibility',
        'Knowledge of state management libraries',
      ],
      responsibilities: [
        'Develop responsive web applications',
        'Collaborate with designers and backend developers',
        'Optimize applications for performance',
        'Implement best practices for code quality',
        'Participate in code reviews and team meetings',
      ],
    },
    {
      id: 3,
      title: 'Data Scientist',
      department: 'AI Research',
      location: 'Remote / Austin',
      type: 'Full-time',
      experience: '4+ years',
      description: 'Analyze complex datasets and develop predictive models to drive business insights.',
      requirements: [
        'PhD or Master\'s in Data Science, Statistics, or related field',
        '4+ years of experience in data science',
        'Proficiency in Python, R, SQL',
        'Experience with machine learning frameworks',
        'Strong statistical analysis skills',
      ],
      responsibilities: [
        'Analyze large datasets and extract insights',
        'Develop and validate predictive models',
        'Create data visualizations and reports',
        'Collaborate with engineering teams',
        'Present findings to stakeholders',
      ],
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      department: 'Infrastructure',
      location: 'Remote / Seattle',
      type: 'Full-time',
      experience: '4+ years',
      description: 'Build and maintain scalable infrastructure for our AI applications.',
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '4+ years of DevOps experience',
        'Experience with Docker, Kubernetes, CI/CD',
        'Knowledge of cloud platforms and monitoring tools',
        'Strong scripting and automation skills',
      ],
      responsibilities: [
        'Design and implement CI/CD pipelines',
        'Manage cloud infrastructure and deployments',
        'Monitor system performance and reliability',
        'Automate routine operational tasks',
        'Ensure security and compliance standards',
      ],
    },
    {
      id: 5,
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote / Boston',
      type: 'Full-time',
      experience: '5+ years',
      description: 'Drive product strategy and roadmap for our AI-powered solutions.',
      requirements: [
        'MBA or equivalent experience',
        '5+ years of product management experience',
        'Experience with AI/ML products',
        'Strong analytical and communication skills',
        'Customer-focused mindset',
      ],
      responsibilities: [
        'Define product vision and strategy',
        'Collaborate with engineering and design teams',
        'Conduct market research and user interviews',
        'Manage product roadmap and priorities',
        'Track product metrics and performance',
      ],
    },
    {
      id: 6,
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Remote / Los Angeles',
      type: 'Full-time',
      experience: '3+ years',
      description: 'Create intuitive and engaging user experiences for our AI applications.',
      requirements: [
        'Bachelor\'s degree in Design or related field',
        '3+ years of UX/UI design experience',
        'Proficiency in Figma, Sketch, or similar tools',
        'Experience with design systems and prototyping',
        'Understanding of user research methodologies',
      ],
      responsibilities: [
        'Design user interfaces and experiences',
        'Create wireframes, prototypes, and mockups',
        'Conduct user research and usability testing',
        'Collaborate with product and engineering teams',
        'Maintain and evolve design systems',
      ],
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
              Join Our Team
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Be part of a team that's shaping the future of AI. We're building the next generation 
              of intelligent solutions and looking for passionate individuals to join our mission.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Why AorySoft?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We believe that great work comes from a great environment. Here's what we offer our team members.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 group hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-200">
                    {benefit}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Open Positions</h2>
            <p className="text-xl text-gray-300">
              Find your next challenge and grow with us.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {openPositions.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, rotateY: 5 }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 group hover:border-cyan-500/50 transition-all duration-300 cursor-pointer relative preserve-3d"
                onClick={() => setSelectedJob(job.id)}
              >
                {/* Front Face */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-200">
                      {job.title}
                    </h3>
                    <p className="text-gray-300">{job.description}</p>
                  </div>

                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Users size={16} />
                      <span>{job.department}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase size={16} />
                      <span>{job.experience}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className="text-cyan-400 font-semibold">Learn More</span>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <ArrowRight size={20} />
                    </motion.div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold text-white">Don't See Your Role?</h2>
            <p className="text-xl text-gray-300">
              We're always interested in hearing from talented individuals. 
              Send us your resume and let's explore how you can contribute to our mission.
            </p>
            <motion.a
              href="mailto:careers@aorysoft.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
            >
              Send Your Resume
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Careers;