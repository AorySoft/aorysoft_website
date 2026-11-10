import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import TechnologiesSection from "@/components/TechnologiesSection";
import IndustriesSection from "@/components/IndustriesSection";
import CareersPreview from "@/components/CareersPreview";
import ReviewsSection from "@/components/ReviewsSection";
import FinalCtaSection from "@/components/FinalCtaSection";
import { getActiveServices, getPublishedReviews } from "@/lib/data";

export const revalidate = 60;

// Selected work is not rendered until real case studies are cleared; its note
// and the #work anchor live in FinalCtaSection (PortfolioSection is kept for then).
export default async function Home() {
  const [services, reviews] = await Promise.all([
    getActiveServices(),
    getPublishedReviews(),
  ]);

  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <ServicesSection services={services} />
      <AboutSection />
      <TechnologiesSection />
      <IndustriesSection />
      <ReviewsSection reviews={reviews} />
      <CareersPreview />
      <FinalCtaSection />
    </main>
  );
}
