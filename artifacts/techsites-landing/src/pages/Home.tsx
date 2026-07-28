import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { PluginHero } from '@/components/sections/PluginHero';
import { SubstitutionBar } from '@/components/sections/SubstitutionBar';
import { HowItWorksPlugin } from '@/components/sections/HowItWorksPlugin';
import { VirtualStaff } from '@/components/sections/VirtualStaff';
import { ComparisonTable } from '@/components/sections/ComparisonTable';
import { CreditsPlans } from '@/components/sections/CreditsPlans';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <PluginHero />
        <SubstitutionBar />
        <HowItWorksPlugin />
        <VirtualStaff />
        <ComparisonTable />
        <CreditsPlans />
      </main>
      <Footer />
    </div>
  );
}