import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, Shield } from 'lucide-react';

export function CreditsPlans() {
  const plans = [
    {
      name: "Starter",
      description: "Para quem quer começar",
      price: "97",
      icon: Zap,
      credits: "500 créditos",
      features: [
        "Auditoria completa de IA",
        "Correção automática de SEO",
        "Editor WYSIWYG visual",
        "Suporte prioritário"
      ]
    },
    {
      name: "Profissional",
      description: "Mais popular",
      price: "197",
      icon: Star,
      popular: true,
      credits: "2.000 créditos",
      features: [
        "Tudo do plano Starter",
        "Prospecção B2B ativa",
        "Chatbot de vendas IA",
        "Campanhas via WhatsApp"
      ]
    },
    {
      name: "Agência",
      description: "Para múltiplos sites",
      price: "397",
      icon: Shield,
      credits: "Ilimitados",
      features: [
        "Tudo do plano Profissional",
        "Acesso via API",
        "Licença para 10 sites",
        "Relatórios White-label"
      ]
    }
  ];

  return (
    <section id="precos" className="py-24 bg-white/[0.02]">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simples como recarregar um celular
          </h2>
          <p className="text-xl text-muted-foreground">
            Escolha o pacote de créditos ideal para o volume do seu negócio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative bg-card rounded-3xl p-8 border flex flex-col ${
                  isPopular 
                    ? 'border-primary shadow-[0_0_40px_rgba(0,212,255,0.15)] transform md:-translate-y-4' 
                    : 'border-white/10'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    Mais Popular
                  </div>
                )}

                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isPopular ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-white'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-8 flex items-end gap-2">
                  <span className="text-5xl font-bold text-white">R${plan.price}</span>
                  <span className="text-muted-foreground mb-2">/mês</span>
                </div>

                <div className="bg-white/5 rounded-xl p-4 mb-8 text-center border border-white/5">
                  <span className="font-bold text-white block">{plan.credits}</span>
                  <span className="text-xs text-muted-foreground">incluídos todo mês</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a 
                  href="#assinar" 
                  className={`w-full py-4 rounded-xl text-center font-bold transition-all duration-300 ${
                    isPopular 
                      ? 'bg-primary text-primary-foreground hover:glow-primary' 
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  Começar Agora
                </a>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground bg-card border border-white/10 inline-block px-6 py-3 rounded-full text-sm">
            <span className="text-white font-medium">Nota:</span> O plugin é 100% gratuito. Os créditos ativam os recursos avançados. Cancele quando quiser.
          </p>
        </div>
      </div>
    </section>
  );
}