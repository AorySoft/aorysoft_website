import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import HowWeWorkSection from "@/components/HowWeWorkSection";
import TechnologiesSection from "@/components/TechnologiesSection";
import IndustriesSection from "@/components/IndustriesSection";
import ReviewsSection from "@/components/ReviewsSection";
import FinalCtaSection from "@/components/FinalCtaSection";
import { getActiveServices, getPublishedCaseStudies, getPublishedReviews } from "@/lib/data";
import { SITE_DEFAULT_TITLE } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  // absolute: the root template ("%s | AorySoft") would otherwise repeat the brand.
  title: { absolute: SITE_DEFAULT_TITLE },
  description:
    "AorySoft builds AI chatbots, agents, workflow automation, and web applications for businesses that need software that ships and stays maintainable.",
  keywords: [
    "AI chatbots",
    "AI agents",
    "automation",
    "n8n",
    "web development",
    "Next.js",
    "AorySoft",
  ],
  alternates: { canonical: "/" },
};

// Home is a summary: every section links on to its dedicated page. Reviews
// render only once at least one is published (no empty band); careers live in
// the nav and footer. The #work anchor and case-study note are in FinalCtaSection.
export default async function Home() {
  const [services, reviews, cases] = await Promise.all([
    getActiveServices(),
    getPublishedReviews(),
    getPublishedCaseStudies(),
  ]);

  return (
    <main className="overflow-x-hidden">
      <HeroSection services={services} />
      <ServicesSection services={services} />
      <HowWeWorkSection />
      <TechnologiesSection />
      <IndustriesSection />
      {reviews && reviews.length > 0 ? <ReviewsSection reviews={reviews} /> : null}
      <FinalCtaSection hasWork={(cases?.length ?? 0) > 0} />
    </main>
  );
}
