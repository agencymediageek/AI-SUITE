import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/sections/Hero';
import { PoweredBy } from '@/components/sections/PoweredBy';
import { TheAudit } from '@/components/sections/TheAudit';
import { PluginServices } from '@/components/sections/PluginServices';
import { ComparisonTable } from '@/components/sections/ComparisonTable';
import { PricingPlans } from '@/components/sections/PricingPlans';
import { ChatbotCTA } from '@/components/sections/ChatbotCTA';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <PoweredBy />
        <TheAudit />
        <PluginServices />
        <ComparisonTable />
        <PricingPlans />
        <ChatbotCTA />
      </main>
      <Footer />
    </div>
  );
}
