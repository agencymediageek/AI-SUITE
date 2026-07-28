import { useLang } from '@/context/LangContext';
import {
  Home, Heart, Scale, Rocket, UtensilsCrossed,
  Megaphone, Store, Dumbbell, GraduationCap, Building2,
} from 'lucide-react';

const niches = [
  {
    icon: Home,
    name_en: 'Real Estate',
    name_pt: 'Imóveis',
    price: 'from $250',
    services_en: '30+ AI services',
    services_pt: '30+ serviços IA',
    iconColor: 'text-blue-400',
    iconBg: 'from-blue-950 via-blue-900 to-blue-800',
    glowColor: 'rgba(96,165,250,0.35)',
    borderHover: 'hover:border-blue-500/40',
  },
  {
    icon: Heart,
    name_en: 'Dental & Medical',
    name_pt: 'Saúde & Médico',
    price: 'from $250',
    services_en: '30+ AI services',
    services_pt: '30+ serviços IA',
    iconColor: 'text-emerald-400',
    iconBg: 'from-emerald-950 via-emerald-900 to-emerald-800',
    glowColor: 'rgba(52,211,153,0.35)',
    borderHover: 'hover:border-emerald-500/40',
  },
  {
    icon: Scale,
    name_en: 'Law & Accounting',
    name_pt: 'Advocacia & Contabilidade',
    price: 'from $250',
    services_en: '30+ AI services',
    services_pt: '30+ serviços IA',
    iconColor: 'text-indigo-400',
    iconBg: 'from-indigo-950 via-indigo-900 to-indigo-800',
    glowColor: 'rgba(129,140,248,0.35)',
    borderHover: 'hover:border-indigo-500/40',
  },
  {
    icon: Rocket,
    name_en: 'SaaS & Tech',
    name_pt: 'SaaS & Tech',
    price: 'from $350',
    services_en: '40+ AI services',
    services_pt: '40+ serviços IA',
    iconColor: 'text-violet-400',
    iconBg: 'from-violet-950 via-violet-900 to-violet-800',
    glowColor: 'rgba(167,139,250,0.35)',
    borderHover: 'hover:border-violet-500/40',
  },
  {
    icon: UtensilsCrossed,
    name_en: 'Restaurant & Café',
    name_pt: 'Restaurante & Café',
    price: 'from $250',
    services_en: '30+ AI services',
    services_pt: '30+ serviços IA',
    iconColor: 'text-amber-400',
    iconBg: 'from-orange-950 via-orange-900 to-amber-800',
    glowColor: 'rgba(251,191,36,0.35)',
    borderHover: 'hover:border-amber-500/40',
  },
  {
    icon: Megaphone,
    name_en: 'Marketing Agency',
    name_pt: 'Agência de Marketing',
    price: 'from $350',
    services_en: '40+ AI services',
    services_pt: '40+ serviços IA',
    iconColor: 'text-pink-400',
    iconBg: 'from-pink-950 via-pink-900 to-rose-800',
    glowColor: 'rgba(244,114,182,0.35)',
    borderHover: 'hover:border-pink-500/40',
  },
  {
    icon: Store,
    name_en: 'Local Business',
    name_pt: 'Negócio Local',
    price: 'from $250',
    services_en: '30+ AI services',
    services_pt: '30+ serviços IA',
    iconColor: 'text-sky-400',
    iconBg: 'from-sky-950 via-sky-900 to-sky-800',
    glowColor: 'rgba(56,189,248,0.35)',
    borderHover: 'hover:border-sky-500/40',
  },
  {
    icon: Dumbbell,
    name_en: 'Fitness & Wellness',
    name_pt: 'Fitness & Bem-estar',
    price: 'from $250',
    services_en: '30+ AI services',
    services_pt: '30+ serviços IA',
    iconColor: 'text-green-400',
    iconBg: 'from-green-950 via-green-900 to-green-800',
    glowColor: 'rgba(74,222,128,0.35)',
    borderHover: 'hover:border-green-500/40',
  },
  {
    icon: GraduationCap,
    name_en: 'Education',
    name_pt: 'Educação',
    price: 'from $300',
    services_en: '35+ AI services',
    services_pt: '35+ serviços IA',
    iconColor: 'text-yellow-400',
    iconBg: 'from-yellow-950 via-yellow-900 to-amber-900',
    glowColor: 'rgba(250,204,21,0.35)',
    borderHover: 'hover:border-yellow-500/40',
  },
  {
    icon: Building2,
    name_en: 'Corporate',
    name_pt: 'Corporativo',
    price: 'from $350',
    services_en: '40+ AI services',
    services_pt: '40+ serviços IA',
    iconColor: 'text-slate-300',
    iconBg: 'from-slate-800 via-slate-700 to-slate-600',
    glowColor: 'rgba(203,213,225,0.25)',
    borderHover: 'hover:border-slate-400/40',
  },
];

export function NichePortfolio() {
  const { t } = useLang();

  return (
    <section id="portfolio" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">
            {t('Built for every business.', 'Construído para todo tipo de negócio.')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t(
              '10 niches. Each one pre-tuned for what actually converts in that market.',
              '10 nichos. Cada um ajustado para o que realmente converte naquele mercado.'
            )}
          </p>
        </div>

        {/* Grid 2×5 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 max-w-6xl mx-auto mb-12">
          {niches.map((niche, i) => {
            const Icon = niche.icon;
            return (
              <div
                key={i}
                className={`bg-card border border-border rounded-2xl overflow-hidden ${niche.borderHover} hover:scale-[1.03] transition-all duration-300 cursor-pointer group`}
              >
                {/* Icon banner */}
                <div className={`relative h-36 bg-gradient-to-b ${niche.iconBg} flex items-center justify-center`}>
                  {/* Radial glow behind icon */}
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ filter: `blur(28px)` }}
                  >
                    <div
                      className="w-20 h-20 rounded-full"
                      style={{ background: niche.glowColor }}
                    />
                  </div>
                  <Icon
                    className={`w-16 h-16 ${niche.iconColor} relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    strokeWidth={1.4}
                  />
                </div>

                {/* Text body */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-foreground mb-1 leading-snug">
                    {t(niche.name_en, niche.name_pt)}
                  </h3>
                  <div className="text-xs font-semibold text-primary mb-2">{niche.price}</div>
                  <div className={`inline-flex items-center px-2 py-0.5 rounded-full bg-muted/40 text-[11px] font-medium text-muted-foreground`}>
                    {t(niche.services_en, niche.services_pt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="#demos"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-bold hover:opacity-90 transition-all duration-300"
          >
            {t('See live demos →', 'Ver demos ao vivo →')}
          </a>
        </div>
      </div>
    </section>
  );
}
