import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Wand2, Palette, Menu as MenuIcon, Settings, LogOut, Store, Link2, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearApiKey } from '@/lib/api-headers';
import { cn } from '@/lib/utils';

interface DashboardShellProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, group: 'main' },
  { name: 'Content Generator', href: '/tools/content', icon: Wand2, group: 'tools' },
  { name: 'Brand Colors', href: '/tools/colors', icon: Palette, group: 'tools' },
  { name: 'Menu Builder', href: '/tools/menu', icon: MenuIcon, group: 'tools' },
  { name: 'Popular Diretório', href: '/tools/populate', icon: Store, group: 'directory' },
  { name: 'Página de Empresa', href: '/tools/page-from-url', icon: Link2, group: 'directory' },
  { name: 'Artigo com Imagens', href: '/tools/article', icon: Newspaper, group: 'directory' },
  { name: 'Setup Guide', href: '/setup', icon: Settings, group: 'main' },
];

export function DashboardShell({ children }: DashboardShellProps) {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    clearApiKey();
    setLocation('/');
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Top header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">WP</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">WP TechSites</h1>
                <p className="text-xs text-muted-foreground">AI-Powered WordPress Tools</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar navigation */}
          <nav className="lg:w-56 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              {navigation.filter(i => i.group === 'main').map((item) => {
                const isActive = location === item.href || location.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}
                    data-testid={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Icon className="w-4 h-4" />{item.name}
                  </Link>
                );
              })}
              <p className="px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ferramentas IA</p>
              {navigation.filter(i => i.group === 'tools').map((item) => {
                const isActive = location === item.href || location.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}
                    data-testid={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Icon className="w-4 h-4" />{item.name}
                  </Link>
                );
              })}
              <p className="px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Directory</p>
              {navigation.filter(i => i.group === 'directory').map((item) => {
                const isActive = location === item.href || location.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}
                    data-testid={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Icon className="w-4 h-4" />{item.name}
                  </Link>
                );
              })}
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
