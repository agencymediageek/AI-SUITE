import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Users, Upload, Sparkles, Check, Star, Image, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/layout/public-layout";
import { useI18n } from "@/lib/i18n";

export default function AiInfluencer() {
  const { t, locale } = useI18n();
  const isPt = locale === "pt";

  const features = isPt ? [
    "Escolha entre 50+ avatares de IA (moda, fitness, lifestyle, tech)",
    "Upload da foto do produto em qualquer ângulo",
    "IA posiciona o influenciador com o produto naturalmente",
    "Geração de imagens em alta resolução (4K)",
    "Múltiplos formatos: Feed, Stories, Reels, Banner",
    "Sem custos de estúdio ou contratação de modelo",
  ] : [
    "Choose from 50+ AI avatars (fashion, fitness, lifestyle, tech)",
    "Upload your product photo from any angle",
    "AI naturally positions the influencer with your product",
    "High-resolution output (4K ready)",
    "Multiple formats: Feed, Stories, Reels, Banner",
    "No studio or model hiring costs",
  ];

  const steps = isPt ? [
    { step: "01", title: "Escolha o Avatar", desc: "Selecione o influenciador de IA que combina com a identidade da sua marca." },
    { step: "02", title: "Envie o Produto", desc: "Faça upload da foto do seu produto. Qualquer ângulo funciona." },
    { step: "03", title: "Gere o Conteúdo", desc: "Nossa IA cria imagens e vídeos virais em segundos." },
  ] : [
    { step: "01", title: "Choose the Avatar", desc: "Select the AI influencer that matches your brand identity." },
    { step: "02", title: "Upload Your Product", desc: "Upload your product photo. Any angle works." },
    { step: "03", title: "Generate Content", desc: "Our AI creates viral images and videos in seconds." },
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto max-w-5xl px-4 py-12 space-y-20">
        {/* Back */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2">
            <ArrowLeft className="w-4 h-4" /> {t("tool_page.back")}
          </Button>
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
          <div className="inline-flex w-20 h-20 rounded-3xl bg-pink-500/10 items-center justify-center mx-auto">
            <Users className="w-10 h-10 text-pink-400" />
          </div>
          <Badge variant="outline" className="bg-pink-500/10 text-pink-400 border-pink-500/20 px-4 py-1 text-xs uppercase tracking-widest">
            {isPt ? "IA Generativa" : "Generative AI"}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            {isPt ? "AI Influencer Studio" : "AI Influencer Studio"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isPt
              ? "Crie campanhas com modelos profissionais sem gastar milhares com estúdio. Escolha um avatar de IA, envie a foto do produto e gere conteúdo viral."
              : "Create campaigns with professional models without spending thousands on studios. Choose an AI avatar, upload your product photo, and generate viral content."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href="/register">
              <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-pink-500 to-rose-600 hover:shadow-lg hover:shadow-pink-500/25 transition-all">
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

        {/* Demo mockup */}
        <div className="relative rounded-2xl border border-border/50 bg-card/50 overflow-hidden p-8">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: isPt ? "Avatar Selecionado" : "Selected Avatar", icon: Users, color: "text-pink-400 bg-pink-500/10" },
              { label: isPt ? "Produto Enviado" : "Product Uploaded", icon: Upload, color: "text-amber-400 bg-amber-500/10" },
              { label: isPt ? "Conteúdo Gerado" : "Content Generated", icon: Image, color: "text-emerald-400 bg-emerald-500/10" },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-background p-6 flex flex-col items-center gap-3 text-center">
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold">{item.label}</span>
                <div className="w-full h-32 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground/30" />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <p className="text-xs text-muted-foreground">{isPt ? "Preview interativo disponível após criar conta gratuita" : "Interactive preview available after creating a free account"}</p>
          </div>
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
                <div className="w-6 h-6 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-pink-400" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 py-8 rounded-2xl bg-gradient-to-br from-pink-500/10 via-background to-rose-600/10 border border-pink-500/20 px-8">
          <Star className="w-8 h-8 text-pink-400 mx-auto" />
          <h2 className="text-3xl font-bold">{t("tool_page.login_required")}</h2>
          <Link href="/register">
            <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-pink-500 to-rose-600 hover:shadow-lg hover:shadow-pink-500/25 transition-all">
              {t("tool_page.create_account")} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
