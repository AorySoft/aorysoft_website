import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import PortfolioSection from "@/components/PortfolioSection";
import TechnologiesSection from "@/components/TechnologiesSection";
import IndustriesSection from "@/components/IndustriesSection";
import CareersPreview from "@/components/CareersPreview";
import { getActiveServices } from "@/lib/data";

// Content edits in /admin revalidate this route (plan §8 ISR flow).
export const revalidate = 60;

export default async function Home() {
  // null → Supabase not connected → sections render placeholder content.
  const services = await getActiveServices();

  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <AboutSection />
      <ServicesSection services={services} />
      <PortfolioSection />
      <TechnologiesSection />
      <IndustriesSection />
      <CareersPreview />
    </main>
  );
}
