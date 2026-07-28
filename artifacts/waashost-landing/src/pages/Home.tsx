import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { MetricsBar } from '@/components/MetricsBar';
import { HowItWorks } from '@/components/HowItWorks';
import { Features } from '@/components/Features';
import { Integrations } from '@/components/Integrations';
import { Comparison } from '@/components/Comparison';
import { Pricing } from '@/components/Pricing';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <Navbar />
      <Hero />
      <MetricsBar />
      <HowItWorks />
      <Features />
      <Integrations />
      <Comparison />
      <Pricing />
      <Footer />
    </div>
  );
}
