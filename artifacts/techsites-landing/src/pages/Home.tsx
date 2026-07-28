import { Navbar } from '@/components/layout/Navbar';
import { HybridHero } from '@/components/sections/HybridHero';
import { MarketOpportunity } from '@/components/sections/MarketOpportunity';
import { NoPluginBloat } from '@/components/sections/NoPluginBloat';
import { DualPath } from '@/components/sections/DualPath';
import { LiveDemos } from '@/components/sections/LiveDemos';
import { TemplatesShowcase } from '@/components/sections/TemplatesShowcase';
import { PluginFeatures } from '@/components/sections/PluginFeatures';
import { AIHosting } from '@/components/sections/AIHosting';
import { NichePortfolio } from '@/components/sections/NichePortfolio';
import { FullPricing } from '@/components/sections/FullPricing';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <HybridHero />
        <MarketOpportunity />
        <NoPluginBloat />
        <DualPath />
        <LiveDemos />
        <TemplatesShowcase />
        <PluginFeatures />
        <AIHosting />
        <NichePortfolio />
        <FullPricing />
      </main>
      <Footer />
    </div>
  );
}
