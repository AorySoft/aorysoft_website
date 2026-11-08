-- AorySoft — Seed data (plan §13 step 5): placeholder content approved by the
-- owner to mirror the current frontend/ site. Idempotent: safe to re-run
-- (unique slugs and the site_settings id guard duplicates).
-- Apply AFTER 0001_schema.sql, 0002_rls.sql, 0003_storage.sql.
--
-- Note: the six blog posts are seeded as DRAFTS (placeholders the owner can
-- review/edit/publish from /admin). Jobs are seeded active to match the
-- currently-shown frontend listings.

-- ── site settings (single row; hero/about/industries/tech/footer copy) ──
insert into public.site_settings (id, data)
values (
  true,
  '{
    "heroBadge": "AI-Powered Innovation",
    "heroTitleLine1": "AI-first solutions,",
    "heroTitleLine2": "real-world impact",
    "heroSubtitle": "We automate what others do manually. From strategy to scale — AI, intelligent apps, and cloud solutions that transform businesses.",
    "aboutHeading": "About AorySoft",
    "aboutText": "We''re not just another software company. We''re AI-first innovators building the future of intelligent automation and seamless integrations.",
    "ctaTitle": "Ready to start your project?",
    "ctaText": "Tell us about your project and we''ll provide a detailed proposal.",
    "industries": [
      {"title": "Healthcare", "description": "AI-powered patient management, diagnostic tools, and healthcare automation solutions."},
      {"title": "E-commerce & Retail", "description": "Intelligent recommendation engines, inventory management, and customer analytics."},
      {"title": "Financial Services", "description": "Fraud detection, algorithmic trading, and risk assessment solutions."},
      {"title": "Real Estate", "description": "Property valuation, market analysis, and automated property management."},
      {"title": "Education", "description": "Personalized learning platforms, student analytics, and educational automation."},
      {"title": "Manufacturing", "description": "Predictive maintenance, quality control, and supply chain optimization."}
    ],
    "technologies": [
      {"name": "Python", "category": "Backend"},
      {"name": "React", "category": "Frontend"},
      {"name": "TensorFlow", "category": "AI/ML"},
      {"name": "Node.js", "category": "Backend"},
      {"name": "MongoDB", "category": "Database"},
      {"name": "AWS", "category": "Cloud"},
      {"name": "Docker", "category": "DevOps"},
      {"name": "TypeScript", "category": "Language"},
      {"name": "PostgreSQL", "category": "Database"},
      {"name": "Redis", "category": "Cache"},
      {"name": "Kubernetes", "category": "DevOps"},
      {"name": "GraphQL", "category": "API"}
    ],
    "footerEmail": "info@aorysoft.com",
    "footerPhone": "+1 (555) 123-4567",
    "footerAddress": "123 Innovation Drive, Tech City, TC 12345",
    "socialLinks": []
  }'::jsonb
)
on conflict (id) do nothing;

-- ── blog categories ──
insert into public.categories (name, slug, description) values
  ('AI & Automation', 'ai-automation', 'Intelligent automation, agents and AI in business.'),
  ('Cloud & Infrastructure', 'cloud-infrastructure', 'Cloud platforms, containers and scalable infrastructure.'),
  ('Machine Learning', 'machine-learning', 'Models, training, optimization and ML engineering.'),
  ('Analytics', 'analytics', 'Business intelligence and real-time analytics.'),
  ('Privacy & Security', 'privacy-security', 'Data privacy, compliance and security in AI systems.'),
  ('NLP', 'nlp', 'Natural language processing and language models.')
on conflict (slug) do nothing;

-- ── blog posts (placeholders — seeded as drafts for owner review) ──
insert into public.posts (title, slug, excerpt, body_html, author, publish_date, featured, status, category_id)
select
  v.title, v.slug, v.excerpt, v.body, v.author, v.publish_date::date, v.featured, 'draft',
  (select id from public.categories where slug = v.category)
