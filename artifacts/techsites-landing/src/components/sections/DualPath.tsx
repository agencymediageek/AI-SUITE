import { useLang } from '@/context/LangContext';
import { Globe, Plug, CheckCircle2, ArrowRight } from 'lucide-react';

export function DualPath() {
  const { t } = useLang();

  const paths = [
    {
      icon: Globe,
      title: t('Start from zero', 'Começar do zero'),
      badge: t('I need a new site', 'Preciso de um site novo'),
      description: t(
        'Choose a niche, pick a template, answer 10 quick questions. Our AI builds your complete site in minutes — WordPress or pure HTML. Live in 24 hours.',
        'Escolha um nicho, selecione um template, responda 10 perguntas rápidas. Nossa IA constrói seu site completo em minutos — WordPress ou HTML puro. No ar em 24 horas.'
      ),
      features: [
        t('WP or HTML template included', 'Template WP ou HTML incluso'),
        t('Zero other plugins needed', 'Zero outros plugins necessários'),
        t('AI builds, you review and go live', 'IA constrói, você revisa e vai ao ar'),
      ],
      cta: t('Browse Templates →', 'Ver Templates →'),
      href: '#templates',
    },
    {
      icon: Plug,
      title: t('Transform your existing site', 'Transformar meu site atual'),
      badge: t('I already have a site', 'Já tenho um site'),
      description: t(
        'Install the TechSites AI plugin on your WordPress. In 60 seconds the AI audits your entire site, diagnoses what\'s hurting your sales, and deploys hundreds of digital employees.',
        'Instale o plugin TechSites AI no seu WordPress. Em 60 segundos a IA audita todo o site, diagnostica o que está prejudicando suas vendas e ativa centenas de funcionários digitais.'
      ),
      features: [
        t('Full AI audit in 60 seconds', 'Auditoria completa de IA em 60 segundos'),
        t('1-click fixes for every issue found', 'Correções em 1 clique para cada problema'),
        t('100+ AI services activated instantly', '100+ serviços de IA ativados instantaneamente'),
      ],
      cta: t('Install Plugin — $10 →', 'Instalar Plugin — $10 →'),
      href: '#plugin',
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Headline */}
        <h2 className="text-3xl md:text-5xl font-black text-center text-white mb-16">
          {t('Two paths. One platform.', 'Dois caminhos. Uma plataforma.')}
        </h2>

        {/* Two Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {paths.map((path, i) => {
            const Icon = path.icon;
            return (
              <div
                key={i}
                className="bg-card border border-card-border rounded-2xl p-8 hover:border-primary/40 transition-all duration-300 flex flex-col"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-semibold mb-6 self-start">
                  {path.badge}
                </div>

                {/* Icon + Title */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{path.title}</h3>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {path.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {path.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={path.href}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 group"
                >
                  {path.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
