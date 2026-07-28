import { useLang } from '@/context/LangContext';
import { ArrowRight } from 'lucide-react';

export function TemplatesShowcase() {
  const { t } = useLang();

  const wpTemplates = [
    { name: t('Real Estate', 'Imóveis'), price: '$79' },
    { name: t('Dental & Medical', 'Saúde'), price: '$79' },
    { name: t('Restaurant & Café', 'Restaurante & Café'), price: '$69' },
    { name: t('SaaS & Tech', 'SaaS'), price: '$89' },
  ];

  const htmlTemplates = [
    { name: t('Local Business', 'Negócio Local'), price: '$49' },
    { name: t('Landing Page', 'Landing Page'), price: '$39' },
    { name: t('Portfolio', 'Portfolio'), price: '$49' },
    { name: t('E-commerce', 'Loja'), price: '$59' },
  ];

  return (
    <section id="templates" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Headline */}
        <h2 className="text-3xl md:text-5xl font-black text-center text-white mb-4">
          {t('Templates built to dominate.', 'Templates feitos para dominar.')}
        </h2>

        {/* Subheadline */}
        <p className="text-lg text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
          {t(
            'Every template ships with TechSites AI plugin included. WordPress templates need zero other plugins. HTML templates load in under 200ms worldwide.',
            'Cada template já vem com o plugin TechSites AI incluso. Templates WordPress não precisam de nenhum outro plugin. Templates HTML carregam em menos de 200ms no mundo todo.'
          )}
        </p>

        {/* Two Blocks */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-12">
          {/* WordPress Templates */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-bold">
              WordPress · Plugin Included
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4">
              {wpTemplates.map((template, i) => (
                <div
                  key={i}
                  className="bg-card border border-card-border rounded-xl p-6 hover:border-primary/40 transition-all duration-300 relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-secondary/20 text-secondary">
                      Plugin Included
                    </span>
                  </div>
                  <div className="pt-6">
                    <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
                    <div className="text-2xl font-black text-primary">{template.price}</div>
                    <div className="text-xs text-muted-foreground mt-1">ThemeForest</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="#"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300"
            >
              {t('All WP Templates on ThemeForest →', 'Ver todos WP no ThemeForest →')}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* HTML Lightning Sites */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-bold">
              HTML · Cloudflare CDN · &lt;200ms
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4">
              {htmlTemplates.map((template, i) => (
                <div
                  key={i}
                  className="bg-card border border-card-border rounded-xl p-6 hover:border-primary/40 transition-all duration-300 relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-accent/20 text-accent">
                      Lightning Fast
                    </span>
                  </div>
                  <div className="pt-6">
                    <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
                    <div className="text-2xl font-black text-primary">{template.price}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="#"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300"
            >
              {t('All HTML Templates →', 'Ver todos HTML →')}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t(
              'All templates include: TechSites AI plugin + 200 starter credits + 30 days free hosting',
              'Todos os templates incluem: plugin TechSites AI + 200 créditos iniciais + 30 dias de hospedagem gratuita'
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
