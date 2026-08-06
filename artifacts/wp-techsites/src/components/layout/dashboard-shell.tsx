import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard, Wand2, Palette, Menu as MenuIcon, Settings, LogOut,
  Store, Link2, Newspaper, Search, Edit3, Layout, FileText,
  MessageSquare, ShieldCheck, Sparkles, ChevronDown, ChevronRight,
  Coins, CreditCard, Lock, Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { clearApiKey, getApiKey, getWpApiHeaders } from '@/lib/api-headers';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useGetWpDashboard, getGetWpDashboardQueryKey } from '@workspace/api-client-react';

interface DashboardShellProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  directoryOnly?: boolean;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Conteúdo & SEO',
    items: [
      { name: 'Artigos SEO',        href: '/tools/seo-articles', icon: Newspaper,   badge: 'Novo' },
      { name: 'Gerador de Conteúdo',href: '/tools/content',      icon: Wand2 },
      { name: 'Artigo com Imagens', href: '/tools/article',      icon: FileText },
      { name: 'Auditoria SEO',      href: '/tools/seo-audit',    icon: ShieldCheck },
    ],
  },
  {
    label: 'Construtor de Site',
    items: [
      { name: 'Editor WYSIWYG',      href: '/tools/wysiwyg',       icon: Edit3,        badge: 'Novo' },
      { name: 'Construtor de Página', href: '/tools/page-builder',  icon: Layout,       badge: 'Novo' },
      { name: 'Menu Builder',         href: '/tools/menu',          icon: MenuIcon },
      { name: 'Página de Empresa',    href: '/tools/page-from-url', icon: Link2 },
      { name: 'Chatbot IA',           href: '/tools/chatbot',       icon: MessageSquare },
    ],
  },
  {
    label: 'Marca & Design',
    items: [
      { name: 'Logo AI',         href: '/tools/logo-ai', icon: Sparkles },
      { name: 'Identidade Visual', href: '/tools/colors', icon: Palette },
    ],
  },
  {
    label: 'Dados & Listings',
    items: [
      { name: 'Coletar Leads',     href: '/tools/scraping',          icon: Search },
      { name: 'Importar Listings', href: '/tools/listings-import',   icon: Database, directoryOnly: true },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { name: 'Planos & Créditos', href: '/planos',        icon: CreditCard },
      { name: 'Configurações',     href: '/tools/settings', icon: Settings },
    ],
  },
];

export function DashboardShell({ children }: DashboardShellProps) {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const { data: dashData } = useGetWpDashboard({
    query: { queryKey: getGetWpDashboardQueryKey(), staleTime: 60_000 },
    request: { headers: getWpApiHeaders() },
  });
  const credits   = dashData?.site?.credits;
  const plan      = dashData?.site?.plan ?? '';
  const siteType  = (dashData as any)?.site?.siteType  as 'directory' | 'standard' | undefined;
  const themeName = (dashData as any)?.site?.themeName as string | undefined;

  const handleLogout = () => {
    clearApiKey();
    setLocation('/');
  };

  const toggleGroup = (label: string) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Top header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-xs">WP</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-foreground leading-none">WP TechSites</h1>
                <p className="text-[10px] text-muted-foreground mt-0.5">Plugin Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme type badge */}
              {siteType && (
                <div className={cn(
                  'hidden md:flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-medium',
                  siteType === 'directory'
                    ? 'bg-green-500/10 border-green-500/30 text-green-600'
                    : 'bg-muted border-border text-muted-foreground'
                )}>
                  {siteType === 'directory' ? '🗂️' : '🌐'}
                  <span>{siteType === 'directory' ? `Directory · ${themeName}` : themeName}</span>
                </div>
              )}

              {/* Credits */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Coins className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-primary">
                  {credits !== undefined ? credits.toLocaleString() : '—'} créditos
                </span>
              </div>

              {plan && (
                <Badge variant="outline" className="hidden md:flex text-[10px] border-primary/30 text-primary capitalize">
                  {plan}
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground text-xs h-8"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">Desconectar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Sidebar navigation */}
          <nav className="lg:w-52 xl:w-56 flex-shrink-0">
            <div className="sticky top-20 space-y-0.5 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              {NAV_GROUPS.map((group) => (
                <div key={group.label ?? '_main'}>
                  {group.label && (
                    <button
                      onClick={() => toggleGroup(group.label!)}
                      className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/40 hover:bg-muted/60 transition-colors"
                    >
                      {group.label}
                      {collapsed[group.label]
                        ? <ChevronRight className="w-3 h-3" />
                        : <ChevronDown  className="w-3 h-3" />}
                    </button>
                  )}
                  {!collapsed[group.label ?? ''] && group.items.map((item) => {
                    const isActive = location === item.href || location.startsWith(item.href + '/');
                    const isLocked = item.directoryOnly && siteType === 'standard';
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition-all border-l-2',
                          isActive
                            ? 'bg-primary/10 text-primary border-l-primary'
                            : isLocked
                            ? 'text-muted-foreground/50 hover:bg-muted/30 hover:text-muted-foreground border-l-transparent'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-transparent'
                        )}
                      >
                        <Icon className={cn(
                          'w-4 h-4 flex-shrink-0',
                          isActive ? 'text-primary' : isLocked ? 'text-muted-foreground/40' : ''
                        )} />
                        <span className={cn('flex-1 truncate text-xs', isLocked && 'opacity-60')}>
                          {item.name}
                        </span>
                        {isLocked ? (
                          <Lock className="w-3 h-3 text-muted-foreground/40" />
                        ) : item.badge ? (
                          <Badge className="text-[9px] px-1 py-0 h-4 bg-primary/20 text-primary border-0 font-semibold">
                            {item.badge}
                          </Badge>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              ))}

              {/* Setup link */}
              <div className="border-t border-border">
                <Link
                  href="/setup"
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium transition-all border-l-2',
                    location === '/setup'
                      ? 'bg-primary/10 text-primary border-l-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-transparent'
                  )}
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  Setup Guide
                </Link>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
