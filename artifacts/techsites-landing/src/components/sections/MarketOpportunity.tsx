import { TrendingUp, Globe, AlertTriangle, Zap } from 'lucide-react';
import { useLang } from '@/context/LangContext';

const stats = [
  {
    number: '810M',
    label_en: 'Websites on the internet today',
    label_pt: 'Sites na internet hoje',
    sub_en: '43% run on WordPress',
    sub_pt: '43% rodam em WordPress',
    icon: Globe,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    number: '500M+',
    label_en: 'WordPress sites worldwide',
    label_pt: 'Sites WordPress no mundo',
    sub_en: 'Every single one is a potential customer',
    sub_pt: 'Cada um deles é um cliente em potencial',
    icon: TrendingUp,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    number: '350M',
    label_en: 'Sites outdated or abandoned',
    label_pt: 'Sites desatualizados ou abandonados',
    sub_en: 'Slow, unsecured, invisible on Google',
    sub_pt: 'Lentos, inseguros, invisíveis no Google',
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    number: '480M',
    label_en: 'Sites with no AI or chatbot',
    label_pt: 'Sites sem IA ou chatbot',
    sub_en: 'Losing leads to competitors every hour',
    sub_pt: 'Perdendo leads para concorrentes toda hora',
    icon: Zap,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
];

export function MarketOpportunity() {
  const { t } = useLang();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative">
        {/* Label */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
            {t('Market Opportunity', 'Oportunidade de Mercado')}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6">
            {t('Hundreds of millions of sites.', 'Centenas de milhões de sites.')}<br />
            <span className="text-primary">
              {t('Zero AI employees.', 'Zero funcionários digitais.')}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t(
              'Every outdated WordPress site is a paying customer waiting to find TechSites AI. The market is not niche — it is the entire internet.',
              'Cada site WordPress desatualizado é um cliente pagante esperando encontrar o TechSites AI. O mercado não é nicho — é a internet inteira.'
            )}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.number}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className={`text-4xl font-black ${stat.color} mb-2`}>{stat.number}</div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  {t(stat.label_en, stat.label_pt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(stat.sub_en, stat.sub_pt)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Cost comparison callout */}
        <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left: old world */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-4">
                {t('Without TechSites AI', 'Sem o TechSites AI')}
              </p>
              <div className="space-y-3">
                {[
                  ['SEO Agency', 'Agência de SEO', '$24,000'],
                  ['Web Designer', 'Web Designer', '$42,000'],
                  ['Developer', 'Programador', '$60,000'],
                  ['Copywriter', 'Redator', '$18,000'],
                  ['Traffic Manager', 'Gestor de Tráfego', '$30,000'],
                  ['Marketing Agency', 'Agência de Marketing', '$36,000'],
                ].map(([en, pt, price]) => (
                  <div key={en} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground line-through">{t(en, pt)}</span>
                    <span className="text-muted-foreground line-through font-mono">{price}/yr</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="font-bold text-foreground">{t('Total', 'Total')}</span>
                  <span className="font-black text-red-400 font-mono">$210,000/yr</span>
                </div>
              </div>
            </div>

            {/* Right: TechSites */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center">
              <p className="text-base font-black text-amber-400 uppercase tracking-widest mb-4">
                {t('With TechSites AI Plugin', 'Com o Plugin TechSites AI')}
              </p>
              <div className="text-7xl font-black text-foreground mb-1">$10</div>
              <p className="text-primary font-semibold mb-2">
                {t('+ credits from $35/mo', '+ créditos a partir de $35/mês')}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {t(
                  'Same results. No salaries. No meetings. No delays.',
                  'Mesmos resultados. Sem salários. Sem reuniões. Sem atrasos.'
                )}
              </p>
              <a
                href="#plugin"
                className="inline-flex items-center justify-center w-full bg-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                {t('Install Plugin — $10', 'Instalar Plugin — $10')}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom claim */}
        <p className="text-center text-sm text-muted-foreground mt-10 max-w-2xl mx-auto">
          {t(
            'TechSites AI is the first and only platform that connects any WordPress or HTML site to a complete AI workforce — through a single plugin. No competitor offers this.',
            'O TechSites AI é a primeira e única plataforma que conecta qualquer site WordPress ou HTML a uma equipe completa de IA — através de um único plugin. Nenhum concorrente oferece isso.'
          )}
        </p>
      </div>
    </section>
  );
}
