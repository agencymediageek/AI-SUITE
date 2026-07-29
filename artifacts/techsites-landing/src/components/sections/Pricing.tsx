import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const plans = [
  {
    name: "Starter",
    description: "Perfeito para freelancers e profissionais independentes.",
    price: "R$ 97",
    period: "/mês",
    features: [
      "Até 3 sites publicados",
      "Editor WYSIWYG básico",
      "Hospedagem Cloudflare",
      "Suporte via email",
      "Sem acesso API",
      "Sem white-label"
    ],
    disabled: [4, 5],
    cta: "Começar Starter",
    popular: false,
  },
  {
    name: "Agência",
    description: "Para agências em crescimento que precisam de escala.",
    price: "R$ 297",
    period: "/mês",
    features: [
      "Até 20 sites publicados",
      "Editor WYSIWYG completo",
      "Geração de Copy com Gemini AI",
      "Hospedagem Cloudflare PRO",
      "Painel White-label para clientes",
      "Automações N8N (5 ativas)"
    ],
    disabled: [],
    cta: "Iniciar Teste de 7 Dias",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Infraestrutura dedicada para grandes operações.",
    price: "R$ 997",
    period: "/mês",
    features: [
      "Sites ilimitados",
      "Workers APIs customizados",
      "Modelos de IA dedicados",
      "Hospedagem Edge Global",
      "White-label 100% customizável",
      "Automações N8N Ilimitadas"
    ],
    disabled: [],
    cta: "Falar com Vendas",
    popular: false,
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-card border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">Planos e Preços</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
            Escale sua agência sem <br className="hidden md:block"/>
            aumentar custos fixos
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col p-8 rounded-3xl border ${
                plan.popular 
                  ? 'bg-background border-primary glow-border' 
                  : 'bg-background/50 border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Mais Escolhido
                </div>
              )}
              
              <div className="mb-8">
                <h4 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h4>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              
              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {plan.disabled.includes(i) ? (
                      <X className="w-5 h-5 text-muted-foreground shrink-0" />
                    ) : (
                      <Check className="w-5 h-5 text-primary shrink-0" />
                    )}
                    <span className={`text-sm ${plan.disabled.includes(i) ? 'text-muted-foreground line-through opacity-50' : 'text-gray-300'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${
                  plan.popular 
                    ? 'bg-primary text-primary-foreground hover:glow-primary' 
                    : 'bg-white/10 text-foreground hover:bg-white/20'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
