"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Mail, Phone, MapPin } from "lucide-react";

// Audit note (Phase 2): social icons and the newsletter mini-form were removed
// — they pointed at "#" / did nothing. They return with real URLs and the
// Phase 4 forms wiring. Legal links return in the SEO phase with real pages.
const quickLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/#about" },
  { name: "Services", path: "/#services" },
  { name: "Portfolio", path: "/#portfolio" },
];

const companyLinks = [
  { name: "Careers", path: "/careers" },
  { name: "Blog", path: "/blog" },
  { name: "Contact", path: "/contact" },
];

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                AorySoft
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-6">
              AI-first solutions for the future. We automate what others do
              manually, delivering intelligent integrations and automation
              solutions.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className="block text-gray-400 hover:text-cyan-400 transition-colors duration-200 text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Company + Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">Company</h3>
            <div className="space-y-2">
              {companyLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className="block text-gray-400 hover:text-cyan-400 transition-colors duration-200 text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            {/* TODO(Phase 0): replace with the real contact details. */}
            <div className="space-y-2 text-sm text-gray-400 pt-2">
              <div className="flex items-center space-x-2">
                <Mail size={16} aria-hidden="true" />
                <span>info@aorysoft.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} aria-hidden="true" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin size={16} className="mt-0.5" aria-hidden="true" />
                <span>123 Innovation Drive, Tech City, TC 12345</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} AorySoft. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
            >
              Terms of Use
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
