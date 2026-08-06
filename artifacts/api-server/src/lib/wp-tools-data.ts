/**
 * WP TechSites — Static Tool Definitions
 *
 * This file is the single source of truth for every tool available in the
 * WP TechSites SaaS dashboard. It mirrors the pattern used by tools-data.ts
 * in the AI Suite (MediaGeek).
 *
 * Each tool has:
 *   - id            → URL-safe identifier used in the DB, API calls, and N8N routing
 *   - label         → Human-readable name shown in the dashboard
 *   - creditCost    → Credits deducted per successful execution
 *   - description   → Short description for the UI
 *   - n8nDefaultPath→ N8N webhook path on n8n.xbest.cloud (null = direct AI only)
 *   - systemPrompt  → System-level instructions sent to the AI (or to N8N as context)
 *   - plan          → Minimum plan required ("trial" | "starter" | "pro")
 *
 * N8N ROUTING PATTERN
 * ───────────────────
 * At startup, ensureWpSitesTable() seeds the wp_tools_config table with the
 * N8N webhook URLs for tools that have n8nDefaultPath set. At execution time,
 * POST /api/wp/execute reads from that table.
 *
 * Admins can override any URL in wp_tools_config without touching this file
 * (ON CONFLICT DO NOTHING — seeds only on first boot).
 *
 * To point a tool to a different N8N workflow, run:
 *   UPDATE wp_tools_config SET n8n_webhook_url = '...' WHERE id = 'seo-audit';
 */

export const WP_N8N_BASE_URL = "https://n8n.xbest.cloud/webhook";

export interface WpTool {
  id: string;
  label: string;
  creditCost: number;
  description: string;
  n8nDefaultPath: string | null;
  systemPrompt: string;
  plan: "trial" | "starter" | "pro";
  icon: string;
}

