// Row types for the public schema (hand-written; a Supabase CLI codegen pass
// can replace these once a project exists).

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body_html: string;
  cover_image_id: string | null;
  author: string | null;
  publish_date: string | null;
  featured: boolean;
  status: "draft" | "published";
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image_url: string | null;
  category_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ServiceRow = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  features: string[];
  icon: string | null;
  color: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type JobRow = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  type: "full-time" | "part-time" | "contract" | "internship" | null;
  experience: string | null;
  description: string | null;
  requirements: string[];
  responsibilities: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type MediaRow = {
  id: string;
  storage_path: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  created_by: string | null;
  created_at: string;
};

export type SubmissionRow = {
  id: string;
  type: "contact" | "quote";
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  message: string | null;
  details: Record<string, unknown>;
  status: "new" | "read" | "replied" | "archived";
  ip_hash: string | null;
  created_at: string;
};

export type SubscriberRow = {
  id: string;
  email: string;
  status: "pending" | "confirmed" | "unsubscribed";
  consent_at: string | null;
  ip_hash: string | null;
  created_at: string;
};

export type ReviewSource =
  | "fiverr"
  | "google"
  | "linkedin"
  | "website"
  | "email"
  | "other";

export type ReviewStatus = "draft" | "pending" | "published" | "archived";

export type ReviewRow = {
  id: string;
  display_name: string;
  review_text: string;
  rating: number;
  source: ReviewSource;
  source_url: string | null;
  project_or_service: string | null;
  attribution: string | null;
  profile_image_id: string | null;
  permission_confirmed: boolean;
  featured: boolean;
  status: ReviewStatus;
  submitter_email: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type MediaListRow = MediaRow;

/** Shape of the single site_settings.data JSONB row (owner-edited). */
export type SiteSettingsData = {
  heroBadge?: string;
  heroTitleLine1?: string;
  heroTitleLine2?: string;
  heroSubtitle?: string;
  aboutHeading?: string;
  aboutText?: string;
  ctaTitle?: string;
  ctaText?: string;
  industries?: { title: string; description: string }[];
  technologies?: { name: string; category: string }[];
  footerEmail?: string;
  footerPhone?: string;
  footerAddress?: string;
  socialLinks?: { label: string; url: string }[];
};
