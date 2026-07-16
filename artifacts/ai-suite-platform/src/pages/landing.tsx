import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Bot, Cpu, Gauge, Globe, MessageSquare, Shield, Sparkles, Zap,
  Music, Film, Image, Code2, Wand2, Check, Users, TrendingUp, Clock,
  Star, Quote, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/layout/public-layout";
import { useI18n } from "@/lib/i18n";

const premiumTools = [
  {
    icon: Users,
    gradient: "from-pink-500/20 to-rose-600/20",
    border: "hover:border-pink-500/40",
    iconBg: "bg-pink-500/15",
    iconColor: "text-pink-400",
    glow: "group-hover:shadow-pink-500/10",
    slug: "ai-influencer",
    nameKey: "tool.ai_influencer.name",
    descKey: "tool.ai_influencer.desc",
    badge: "popular_badge",
  },
  {
    icon: Film,
    gradient: "from-violet-500/20 to-purple-600/20",
    border: "hover:border-violet-500/40",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
    glow: "group-hover:shadow-violet-500/10",
    slug: "viral-reels",
    nameKey: "tool.viral_reels.name",
    descKey: "tool.viral_reels.desc",
    badge: "popular_badge",
  },
  {
    icon: Image,
    gradient: "from-amber-500/20 to-orange-600/20",
    border: "hover:border-amber-500/40",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    glow: "group-hover:shadow-amber-500/10",
    slug: "thumbnail-maker",
    nameKey: "tool.thumbnail.name",
    descKey: "tool.thumbnail.desc",
    badge: "new_badge",
  },
  {
    icon: Music,
    gradient: "from-emerald-500/20 to-teal-600/20",
    border: "hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    glow: "group-hover:shadow-emerald-500/10",
    slug: "music-creator",
    nameKey: "tool.music.name",
    descKey: "tool.music.desc",
    badge: "new_badge",
  },
  {
    icon: Globe,
    gradient: "from-cyan-500/20 to-blue-600/20",
    border: "hover:border-cyan-500/40",
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
    glow: "group-hover:shadow-cyan-500/10",
    slug: "website-builder",
    nameKey: "tool.website.name",
    descKey: "tool.website.desc",
    badge: "popular_badge",
  },
  {
    icon: Wand2,
    gradient: "from-fuchsia-500/20 to-pink-600/20",
    border: "hover:border-fuchsia-500/40",
    iconBg: "bg-fuchsia-500/15",
    iconColor: "text-fuchsia-400",
    glow: "group-hover:shadow-fuchsia-500/10",
    slug: "manga-studio",
    nameKey: "tool.manga.name",
    descKey: "tool.manga.desc",
    badge: "new_badge",
  },
];