export const WP_TOOLS: WpTool[] = [
  {
    id: "seo-audit",
    label: "Auditoria SEO",
    creditCost: 10,
    description: "Análise técnica completa do site com pontuação, problemas e recomendações priorizadas.",
    n8nDefaultPath: "seocontent-audit",
    plan: "trial",
    icon: "🔍",
    systemPrompt: `Você é um especialista em SEO técnico para WordPress. Analise os dados do site fornecidos e gere uma auditoria SEO profissional e detalhada em JSON. Inclua score (0-100), grade (A/B/C/D), checks individuais (status ok/warn/fail/info), recomendações priorizadas e quick wins. Responda em português brasileiro.`,
  },
  {
    id: "generate-content",
    label: "Gerador de Conteúdo",
    creditCost: 5,
    description: "Cria conteúdo de marketing completo: posts, páginas, e-mails, posts sociais ou copy de anúncios.",
    n8nDefaultPath: "seocontent-v4",
    plan: "trial",
    icon: "✍️",
    systemPrompt: `Você é um especialista em marketing de conteúdo digital e copywriting para sites WordPress. Crie conteúdo profissional, otimizado para SEO e conversão. Retorne JSON com title, metaDescription, content (HTML), e excerpt. Responda em português brasileiro por padrão.`,
  },
  {
    id: "chat-editor",
    label: "Chat Editor",
    creditCost: 3,
    description: "Controle o WordPress com linguagem natural: crie posts, atualize tagline, adicione listings.",
    n8nDefaultPath: "ts-chat-editor-intake",
    plan: "starter",
    icon: "🤖",
    systemPrompt: `Você é um assistente inteligente que controla um site WordPress via comandos em linguagem natural. Interprete o comando do usuário e retorne JSON com as ações WordPress a executar (create_post, update_tagline, create_listing, etc). Responda em português brasileiro.`,
  },
  {
    id: "article-with-images",
    label: "Artigo com Imagens",
    creditCost: 8,
    description: "Gera um artigo SEO completo com imagens Hero e publica diretamente no WordPress.",
    n8nDefaultPath: null, // Uses complex WP REST publish logic in the dedicated route
    plan: "starter",
    icon: "📰",
    systemPrompt: `Você é um especialista em SEO e marketing de conteúdo. Crie um artigo profissional com H1/H2/H3, meta description, slug, tags e reading_time estimado. Conteúdo em HTML semântico. Retorne JSON. Responda em português brasileiro.`,
  },
  {
    id: "generate-colors",
    label: "Paleta de Cores IA",
    creditCost: 2,
    description: "Sugere 3 paletas de cores profissionais baseadas no nicho e estilo do site.",
    n8nDefaultPath: null,
    plan: "trial",
    icon: "🎨",
    systemPrompt: `Você é um designer especialista em branding digital. Crie paletas de cores profissionais (primary, secondary, accent, text, background) para sites WordPress. Cores devem ser contrastantes, acessíveis (WCAG AA) e coerentes com o nicho. Retorne JSON com array de paletas.`,
  },
  {
    id: "generate-menu",
    label: "Menu Builder IA",
    creditCost: 3,
    description: "Sugere estrutura de navegação otimizada para o nicho do site com ícones e slugs.",
    n8nDefaultPath: null,
    plan: "trial",
    icon: "📋",
    systemPrompt: `Você é um especialista em UX e arquitetura de informação para sites WordPress. Crie estruturas de menu de navegação claras e otimizadas para conversão. Retorne JSON com menuItems (label, slug, icon emoji). Máximo 7 itens. Responda no idioma solicitado.`,
  },
  {
    id: "generate-logo",
    label: "Logo IA",
    creditCost: 15,
    description: "Gera um logotipo SVG profissional pronto para usar no header do site.",
    n8nDefaultPath: null,
    plan: "starter",
    icon: "🖼️",
    systemPrompt: `Você é um designer especialista em identidade visual. Crie logos SVG profissionais e modernos para sites. O SVG deve ter viewBox 0 0 300 80 (landscape), ícone à esquerda e nome à direita. Use apenas o código SVG, sem markdown ou explicações.`,
  },
  {
    id: "page-from-url",
    label: "Página de Empresa",
    creditCost: 5,
    description: "Extrai informações de um site externo e cria uma página WordPress profissional.",
    n8nDefaultPath: null,
    plan: "starter",
    icon: "🌐",
    systemPrompt: `Você é um especialista em criação de páginas WordPress a partir de dados de sites externos. Analise o conteúdo fornecido e crie uma página profissional com title, slug, meta_description, content_html e business_info. Retorne JSON. Responda em português brasileiro.`,
  },
  {
    id: "scraping",
    label: "Importar Listings (BrightData)",
    creditCost: 20,
    description: "Importa estabelecimentos reais do Google Maps para o diretório WordPress via BrightData.",
    n8nDefaultPath: null,
    plan: "pro",
    icon: "🗂️",
    systemPrompt: `Você é um especialista em dados e diretórios de negócios locais. Gere listings realistas com nome, endereço, telefone, site, avaliação e descrição para a categoria e cidade solicitadas. Retorne um array JSON de listings.`,
  },
  {
    id: "chatbot",
    label: "Chatbot IA",
    creditCost: 1,
    description: "Chatbot inteligente para atendimento 24/7 aos visitantes do site.",
    n8nDefaultPath: null,
    plan: "trial",
    icon: "💬",
    systemPrompt: `Você é o assistente IA do site. Responda de forma útil, concisa e amigável em português. Ajude visitantes com dúvidas sobre o site e seus serviços.`,
  },
];

/** Look up a tool by ID. Returns undefined if not found. */
export function getWpToolById(id: string): WpTool | undefined {
  return WP_TOOLS.find((t) => t.id === id);
}

/**
 * Build the full N8N webhook URL for a tool.
 * Returns null if the tool has no default N8N path.
 */
export function getWpToolN8nUrl(tool: WpTool): string | null {
  if (!tool.n8nDefaultPath) return null;
  return `${WP_N8N_BASE_URL}/${tool.n8nDefaultPath}`;
}
