import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Bot, Cpu, Gauge, Globe, MessageSquare, Shield, Sparkles, Zap,
  Music, Film, Image, Code2, Wand2, ChevronRight, Check, Users, TrendingUp, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/layout/public-layout";
import { useI18n } from "@/lib/i18n";

const premiumTools = [
  {
    icon: Users,
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-500/10",
    iconColor: "text-pink-400",
    slug: "ai-influencer",
    nameKey: "tool.ai_influencer.name",
    descKey: "tool.ai_influencer.desc",
    badge: "popular_badge",
  },
  {
    icon: Film,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-500/10",
    iconColor: "text-violet-400",
    slug: "viral-reels",
    nameKey: "tool.viral_reels.name",
    descKey: "tool.viral_reels.desc",
    badge: "popular_badge",
  },
  {
    icon: Image,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-400",
    slug: "thumbnail-maker",
    nameKey: "tool.thumbnail.name",
    descKey: "tool.thumbnail.desc",
    badge: "new_badge",
  },
  {
    icon: Music,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    slug: "music-creator",
    nameKey: "tool.music.name",
    descKey: "tool.music.desc",
    badge: "new_badge",
  },
  {
    icon: Globe,
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    slug: "website-builder",
    nameKey: "tool.website.name",
    descKey: "tool.website.desc",
    badge: "popular_badge",
  },
  {
    icon: Wand2,
    color: "from-fuchsia-500 to-pink-600",
    bgColor: "bg-fuchsia-500/10",
    iconColor: "text-fuchsia-400",
    slug: "manga-studio",
    nameKey: "tool.manga.name",
    descKey: "tool.manga.desc",
    badge: "new_badge",
  },
];

const steps = [
  { num: "01", titleKey: "how.step1.title", descKey: "how.step1.desc", icon: Zap },
  { num: "02", titleKey: "how.step2.title", descKey: "how.step2.desc", icon: Wand2 },
  { num: "03", titleKey: "how.step3.title", descKey: "how.step3.desc", icon: Sparkles },
];

const features = [
  { icon: Cpu, titleKey: "features.models.title", descKey: "features.models.desc" },
  { icon: Zap, titleKey: "features.tools.title", descKey: "features.tools.desc" },
  { icon: Gauge, titleKey: "features.performance.title", descKey: "features.performance.desc" },
  { icon: Bot, titleKey: "features.agents.title", descKey: "features.agents.desc" },
  { icon: Code2, titleKey: "features.api.title", descKey: "features.api.desc" },
  { icon: Globe, titleKey: "features.multilang.title", descKey: "features.multilang.desc" },
];

export default function Landing() {
  const { t } = useI18n();

  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-24 pb-28 lg:pt-36 lg:pb-40">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        </div>

        {/* Animated grid lines */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="container mx-auto max-w-6xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 shadow-sm shadow-primary/10">
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              <span>{t("hero.badge")}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 max-w-5xl mx-auto leading-[1.1]">
              {t("hero.title1")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
                {t("hero.title2")}
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-base h-13 px-8 rounded-full shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-accent hover:shadow-primary/40 hover:shadow-xl transition-all">
                  {t("hero.cta_primary")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-13 px-8 rounded-full border-border/60 bg-background/50 backdrop-blur hover:border-primary/40 transition-colors">
                  {t("hero.cta_secondary")}
                </Button>
              </Link>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {[
                { value: "50k+", labelKey: "stats.users", icon: Users },
                { value: "100+", labelKey: "stats.tools", icon: Zap },
                { value: "10M+", labelKey: "stats.generations", icon: TrendingUp },
                { value: "99.9%", labelKey: "stats.uptime", icon: Clock },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-extrabold text-foreground">{stat.value}</div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">{t(stat.labelKey)}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PREMIUM TOOLS SHOWCASE ── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-card/20 border-y border-border/30 -z-10" />
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5 px-4 py-1 text-xs uppercase tracking-widest">
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
                    <div className="group h-full p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-6 h-6 ${tool.iconColor}`} />
                        </div>
                        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                          {badgeLabel}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{t(tool.nameKey)}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{t(tool.descKey)}</p>
                      </div>
                      <div className="flex items-center text-sm font-semibold text-primary gap-1 group-hover:gap-2 transition-all">
                        {t("tools.try_free")} <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link href="/tools">
              <Button variant="outline" size="lg" className="rounded-full px-8 border-border/60 hover:border-primary/40">
                {t("tools.view_all")} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t("how.title")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">{t("how.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
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
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-card/20 border-y border-border/30 -z-10" />
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
                  className="p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{t(feature.titleKey)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t(feature.descKey)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 1-CLICK WORKFLOW HIGHLIGHT ── */}
      <section className="py-24">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-10 md:p-16"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-0" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-0" />
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
                <Zap className="w-4 h-4 fill-primary/20" />
                1-Click Workflow
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 max-w-3xl mx-auto">
                Nome do Produto →{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  Criativo Pronto
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Digite apenas o nome do produto → A IA gera o roteiro → Cria a imagem de fundo → Entrega o criativo completo para anúncio. Tudo em segundos.
              </p>
              {/* Mini workflow visualization */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                {["Roteiro", "Imagem", "Legenda", "Criativo Final"].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-full bg-background border border-border/60 text-sm font-semibold text-foreground">
                      {step}
                    </div>
                    {i < 3 && <ArrowRight className="w-4 h-4 text-primary" />}
                  </div>
                ))}
              </div>
              <Link href="/register">
                <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/30 transition-all">
                  {t("hero.cta_primary")} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-card/20 border-y border-border/30 -z-10" />
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t("pricing.title")}</h2>
          <p className="text-muted-foreground mb-10 text-lg max-w-xl mx-auto">{t("pricing.subtitle")}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/pricing">
              <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-accent">
                {t("hero.cta_secondary")} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="rounded-full px-8 border-border/60">
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
              <Button size="lg" className="text-lg h-14 px-10 rounded-full shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-accent hover:shadow-2xl hover:shadow-primary/30 transition-all">
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
      `}</style>
    </PublicLayout>
  );
}