const steps = [
  { num: "01", titleKey: "how.step1.title", descKey: "how.step1.desc", icon: Zap, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { num: "02", titleKey: "how.step2.title", descKey: "how.step2.desc", icon: Wand2, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { num: "03", titleKey: "how.step3.title", descKey: "how.step3.desc", icon: Sparkles, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
];

const features = [
  { icon: Cpu, titleKey: "features.models.title", descKey: "features.models.desc", color: "text-violet-400", bg: "bg-violet-500/10" },
  { icon: Zap, titleKey: "features.tools.title", descKey: "features.tools.desc", color: "text-amber-400", bg: "bg-amber-500/10" },
  { icon: Gauge, titleKey: "features.performance.title", descKey: "features.performance.desc", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: Bot, titleKey: "features.agents.title", descKey: "features.agents.desc", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { icon: Code2, titleKey: "features.api.title", descKey: "features.api.desc", color: "text-pink-400", bg: "bg-pink-500/10" },
  { icon: Globe, titleKey: "features.multilang.title", descKey: "features.multilang.desc", color: "text-blue-400", bg: "bg-blue-500/10" },
];

const testimonials = [
  {
    name: "Carlos Mendes",
    role: "Gestor de Tráfego",
    avatar: "CM",
    avatarColor: "from-violet-500 to-purple-600",
    stars: 5,
    text: "Economizo pelo menos 4 horas por dia com as ferramentas da MediaGeek. O AI Influencer sozinho me paga 10x o plano.",
  },
  {
    name: "Juliana Freitas",
    role: "Social Media",
    avatar: "JF",
    avatarColor: "from-pink-500 to-rose-600",
    stars: 5,
    text: "Minhas Reels viralizaram depois que comecei a usar o Viral Reels Creator. É como ter um time de criação no bolso.",
  },
  {
    name: "Rafael Torres",
    role: "Youtuber & Creator",
    avatar: "RT",
    avatarColor: "from-amber-500 to-orange-600",
    stars: 5,
    text: "Thumbnails profissionais em segundos. Antes levava 30 minutos no Photoshop. Meu CTR aumentou 40% em 2 semanas.",
  },
  {
    name: "Aline Costa",
    role: "Agência Digital",
    avatar: "AC",
    avatarColor: "from-emerald-500 to-teal-600",
    stars: 5,
    text: "Atendo 3x mais clientes com a mesma equipe. A plataforma é intuitiva e o suporte responde rápido. Recomendo demais!",
  },
  {
    name: "Diego Souza",
    role: "Empreendedor Digital",
    avatar: "DS",
    avatarColor: "from-cyan-500 to-blue-600",
    stars: 5,
    text: "Lancei um negócio do zero em 48 horas usando o Website Builder e a criação de conteúdo automatizada. Incrível!",
  },
  {
    name: "Mariana Luz",
    role: "Influenciadora",
    avatar: "ML",
    avatarColor: "from-fuchsia-500 to-pink-600",
    stars: 5,
    text: "Finalmente uma plataforma em português que funciona de verdade. Os resultados superam qualquer ferramenta que já usei.",
  },
];

const trustedBrands = [
  "Agência Click", "Viral Studio", "DigitalBR", "MKT Experts",
  "Creators Hub", "Impulso Mídia", "Geek Agency", "TrendMakers",
];

export default function Landing() {
  const { t, locale } = useI18n();

  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-24 pb-28 lg:pt-36 lg:pb-40">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[100px]" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-pink-500/8 rounded-full blur-[100px]" />
        </div>

        {/* Grid lines */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="container mx-auto max-w-6xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-400 mb-8 shadow-sm">
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              <span>{t("hero.badge")}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 max-w-5xl mx-auto leading-[1.1]">
              {t("hero.title1")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-pink-400 bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
                {t("hero.title2")}
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-base h-13 px-8 rounded-full shadow-lg shadow-violet-500/25 bg-gradient-to-r from-violet-600 to-cyan-600 hover:shadow-violet-500/40 hover:shadow-xl transition-all">
                  {t("hero.cta_primary")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-13 px-8 rounded-full border-border/60 bg-background/50 backdrop-blur hover:border-violet-500/40 transition-colors">
                  {t("hero.cta_secondary")}
                </Button>
              </Link>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {[
                { value: "50k+", labelKey: "stats.users", icon: Users, color: "text-violet-400" },
                { value: "100+", labelKey: "stats.tools", icon: Zap, color: "text-amber-400" },
                { value: "10M+", labelKey: "stats.generations", icon: TrendingUp, color: "text-cyan-400" },
                { value: "99.9%", labelKey: "stats.uptime", icon: Clock, color: "text-emerald-400" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-center"
                >
                  <div className={`text-3xl md:text-4xl font-extrabold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">{t(stat.labelKey)}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUSTED BY BRANDS ── */}
      <section className="py-12 border-y border-border/30 bg-muted/20">
        <div className="container mx-auto max-w-6xl px-4">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">
            {locale === "pt"
              ? "Confiado por mais de 50.000 profissionais no Brasil e no mundo"
              : "Trusted by 50,000+ professionals worldwide"}
          </p>
          <div className="relative overflow-hidden">
            <div className="flex gap-8 animate-[marquee_25s_linear_infinite]">
              {[...trustedBrands, ...trustedBrands].map((brand, i) => (
                <div
                  key={i}
                  className="shrink-0 px-6 py-2.5 rounded-full border border-border/50 bg-card/50 text-sm font-semibold text-muted-foreground whitespace-nowrap hover:border-primary/30 hover:text-foreground transition-colors"
                >
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PREMIUM TOOLS SHOWCASE ── */}
      <section className="py-24 relative">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-violet-400 border-violet-500/30 bg-violet-500/5 px-4 py-1 text-xs uppercase tracking-widest">
              Premium
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {t("tools.featured_title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t("tools.featured_subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {premiumTools.map((tool, i) => {
              const Icon = tool.icon;
              const badgeLabel = tool.badge === "popular_badge" ? t("tools.popular_badge") : t("tools.new_badge");
              const badgeClass = tool.badge === "popular_badge"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

              return (
                <motion.div
                  key={tool.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <Link href={`/features/${tool.slug}`}>
                    <div className={`group h-full p-6 rounded-2xl bg-gradient-to-br ${tool.gradient} border border-border/50 ${tool.border} hover:shadow-xl ${tool.glow} transition-all duration-300 cursor-pointer flex flex-col gap-4`}>
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-xl ${tool.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-6 h-6 ${tool.iconColor}`} />
                        </div>
                        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                          {badgeLabel}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1.5">{t(tool.nameKey)}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{t(tool.descKey)}</p>
                      </div>
                      <div className={`mt-auto flex items-center gap-1 text-xs font-semibold ${tool.iconColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        {locale === "pt" ? "Explorar" : "Explore"} <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link href="/login">
              <Button variant="outline" size="lg" className="rounded-full px-8 border-border/60 hover:border-violet-500/40">
                {t("tools.view_all")} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 relative bg-muted/20 border-y border-border/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t("how.title")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">{t("how.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="text-center flex flex-col items-center"
                >
                  <div className="relative mb-6">
                    <div className={`w-20 h-20 rounded-2xl ${step.bg} border flex items-center justify-center`}>
                      <Icon className={`w-9 h-9 ${step.color}`} />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{t(step.titleKey)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t(step.descKey)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t("features.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t("features.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300 group hover:shadow-lg"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{t(feature.titleKey)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t(feature.descKey)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 1-CLICK WORKFLOW ── */}
      <section className="py-24 bg-muted/20 border-y border-border/30">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-background to-cyan-500/10 p-10 md:p-16"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl" />
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 text-sm font-semibold text-violet-400 mb-6">
                <Zap className="w-4 h-4" />
                1-Click Workflow
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 max-w-3xl mx-auto">
                {locale === "pt" ? "Nome do Produto →" : "Product Name →"}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                  {locale === "pt" ? "Criativo Pronto" : "Creative Ready"}
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                {locale === "pt"
                  ? "Digite apenas o nome do produto → A IA gera roteiro, imagem e legenda → Entrega o criativo completo. Tudo em segundos."
                  : "Just type your product name → AI generates script, image and caption → Delivers the complete creative. All in seconds."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                {(locale === "pt"
                  ? ["Roteiro", "Imagem", "Legenda", "Criativo Final"]
                  : ["Script", "Image", "Caption", "Final Creative"]
                ).map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-full bg-background border border-border/60 text-sm font-semibold">
                      {step}
                    </div>
                    {i < 3 && <ArrowRight className="w-4 h-4 text-violet-400" />}
                  </div>
                ))}
              </div>
              <Link href="/register">
                <Button size="lg" className="rounded-full px-8 shadow-lg shadow-violet-500/25 bg-gradient-to-r from-violet-600 to-cyan-600 hover:shadow-xl hover:shadow-violet-500/30 transition-all">
                  {t("hero.cta_primary")} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-pink-400 border-pink-500/30 bg-pink-500/5 px-4 py-1 text-xs uppercase tracking-widest">
              {locale === "pt" ? "Depoimentos" : "Reviews"}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {locale === "pt" ? "Amado por Criadores do Mundo Todo" : "Loved by Creators Worldwide"}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              {locale === "pt"
                ? "Veja o que nossos usuários falam sobre a MediaGeek AI Suite"
                : "See what our users say about MediaGeek AI Suite"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-pink-500/20 transition-all duration-300 flex flex-col gap-4 hover:shadow-lg hover:shadow-pink-500/5"
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: t_.stars }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t_.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t_.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {t_.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t_.name}</div>
                    <div className="text-xs text-muted-foreground">{t_.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
            {[
              { icon: Shield, label: locale === "pt" ? "Dados 100% Seguros" : "100% Secure Data" },
              { icon: Zap, label: locale === "pt" ? "Resposta em milissegundos" : "Millisecond response" },
              { icon: Check, label: locale === "pt" ? "Cancele a qualquer momento" : "Cancel anytime" },
              { icon: MessageSquare, label: locale === "pt" ? "Suporte em português" : "Portuguese support" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="w-4 h-4 text-emerald-400" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ── */}
      <section className="py-24 bg-muted/20 border-y border-border/30">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t("pricing.title")}</h2>
          <p className="text-muted-foreground mb-10 text-lg max-w-xl mx-auto">{t("pricing.subtitle")}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/pricing">
              <Button size="lg" className="rounded-full px-8 shadow-lg shadow-violet-500/20 bg-gradient-to-r from-violet-600 to-cyan-600">
                {t("hero.cta_secondary")} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="rounded-full px-8 border-border/60 hover:border-violet-500/40">
                {t("hero.cta_primary")}
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{t("pricing.free_trial")}</p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">{t("cta.title")}</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">{t("cta.subtitle")}</p>
            <Link href="/register">
              <Button size="lg" className="text-lg h-14 px-10 rounded-full shadow-xl shadow-violet-500/25 bg-gradient-to-r from-violet-600 to-cyan-600 hover:shadow-2xl hover:shadow-violet-500/30 transition-all">
                {t("cta.button")} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </PublicLayout>
  );
}
