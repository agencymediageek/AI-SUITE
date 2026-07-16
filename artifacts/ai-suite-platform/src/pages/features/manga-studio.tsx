import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Wand2, Check, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/layout/public-layout";
import { useI18n } from "@/lib/i18n";

export default function MangaStudio() {
  const { t, locale } = useI18n();
  const isPt = locale === "pt";

  const features = isPt ? [
    "Criação de personagens originais com IA",
    "Estilos: Manga, Anime, Comics ocidentais, Chibi",
    "Geração de painéis completos com diálogos automáticos",
    "Narrativas de 1 a 50 páginas em segundos",
    "Exportação em PDF, PNG por painel ou ZIP completo",
    "Ideal para criadores de conteúdo, professores e autores",
  ] : [
    "Original character creation with AI",
    "Styles: Manga, Anime, Western Comics, Chibi",
    "Complete panel generation with automatic dialogues",
    "Narratives from 1 to 50 pages in seconds",
    "Export in PDF, PNG per panel or complete ZIP",
    "Ideal for content creators, teachers and authors",
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
          <div className="inline-flex w-20 h-20 rounded-3xl bg-fuchsia-500/10 items-center justify-center mx-auto">
            <Wand2 className="w-10 h-10 text-fuchsia-400" />
          </div>
          <Badge variant="outline" className="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 px-4 py-1 text-xs uppercase tracking-widest">
            {isPt ? "Arte Criativa" : "Creative Art"}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            {t("tool.manga.name")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isPt
              ? "Crie histórias em quadrinhos, mangás e narrativas visuais completas a partir de um simples texto ou roteiro. Do prompt ao quadrinho em segundos."
              : "Create comics, manga, and complete visual narratives from a simple text prompt or script. From prompt to comic in seconds."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href="/register">
              <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all">
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

        {/* Style pills */}
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            {isPt ? "Estilos de arte" : "Art styles"}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Manga", "Anime", "Comics", "Chibi", "Webtoon", "American Comics", "Graphic Novel", "Pixel Art"].map((s, i) => (
              <span key={i} className="px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-sm font-medium">{s}</span>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center">{t("tool_page.features")}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border/50">
                <div className="w-6 h-6 rounded-full bg-fuchsia-500/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-fuchsia-400" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center space-y-6 py-8 rounded-2xl bg-gradient-to-br from-fuchsia-500/10 via-background to-pink-600/10 border border-fuchsia-500/20 px-8">
          <BookOpen className="w-8 h-8 text-fuchsia-400 mx-auto" />
          <h2 className="text-3xl font-bold">{t("tool_page.login_required")}</h2>
          <Link href="/register">
            <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all">
              {t("tool_page.create_account")} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
