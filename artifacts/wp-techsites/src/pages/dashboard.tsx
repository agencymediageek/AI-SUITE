import { useLocation } from 'wouter';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { MetricCard } from '@/components/ui/metric-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetWpDashboard, getGetWpDashboardQueryKey } from '@workspace/api-client-react';
import { getWpApiHeaders } from '@/lib/api-headers';
import {
  Coins, TrendingUp, Zap, Globe, Lightbulb,
  Search, Edit3, Layout, Newspaper, MessageSquare,
  ShieldCheck, Sparkles, Store, Wand2, Palette,
  Menu, Link2, FileText, ArrowRight, Star
} from 'lucide-react';

const ALL_TOOLS = [
  // Featured / Highlighted
  {
    id: 'scraping', name: 'BrightData Scraping', href: '/tools/scraping',
    icon: Search, description: 'Importe listings reais por cidade e categoria',
    credits: 5, badge: 'Novo', featured: true,
  },
  {
    id: 'seo-articles', name: 'Artigos SEO', href: '/tools/seo-articles',
    icon: Newspaper, description: 'Publique artigos automaticamente com cronograma anti-penalização',
    credits: 8, badge: 'Novo', featured: true,
  },
  {
    id: 'wysiwyg', name: 'Editor WYSIWYG', href: '/tools/wysiwyg',
    icon: Edit3, description: 'Edite qualquer página com assistência de IA',
    credits: 10, badge: 'Novo', featured: true,
  },
  {
    id: 'page-builder', name: 'Construtor de Página', href: '/tools/page-builder',
    icon: Layout, description: 'Gere páginas HTML completas com hero e cards',
    credits: 15, badge: 'Novo', featured: true,
  },
  // Standard tools
  {
    id: 'seo-audit', name: 'Auditoria SEO', href: '/tools/seo-audit',
    icon: ShieldCheck, description: 'Análise completa de SEO com score e recomendações',
    credits: 15,
  },
  {
    id: 'chatbot', name: 'Chatbot IA', href: '/tools/chatbot',
    icon: MessageSquare, description: 'Configure o assistente inteligente do seu site',
    credits: 3,
  },
  {
    id: 'logo-ai', name: 'Logo AI', href: '/tools/logo-ai',
    icon: Sparkles, description: 'Gere logos profissionais com IA',
    credits: 20,
  },
  {
    id: 'content', name: 'Gerador de Conteúdo', href: '/tools/content',
    icon: Wand2, description: 'Crie conteúdo SEO para páginas e posts',
    credits: 10,
  },
  {
    id: 'article', name: 'Artigo com Imagens', href: '/tools/article',
    icon: FileText, description: 'Artigos completos com imagens geradas por IA',
    credits: 12,
  },
  {
    id: 'populate', name: 'Popular Diretório', href: '/tools/populate',
    icon: Store, description: 'Popule seu diretório com listings automáticos',
    credits: 5,
  },
  {
    id: 'page-from-url', name: 'Página de Empresa', href: '/tools/page-from-url',
    icon: Link2, description: 'Crie uma página a partir de uma URL existente',
    credits: 8,
  },
  {
    id: 'menu', name: 'Menu Builder', href: '/tools/menu',
    icon: Menu, description: 'Construa menus de navegação com IA',
    credits: 5,
  },
  {
    id: 'colors', name: 'Brand Colors', href: '/tools/colors',
    icon: Palette, description: 'Aplique cores de marca em todo o site',
    credits: 5,
  },
];

export default function DashboardPage() {
  const [, setLocation] = useLocation();

  const { data: dashboard, isLoading, error } = useGetWpDashboard({
    query: {
      queryKey: getGetWpDashboardQueryKey(),
    },
    request: {
      headers: getWpApiHeaders(),
    },
  });

  if (error) {
    return (
      <DashboardShell>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle>Erro ao Carregar Dashboard</CardTitle>
            <CardDescription>
              {error.message || 'Falha ao carregar os dados. Tente recarregar a página.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </DashboardShell>
    );
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-64" />
        </div>
      </DashboardShell>
    );
  }

  const site = dashboard?.site;
  const featuredTools = ALL_TOOLS.filter(t => t.featured);
  const standardTools = ALL_TOOLS.filter(t => !t.featured);

  return (
    <DashboardShell>
      <div className="space-y-6 animate-slide-in-up">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {site?.siteName || 'Seu Site'} •{' '}
              <span className="text-foreground font-medium">{site?.siteUrl || 'wp.techsites.ai'}</span>
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            {site?.plan || 'Starter'}
          </Badge>
        </div>

        {/* Metrics */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Créditos"
            value={(site?.credits ?? 200).toLocaleString()}
            icon={Coins}
            className="pulse-border"
          />
          <MetricCard
            label="Plano"
            value={site?.plan || 'Starter'}
            icon={TrendingUp}
          />
          <MetricCard
            label="Status"
            value="Conectado"
            icon={Globe}
          />
          <MetricCard
            label="Ferramentas"
            value={ALL_TOOLS.length}
            icon={Zap}
          />
        </div>

        {/* Usage tip */}
        {dashboard?.usageTip && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-3 p-4">
              <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{dashboard.usageTip}</p>
            </CardContent>
          </Card>
        )}

        {/* NEW — Featured tools */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">Novidades</h2>
            <Badge className="bg-primary/10 text-primary border-0 text-xs">4 novas ferramentas</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {featuredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setLocation(tool.href)}
                  className="flex items-start gap-3 p-4 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{tool.name}</p>
                      <Badge className="text-[9px] px-1.5 py-0 h-4 bg-primary text-primary-foreground border-0">
                        {tool.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                </button>
              );
            })}
          </div>
        </div>

        {/* All tools grid */}
        <div>
          <h2 className="text-base font-bold text-foreground mb-3">Todas as Ferramentas</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {standardTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setLocation(tool.href)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">{tool.credits} créditos</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Getting started */}
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Como usar o WP TechSites</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
              <li>Instale o plugin no seu WordPress via <strong>Plugins → Adicionar Novo</strong></li>
              <li>Cole sua chave de conexão em <strong>Configurações → WP TechSites</strong></li>
              <li>Use o <strong>BrightData Scraping</strong> para popular seu diretório com listings reais</li>
              <li>Ative o <strong>Artigos SEO</strong> para publicação automática com cronograma</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
