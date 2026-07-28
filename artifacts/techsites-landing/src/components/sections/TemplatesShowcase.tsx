import { ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { useLang } from '@/context/LangContext';

const wpTemplates = [
  {
    name_en: 'Real Estate',
    name_pt: 'Imóveis',
    price: '$79',
    color: 'bg-blue-500/20 border-blue-500/30',
    accent: 'text-blue-400',
    features_en: ['MLS listings ready', 'Lead capture forms', 'Agent profiles'],
    features_pt: ['Listagens de imóveis', 'Formulários de captação', 'Perfis de corretores'],
  },
  {
    name_en: 'Dental & Medical',
    name_pt: 'Saúde & Médico',
    price: '$79',
    color: 'bg-emerald-500/20 border-emerald-500/30',
    accent: 'text-emerald-400',
    features_en: ['Online booking', 'Services & team', 'Trust signals'],
    features_pt: ['Agendamento online', 'Serviços e equipe', 'Selos de confiança'],
  },
  {
    name_en: 'Restaurant & Café',
    name_pt: 'Restaurante & Café',
    price: '$69',
    color: 'bg-amber-500/20 border-amber-500/30',
    accent: 'text-amber-400',
    features_en: ['Menu showcase', 'Reservations', 'Photo gallery'],
    features_pt: ['Cardápio visual', 'Reservas online', 'Galeria de fotos'],
  },
  {
    name_en: 'SaaS & Tech',
    name_pt: 'SaaS & Tech',
    price: '$89',
    color: 'bg-violet-500/20 border-violet-500/30',
    accent: 'text-violet-400',
    features_en: ['Feature showcase', 'Pricing tables', 'Conversion-first'],
    features_pt: ['Vitrine de funcionalidades', 'Tabelas de preços', 'Foco em conversão'],
  },
];

const htmlTemplates = [
  {
    name_en: 'Local Business',
    name_pt: 'Negócio Local',
    price: '$49',
    color: 'bg-sky-500/20 border-sky-500/30',
    accent: 'text-sky-400',
    features_en: ['<200ms globally', 'Lead form', 'Google Maps'],
    features_pt: ['<200ms no mundo', 'Formulário de contato', 'Google Maps'],
  },
  {
    name_en: 'Landing Page',
    name_pt: 'Landing Page',
    price: '$39',
    color: 'bg-pink-500/20 border-pink-500/30',
    accent: 'text-pink-400',
    features_en: ['Single-page', 'CTA-optimized', 'A/B ready'],
    features_pt: ['Página única', 'Otimizado para CTA', 'Pronto para A/B'],
  },
  {
    name_en: 'Portfolio',
    name_pt: 'Portfolio',
    price: '$49',
    color: 'bg-indigo-500/20 border-indigo-500/30',
    accent: 'text-indigo-400',
    features_en: ['Gallery grid', 'Contact form', 'About section'],
    features_pt: ['Grade de galeria', 'Formulário de contato', 'Seção sobre'],
  },
  {
    name_en: 'E-commerce',
    name_pt: 'Loja Online',
    price: '$59',
    color: 'bg-orange-500/20 border-orange-500/30',
    accent: 'text-orange-400',
    features_en: ['Product showcase', 'Cart & checkout', 'Fast load'],
    features_pt: ['Vitrine de produtos', 'Carrinho e checkout', 'Carga ultrarrápida'],
  },
];

function TemplateCard({ name, price, color, accent, features }: {
  name: string; price: string; color: string; accent: string; features: string[];
}) {
  return (
    <div className={`rounded-2xl border p-5 ${color} hover:scale-[1.02] transition-transform duration-200 cursor-pointer flex flex-col gap-4`}>
      {/* Header row */}
      <div className="flex items-start justify-between">
        <h3 className="text-base font-bold text-foreground">{name}</h3>
        <span className={`text-xl font-black ${accent}`}>{price}</span>
      </div>
      {/* Feature list */}
      <ul className="space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${accent}`} />
            {f}
          </li>
        ))}
      </ul>
      {/* Badge */}
      <div className="mt-auto">
        <span className="text-xs font-semibold text-muted-foreground">Plugin Included</span>
      </div>
    </div>
  );
}

export function TemplatesShowcase() {
  const { t, lang } = useLang();

  return (
    <section id="templates" className="py-24 bg-background">
      <div className="container mx-auto px-6">

        {/* Headline */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            {t('Templates · ThemeForest & Direct', 'Templates · ThemeForest & Direto')}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">
            {t('Templates built to dominate.', 'Templates feitos para dominar.')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t(
              'Sold on Envato Market — the world\'s largest creative marketplace with over 50 million registered buyers. Every template ships with the TechSites AI plugin already included.',
              'Vendidos na Envato Market — o maior marketplace criativo do mundo, com mais de 50 milhões de compradores cadastrados. Cada template já vem com o plugin TechSites AI incluso.'
            )}
          </p>
        </div>

        {/* Envato badge strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <span className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {t('50M+ Envato buyers', '50M+ compradores Envato')}
          </span>
          <span className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {t('Plugin included in every template', 'Plugin incluso em todo template')}
          </span>
          <span className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm text-muted-foreground">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {t('Zero other plugins needed', 'Zero outros plugins necessários')}
          </span>
          <span className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            {t('Auto-updates — no vulnerabilities', 'Auto-atualizações — sem vulnerabilidades')}
          </span>
        </div>

        {/* Two columns — WP and HTML */}
        <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto mb-12">

          {/* WordPress */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                WordPress
              </span>
              <span className="text-sm text-muted-foreground">
                {t('Plugin Included · No WooCommerce needed', 'Plugin Incluso · Sem WooCommerce necessário')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              {wpTemplates.map((tpl) => (
                <TemplateCard
                  key={tpl.name_en}
                  name={lang === 'PT' ? tpl.name_pt : tpl.name_en}
                  price={tpl.price}
                  color={tpl.color}
                  accent={tpl.accent}
                  features={lang === 'PT' ? tpl.features_pt : tpl.features_en}
                />
              ))}
            </div>
            <a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">
              {t('All WP templates on ThemeForest', 'Ver todos WP no ThemeForest')}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* HTML */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                HTML Lightning
              </span>
              <span className="text-sm text-muted-foreground">
                {t('Cloudflare CDN · <200ms worldwide', 'Cloudflare CDN · <200ms no mundo todo')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              {htmlTemplates.map((tpl) => (
                <TemplateCard
                  key={tpl.name_en}
                  name={lang === 'PT' ? tpl.name_pt : tpl.name_en}
                  price={tpl.price}
                  color={tpl.color}
                  accent={tpl.accent}
                  features={lang === 'PT' ? tpl.features_pt : tpl.features_en}
                />
              ))}
            </div>
            <a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">
              {t('All HTML Lightning templates', 'Ver todos templates HTML Lightning')}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          {t(
            'All templates include: TechSites AI plugin · 200 starter credits · 30 days free hosting · auto-updates for life · zero external plugin dependencies.',
            'Todos os templates incluem: plugin TechSites AI · 200 créditos iniciais · 30 dias de hospedagem gratuita · atualizações automáticas para sempre · zero dependência de plugins externos.'
          )}
        </p>
      </div>
    </section>
  );
}
