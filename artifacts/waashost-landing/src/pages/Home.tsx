import { Navbar } from '@/components/Navbar';
import { VaultHero } from '@/components/sections/VaultHero';
import { StatusBar } from '@/components/sections/StatusBar';
import { WhatItDoes } from '@/components/sections/WhatItDoes';
import { ClientPanel } from '@/components/sections/ClientPanel';
import { SecurityGrid } from '@/components/sections/SecurityGrid';
import { CreditsPackages } from '@/components/sections/CreditsPackages';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <Navbar />
      <VaultHero />
      <StatusBar />
      <WhatItDoes />
      <ClientPanel />
      <SecurityGrid />
      <CreditsPackages />
      <Footer />
    </div>
  );
}
