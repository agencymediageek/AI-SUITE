import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Globe, Check, Zap, Cloud, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/layout/public-layout";
import { useI18n } from "@/lib/i18n";

export default function WebsiteBuilder() {
  const { t, locale } = useI18n();
  const isPt = locale === "pt";

  const features = isPt ? [
    "Sites HTML/CSS/JS nativos — ultrarrápidos e sem WordPress",
    "Deploy automático na rede global da Cloudflare Pages",
    "SSL grátis, CDN global e proteção DDoS incluídos",
    "Editor WYSIWYG para customização sem código",
    "Domínio personalizado conectável em 1 clique",
    "Geração de copy e imagens automática por IA",
    "Templates para: agências, clínicas, restaurantes, e-commerce",
    "Integração com plugin WordPress MediaGeek",
  ] : [
    "Native HTML/CSS/JS sites — ultra-fast and WordPress-free",
    "Automatic deployment to Cloudflare Pages global network",
    "Free SSL, global CDN and DDoS protection included",
    "WYSIWYG editor for customization without code",
    "Custom domain connectable in 1 click",
    "Automatic AI copy and image generation",
    "Templates for: agencies, clinics, restaurants, e-commerce",
    "Integration with MediaGeek WordPress plugin",
  ];

  const steps = isPt ? [
    { step: "01", title: "Descreva o Site", desc: "Informe o nicho, público-alvo e objetivo. A IA cria a estrutura completa." },
    { step: "02", title: "IA Gera o Site", desc: "HTML, CSS, copy, imagens e SEO básico gerados em segundos." },
    { step: "03", title: "Deploy na Cloudflare", desc: "Publicação automática na rede global. Online em menos de 1 minuto." },
  ] : [
    { step: "01", title: "Describe the Site", desc: "Provide the niche, target audience and objective. AI creates the complete structure." },
    { step: "02", title: "AI Generates the Site", desc: "HTML, CSS, copy, images and basic SEO generated in seconds." },
    { step: "03", title: "Deploy to Cloudflare", desc: "Automatic publishing on the global network. Live in less than 1 minute." },
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto max-w-5xl px-4 py-12 space-y-20">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2">
            <ArrowLeft className="w-4 h-4" /> {t("tool_page.back")}
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
          <div className="inline-flex w-20 h-20 rounded-3xl bg-cyan-500/10 items-center justify-center mx-auto">
            <Globe className="w-10 h-10 text-cyan-400" />
          </div>
          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-1 text-xs uppercase tracking-widest">
            {isPt ? "Sites com IA" : "AI Websites"}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            {t("tool.website.name")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isPt
              ? "Crie sites HTML estáticos ultrarrápidos com um clique e publique automaticamente na rede global da Cloudflare. SSL grátis, Lighthouse ≥90 garantido."
              : "Create ultra-fast static HTML sites with one click and automatically deploy to Cloudflare's global network. Free SSL, Lighthouse ≥90 guaranteed."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href="/register">
              <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                {t("tool_page.try_now")} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="rounded-full px-8 border-border/60">
                {t("tool_page.see_plans")}
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Highlights */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: Zap, value: "<60s", label: isPt ? "Site online" : "Site online", color: "text-cyan-400 bg-cyan-500/10" },
            { icon: Cloud, value: "100+", label: isPt ? "Países na CDN" : "CDN countries", color: "text-blue-400 bg-blue-500/10" },
            { icon: Code2, value: "≥90", label: "Lighthouse", color: "text-emerald-400 bg-emerald-500/10" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-background border border-border/50">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center">{t("tool_page.how_works")}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-background border border-border/50 text-center space-y-3">
                <span className="text-4xl font-black text-primary/20">{s.step}</span>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center">{t("tool_page.features")}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border/50">
                <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 py-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-background to-blue-600/10 border border-cyan-500/20 px-8">
          <Cloud className="w-8 h-8 text-cyan-400 mx-auto" />
          <h2 className="text-3xl font-bold">{t("tool_page.login_required")}</h2>
          <Link href="/register">
            <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
              {t("tool_page.create_account")} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
