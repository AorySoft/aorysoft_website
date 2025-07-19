import React from 'react';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import ServicesSection from '../components/ServicesSection';
import PortfolioSection from '../components/PortfolioSection';
import TechnologiesSection from '../components/TechnologiesSection';
import IndustriesSection from '../components/IndustriesSection';
import CareersPreview from '../components/CareersPreview';

const Home = () => {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <PortfolioSection />
      <TechnologiesSection />
      <IndustriesSection />
      <CareersPreview />
    </div>
  );
};

export default Home;