from (values
  ('The Future of AI in Business Automation', 'future-of-ai-in-business-automation',
   'Explore how artificial intelligence is revolutionizing business processes and creating new opportunities for efficiency and growth.',
   '<p>Placeholder article body. Replace with your real content from the admin panel before publishing.</p>',
   'Talha Ahmed Hashmi', '2024-01-15', true, 'ai-automation'),
  ('Building Scalable AI Solutions with Cloud Infrastructure', 'scalable-ai-cloud-infrastructure',
   'Learn best practices for deploying AI applications at scale using modern cloud platforms and containerization technologies.',
   '<p>Placeholder article body. Replace with your real content from the admin panel before publishing.</p>',
   'Sabih ul Hassan', '2024-01-10', false, 'cloud-infrastructure'),
  ('Machine Learning Model Optimization Techniques', 'ml-model-optimization-techniques',
   'Discover advanced techniques for optimizing machine learning models for better performance and reduced computational costs.',
   '<p>Placeholder article body. Replace with your real content from the admin panel before publishing.</p>',
   'Abbas Ghori', '2024-01-05', false, 'machine-learning'),
  ('Data Privacy in AI: Best Practices and Compliance', 'data-privacy-in-ai-best-practices',
   'Understanding the importance of data privacy in AI systems and implementing best practices for compliance and security.',
   '<p>Placeholder article body. Replace with your real content from the admin panel before publishing.</p>',
   'Talha Ahmed Hashmi', '2023-12-28', false, 'privacy-security'),
  ('Real-time Analytics with AI: A Complete Guide', 'real-time-analytics-with-ai',
   'Implementing real-time analytics solutions using AI and machine learning for instant business insights and decision making.',
   '<p>Placeholder article body. Replace with your real content from the admin panel before publishing.</p>',
   'Sabih ul Hassan', '2023-12-20', false, 'analytics'),
  ('The Role of Natural Language Processing in Modern Applications', 'nlp-in-modern-applications',
   'Exploring how NLP is transforming user interactions and enabling more intuitive human-computer interfaces.',
   '<p>Placeholder article body. Replace with your real content from the admin panel before publishing.</p>',
   'Abbas Ghori', '2023-12-15', false, 'nlp')
) as v(title, slug, excerpt, body, author, publish_date, featured, category)
on conflict (slug) do nothing;

-- ── services ──
insert into public.services (title, subtitle, description, features, icon, color, sort_order, active) values
  ('AI Automation', 'Intelligent Process Automation',
   'Transform your business operations with cutting-edge AI automation solutions.',
   '["Robotic Process Automation (RPA)", "Intelligent Document Processing", "Workflow Optimization", "Predictive Analytics", "Natural Language Processing"]'::jsonb,
   'bot', 'from-blue-600 to-cyan-500', 1, true),
  ('Smart Integrations', 'Seamless System Connectivity',
   'Connect disparate systems with intelligent integration solutions.',
   '["API Development & Integration", "Cloud Platform Connectivity", "Data Synchronization", "Legacy System Modernization", "Real-time Data Processing"]'::jsonb,
   'zap', 'from-purple-600 to-pink-500', 2, true),
  ('Data Analytics', 'Actionable Business Intelligence',
   'Turn raw data into actionable insights with advanced analytics.',
   '["Business Intelligence Dashboards", "Predictive Modeling", "Data Visualization", "Machine Learning Models", "Custom Analytics Solutions"]'::jsonb,
   'bar-chart', 'from-green-600 to-teal-500', 3, true),
  ('Cloud Solutions', 'Scalable Infrastructure',
   'Build robust, scalable applications on modern cloud platforms.',
   '["Cloud Migration Services", "Serverless Architecture", "Container Orchestration", "DevOps Implementation", "Security & Compliance"]'::jsonb,
   'cloud', 'from-orange-600 to-red-500', 4, true)
