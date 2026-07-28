import { useLang } from '@/context/LangContext';
import { Play } from 'lucide-react';

export function Hero() {
  const { t } = useLang();

  const stats = [
    { label: t('ACTIVE SITES', 'SITES ATIVOS'), value: '4,200+' },
    { label: t('AUDIT TIME', 'TEMPO DE AUDITORIA'), value: '60s' },
    { label: t('AI SERVICES', 'SERVIÇOS DE IA'), value: '100+' },
    { label: t('LIGHTHOUSE SCORE', 'LIGHTHOUSE SCORE'), value: '≥90' },
  ];

  return (
    <section className="pt-32 pb-20 px-6">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-muted-foreground">
              {t('WordPress Plugin · Powered by AI', 'Plugin WordPress · Powered by IA')}
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              <div className="text-white mb-2">
                {t('One plugin.', 'Um plugin.')}
              </div>
              <div className="text-gradient-primary">
                {t('An entire digital workforce.', 'Uma equipe digital completa.')}
              </div>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              {t(
                "Install TechSites AI on your WordPress in 2 clicks. Our AI audits your entire site in 60 seconds, shows exactly why you're not selling, and deploys hundreds of digital employees — all from your WordPress dashboard.",
                'Instale o TechSites AI no seu WordPress em 2 cliques. Nossa IA audita todo o seu site em 60 segundos, mostra exatamente por que você não está vendendo, e ativa centenas de funcionários digitais — tudo no painel do seu WordPress.'
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#download"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg text-base font-semibold hover:opacity-90 transition-all duration-300"
              >
                {t('Install Plugin — Free', 'Instalar o Plugin — Grátis')}
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-transparent border border-border text-white px-8 py-4 rounded-lg text-base font-semibold hover:bg-card transition-all duration-300"
              >
                <Play className="w-4 h-4" />
                {t('Watch how it works', 'Ver como funciona')}
              </a>
            </div>
          </div>

          {/* Right — Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
