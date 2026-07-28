import { useLang } from '@/context/LangContext';
import {
  Home,
  Heart,
  Scale,
  Rocket,
  UtensilsCrossed,
  Megaphone,
  Store,
  Dumbbell,
  GraduationCap,
  Building2,
} from 'lucide-react';

export function NichePortfolio() {
  const { t } = useLang();

  const niches = [
    {
      icon: Home,
      name: t('Real Estate', 'Imóveis'),
      price: 'from $250',
      services: '30+ services',
    },
    {
      icon: Heart,
      name: t('Dentist & Medical', 'Saúde & Médico'),
      price: 'from $250',
      services: '30+ services',
    },
    {
      icon: Scale,
      name: t('Lawyer & Accountant', 'Advocacia & Contabilidade'),
      price: 'from $250',
      services: '30+ services',
    },
    {
      icon: Rocket,
      name: t('SaaS & Tech', 'SaaS & Tech'),
      price: 'from $350',
      services: '40+ services',
    },
    {
      icon: UtensilsCrossed,
      name: t('Restaurant & Café', 'Restaurante & Café'),
      price: 'from $250',
      services: '30+ services',
    },
    {
      icon: Megaphone,
      name: t('Marketing Agency', 'Agência de Marketing'),
      price: 'from $350',
      services: '40+ services',
    },
    {
      icon: Store,
      name: t('Local Business', 'Negócio Local'),
      price: 'from $250',
      services: '30+ services',
    },
    {
      icon: Dumbbell,
      name: t('Fitness & Wellness', 'Fitness & Bem-estar'),
      price: 'from $250',
      services: '30+ services',
    },
    {
      icon: GraduationCap,
      name: t('Education', 'Educação'),
      price: 'from $300',
      services: '35+ services',
    },
    {
      icon: Building2,
      name: t('Corporate', 'Corporativo'),
      price: 'from $350',
      services: '40+ services',
    },
  ];

  return (
    <section id="portfolio" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Headline */}
        <h2 className="text-3xl md:text-5xl font-black text-center text-white mb-4">
          {t('Built for every business.', 'Construído para todo tipo de negócio.')}
        </h2>

        {/* Subheadline */}
        <p className="text-lg text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
          {t(
            '10 niches. Each one pre-tuned for what actually converts in that market.',
            '10 nichos. Cada um ajustado para o que realmente converte naquele mercado.'
          )}
        </p>

        {/* Grid 2x5 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto mb-12">
          {niches.map((niche, i) => {
            const Icon = niche.icon;
            return (
              <div
                key={i}
                className="bg-card border border-card-border rounded-xl p-6 hover:border-primary/40 transition-all duration-300 cursor-pointer group"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-7 h-7 text-primary" />
                </div>

                {/* Name */}
                <h3 className="text-lg font-bold text-white mb-2">{niche.name}</h3>

                {/* Price */}
                <div className="text-sm font-semibold text-primary mb-1">{niche.price}</div>

                {/* Services Badge */}
                <div className="inline-flex items-center px-2 py-1 rounded-full bg-muted/30 text-xs font-medium text-muted-foreground">
                  {niche.services}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-bold hover:opacity-90 transition-all duration-300"
          >
            {t('See live demos →', 'Ver demos ao vivo →')}
          </a>
        </div>
      </div>
    </section>
  );
}