on conflict do nothing;

-- ── jobs (active, mirroring the frontend listings) ──
insert into public.jobs (title, department, location, type, experience, description, requirements, responsibilities, active) values
  ('Senior AI Engineer', 'Engineering', 'Remote / San Francisco', 'full-time', '5+ years',
   'Lead the development of cutting-edge AI solutions and mentor junior engineers.',
   '["Master''s degree in Computer Science, AI, or related field", "5+ years of experience in AI/ML development", "Proficiency in Python, TensorFlow, PyTorch", "Experience with cloud platforms (AWS, GCP, Azure)", "Strong problem-solving and communication skills"]'::jsonb,
   '["Design and implement AI algorithms and models", "Lead technical architecture decisions", "Mentor junior team members", "Collaborate with cross-functional teams", "Stay updated with latest AI research and technologies"]'::jsonb,
   true),
  ('Frontend Developer', 'Engineering', 'Remote / New York', 'full-time', '3+ years',
   'Build beautiful and responsive user interfaces for our AI-powered applications.',
   '["Bachelor''s degree in Computer Science or related field", "3+ years of frontend development experience", "Expertise in React, TypeScript, and modern CSS", "Experience with responsive design and accessibility", "Knowledge of state management libraries"]'::jsonb,
   '["Develop responsive web applications", "Collaborate with designers and backend developers", "Optimize applications for performance", "Implement best practices for code quality", "Participate in code reviews and team meetings"]'::jsonb,
   true),
  ('Data Scientist', 'AI Research', 'Remote / Austin', 'full-time', '4+ years',
   'Analyze complex datasets and develop predictive models to drive business insights.',
   '["PhD or Master''s in Data Science, Statistics, or related field", "4+ years of experience in data science", "Proficiency in Python, R, SQL", "Experience with machine learning frameworks", "Strong statistical analysis skills"]'::jsonb,
   '["Analyze large datasets and extract insights", "Develop and validate predictive models", "Create data visualizations and reports", "Collaborate with engineering teams", "Present findings to stakeholders"]'::jsonb,
   true),
  ('DevOps Engineer', 'Infrastructure', 'Remote / Seattle', 'full-time', '4+ years',
   'Build and maintain scalable infrastructure for our AI applications.',
   '["Bachelor''s degree in Computer Science or related field", "4+ years of DevOps experience", "Experience with Docker, Kubernetes, CI/CD", "Knowledge of cloud platforms and monitoring tools", "Strong scripting and automation skills"]'::jsonb,
   '["Design and implement CI/CD pipelines", "Manage cloud infrastructure and deployments", "Monitor system performance and reliability", "Automate routine operational tasks", "Ensure security and compliance standards"]'::jsonb,
   true),
  ('Product Manager', 'Product', 'Remote / Boston', 'full-time', '5+ years',
   'Drive product strategy and roadmap for our AI-powered solutions.',
   '["MBA or equivalent experience", "5+ years of product management experience", "Experience with AI/ML products", "Strong analytical and communication skills", "Customer-focused mindset"]'::jsonb,
   '["Define product vision and strategy", "Collaborate with engineering and design teams", "Conduct market research and user interviews", "Manage product roadmap and priorities", "Track product metrics and performance"]'::jsonb,
   true),
  ('UX/UI Designer', 'Design', 'Remote / Los Angeles', 'full-time', '3+ years',
   'Create intuitive and engaging user experiences for our AI applications.',
   '["Bachelor''s degree in Design or related field", "3+ years of UX/UI design experience", "Proficiency in Figma, Sketch, or similar tools", "Experience with design systems and prototyping", "Understanding of user research methodologies"]'::jsonb,
   '["Design user interfaces and experiences", "Create wireframes, prototypes, and mockups", "Conduct user research and usability testing", "Collaborate with product and engineering teams", "Maintain and evolve design systems"]'::jsonb,
   true);
