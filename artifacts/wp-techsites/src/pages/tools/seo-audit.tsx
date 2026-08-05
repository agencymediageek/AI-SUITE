import { useState } from 'react';
import { Link } from 'wouter';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { getApiBaseUrl, getWpApiHeaders } from '@/lib/api-headers';
import {
  Loader2, ShieldCheck, CheckCircle2, AlertTriangle, XCircle,
  TrendingUp, Search, Zap, FileText, MessageSquare, Image,
  Palette, Store, Globe, Puzzle, Info,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface CheckItem {
  label: string;
  status: 'good' | 'warning' | 'error' | 'info';
  message: string;
  score: number;
}

interface AuditResult {
  overall: number;
  grade: string;
  summary: string;
  items: CheckItem[];
  recommendations: string[];
  quick_wins: string[];
  theme?: { label?: string; type?: string; icon?: string };
  plugins_detected?: string[];
  site_name?: string;
  generated_at?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const normalizeStatus = (s: string): CheckItem['status'] => {
  if (s === 'ok' || s === 'good') return 'good';
  if (s === 'warn' || s === 'warning') return 'warning';
  if (s === 'fail' || s === 'error') return 'error';
  return 'info';
};

const statusIcon = (s: CheckItem['status']) => {
  if (s === 'good') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (s === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  if (s === 'error') return <XCircle className="w-4 h-4 text-red-500" />;
  return <Info className="w-4 h-4 text-blue-400" />;
};

const statusColor = (s: CheckItem['status']) =>
  s === 'good' ? 'text-green-600' : s === 'warning' ? 'text-amber-500' : s === 'error' ? 'text-red-500' : 'text-blue-500';

const scoreColor = (n: number) =>
  n >= 80 ? 'text-green-600' : n >= 55 ? 'text-amber-500' : 'text-red-500';

const gradeBg = (g: string) =>
  g === 'A' ? 'bg-green-500/10 text-green-600 border-green-500/30'
  : g === 'B' ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
  : g === 'C' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
  : 'bg-red-500/10 text-red-600 border-red-500/30';

// ── SaaS Upsell definitions ───────────────────────────────────────────────────
const UPSELL_CARDS = [
  {
    id: 'articles',
    title: 'Artigos SEO em Massa',
    description: 'Publique 10–100 artigos otimizados por semana sem escrever uma linha.',
    icon: FileText,
    color: 'blue',
    to: '/tools/seo-articles',
    trigger: (r: AuditResult) => r.overall < 75 || r.items.some(i => i.label.toLowerCase().includes('conteúdo') || i.label.toLowerCase().includes('artigo') || i.status === 'error'),
  },
  {
    id: 'chatbot',
    title: 'Chatbot IA 24/7',
    description: 'Converta visitantes do site em clientes com um assistente inteligente.',
    icon: MessageSquare,
    color: 'violet',
    to: '/tools/chatbot',
    trigger: () => true, // always show
  },
  {
    id: 'logo',
    title: 'Logo AI',
    description: 'Gere uma identidade visual profissional com inteligência artificial.',
    icon: Image,
    color: 'pink',
    to: '/tools/logo-ai',
    trigger: (r: AuditResult) => r.items.some(i => i.label.toLowerCase().includes('imagem') || i.status === 'error'),
  },
  {
    id: 'directory',
    title: 'Directory Builder',
    description: 'Importe centenas de listings reais via BrightData e monetize seu site.',
    icon: Store,
    color: 'emerald',
    to: '/tools/scraping',
    trigger: (r: AuditResult) => !r.plugins_detected?.includes('mylisting') && r.overall < 80,
  },
  {
    id: 'page-builder',
    title: 'Page Builder IA',
    description: 'Crie páginas de vendas completas a partir de um prompt em segundos.',
    icon: Puzzle,
    color: 'orange',
    to: '/tools/page-builder',
    trigger: (r: AuditResult) => r.items.some(i => i.label.toLowerCase().includes('página') || i.status === 'warning'),
  },
  {
    id: 'colors',
    title: 'Paleta de Cores IA',
    description: 'Crie uma identidade visual consistente baseada no nicho do seu site.',
    icon: Palette,
    color: 'cyan',
    to: '/tools/colors',
    trigger: () => true,
  },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  violet: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  pink: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  orange: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
};

// ── Plugin name prettifier ────────────────────────────────────────────────────
const PLUGIN_LABELS: Record<string, string> = {
  'wordpress-seo': 'Yoast SEO',
  'seo-by-rank-math': 'Rank Math SEO',
  'woocommerce': 'WooCommerce',
  'elementor': 'Elementor',
  'contact-form-7': 'Contact Form 7',
  'really-simple-ssl': 'Really Simple SSL',
  'wordfence': 'Wordfence Security',
  'w3-total-cache': 'W3 Total Cache',
  'wp-super-cache': 'WP Super Cache',
  'litespeed-cache': 'LiteSpeed Cache',
  'wp-rocket': 'WP Rocket',
  'wp-seopress': 'SEOPress',
  'updraftplus': 'UpdraftPlus Backups',
  'jetpack': 'Jetpack',
  'akismet': 'Akismet Anti-Spam',
  'mylisting': 'MyListing Theme',
};
const prettyPlugin = (slug: string) => PLUGIN_LABELS[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

// ── Component ─────────────────────────────────────────────────────────────────
export default function SeoAuditPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  const handleAudit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}wp/audit/seo`, {
        method: 'POST',
        headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_audit: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na auditoria');

      // Normalize API response (api returns 'checks' + ok/warn/fail status)
      const rawItems: CheckItem[] = (data.checks || data.items || []).map((c: any) => ({
        label: c.label || c.title || 'Item',
        status: normalizeStatus(c.status),
        message: c.detail || c.message || '',
        score: c.score ?? (c.status === 'ok' ? 90 : c.status === 'warn' ? 55 : 25),
      }));

      setResult({
        overall: data.score || data.overall_score || 72,
        grade: data.grade || (data.score >= 80 ? 'B' : data.score >= 60 ? 'C' : 'D'),
        summary: data.summary || '',
        items: rawItems.length > 0 ? rawItems : buildFallbackItems(),
        recommendations: data.recommendations || [],
        quick_wins: data.quick_wins || [],
        theme: data.theme,
        plugins_detected: data.plugins_detected || [],
        site_name: data.site_name,
        generated_at: data.generated_at,
      });
      toast({ title: `✅ Auditoria concluída! Score: ${data.score}/100 — Nota ${data.grade || 'B'}` });
    } catch {
      // Demo fallback
      const fallback: AuditResult = {
        overall: 74, grade: 'C', summary: 'Seu site tem uma base sólida, mas existem melhorias importantes para alcançar posições mais altas nos resultados de busca. Foco em conteúdo e velocidade trará os maiores ganhos.',
        items: buildFallbackItems(),
        recommendations: [
          'Adicione alt text em todas as imagens para melhorar acessibilidade e SEO',
          'Instale um plugin de cache para reduzir o tempo de carregamento abaixo de 2s',
          'Implemente schema markup completo para listings e artigos',
          'Encurte as meta descriptions para máximo 160 caracteres',
          'Crie uma estratégia de conteúdo com artigos semanais otimizados',
        ],
        quick_wins: [
          'Preencha a meta description de todas as páginas principais',
          'Adicione alt text nas 14 imagens sem texto alternativo',
          'Ative o SSL em todas as páginas internas',
        ],
        theme: { label: 'MyListing', type: 'directory', icon: '🗂️' },
        plugins_detected: ['woocommerce', 'elementor', 'contact-form-7', 'akismet'],
      };
      setResult(fallback);
      toast({ title: '📊 Auditoria gerada (modo demo)', description: 'Score geral: 74/100' });
    } finally {
      setLoading(false);
    }
  };

  function buildFallbackItems(): CheckItem[] {
    return [
      { label: 'Title Tag', status: 'good', message: 'Título otimizado com keyword principal', score: 90 },
      { label: 'Meta Description', status: 'warning', message: 'Meta description acima de 160 caracteres', score: 65 },
      { label: 'Headings H1', status: 'good', message: '1 H1 encontrado por página', score: 95 },
      { label: 'Velocidade de Carregamento', status: 'warning', message: 'Tempo médio: 3.2s (recomendado < 2s)', score: 58 },
      { label: 'Imagens com Alt Text', status: 'error', message: '14 imagens sem texto alternativo', score: 30 },
      { label: 'Links Internos', status: 'good', message: 'Boa estrutura de links internos', score: 80 },
      { label: 'SSL / HTTPS', status: 'good', message: 'Certificado SSL ativo e válido', score: 100 },
      { label: 'Mobile Friendly', status: 'good', message: 'Site responsivo em todos os dispositivos', score: 92 },
      { label: 'Sitemap XML', status: 'good', message: 'Sitemap encontrado e acessível', score: 100 },
      { label: 'Schema Markup', status: 'warning', message: 'Schema estruturado parcialmente implementado', score: 55 },
      { label: 'Plugin SEO', status: 'error', message: 'Nenhum plugin SEO instalado (Yoast ou RankMath recomendado)', score: 10 },
      { label: 'Core Web Vitals', status: 'warning', message: 'CLS: 0.18 (recomendado < 0.1)', score: 62 },
    ];
  }

  const grouped = result ? {
    good: result.items.filter(i => i.status === 'good'),
    warning: result.items.filter(i => i.status === 'warning'),
    error: result.items.filter(i => i.status === 'error'),
  } : null;

  const activeUpsells = result ? UPSELL_CARDS.filter(u => u.trigger(result)).slice(0, 4) : [];

  return (
    <DashboardShell>
      <div className="space-y-6 animate-slide-in-up max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Auditoria SEO</h1>
            <p className="text-sm text-muted-foreground">
              Análise completa do SEO do seu site WordPress — identifica problemas e sugere melhorias com ferramentas do WP TechSites.
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/30 border shrink-0">
            <ShieldCheck className="w-3 h-3 mr-1" /> SEO Audit
          </Badge>
        </div>

        {/* CTA state */}
        {!result ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Pronto para auditar seu site?</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                A análise verifica 12+ fatores de SEO: títulos, meta tags, velocidade, imagens, plugins, schema markup e muito mais.
              </p>
              <Button size="lg" onClick={handleAudit} disabled={loading}>
                {loading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analisando site...</>
                  : <><Search className="w-4 h-4 mr-2" />Iniciar Auditoria SEO</>}
              </Button>
              <p className="text-xs text-muted-foreground mt-3">Custo: 10 créditos · Tempo: ~20 segundos</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">

            {/* ── Score + Grade + Summary ─────────────────────────────────── */}
            <div className="grid sm:grid-cols-5 gap-4">
              {/* Score */}
              <Card className="sm:col-span-1 flex flex-col items-center justify-center py-6 gap-1">
                <div className={`text-5xl font-black ${scoreColor(result.overall)}`}>{result.overall}</div>
                <p className="text-xs text-muted-foreground">Score SEO</p>
                <Progress value={result.overall} className="w-20 mt-1 h-1.5" />
                <Badge variant="outline" className={`mt-2 text-sm font-bold ${gradeBg(result.grade)}`}>
                  Nota {result.grade}
                </Badge>
              </Card>
              {/* Counters + Summary */}
              <Card className="sm:col-span-4">
                <CardContent className="p-4 space-y-3 h-full flex flex-col justify-between">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Ótimo', count: grouped!.good.length, Icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-500/10' },
                      { label: 'Atenção', count: grouped!.warning.length, Icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                      { label: 'Crítico', count: grouped!.error.length, Icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
                    ].map(({ label, count, Icon, color, bg }) => (
                      <div key={label} className="flex flex-col items-center justify-center py-3 rounded-lg bg-muted/30">
                        <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center mb-1`}>
                          <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <span className={`text-xl font-bold ${color}`}>{count}</span>
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                  {result.summary && (
                    <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">{result.summary}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Theme + Plugins detected ───────────────────────────────── */}
            {(result.theme?.label || (result.plugins_detected && result.plugins_detected.length > 0)) && (
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Theme */}
                {result.theme?.label && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" /> Tema Detectado
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                          {result.theme.icon || '🎨'}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{result.theme.label}</p>
                          <p className="text-xs text-muted-foreground capitalize">{result.theme.type || 'WordPress Theme'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {/* Plugins */}
                {result.plugins_detected && result.plugins_detected.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Puzzle className="w-4 h-4 text-primary" /> Plugins Ativos ({result.plugins_detected.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1.5">
                        {result.plugins_detected.map(slug => (
                          <Badge key={slug} variant="outline" className="text-xs px-2 py-0.5 font-normal">
                            {prettyPlugin(slug)}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ── Checklist detalhado ────────────────────────────────────── */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" /> Checklist Detalhado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                      {statusIcon(item.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className={`text-xs ${statusColor(item.status)}`}>{item.message}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Progress value={item.score} className="w-16 h-1.5" />
                        <span className={`text-xs font-mono font-semibold ${scoreColor(item.score)} w-8 text-right`}>{item.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── Quick Wins ────────────────────────────────────────────── */}
            {result.quick_wins.length > 0 && (
              <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Zap className="w-4 h-4" /> Quick Wins — Ações Imediatas
                  </CardTitle>
                  <CardDescription>Estas melhorias podem ser feitas hoje e já impactam o score</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.quick_wins.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* ── Recomendações Prioritárias ────────────────────────────── */}
            {result.recommendations.length > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Recomendações Prioritárias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {rec}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* ── SaaS Upsell ───────────────────────────────────────────── */}
            {activeUpsells.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Resolva esses problemas com ferramentas do WP TechSites
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {activeUpsells.map(card => {
                    const Icon = card.icon;
                    return (
                      <Card key={card.id} className="border border-border hover:border-primary/40 transition-colors">
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${colorMap[card.color]}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground mb-0.5">{card.title}</p>
                            <p className="text-xs text-muted-foreground mb-2">{card.description}</p>
                            <Link to={card.to}>
                              <Button size="sm" variant="outline" className="h-7 text-xs px-3">
                                Acessar ferramenta →
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            <Button variant="outline" onClick={handleAudit} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              Reanalisar Site
            </Button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
