import { Link } from 'wouter';
import { Moon, Sun, Globe, LogOut, User, Settings, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { useI18n, Language } from '@/lib/i18n';
import { useGetMe, useLogoutUser, getGetMeQueryKey } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';

export function Navbar() {
  const { isAuthenticated, clearToken } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const { toast } = useToast();
  const { data: user } = useGetMe({ query: { enabled: isAuthenticated, queryKey: getGetMeQueryKey() } });
  const logout = useLogoutUser();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      clearToken();
      toast({ title: 'Logged out successfully' });
    } catch (error) {
      clearToken();
    }
  };

  const languages: { value: Language; label: string }[] = [
    { value: 'pt', label: 'PT' },
    { value: 'en', label: 'EN' },
    { value: 'es', label: 'ES' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-primary/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-primary/20 rounded blur-lg group-hover:bg-primary/30 transition-colors" />
            <div className="relative w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded flex items-center justify-center font-mono font-bold text-black text-sm">
              A
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight matrix-text font-sans">
            APEX CORE
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {isAuthenticated && user && (
            <>
              <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary">
                <Link href="/dashboard" data-testid="link-dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {t('nav.dashboard')}
                </Link>
              </Button>
              {user.role === 'admin' && (
                <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary">
                  <Link href="/admin" data-testid="link-admin">
                    {t('nav.admin')}
                  </Link>
                </Button>
              )}
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:text-primary" data-testid="button-language">
                <Globe className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-primary/20">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={language === lang.value ? 'bg-primary/10 text-primary' : ''}
                  data-testid={`menu-item-language-${lang.value}`}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground hover:text-primary"
            data-testid="button-theme-toggle"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:text-primary" data-testid="button-user-menu">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-primary/20 w-56">
                <DropdownMenuLabel className="text-primary">{user.name}</DropdownMenuLabel>
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/20" />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer" data-testid="menu-item-settings">
                    <Settings className="w-4 h-4 mr-2" />
                    {t('nav.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer" data-testid="menu-item-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary">
                <Link href="/login" data-testid="link-login">{t('nav.login')}</Link>
              </Button>
              <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/register" data-testid="link-register">{t('nav.register')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
