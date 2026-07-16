import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Music, Check, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/layout/public-layout";
import { useI18n } from "@/lib/i18n";

export default function MusicCreator() {
  const { t, locale } = useI18n();
  const isPt = locale === "pt";

  const features = isPt ? [
    "Trilhas 100% livres de direitos autorais (copyright-free)",
    "Estilos: Lo-fi, Pop, Eletrônico, Sertanejo, Funk, Rock e mais",
    "Jingles comerciais com letra e melodia personalizados",
    "Duração configurável: 15s, 30s, 60s ou 3 minutos",
    "Download em MP3 e WAV de alta qualidade",
    "Integração direta com seu Reel ou vídeo gerado",
  ] : [
    "100% royalty-free tracks (copyright-free)",
    "Styles: Lo-fi, Pop, Electronic, Country, Funk, Rock, and more",
    "Commercial jingles with custom lyrics and melody",
    "Configurable duration: 15s, 30s, 60s or 3 minutes",
    "Download in high-quality MP3 and WAV",
    "Direct integration with your generated Reel or video",
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
          <div className="inline-flex w-20 h-20 rounded-3xl bg-emerald-500/10 items-center justify-center mx-auto">
            <Music className="w-10 h-10 text-emerald-400" />
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1 text-xs uppercase tracking-widest">
            {isPt ? "Áudio com IA" : "AI Audio"}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            {t("tool.music.name")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isPt
              ? "Gere trilhas sonoras e jingles comerciais livres de direitos baseados no estilo musical que você preferir. Perfeito para Reels, anúncios e podcasts."
              : "Generate royalty-free soundtracks and commercial jingles based on whatever musical style you prefer. Perfect for Reels, ads and podcasts."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href="/register">
              <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
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

        {/* Genre pills */}
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            {isPt ? "Estilos disponíveis" : "Available styles"}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Lo-fi", "Pop", "Electronic", "Hip-Hop", "Jazz", "Rock", "Sertanejo", "Funk", "Reggaeton", "Classical", "Cinematic", "Podcast"].map((g, i) => (
              <span key={i} className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">{g}</span>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center">{t("tool_page.features")}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border/50">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center space-y-6 py-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-background to-teal-600/10 border border-emerald-500/20 px-8">
          <Headphones className="w-8 h-8 text-emerald-400 mx-auto" />
          <h2 className="text-3xl font-bold">{t("tool_page.login_required")}</h2>
          <Link href="/register">
            <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
              {t("tool_page.create_account")} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
