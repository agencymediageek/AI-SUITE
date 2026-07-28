import { Check, Zap, Rocket, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    icon: Zap,
    name: 'Starter Agência',
    price: 'R$ 297',
    period: '/mês',
    description: 'Ideal para agências iniciando automação',
    features: [
      'Até 5 deploys por mês',
      'Suporte N8N + SSH + PM2',
      'SSL automático via Let\'s Encrypt',
      'Monitoramento básico PM2',
      'Envato API integration',
      'Suporte via email (48h)',
    ],
    cta: 'Começar Agora',
    popular: false,
  },
  {
    icon: Rocket,
    name: 'Pro Agência',
    price: 'R$ 897',
    period: '/mês',
    description: 'Para agências com volume consistente',
    features: [
      'Deploys ilimitados',
      'Infraestrutura completa enterprise',
      'SSL + CDN Cloudflare integrado',
      'Monitoramento avançado + alertas',
      'GitHub Actions automático',
      'Suporte prioritário (4h)',
      'White label dashboard',
      'API de automação personalizada',
    ],
    cta: 'Assinar Pro',
    popular: true,
  },
  {
    icon: Building,
    name: 'Enterprise',
    price: 'Customizado',
    period: '',
    description: 'Infraestrutura dedicada e SLA garantido',
    features: [
      'Tudo do Pro Agência',
      'Servidores dedicados',
      'SLA 99.99% com compensação',
      'Onboarding personalizado',
      'Suporte 24/7 via Slack',
      'Arquitetura multi-região',
      'Compliance e auditoria',
      'Custom workflows N8N',
    ],
    cta: 'Falar com Vendas',
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="precos" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-mono font-bold mb-4 text-foreground">
            Planos e Preços
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para o volume de deploys da sua agência.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={index}
                className={`relative bg-card border rounded-lg p-8 ${
                  plan.popular
                    ? 'border-primary shadow-lg shadow-primary/20 lg:-mt-4 lg:mb-0'
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-mono font-bold">
                    Mais Popular
                  </div>
                )}

                <div className="mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 border border-primary/20">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-mono font-bold mb-2 text-foreground">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-mono font-bold text-primary">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                </div>

                <Button
                  className={`w-full mb-6 ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee */}
        <div className="mt-16 max-w-3xl mx-auto bg-card border border-primary/30 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-mono font-bold mb-3 text-foreground">
            Garantia de 30 Dias
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Se a WaasHost não economizar pelo menos 10 horas de trabalho DevOps no primeiro mês,
            devolvemos 100% do seu investimento. Sem perguntas, sem burocracia.
          </p>
        </div>
      </div>
    </section>
  );
}
