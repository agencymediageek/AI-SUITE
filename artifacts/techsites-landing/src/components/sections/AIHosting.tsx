import { useLang } from '@/context/LangContext';
import { CheckCircle2 } from 'lucide-react';

export function AIHosting() {
  const { t } = useLang();

  const plans = [
    {
      name: 'HTML Lightning',
      price: t('from $9/mo', 'a partir de $9/mês'),
      description: t('Static HTML sites on Cloudflare CDN', 'Sites HTML estáticos no Cloudflare CDN'),
      features: [
        t('Global CDN <200ms', 'CDN global <200ms'),
        t('Free SSL', 'SSL gratuito'),
        t('Daily backup', 'Backup diário'),
        t('AI performance monitor', 'Monitor de performance IA'),
      ],
      popular: false,
    },
    {
      name: 'WordPress Managed',
      price: t('from $20/mo', 'a partir de $20/mês'),
      description: t('Managed WordPress with AI', 'WordPress gerenciado com IA'),
      features: [
        t('Global CDN <200ms', 'CDN global <200ms'),
        t('Free SSL', 'SSL gratuito'),
        t('Daily backup', 'Backup diário'),
        t('AI performance monitor', 'Monitor de performance IA'),
        t('1-click updates', 'Updates em 1 clique'),
        t('TechSites AI plugin included', 'Plugin TechSites AI incluso'),
        t('AI security scan', 'Varredura de segurança IA'),
      ],
      popular: true,
    },
    {
      name: 'WordPress + Plugin Pro',
      price: t('from $30/mo', 'a partir de $30/mês'),
      description: t('Hosting + unlimited AI credits', 'Hospedagem + créditos IA ilimitados'),
      features: [
        t('Global CDN <200ms', 'CDN global <200ms'),
        t('Free SSL', 'SSL gratuito'),
        t('Daily backup', 'Backup diário'),
        t('AI performance monitor', 'Monitor de performance IA'),
        t('1-click updates', 'Updates em 1 clique'),
        t('TechSites AI plugin included', 'Plugin TechSites AI incluso'),
        t('AI security scan', 'Varredura de segurança IA'),
        t('Unlimited AI credits', 'Créditos IA ilimitados'),
        t('Priority support', 'Suporte prioritário'),
        t('Performance guarantee ≥90', 'Garantia de performance ≥90'),
      ],
      popular: false,
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Headline */}
        <h2 className="text-3xl md:text-5xl font-black text-center text-white mb-4">
          {t('AI-Managed Hosting.', 'Hospedagem Gerenciada por IA.')}
        </h2>

        {/* Subheadline */}
        <p className="text-lg text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
          {t(
            'Your site hosted, monitored, backed up and improved by AI — 24 hours a day, 7 days a week. Not just a server. An intelligent platform.',
            'Seu site hospedado, monitorado, com backup automático e melhorado por IA — 24 horas por dia, 7 dias por semana. Não é apenas um servidor. É uma plataforma inteligente.'
          )}
        </p>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`bg-card border rounded-2xl p-8 flex flex-col relative ${
                plan.popular
                  ? 'border-primary glow-border'
                  : 'border-card-border hover:border-primary/40'
              } transition-all duration-300`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>

              {/* Price */}
              <div className="text-3xl font-black text-primary mb-2">{plan.price}</div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#"
                className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                    : 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10'
                }`}
              >
                {t('Get Started', 'Começar')}
              </a>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t(
              '30 days free hosting included with every site build or template purchase.',
              '30 dias de hospedagem gratuita incluso em toda construção de site ou compra de template.'
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
