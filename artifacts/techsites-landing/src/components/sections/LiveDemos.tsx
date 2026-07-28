import { ExternalLink, ArrowRight, Home, UtensilsCrossed, Rocket, Dumbbell } from 'lucide-react';
import { useLang } from '@/context/LangContext';

const demos = [
  {
    name_en: 'Real Estate',
    name_pt: 'Imóveis',
    url: 'https://ts-real-estate-model.pages.dev/',
    from: '$250',
    gradient: 'from-blue-950 via-blue-900 to-blue-700',
    glowColor: 'rgba(96,165,250,0.4)',
    iconColor: 'text-blue-300',
    Icon: Home,
    tag_en: 'Real Estate',
    tag_pt: 'Imóveis',
  },
  {
    name_en: 'Restaurant & Café',
    name_pt: 'Restaurante & Café',
    url: 'https://ts-restaurant-cafe.pages.dev/',
    from: '$250',
    gradient: 'from-orange-950 via-orange-900 to-amber-700',
    glowColor: 'rgba(251,146,60,0.4)',
    iconColor: 'text-amber-300',
    Icon: UtensilsCrossed,
    tag_en: 'Food & Beverage',
    tag_pt: 'Alimentação',
  },
  {
    name_en: 'SaaS & Tech',
    name_pt: 'SaaS & Tech',
    url: 'https://ts-saas-tech.pages.dev/',
    from: '$350',
    gradient: 'from-violet-950 via-violet-900 to-purple-700',
    glowColor: 'rgba(167,139,250,0.4)',
    iconColor: 'text-violet-300',
    Icon: Rocket,
    tag_en: 'Technology',
    tag_pt: 'Tecnologia',
  },
  {
    name_en: 'Fitness & Wellness',
    name_pt: 'Fitness & Bem-estar',
    url: 'https://ts-fitness-wellness.pages.dev/',
    from: '$250',
    gradient: 'from-green-950 via-green-900 to-emerald-700',
    glowColor: 'rgba(74,222,128,0.4)',
    iconColor: 'text-green-300',
    Icon: Dumbbell,
    tag_en: 'Health & Fitness',
    tag_pt: 'Saúde & Fitness',
  },
];

export function LiveDemos() {
  const { t, lang } = useLang();

  return (
    <section id="demos" className="py-24 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            {t('Live Demos', 'Demos ao Vivo')}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6">
            {t('See it live. Buy it ready.', 'Veja ao vivo. Compre pronto.')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t(
              "Every site below is live on Cloudflare's global network. Click, explore, and order yours — customized for your brand, delivered in 24 hours.",
              'Cada site abaixo está no ar na rede global da Cloudflare. Acesse, explore e peça o seu — personalizado com sua marca, entregue em 24 horas.'
            )}
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-10">
          {demos.map((demo) => {
            const Icon = demo.Icon;
            return (
              <a
                key={demo.url}
                href={demo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
              >
                {/* Preview area with large icon */}
                <div className={`relative h-48 bg-gradient-to-b ${demo.gradient} flex items-center justify-center overflow-hidden`}>
                  {/* Browser dots */}
                  <div className="absolute top-3 left-4 flex gap-1.5 z-10">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  </div>
                  <div className="absolute top-3 left-12 right-4 h-2.5 rounded-sm bg-white/10 z-10" />

                  {/* Radial glow */}
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ filter: 'blur(40px)' }}
                  >
                    <div
                      className="w-32 h-32 rounded-full"
                      style={{ background: demo.glowColor }}
                    />
                  </div>

                  {/* Large niche icon */}
                  <Icon
                    className={`w-20 h-20 ${demo.iconColor} relative z-10 drop-shadow-2xl group-hover:scale-110 transition-transform duration-300`}
                    strokeWidth={1.2}
                  />

                  {/* FROM badge */}
                  <span className="absolute bottom-3 right-3 text-xs font-bold bg-white/15 border border-white/20 text-white px-3 py-1 rounded-full z-10">
                    FROM {demo.from}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                        {lang === 'PT' ? demo.tag_pt : demo.tag_en}
                      </p>
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {lang === 'PT' ? demo.name_pt : demo.name_en}
                      </h3>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    {t('See Live Demo', 'Ver Demo ao Vivo')} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        {/* Bottom link */}
        <div className="text-center">
          <a
            href="https://techsites.ai/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {t('View all 10 niches on techsites.ai →', 'Ver todos os 10 nichos em techsites.ai →')}
          </a>
        </div>
      </div>
    </section>
  );
}
