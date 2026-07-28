import { useLang } from '@/context/LangContext';
import { X } from 'lucide-react';

export function NoPluginBloat() {
  const { t } = useLang();

  const replacedPlugins = [
    ['WooCommerce', 'WPForms', 'Contact Form 7'],
    ['Elementor', 'Yoast SEO', 'RankMath'],
    ['MonsterInsights', 'Jetpack', 'UpdraftPlus'],
  ];

  return (
    <section className="py-20 bg-background relative">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto bg-card border-2 border-primary/20 rounded-2xl p-8 md:p-12 glow-border">
          {/* Headline */}
          <h2 className="text-3xl md:text-4xl font-black text-center text-white mb-4">
            {t('One plugin. Zero bloat.', 'Um plugin. Zero lixo.')}
          </h2>

          {/* Subheadline */}
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            {t(
              'Our WordPress templates need only ONE plugin — ours. Every other plugin you\'ve ever installed becomes unnecessary.',
              'Nossos templates WordPress precisam de apenas UM plugin — o nosso. Todos os outros que você já instalou se tornam desnecessários.'
            )}
          </p>

          {/* Grid of replaced plugins */}
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {replacedPlugins.map((column, colIndex) => (
              <div key={colIndex} className="space-y-4">
                {column.map((plugin, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <X className="w-5 h-5 text-destructive flex-shrink-0" />
                    <span className="line-through text-muted-foreground font-medium">
                      {plugin}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom statement */}
          <div className="text-center">
            <p className="text-xl font-bold text-primary">
              {t(
                'TechSites AI replaces all of them. One plugin. One dashboard. Everything automated.',
                'TechSites AI substitui todos eles. Um plugin. Um painel. Tudo automatizado.'
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
