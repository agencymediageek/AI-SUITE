import { PublicLayout } from "@/components/layout/public-layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { UserPlus, MousePointerClick, Sparkles, Zap, LayoutDashboard, History, Star, ArrowRight, CheckCircle2, Rocket } from "lucide-react";

export default function ComoFunciona() {
  const { locale } = useI18n();
  const isPt = locale === "pt";

  const steps = [
    {
      icon: UserPlus,
      number: "01",
      title: isPt ? "Crie sua Conta Gratuita" : "Create Your Free Account",
      desc: isPt
        ? "Cadastre-se em menos de 1 minuto com seu e-mail. Sem cartão de crédito. Você recebe tokens gratuitos para testar as ferramentas imediatamente."
        : "Sign up in under 1 minute with your email. No credit card required. You get free tokens to test tools right away.",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      icon: LayoutDashboard,
      number: "02",
      title: isPt ? "Acesse o Painel" : "Access the Dashboard",
      desc: isPt
        ? "Seu painel centraliza tudo: saldo de tokens, histórico de gerações, ferramentas favoritas e estatísticas de uso. Tudo em uma interface limpa e rápida."
        : "Your dashboard centralizes everything: token balance, generation history, favorite tools, and usage stats — all in a clean, fast interface.",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      icon: MousePointerClick,
      number: "03",
      title: isPt ? "Escolha sua Ferramenta" : "Choose Your Tool",
      desc: isPt
        ? "Mais de 100 ferramentas organizadas por categoria: Marketing, Vídeo, Áudio, Design, Código e mais. Use a busca ou filtre pela categoria que precisa."
        : "Over 100 tools organized by category: Marketing, Video, Audio, Design, Code and more. Use the search or filter by the category you need.",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      icon: Sparkles,
      number: "04",
      title: isPt ? "Descreva o que Quer" : "Describe What You Want",
      desc: isPt
        ? "Cada ferramenta tem campos simples e objetivos. Digite seu prompt ou preencha as informações — nossa IA entende contexto, tom e objetivo sem configurações complexas."
        : "Each tool has simple, focused fields. Type your prompt or fill in the details — our AI understands context, tone, and goal without complex setup.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      icon: Zap,
      number: "05",
      title: isPt ? "Receba o Resultado em Segundos" : "Get Results in Seconds",
      desc: isPt
        ? "Conteúdo profissional gerado em segundos. Texto, imagem, música, código — pronto para usar. Copie, baixe ou salve diretamente no seu histórico."
        : "Professional content generated in seconds. Text, image, music, code — ready to use. Copy, download, or save directly to your history.",
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
    },
    {
      icon: History,
      number: "06",
      title: isPt ? "Acesse seu Histórico" : "Access Your History",
      desc: isPt
        ? "Todas as suas gerações ficam salvas com data, ferramenta utilizada e o prompt. Reutilize, refine ou exporte qualquer resultado com um clique."
        : "All your generations are saved with date, tool used, and prompt. Reuse, refine, or export any result with one click.",
      color: "text-fuchsia-400",
      bg: "bg-fuchsia-500/10",
      border: "border-fuchsia-500/20",
    },
  ];

  const features = isPt ? [
    "Sem limite de ferramentas por sessão",
    "Troca de idioma PT-BR / EN em tempo real",
    "Modelos de IA de última geração (Gemini, Grok)",
    "Histórico de todas as gerações salvo automaticamente",
    "Fluxos N8N para automações avançadas (planos Pro+)",
    "API REST para integração com seus sistemas",
    "Favoritos para acesso rápido às suas ferramentas preferidas",
    "Suporte por chat com assistente de IA",
  ] : [
    "No limit on tools per session",
    "Real-time PT-BR / EN language switching",
    "Latest AI models (Gemini, Grok)",
    "All generations saved to history automatically",
    "N8N flows for advanced automation (Pro+ plans)",
    "REST API for integration with your own systems",
    "Favorites for quick access to your preferred tools",
    "Chat support with AI assistant",
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-20 pb-16 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            {isPt ? "Guia Completo da Plataforma" : "Full Platform Guide"}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
            {isPt ? (
              <>Como funciona a <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">MediaGeek AI Suite</span></>
            ) : (
              <>How <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">MediaGeek AI Suite</span> Works</>
            )}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {isPt
              ? "Do cadastro ao conteúdo publicado em menos de 3 minutos. Veja exatamente como nossa plataforma funciona, passo a passo."
              : "From sign-up to published content in under 3 minutes. See exactly how our platform works, step by step."}
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex gap-6 items-start group">
                  <div className={`shrink-0 w-14 h-14 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-3xl font-black ${step.color} opacity-30 font-mono leading-none`}>{step.number}</span>
                      <h3 className="text-xl font-bold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features list */}
      <section className="py-16 px-4 bg-card/30 border-y border-border/40">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-10">
            {isPt ? "O que está incluso em todos os planos" : "What's included in all plans"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feat, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">
            {isPt ? "Pronto para começar?" : "Ready to get started?"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isPt
              ? "Crie sua conta gratuita agora e comece a gerar conteúdo profissional em minutos."
              : "Create your free account now and start generating professional content in minutes."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button size="lg" className="rounded-full px-8 w-full sm:w-auto">
                {isPt ? "Criar Conta Grátis" : "Create Free Account"} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="rounded-full px-8 w-full sm:w-auto">
                {isPt ? "Ver Planos" : "View Plans"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
