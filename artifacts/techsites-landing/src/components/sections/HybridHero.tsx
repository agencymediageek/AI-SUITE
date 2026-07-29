import { useLang } from '@/context/LangContext';
import { ArrowRight } from 'lucide-react';

export function HybridHero() {
  const { t } = useLang();

  const stats = [
    { 
      label: t('ACTIVE SITES', 'SITES ATIVOS'), 
      value: '4,200+' 
    },
    { 
      label: t('BUILD TIME', 'TEMPO DE BUILD'), 
      value: t('Minutes', 'Minutos') 
    },
    { 
      label: t('AI SERVICES', 'SERVIÇOS DE IA'), 
      value: '100+' 
    },
    { 
      label: t('LIGHTHOUSE', 'LIGHTHOUSE'), 
      value: '≥90' 
    },
  ];

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-background pt-16">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column — Text */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-primary/30 mb-8">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">
                {t('Agency + AI Plugin · WordPress & HTML', 'Agência + Plugin IA · WordPress & HTML')}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-6">
              <div className="text-foreground mb-2">
                {t('Build. Transform.', 'Construa. Transforme.')}
              </div>
              <div className="text-gradient-primary">
                {t('Dominate online.', 'Domine online.')}
              </div>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0">
              {t(
                'A complete site built in minutes — or your existing WordPress transformed by AI. One plugin, $10 with 200 AI credits, replaces an entire team of professionals.',
                'Um site completo construído em minutos — ou o seu WordPress existente transformado por IA. Um plugin, $10 com 200 créditos de IA, substitui uma equipe inteira de profissionais.'
              )}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#portfolio"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg text-base font-bold hover:opacity-90 transition-all duration-300 glow-primary"
              >
                {t('Build My Site — From $250', 'Construir Meu Site — A partir de $250')}
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#plugin"
                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-primary text-primary px-8 py-4 rounded-lg text-base font-bold hover:bg-primary/10 transition-all duration-300"
              >
                {t('Install Plugin — $10 with 200 credits', 'Instalar Plugin — $10 com 200 créditos')}
              </a>
            </div>
          </div>

          {/* Right Column — Stats Grid 2x2 */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-card border border-card-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">
                  {stat.label}
                </div>
                <div className="text-3xl md:text-4xl font-black text-foreground">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
