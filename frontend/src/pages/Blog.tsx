import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import InsightSearch from '../components/InsightSearch';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'The Future of AI in Business Automation',
      excerpt: 'Explore how artificial intelligence is revolutionizing business processes and creating new opportunities for efficiency and growth.',
      author: 'Talha Ahmed Hashmi',
      date: '2024-01-15',
      readTime: '8 min read',
      category: 'AI & Automation',
      image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
      featured: true,
    },
    {
      id: 2,
      title: 'Building Scalable AI Solutions with Cloud Infrastructure',
      excerpt: 'Learn best practices for deploying AI applications at scale using modern cloud platforms and containerization technologies.',
      author: 'Sabih ul Hassan',
      date: '2024-01-10',
      readTime: '12 min read',
      category: 'Cloud & Infrastructure',
      image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
      featured: false,
    },
    {
      id: 3,
      title: 'Machine Learning Model Optimization Techniques',
      excerpt: 'Discover advanced techniques for optimizing machine learning models for better performance and reduced computational costs.',
      author: 'Abbas Ghori',
      date: '2024-01-05',
      readTime: '10 min read',
      category: 'Machine Learning',
      image: 'https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=800',
      featured: false,
    },
    {
      id: 4,
      title: 'Data Privacy in AI: Best Practices and Compliance',
      excerpt: 'Understanding the importance of data privacy in AI systems and implementing best practices for compliance and security.',
      author: 'Talha Ahmed Hashmi',
      date: '2023-12-28',
      readTime: '6 min read',
      category: 'Privacy & Security',
      image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
      featured: false,
    },
    {
      id: 5,
      title: 'Real-time Analytics with AI: A Complete Guide',
      excerpt: 'Implementing real-time analytics solutions using AI and machine learning for instant business insights and decision making.',
      author: 'Sabih ul Hassan',
      date: '2023-12-20',
      readTime: '9 min read',
      category: 'Analytics',
      image: 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=800',
      featured: false,
    },
    {
      id: 6,
      title: 'The Role of Natural Language Processing in Modern Applications',
      excerpt: 'Exploring how NLP is transforming user interactions and enabling more intuitive human-computer interfaces.',
      author: 'Abbas Ghori',
      date: '2023-12-15',
      readTime: '7 min read',
      category: 'NLP',
      image: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800',
      featured: false,
    },
  ];

  const categories = ['All', 'AI & Automation', 'Cloud & Infrastructure', 'Machine Learning', 'Analytics', 'Privacy & Security', 'NLP'];
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

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
              AorySoft Blog
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Insights, tutorials, and thoughts on AI, automation, and the future of technology. 
              Stay updated with the latest trends and best practices in intelligent software development.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Live web search */}
      <InsightSearch />

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-8">Featured Article</h2>
            </motion.div>

            <motion.article
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-3xl overflow-hidden group hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative h-64 lg:h-auto">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  </div>
                </div>
                
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full">
                        {featuredPost.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{featuredPost.readTime}</span>
                      </div>
                    </div>

                    <h3 className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-200">
                      {featuredPost.title}
                    </h3>

                    <p className="text-gray-300 text-lg leading-relaxed">
                      {featuredPost.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-gray-400" />
                        <span className="text-gray-400">By {featuredPost.author}</span>
                      </div>
                      
                      <motion.button
                        whileHover={{ x: 5 }}
                        className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                      >
                        <span>Read More</span>
                        <ArrowRight size={18} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4"
          >
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.filter(post => !post.featured).map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden group hover:border-cyan-500/50 transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-gray-900/80 backdrop-blur-sm text-cyan-400 px-3 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-200 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-2">
                      <User size={14} className="text-gray-400" />
                      <span className="text-gray-400 text-sm">{post.author}</span>
                    </div>
                    
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <ArrowRight size={16} />
                    </motion.div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-gray-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gray-900/80 to-blue-900/20 backdrop-blur-sm border border-gray-700 rounded-3xl p-12 space-y-8"
          >
            <h2 className="text-4xl font-bold text-white">Stay Updated</h2>
            <p className="text-xl text-gray-300">
              Subscribe to our newsletter to get the latest insights on AI, automation, and technology trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Blog;