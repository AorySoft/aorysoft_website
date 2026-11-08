"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Users, Briefcase, CheckCircle } from "lucide-react";
import type { JobRow } from "@/lib/types";

// Audit fix: job cards had a dead "Learn More" affordance (onClick set state
// no modal ever consumed) — cards are now honest display items. Applications
// go through the mailto CTA, which is a real destination.
// NOTE: positions are placeholder seed content, replaceable via the admin
// panel (Phase 3) once real openings exist.
const benefits = [
  "Competitive salary and equity packages",
  "Comprehensive health, dental, and vision insurance",
  "Flexible remote-first work environment",
  "Unlimited PTO policy",
  "Professional development budget",
  "State-of-the-art equipment and tools",
  "Regular team building events",
  "Career growth and mentorship programs",
];

const placeholderPositions = [
  {
    id: 1,
    title: "Senior AI Engineer",
    department: "Engineering",
    location: "Remote / San Francisco",
    type: "Full-time",
    experience: "5+ years",
    description:
      "Lead the development of cutting-edge AI solutions and mentor junior engineers.",
  },
  {
    id: 2,
    title: "Frontend Developer",
    department: "Engineering",
    location: "Remote / New York",
    type: "Full-time",
    experience: "3+ years",
    description:
      "Build beautiful and responsive user interfaces for our AI-powered applications.",
  },
  {
    id: 3,
    title: "Data Scientist",
    department: "AI Research",
    location: "Remote / Austin",
    type: "Full-time",
    experience: "4+ years",
    description:
      "Analyze complex datasets and develop predictive models to drive business insights.",
  },
  {
    id: 4,
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Remote / Seattle",
    type: "Full-time",
    experience: "4+ years",
    description:
      "Build and maintain scalable infrastructure for our AI applications.",
  },
  {
    id: 5,
    title: "Product Manager",
    department: "Product",
    location: "Remote / Boston",
    type: "Full-time",
    experience: "5+ years",
    description:
      "Drive product strategy and roadmap for our AI-powered solutions.",
  },
  {
    id: 6,
    title: "UX/UI Designer",
    department: "Design",
    location: "Remote / Los Angeles",
    type: "Full-time",
    experience: "3+ years",
    description:
      "Create intuitive and engaging user experiences for our AI applications.",
  },
];

function capitalize(value: string | null): string {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toPosition(job: JobRow) {
  return {
    id: job.id,
    title: job.title,
    department: job.department ?? "—",
    location: job.location ?? "—",
    type: capitalize(job.type),
    experience: job.experience ?? "—",
    description: job.description ?? "",
  };
}

const CareersContent = ({
  jobs,
}: {
  jobs?: JobRow[] | null;
}) => {
  // null/undefined → Supabase not connected → placeholder listings.
  const openPositions =
    jobs && jobs.length > 0
      ? jobs.map(toPosition)
      : placeholderPositions;

  return (
    <div>
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
              Be part of a team that&apos;s shaping the future of AI.
              We&apos;re building the next generation of intelligent solutions
              and looking for passionate individuals to join our mission.
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
            <h2 className="text-4xl font-bold text-white mb-6">
              Why AorySoft?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We believe that great work comes from a great environment.
              Here&apos;s what we offer our team members.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 group hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="flex items-start space-x-3">
                  <CheckCircle
                    className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1"
                    aria-hidden="true"
                  />
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
            <h2 className="text-4xl font-bold text-white mb-6">
              Open Positions
            </h2>
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
                whileHover={{ y: -5 }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 group hover:border-cyan-500/50 transition-all duration-300 relative"
              >
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-200">
                      {job.title}
                    </h3>
                    <p className="text-gray-300">{job.description}</p>
                  </div>

                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Users size={16} aria-hidden="true" />
                      <span>{job.department}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} aria-hidden="true" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} aria-hidden="true" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase size={16} aria-hidden="true" />
                      <span>{job.experience}</span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
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
            <h2 className="text-4xl font-bold text-white">
              Don&apos;t See Your Role?
            </h2>
            <p className="text-xl text-gray-300">
              We&apos;re always interested in hearing from talented individuals.
              Send us your resume and let&apos;s explore how you can contribute
              to our mission.
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

export default CareersContent;
