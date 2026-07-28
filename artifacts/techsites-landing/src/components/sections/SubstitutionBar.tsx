import React from 'react';
import { Search, PenTool, BarChart, Code, FileText, Share2 } from 'lucide-react';

export function SubstitutionBar() {
  const roles = [
    { name: "Agência de SEO", icon: Search },
    { name: "Web Designer", icon: PenTool },
    { name: "Analista de Tráfego", icon: BarChart },
    { name: "Programador", icon: Code },
    { name: "Redator", icon: FileText },
    { name: "Gestor de Redes", icon: Share2 },
  ];

  return (
    <section className="py-16 border-y border-white/5 bg-white/[0.02]">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-10">
          Substitui tudo isso com 1 plugin:
        </p>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 mb-12">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <div key={idx} className="flex flex-col items-center gap-3 relative group">
                {/* Visual strike-through */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-full h-0.5 bg-destructive rotate-[-15deg] transform origin-center shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                </div>
                
                <div className="w-16 h-16 rounded-2xl bg-card border border-white/10 flex items-center justify-center text-muted-foreground opacity-50 grayscale transition-all duration-500">
                  <Icon className="w-8 h-8" />
                </div>
                <span className="text-sm font-medium text-muted-foreground opacity-60 line-through decoration-destructive decoration-2">
                  {role.name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="inline-block bg-card border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
          <p className="text-lg text-white font-medium relative z-10">
            Custo médio mensal dessas 6 pessoas: <span className="text-destructive font-bold line-through">R$ 18.000</span>
            <span className="mx-4 text-muted-foreground">→</span>
            Custo do TechSites AI: planos a partir de <span className="text-primary font-bold text-2xl">R$ 97/mês</span>
          </p>
        </div>
      </div>
    </section>
  );
}