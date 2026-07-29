import { useState } from 'react';
import { useLang } from '@/context/LangContext';
import { CheckCircle2 } from 'lucide-react';

export function FullPricing() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<'builds' | 'credits' | 'hosting'>('builds');

  const buildPlans = [
    {
      name: 'Basic',
      price: '$250',
      description: t('Perfect to start', 'Perfeito para começar'),
      features: [
        t('WordPress or HTML template', 'Template WordPress ou HTML'),
        t('10+ AI services configured', '10+ serviços de IA configurados'),
        t('Live in 24 hours', 'No ar em 24 horas'),
        t('30 days free hosting', '30 dias de hospedagem gratuita'),
        t('200 AI credits included', '200 créditos de IA inclusos'),
      ],
    },
    {
      name: 'Standard',
      price: '$350',
      description: t('Most popular', 'Mais popular'),
      features: [
        t('WordPress or HTML template', 'Template WordPress ou HTML'),
        t('30+ AI services configured', '30+ serviços de IA configurados'),
        t('Custom branding & logo', 'Marca e logo customizados'),
        t('Live in 24 hours', 'No ar em 24 horas'),
        t('30 days free hosting', '30 dias de hospedagem gratuita'),
        t('500 AI credits included', '500 créditos de IA inclusos'),
      ],
      popular: true,
    },
    {
      name: 'Premium',
      price: '$500',
      description: t('Full power', 'Poder total'),
      features: [
        t('WordPress or HTML template', 'Template WordPress ou HTML'),
        t('50+ AI services configured', '50+ serviços de IA configurados'),
        t('Custom branding & logo', 'Marca e logo customizados'),
        t('Advanced integrations', 'Integrações avançadas'),
        t('Live in 24 hours', 'No ar em 24 horas'),
        t('60 days free hosting', '60 dias de hospedagem gratuita'),
        t('1000 AI credits included', '1000 créditos de IA inclusos'),
      ],
    },
  ];

  const creditPlans = [
    {
      name: 'Starter',
      price: '$10',
      credits: '200 credits',
      description: t('Perfect to start', 'Perfeito para começar'),
      note: t('Never expire', 'Não expiram'),
    },
    {
      name: 'Growth',
      price: '$35',
      credits: '1,000 credits',
      description: t('Save 30%', 'Economize 30%'),
      badge: 'Best Value',
    },
    {
      name: 'Pro',
      price: '$80',
      credits: '3,000 credits',
      description: t('Save 45%', 'Economize 45%'),
      note: t('For power users', 'Para usuários avançados'),
    },
  ];

  const hostingPlans = [
    {
      name: 'HTML Lightning',
      price: t('from $9/mo', 'a partir de $9/mês'),
      description: t('Static HTML on Cloudflare', 'HTML estático no Cloudflare'),
    },
    {
      name: 'WordPress Managed',
      price: t('from $20/mo', 'a partir de $20/mês'),
      description: t('Managed WP + AI', 'WP gerenciado + IA'),
      popular: true,
    },
    {
      name: 'WordPress + Plugin Pro',
      price: t('from $30/mo', 'a partir de $30/mês'),
      description: t('Unlimited AI credits', 'Créditos IA ilimitados'),
    },
  ];

  const tabs = [
    { id: 'builds' as const, label: 'Site Builds' },
    { id: 'credits' as const, label: 'AI Credits' },
    { id: 'hosting' as const, label: 'Hosting' },
  ];

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Headline */}
        <h2 className="text-3xl md:text-5xl font-black text-center text-foreground mb-12">
          {t('Simple, transparent pricing.', 'Preços simples e transparentes.')}
        </h2>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center mb-16 max-w-md mx-auto w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-bold transition-all duration-300 first:rounded-l-lg last:rounded-r-lg border ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          {/* Site Builds Tab */}
          {activeTab === 'builds' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {buildPlans.map((plan, i) => (
                <div
                  key={i}
                  className={`bg-card border rounded-2xl p-8 flex flex-col relative ${
                    plan.popular
                      ? 'border-primary glow-border'
                      : 'border-card-border hover:border-primary/40'
                  } transition-all duration-300`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-black text-primary mb-2">{plan.price}</div>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

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
          )}

          {/* AI Credits Tab */}
          {activeTab === 'credits' && (
            <div>
              <div className="grid lg:grid-cols-3 gap-8 mb-8">
                {creditPlans.map((plan, i) => (
                  <div
                    key={i}
                    className={`bg-card border rounded-2xl p-8 text-center relative ${
                      plan.badge
                        ? 'border-primary glow-border'
                        : 'border-card-border hover:border-primary/40'
                    } transition-all duration-300`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-5xl font-black text-primary mb-2">{plan.price}</div>
                    <div className="text-lg font-semibold text-foreground mb-2">{plan.credits}</div>
                    <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                    {plan.note && <p className="text-xs text-muted-foreground mb-6">{plan.note}</p>}

                    <a
                      href="#"
                      className={`inline-flex items-center justify-center w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                        plan.badge
                          ? 'bg-primary text-primary-foreground hover:opacity-90'
                          : 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10'
                      }`}
                    >
                      {t('Buy Now', 'Comprar')}
                    </a>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <a href="#" className="text-sm text-primary font-semibold hover:underline">
                  {t('1 credit = 1 AI action. See full credit table →', '1 crédito = 1 ação de IA. Ver tabela completa →')}
                </a>
              </div>
            </div>
          )}

          {/* Hosting Tab */}
          {activeTab === 'hosting' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {hostingPlans.map((plan, i) => (
                <div
                  key={i}
                  className={`bg-card border rounded-2xl p-8 text-center relative ${
                    plan.popular
                      ? 'border-primary glow-border'
                      : 'border-card-border hover:border-primary/40'
                  } transition-all duration-300`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-black text-primary mb-2">{plan.price}</div>
                  <p className="text-sm text-muted-foreground mb-8">{plan.description}</p>

                  <a
                    href="#"
                    className={`inline-flex items-center justify-center w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
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
          )}
        </div>
      </div>
    </section>
  );
}
