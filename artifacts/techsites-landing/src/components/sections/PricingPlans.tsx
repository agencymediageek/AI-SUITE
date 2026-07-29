import { useLang } from '@/context/LangContext';
import { Check } from 'lucide-react';

export function PricingPlans() {
  const { t } = useLang();

  const plans = [
    {
      name: 'Starter',
      price: t('$97/mo', 'R$97/mês'),
      credits: t('500 credits', '500 créditos'),
      popular: false,
      features: [
        t('Full AI Audit', 'Auditoria Completa de IA'),
        t('1-click SEO Fix', 'Correção SEO em 1 clique'),
        t('WYSIWYG Editor', 'Editor WYSIWYG'),
        t('Priority support', 'Suporte prioritário'),
      ],
    },
    {
      name: 'Professional',
      price: t('$197/mo', 'R$197/mês'),
      credits: t('2,000 credits', '2.000 créditos'),
      popular: true,
      features: [
        t('Everything in Starter', 'Tudo do Starter'),
        t('B2B Prospecting', 'Prospecção B2B'),
        t('Sales Chatbot', 'Chatbot de Vendas'),
        t('WhatsApp Campaigns', 'Campanhas WhatsApp'),
        t('Content Creation', 'Criação de Conteúdo'),
      ],
    },
    {
      name: t('Agency', 'Agência'),
      price: t('$397/mo', 'R$397/mês'),
      credits: t('Unlimited credits', 'Créditos ilimitados'),
      popular: false,
      features: [
        t('Everything in Professional', 'Tudo do Professional'),
        t('10 sites included', '10 sites incluídos'),
        t('API access', 'Acesso API'),
        t('White-label reports', 'Relatórios white-label'),
        t('Dedicated manager', 'Gerente dedicado'),
      ],
    },
  ];

  return (
    <section id="pricing" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('Simple as recharging your phone.', 'Simples como recarregar um celular.')}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-card border rounded-xl p-8 relative ${
                plan.popular ? 'border-primary shadow-lg' : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold">
                  {t('Most Popular', 'Mais Popular')}
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-primary mb-2">{plan.price}</div>
                <div className="text-sm text-muted-foreground">{plan.credits}</div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={index === 2 ? '#contact' : '#download'}
                className={`block text-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {index === 2 ? t('Contact Us', 'Falar com a Equipe') : t('Get Started', 'Começar Agora')}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-12">
          {t(
            'Free plugin. Credits activate advanced features. Cancel anytime.',
            'Plugin gratuito. Os créditos ativam os recursos avançados. Cancele quando quiser.'
          )}
        </p>
      </div>
    </section>
  );
}
