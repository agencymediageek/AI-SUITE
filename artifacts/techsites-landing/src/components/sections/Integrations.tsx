import React from 'react';
import { SiCloudflare, SiN8N, SiGithub, SiGooglegemini, SiStripe } from "react-icons/si";

const integrations = [
  { name: "Cloudflare", icon: SiCloudflare, color: "hover:text-[#F38020]" },
  { name: "N8N", icon: SiN8N, color: "hover:text-[#FF6D5A]" },
  { name: "GitHub", icon: SiGithub, color: "hover:text-[#ffffff]" },
  { name: "Gemini AI", icon: SiGooglegemini, color: "hover:text-[#8E75FF]" },
  { name: "Stripe", icon: SiStripe, color: "hover:text-[#635BFF]" },
];

export function Integrations() {
  return (
    <section className="py-20 border-t border-white/5 overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm font-medium text-muted-foreground mb-10 uppercase tracking-widest">
          Powered by the best in class
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
          {integrations.map((Integration, idx) => {
            const Icon = Integration.icon;
            return (
              <div 
                key={idx} 
                className={`flex items-center gap-3 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 ${Integration.color} cursor-pointer`}
                title={Integration.name}
              >
                <Icon className="w-8 h-8 md:w-10 md:h-10" />
                <span className="font-bold text-lg md:text-xl hidden sm:block">{Integration.name}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  );
}
