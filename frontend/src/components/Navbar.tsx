import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Blog', path: '/blog' },
    { name: 'Team', path: '/team' },
    { name: 'Careers', path: '/careers' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleNavClick = (path: string, sectionId?: string) => {
    setIsMobileMenuOpen(false);
    
    if (sectionId) {
      // If we're not on home page, navigate to home first
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation to complete, then scroll
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        // Already on home page, just scroll
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      // Regular navigation
      navigate(path);
    }
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-gray-900/95 backdrop-blur-md shadow-2xl shadow-blue-500/20'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Zap className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                AorySoft
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <motion.div key={item.name} whileHover={{ scale: 1.05 }}>
                  {item.name === 'About' ? (
                    <button
                      onClick={() => handleNavClick('/', 'about')}
                      className="text-gray-300 hover:text-cyan-400 transition-colors duration-200 relative group"
                    >
                      {item.name}
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                    </button>
                  ) : item.name === 'Services' ? (
                    <button
                      onClick={() => handleNavClick('/', 'services')}
                      className="text-gray-300 hover:text-cyan-400 transition-colors duration-200 relative group"
                    >
                      {item.name}
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`transition-colors duration-200 relative group ${
                        location.pathname === item.path
                          ? 'text-cyan-400'
                          : 'text-gray-300 hover:text-cyan-400'
                      }`}
                    >
                      {item.name}
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                    </Link>
                  )}
                </motion.div>
              ))}
              </div>
            </div>

            {/* Get Quote Button */}
            <div className="hidden md:block">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/quote"
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                >
                  Get Quote
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <div key={item.name}>
                  {item.name === 'About' ? (
                    <button
                      onClick={() => handleNavClick('/', 'about')}
                      className="block text-gray-300 hover:text-cyan-400 transition-colors duration-200 w-full text-left"
                    >
                      {item.name}
                    </button>
                  ) : item.name === 'Services' ? (
                    <button
                      onClick={() => handleNavClick('/', 'services')}
                      className="block text-gray-300 hover:text-cyan-400 transition-colors duration-200 w-full text-left"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={`block transition-colors duration-200 ${
                        location.pathname === item.path
                          ? 'text-cyan-400'
                          : 'text-gray-300 hover:text-cyan-400'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              <Link
                to="/quote"
                onClick={() => handleNavClick('/quote')}
                className="block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-full text-center"
              >
                Get Quote
              </Link>
            </div>
          </motion.div>
        )}
      </motion.nav>
    </>
  );
};

export default Navbar;