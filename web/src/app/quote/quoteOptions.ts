export type QuoteFormData = {
  projectType: string;
  budget: string;
  timeline: string;
  description: string;
  technologies: string[];
  integrations: string[];
  scalability: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  additionalNotes: string;
};

export const initialData: QuoteFormData = {
  projectType: "",
  budget: "",
  timeline: "",
  description: "",
  technologies: [],
  integrations: [],
  scalability: "",
  name: "",
  email: "",
  company: "",
  phone: "",
  additionalNotes: "",
};

export const projectTypes = [
  "AI/ML Development",
  "Process Automation",
  "Data Analytics",
  "Web Application",
  "Mobile Application",
  "Cloud Migration",
  "API Integration",
  "Custom Software",
];

export const budgetRanges = [
  "Under $10,000",
  "$10,000 - $25,000",
  "$25,000 - $50,000",
  "$50,000 - $100,000",
  "$100,000+",
  "Let's discuss",
];

export const timelineOptions = [
  "1-3 months",
  "3-6 months",
  "6-12 months",
  "12+ months",
  "Flexible",
];

export const techOptions = [
  "Python",
  "JavaScript",
  "React",
  "Node.js",
  "TensorFlow",
  "PyTorch",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "MongoDB",
  "PostgreSQL",
];

export const integrationOptions = [
  "CRM Systems",
  "ERP Systems",
  "Payment Gateways",
  "Social Media APIs",
  "Marketing Tools",
  "Analytics Platforms",
  "Email Services",
  "Cloud Storage",
];

export const inputClasses = "field-input";

export const TOTAL_STEPS = 4;
