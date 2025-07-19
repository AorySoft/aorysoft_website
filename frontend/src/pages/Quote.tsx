import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Upload, ArrowRight, ArrowLeft } from 'lucide-react';

const Quote = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Project Details
    projectType: '',
    budget: '',
    timeline: '',
    description: '',
    
    // Step 2: Technical Requirements
    technologies: [],
    integrations: [],
    scalability: '',
    
    // Step 3: Contact Information
    name: '',
    email: '',
    company: '',
    phone: '',
    
    // Step 4: Additional Information
    files: [],
    additionalNotes: '',
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const projectTypes = [
    'AI/ML Development',
    'Process Automation',
    'Data Analytics',
    'Web Application',
    'Mobile Application',
    'Cloud Migration',
    'API Integration',
    'Custom Software',
  ];

  const budgetRanges = [
    'Under $10,000',
    '$10,000 - $25,000',
    '$25,000 - $50,000',
    '$50,000 - $100,000',
    '$100,000+',
    'Let\'s discuss',
  ];

  const timelineOptions = [
    '1-3 months',
    '3-6 months',
    '6-12 months',
    '12+ months',
    'Flexible',
  ];

  const techOptions = [
    'Python', 'JavaScript', 'React', 'Node.js', 'TensorFlow', 'PyTorch',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL',
  ];

  const integrationOptions = [
    'CRM Systems', 'ERP Systems', 'Payment Gateways', 'Social Media APIs',
    'Marketing Tools', 'Analytics Platforms', 'Email Services', 'Cloud Storage',
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value],
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log('Quote request submitted:', formData);
    setCurrentStep(5); // Success step
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Project Details</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    What type of project are you looking to build? *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {projectTypes.map((type) => (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleInputChange('projectType', type)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          formData.projectType === type
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                        }`}
                      >
                        {type}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    What's your budget range? *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {budgetRanges.map((range) => (
                      <motion.button
                        key={range}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleInputChange('budget', range)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          formData.budget === range
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                        }`}
                      >
                        {range}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Project timeline *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {timelineOptions.map((timeline) => (
                      <motion.button
                        key={timeline}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleInputChange('timeline', timeline)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          formData.timeline === timeline
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                        }`}
                      >
                        {timeline}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-3">
                    Project description *
                  </label>
                  <textarea
                    id="description"
                    rows={6}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 resize-none"
                    placeholder="Tell us about your project goals, requirements, and any specific features you need..."
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Technical Requirements</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Preferred technologies (select all that apply)
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {techOptions.map((tech) => (
                      <motion.button
                        key={tech}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleArrayToggle('technologies', tech)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          formData.technologies.includes(tech)
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                        }`}
                      >
                        {tech}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Required integrations (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {integrationOptions.map((integration) => (
                      <motion.button
                        key={integration}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleArrayToggle('integrations', integration)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          formData.integrations.includes(integration)
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                        }`}
                      >
                        {integration}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Scalability requirements
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['Small scale (< 1K users)', 'Medium scale (1K-10K users)', 'Large scale (10K+ users)'].map((scale) => (
                      <motion.button
                        key={scale}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleInputChange('scalability', scale)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          formData.scalability === scale
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                        }`}
                      >
                        {scale}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Additional Information</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Upload project files (optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-cyan-500/50 transition-colors duration-200">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">Drag and drop files here, or click to select</p>
                    <p className="text-gray-500 text-sm">PDF, DOC, DOCX, TXT up to 10MB each</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-4 bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    >
                      Choose Files
                    </motion.button>
                  </div>
                </div>

                <div>
                  <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-300 mb-2">
                    Additional notes or requirements
                  </label>
                  <textarea
                    id="additionalNotes"
                    rows={6}
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 resize-none"
                    placeholder="Any specific requirements, constraints, or questions you'd like to discuss..."
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">Quote Request Submitted!</h3>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Thank you for your interest in AorySoft. We've received your quote request and 
                our team will review it carefully. You can expect to hear from us within 24 hours.
              </p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 max-w-md mx-auto">
              <h4 className="text-lg font-semibold text-white mb-3">What happens next?</h4>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <span className="text-gray-300">We'll review your requirements</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                  <span className="text-gray-300">Schedule a consultation call</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                  <span className="text-gray-300">Provide detailed proposal</span>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-gray-900 to-cyan-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              Get Your Quote
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tell us about your project and we'll provide you with a detailed proposal. 
              Our multi-step form helps us understand your needs better.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Progress Bar */}
      {currentStep <= totalSteps && (
        <section className="py-8 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Form Content */}
      <section className="py-20 bg-gray-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 md:p-12">
            {renderStepContent()}

            {/* Navigation Buttons */}
            {currentStep <= totalSteps && (
              <div className="flex justify-between mt-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    currentStep === 1
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  <ArrowLeft size={18} />
                  <span>Previous</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={currentStep === totalSteps ? handleSubmit : nextStep}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                >
                  <span>{currentStep === totalSteps ? 'Submit Quote Request' : 'Next'}</span>
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Quote;