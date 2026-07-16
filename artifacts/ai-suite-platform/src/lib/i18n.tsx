import React, { createContext, useContext, useEffect, useState } from "react";

export type Locale = "pt" | "en";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  currency: "BRL" | "USD";
  formatPrice: (usdPrice: number) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  pt: {
    // Nav
    "nav.pricing": "Preços",
    "nav.tools": "Ferramentas",
    "nav.signin": "Entrar",
    "nav.get_started": "Começar Grátis",
    "nav.dashboard": "Painel",
    // Hero
    "hero.badge": "🚀 Versão 2.0 ao vivo",
    "hero.title1": "O Centro de Comando para",
    "hero.title2": "Fluxos de Trabalho com IA",
    "hero.subtitle": "Acesse 100+ ferramentas premium de IA em um único painel. De marketing a código, acelere o resultado da sua equipe.",
    "hero.cta_primary": "Começar Gratuitamente",
    "hero.cta_secondary": "Ver Preços",
    // Featured tools section
    "tools.featured_title": "Ferramentas Premium que Geram Receita",
    "tools.featured_subtitle": "Destaque-se com ferramentas de IA que o mercado mais procura. Cada uma com página dedicada e teste gratuito.",
    "tools.try_free": "Testar Grátis",
    "tools.view_all": "Ver Todas as Ferramentas",
    "tools.popular_badge": "Popular",
    "tools.new_badge": "Novo",
    // Tool names
    "tool.ai_influencer.name": "AI Influencer Studio",
    "tool.ai_influencer.desc": "Escolha um avatar de IA, envie a foto do seu produto e gere imagens e vídeos virais do influenciador segurando o produto.",
    "tool.viral_reels.name": "Gerador de Reels Virais",
    "tool.viral_reels.desc": "Vídeos verticais automatizados para Instagram e TikTok com legendas dinâmicas e ganchos de retenção psicológicos.",
    "tool.thumbnail.name": "Criador de Thumbnails Pro",
    "tool.thumbnail.desc": "Thumbnails e logotipos com alta taxa de clique (CTR), com contraste otimizado por IA e expressões faciais impactantes.",
    "tool.music.name": "Criador de Música com IA",
    "tool.music.desc": "Gere trilhas sonoras e jingles comerciais livres de direitos baseados no estilo musical que você preferir.",
    "tool.website.name": "Criador de Sites com IA",
    "tool.website.desc": "Crie sites HTML estáticos ultrarrápidos com um clique e publique automaticamente na rede global da Cloudflare.",
    "tool.manga.name": "Manga Studio AI",
    "tool.manga.desc": "Crie histórias em quadrinhos, mangás e narrativas visuais completas a partir de um simples texto ou roteiro.",
    // How it works
    "how.title": "Como Funciona",
    "how.subtitle": "Três passos para transformar qualquer ideia em conteúdo profissional.",
    "how.step1.title": "Escolha sua Ferramenta",
    "how.step1.desc": "Mais de 100 ferramentas especializadas organizadas por categoria. Busque, filtre e encontre exatamente o que precisa.",
    "how.step2.title": "Insira seu Comando",
    "how.step2.desc": "Apenas 1 ou 2 inputs e um clique. Nossa IA entende contexto, tom e objetivo — sem configurações complexas.",
    "how.step3.title": "Receba o Resultado",
    "how.step3.desc": "Conteúdo profissional gerado em segundos. Salve no histórico, edite ou exporte diretamente para sua plataforma.",
    // Features
    "features.title": "Tudo que Você Precisa para Escalar",
    "features.subtitle": "Pare de gerenciar múltiplas assinaturas. Tenha acesso aos melhores modelos e fluxos de trabalho em uma plataforma única.",
    "features.models.title": "Múltiplos Modelos de IA",
    "features.models.desc": "Grok, Gemini, GPT-4 — alterne entre os melhores modelos sem esforço.",
    "features.tools.title": "100+ Ferramentas Prontas",
    "features.tools.desc": "Marketing, código, design, vídeo, áudio — tudo pré-configurado para resultado imediato.",
    "features.performance.title": "Alta Performance",
    "features.performance.desc": "Infraestrutura enterprise garante geração rápida mesmo em horários de pico.",
    "features.agents.title": "Fluxos de 1 Clique",
    "features.agents.desc": "Sequências automáticas: texto → imagem → criativo pronto. Sua agência em modo turbo.",
    "features.api.title": "Acesso via API",
    "features.api.desc": "Integre nossas ferramentas diretamente em seus aplicativos via REST API autenticada.",
    "features.multilang.title": "Multilíngue",
    "features.multilang.desc": "Interface em português e inglês com preços em Real ou Dólar baseados na sua localização.",
    // Stats
    "stats.users": "Usuários Ativos",
    "stats.tools": "Ferramentas de IA",
    "stats.generations": "Gerações",
    "stats.uptime": "Disponibilidade",
    // Pricing
    "pricing.title": "Preços Simples e Transparentes",
    "pricing.subtitle": "Acesso a 100+ ferramentas e modelos premium. Escolha o plano que se encaixa na sua necessidade.",
    "pricing.popular": "Mais Popular",
    "pricing.tokens_mo": "tokens / mês",
    "pricing.subscribe": "Assinar",
    "pricing.current_plan": "Plano Atual",
    "pricing.period.month": "mês",
    "pricing.period.year": "ano",
    "pricing.free_trial": "Teste grátis por 7 dias. Cancele quando quiser.",
    // CTA
    "cta.title": "Pronto para Turbinar seu Fluxo de Trabalho?",
    "cta.subtitle": "Junte-se a profissionais que já estão construindo o futuro com IA.",
    "cta.button": "Começar Gratuitamente",
    // Footer
    "footer.rights": "Todos os direitos reservados.",
    "footer.tools": "Ferramentas",
    "footer.pricing": "Preços",
    "footer.login": "Entrar",
    "footer.register": "Cadastrar",
    // Dashboard / App
    "app.dashboard": "Painel",
    "app.tools": "Ferramentas",
    "app.history": "Histórico",
    "app.account": "Conta",
    "app.admin": "Admin",
    "app.logout": "Sair",
    "app.free_plan": "Plano Gratuito",
    // Chatbot
    "chatbot.title": "MediaGeek AI",
    "chatbot.subtitle": "Assistente Virtual",
    "chatbot.placeholder": "Pergunte qualquer coisa...",
    "chatbot.welcome": "Olá! Sou o assistente da MediaGeek. Como posso ajudar você hoje?",
    "chatbot.send": "Enviar",
    "chatbot.thinking": "Pensando...",
    "chatbot.error": "Erro ao conectar. Tente novamente.",
    // Tool pages
    "tool_page.try_now": "Testar Agora",
    "tool_page.see_plans": "Ver Planos",
    "tool_page.how_works": "Como Funciona",
    "tool_page.features": "Recursos",
    "tool_page.back": "Voltar para Ferramentas",
    "tool_page.login_required": "Crie uma conta gratuita para ver o resultado completo",
    "tool_page.create_account": "Criar Conta Gratuita",
  },
  en: {
    // Nav
    "nav.pricing": "Pricing",
    "nav.tools": "Tools",
    "nav.signin": "Sign In",
    "nav.get_started": "Get Started Free",
    "nav.dashboard": "Dashboard",
    // Hero
    "hero.badge": "🚀 Version 2.0 is live",
    "hero.title1": "The Command Center for",
    "hero.title2": "AI-Powered Workflows",
    "hero.subtitle": "Access 100+ premium AI tools in one unified dashboard. From content generation to code, accelerate your team's output.",
    "hero.cta_primary": "Start Building for Free",
    "hero.cta_secondary": "View Pricing",
    // Featured tools section
    "tools.featured_title": "Premium Tools That Generate Revenue",
    "tools.featured_subtitle": "Stand out with the AI tools the market demands most. Each one with a dedicated page and free trial.",
    "tools.try_free": "Try for Free",
    "tools.view_all": "View All Tools",
    "tools.popular_badge": "Popular",
    "tools.new_badge": "New",
    // Tool names
    "tool.ai_influencer.name": "AI Influencer Studio",
    "tool.ai_influencer.desc": "Select an AI avatar, upload your product photo, and generate viral images and videos of the influencer holding your product.",
    "tool.viral_reels.name": "Viral Reels Generator",
    "tool.viral_reels.desc": "Automated vertical videos for Instagram and TikTok with dynamic captions and psychological retention hooks.",
    "tool.thumbnail.name": "Pro Thumbnail Maker",
    "tool.thumbnail.desc": "Thumbnails and logos with high click-through rates (CTR), with AI-optimized contrast and impactful facial expressions.",
    "tool.music.name": "AI Music Creator",
    "tool.music.desc": "Generate royalty-free soundtracks and commercial jingles based on whatever musical style you prefer.",
    "tool.website.name": "AI Website Builder",
    "tool.website.desc": "Create ultra-fast static HTML sites with one click and automatically deploy to Cloudflare's global network.",
    "tool.manga.name": "Manga Studio AI",
    "tool.manga.desc": "Create comics, manga, and complete visual narratives from a simple text prompt or script.",
    // How it works
    "how.title": "How It Works",
    "how.subtitle": "Three steps to turn any idea into professional content.",
    "how.step1.title": "Choose Your Tool",
    "how.step1.desc": "100+ specialized tools organized by category. Search, filter, and find exactly what you need.",
    "how.step2.title": "Enter Your Prompt",
    "how.step2.desc": "Just 1 or 2 inputs and one click. Our AI understands context, tone, and goal — no complex setup.",
    "how.step3.title": "Get the Result",
    "how.step3.desc": "Professional content generated in seconds. Save to history, edit, or export directly to your platform.",
    // Features
    "features.title": "Everything You Need to Scale",
    "features.subtitle": "Stop juggling subscriptions. Get access to the best models and workflows in a single, predictable platform.",
    "features.models.title": "Multiple AI Models",
    "features.models.desc": "Grok, Gemini, GPT-4 — switch between top models seamlessly.",
    "features.tools.title": "100+ Ready Tools",
    "features.tools.desc": "Marketing, code, design, video, audio — all pre-configured for immediate results.",
    "features.performance.title": "High Performance",
    "features.performance.desc": "Enterprise-grade infrastructure ensures fast generation times even at peak hours.",
    "features.agents.title": "1-Click Workflows",
    "features.agents.desc": "Automatic sequences: text → image → finished creative. Your agency in turbo mode.",
    "features.api.title": "API Access",
    "features.api.desc": "Integrate our tools directly into your own applications via authenticated REST API.",
    "features.multilang.title": "Multilingual",
    "features.multilang.desc": "Interface in Portuguese and English with prices in BRL or USD based on your location.",
    // Stats
    "stats.users": "Active Users",
    "stats.tools": "AI Tools",
    "stats.generations": "Generations",
    "stats.uptime": "Uptime",
    // Pricing
    "pricing.title": "Simple, Transparent Pricing",
    "pricing.subtitle": "Access to 100+ AI tools and premium models. Choose the plan that fits your needs.",
    "pricing.popular": "Most Popular",
    "pricing.tokens_mo": "tokens / mo",
    "pricing.subscribe": "Subscribe",
    "pricing.current_plan": "Current Plan",
    "pricing.period.month": "month",
    "pricing.period.year": "year",
    "pricing.free_trial": "7-day free trial. Cancel anytime.",
    // CTA
    "cta.title": "Ready to Superpower Your Workflow?",
    "cta.subtitle": "Join thousands of professionals already building the future with AI.",
    "cta.button": "Get Started for Free",
    // Footer
    "footer.rights": "All rights reserved.",
    "footer.tools": "Tools",
    "footer.pricing": "Pricing",
    "footer.login": "Login",
    "footer.register": "Register",
    // Dashboard / App
    "app.dashboard": "Dashboard",
    "app.tools": "Tools",
    "app.history": "History",
    "app.account": "Account",
    "app.admin": "Admin",
    "app.logout": "Logout",
    "app.free_plan": "Free Plan",
    // Chatbot
    "chatbot.title": "MediaGeek AI",
    "chatbot.subtitle": "Virtual Assistant",
    "chatbot.placeholder": "Ask me anything...",
    "chatbot.welcome": "Hi! I'm MediaGeek's assistant. How can I help you today?",
    "chatbot.send": "Send",
    "chatbot.thinking": "Thinking...",
    "chatbot.error": "Connection error. Please try again.",
    // Tool pages
    "tool_page.try_now": "Try Now",
    "tool_page.see_plans": "See Plans",
    "tool_page.how_works": "How It Works",
    "tool_page.features": "Features",
    "tool_page.back": "Back to Tools",
    "tool_page.login_required": "Create a free account to see the full result",
    "tool_page.create_account": "Create Free Account",
  },
};

const I18nContext = createContext<I18nContextType | null>(null);

// BRL conversion rate (approximate)
const USD_TO_BRL = 5.5;

async function detectLocale(): Promise<Locale> {
  // 1. Check localStorage first
  const stored = localStorage.getItem("mediageek_locale") as Locale | null;
  if (stored === "pt" || stored === "en") return stored;

  // 2. Check browser language
  const browserLang = navigator.language?.toLowerCase() || "";
  if (browserLang.startsWith("pt")) return "pt";

  // 3. Check IP geolocation as fallback
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    if (data.country_code === "BR") return "pt";
  } catch {
    // silent fail — default to en
  }

  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    detectLocale().then(setLocaleState);
  }, []);

  const setLocale = (l: Locale) => {
    localStorage.setItem("mediageek_locale", l);
    setLocaleState(l);
  };

  const t = (key: string): string => {
    return translations[locale][key] ?? translations["en"][key] ?? key;
  };

  const currency = locale === "pt" ? "BRL" : "USD";

  const formatPrice = (usdPrice: number): string => {
    if (locale === "pt") {
      const brl = usdPrice * USD_TO_BRL;
      return `R$ ${brl.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
    }
    return `$${usdPrice}`;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, currency, formatPrice }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
