import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    number: "01",
    title: "Briefing & Seleção",
    description: "Escolha um dos 8 nichos disponíveis e preencha as informações básicas do seu cliente.",
  },
  {
    number: "02",
    title: "Geração via IA",
    description: "O Gemini AI cria instantaneamente a copy persuasiva adaptada para o negócio do cliente.",
  },
  {
    number: "03",
    title: "Edição WYSIWYG",
    description: "Ajuste detalhes visuais ou compartilhe o editor white-label direto com o cliente para revisão.",
  },
  {
    number: "04",
    title: "Deploy Instantâneo",
    description: "Com um clique, o GitHub Actions faz o build e publica o site no Cloudflare Pages edge.",
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">Workflow Simples</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
            Do zero à produção em <br className="hidden md:block" />
            questão de minutos
          </h3>
        </div>

        <div className="relative">
          {/* Connection line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/10 via-primary/50 to-secondary/10 -translate-y-1/2 z-0" />

          <div className="grid md:grid-cols-4 gap-12 md:gap-6 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                <div className="w-16 h-16 rounded-2xl bg-card border border-primary/30 flex items-center justify-center text-xl font-mono font-bold text-primary mx-auto mb-6 glow-primary relative z-10">
                  {step.number}
                </div>
                <div className="text-center px-4">
                  <h4 className="text-xl font-bold text-foreground mb-3">{step.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
