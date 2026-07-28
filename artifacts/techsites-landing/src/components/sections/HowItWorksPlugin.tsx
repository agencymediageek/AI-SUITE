import React from 'react';
import { motion } from 'framer-motion';
import { Download, Activity, FileSearch, Power } from 'lucide-react';

export function HowItWorksPlugin() {
  const steps = [
    {
      icon: Download,
      title: "Instale o Plugin",
      description: "Disponível no WordPress.org e Envato. Instalação em 2 cliques."
    },
    {
      icon: Activity,
      title: "IA Audita seu Site em 60 segundos",
      description: "Escaneia SEO, velocidade, conteúdo, links e entende seu negócio."
    },
    {
      icon: FileSearch,
      title: "Veja o Diagnóstico Completo",
      description: "Relatório visual gerado por IA mostra exatamente por que seu site não está vendendo."
    },
    {
      icon: Power,
      title: "Ative seus Funcionários Digitais",
      description: "Com seus créditos, corrija tudo com 1 clique e ative robôs especializados no seu negócio."
    }
  ];

  return (
    <section id="como-funciona" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Como funciona
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Quatro passos simples para transformar um site estático em uma máquina de vendas ativa.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2" />
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary -translate-y-1/2 w-full scale-x-0 origin-left motion-safe:animate-[scaleX_2s_ease-out_forwards]" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div className="w-20 h-20 rounded-2xl bg-card border border-white/10 flex items-center justify-center relative z-10 mb-6 group-hover:border-primary/50 group-hover:glow-primary transition-all duration-500">
                    <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Icon className="w-8 h-8 text-primary relative z-10" />
                    
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-lg">
                      {idx + 1}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}