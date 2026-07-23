/**
 * NICHO CONFIG — Arquivo central de configuração da plataforma
 * Edite APENAS este arquivo para customizar uma filha da MediaGeek.
 * Nunca edite diretamente os componentes para branding — use este config.
 *
 * Deploy de nova filha: veja /deploy/README.md
 */

const nichoConfig = {
  // ─── IDENTIDADE ───────────────────────────────────────────────────────────
  platform: {
    name: "MediaGeek AI",           // Nome da plataforma
    tagline: "Sua IA para criação de conteúdo",
    description: "Plataforma de inteligência artificial com mais de 80 ferramentas",
    domain: "mediageek.io",         // Domínio principal (sem https://)
    supportEmail: "suporte@mediageek.io",
    logoUrl: "/logo.png",           // Dentro de /public/
    faviconUrl: "/favicon.ico",
    locale: "pt-BR",                // Idioma padrão
  },

  // ─── CORES (Tailwind / CSS vars) ──────────────────────────────────────────
  branding: {
    primaryColor: "#0d9488",        // teal-600 — cor principal (botões, header)
    primaryHover: "#0f766e",        // teal-700
    accentColor: "#f59e0b",         // amber — destaques e avisos
    // Para alterar: edite src/app/globals.css → --primary
  },

  // ─── NICHO & FERRAMENTAS ──────────────────────────────────────────────────
  niche: {
    category: "geral",              // geral | marketing | juridico | saude | educacao | financas
    focusTools: [],                 // IDs das ferramentas em destaque no dashboard (vazio = padrão)
    hiddenTools: [],                // IDs de ferramentas completamente ocultas na sidebar
  },

  // ─── PLANOS (texto exibido — valores reais no banco) ──────────────────────
  plans: {
    free: {
      tokens: 300,
      expiryDays: 14,
      toolCount: 10,
    },
    currency: "USD",                // Moeda de exibição
    mercadoPagoEnabled: true,       // Exibe opção MP na pricing page
    stripeEnabled: true,
  },

  // ─── CHAT DE SUPORTE ──────────────────────────────────────────────────────
  support: {
    enabled: true,
    aiEngine: "grok",               // grok | gemini (grok recomendado para produção)
    // O system prompt é gerado automaticamente com base em platform.name e niche.category
    // Para sobrescrever: edite src/lib/rag.ts → systemPrompt
  },

  // ─── INTEGRAÇÕES ──────────────────────────────────────────────────────────
  integrations: {
    // Configure as chaves em .env.local — nunca aqui
    grok: true,
    gemini: false,    // Ativar somente com billing habilitado no Google AI Studio
    stripe: true,
    mercadoPago: true,
    n8n: false,       // Webhooks N8N para automações avançadas
  },
};

export default nichoConfig;
export type NichoConfig = typeof nichoConfig;
