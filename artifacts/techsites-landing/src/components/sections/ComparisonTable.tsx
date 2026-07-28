import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

export function ComparisonTable() {
  const comparisons = [
    {
      old: { title: "Agência de SEO", cost: "R$ 2.000/mês" },
      new: { title: "IA corrige SEO automaticamente", cost: "Incluso" }
    },
    {
      old: { title: "Web Designer", cost: "R$ 3.500/mês" },
      new: { title: "Editor WYSIWYG inline (você edita)", cost: "Incluso" }
    },
    {
      old: { title: "Programador", cost: "R$ 5.000/mês" },
      new: { title: "Plugin atualiza e mantém sem código", cost: "Incluso" }
    },
    {
      old: { title: "Gestor de Tráfego", cost: "R$ 2.500/mês" },
      new: { title: "Robôs de prospecção ativos 24/7", cost: "Incluso" }
    },
    {
      old: { title: "Redator", cost: "R$ 1.500/mês" },
      new: { title: "IA cria conteúdo no seu estilo", cost: "Incluso" }
    }
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            O que você para de pagar.<br />O que você começa a ganhar.
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Headers */}
            <div className="grid grid-cols-2 border-b border-white/10">
              <div className="p-8 bg-destructive/5">
                <h3 className="text-xl font-bold text-white/80">Antes do TechSites AI</h3>
              </div>
              <div className="p-8 bg-primary/5">
                <h3 className="text-xl font-bold text-primary">Com o TechSites AI</h3>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
              {comparisons.map((item, idx) => (
                <div key={idx} className="grid grid-cols-2 hover:bg-white/[0.02] transition-colors">
                  <div className="p-6 md:p-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                        <X className="w-4 h-4 text-destructive" />
                      </div>
                      <span className="font-medium line-through decoration-destructive/50">{item.old.title}</span>
                    </div>
                    <span className="text-destructive/80 font-bold whitespace-nowrap">{item.old.cost}</span>
                  </div>
                  <div className="p-6 md:p-8 flex items-center justify-between gap-4 bg-primary/[0.02]">
                    <div className="flex items-center gap-3 text-white">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{item.new.title}</span>
                    </div>
                    <span className="text-primary font-bold whitespace-nowrap">{item.new.cost}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-t border-white/10 bg-white/5">
              <div className="p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Custo Tradicional</span>
                <span className="text-4xl font-bold text-white/50 line-through">R$ 14.500/mês</span>
              </div>
              <div className="p-8 flex flex-col justify-center bg-primary/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider mb-2 relative z-10">TechSites AI</span>
                <div className="flex items-end gap-2 relative z-10">
                  <span className="text-4xl font-bold text-white">R$ 97</span>
                  <span className="text-xl text-primary font-medium mb-1">/mês</span>
                </div>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-card border border-primary/30 shadow-[0_0_40px_rgba(0,212,255,0.15)]">
              <p className="text-2xl font-bold text-white">
                Você economiza mais de <span className="text-primary">R$ 14.000 por mês</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}