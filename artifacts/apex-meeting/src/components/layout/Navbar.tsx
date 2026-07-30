import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Globe, LogOut, User, Settings, LayoutDashboard, Menu, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useAuthStore } from '@/lib/auth';
import { useI18n, Language } from '@/lib/i18n';
import { MatrixGlobe } from '@/components/meeting/MatrixGlobe';
import { useGetMe, useLogoutUser, getGetMeQueryKey } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';

const navLinkDefs = [
  { key: 'nav.inicio',       anchor: 'inicio' },
  { key: 'nav.comoFunciona', anchor: 'como-funciona' },
  { key: 'nav.recursos',     anchor: 'recursos' },
  { key: 'nav.planos',       anchor: 'planos' },
  { key: 'nav.faq',          anchor: 'faq' },
  { key: 'nav.contato',      anchor: 'contato' },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

export function Navbar() {
  const { isAuthenticated, clearToken } = useAuthStore();
  const { language, setLanguage, t } = useI18n();

  // PWA install prompt
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const { toast } = useToast();
  const { data: user } = useGetMe({ query: { enabled: isAuthenticated, queryKey: getGetMeQueryKey() } });
  const logout = useLogoutUser();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = location === '/';

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      clearToken();
      toast({ title: 'Logout realizado com sucesso' });
    } catch {
      clearToken();
    }
  };

  const languages: { value: Language; label: string }[] = [
    { value: 'pt', label: 'PT' },
    { value: 'en', label: 'EN' },
    { value: 'es', label: 'ES' },
  ];

  const handleNavClick = (anchor: string) => {
    setMobileOpen(false);
    if (isLanding) {
      setTimeout(() => scrollTo(anchor), 50);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-primary/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <MatrixGlobe size={36} isProcessing={false} />
          <span className="text-xl font-bold tracking-tight matrix-text font-sans">
            APEX CORE
          </span>
        </Link>

        {/* Desktop Nav Links */}
        {isLanding && (
          <div className="hidden lg:flex items-center gap-1">
            {navLinkDefs.map((link) => (
              <button
                key={link.anchor}
                onClick={() => scrollTo(link.anchor)}
                className="text-sm text-muted-foreground hover:text-primary px-3 py-1.5 rounded-md transition-colors hover:bg-primary/5 font-medium"
              >
                {t(link.key)}
              </button>
            ))}
          </div>
        )}

        {/* Right side controls */}
        <div className="flex items-center gap-1">
          {/* Authenticated: Dashboard + Admin */}
          {isAuthenticated && user && (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden md:flex text-foreground hover:text-primary">
                <Link href="/dashboard" data-testid="link-dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {t('nav.dashboard')}
                </Link>
              </Button>
              {user.role === 'admin' && (
                <Button variant="ghost" size="sm" asChild className="hidden md:flex text-foreground hover:text-primary">
                  <Link href="/admin" data-testid="link-admin">
                    {t('nav.admin')}
                  </Link>
                </Button>
              )}
            </>
          )}

          {/* Install App button — shown only when PWA install is available */}
          {installPrompt && (
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-primary"
              title={t('nav.installApp')}
              onClick={() => { installPrompt.prompt(); installPrompt.userChoice.then(() => setInstallPrompt(null)); }}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          )}

          {/* Language selector */}
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

          {/* Auth buttons or user dropdown */}
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
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary">
                <Link href="/login" data-testid="link-login">{t('nav.login')}</Link>
              </Button>
              <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow">
                <Link href="/register" data-testid="link-register">{t('nav.register')}</Link>
              </Button>
            </div>
          )}

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-foreground hover:text-primary" data-testid="button-mobile-menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background border-primary/20 flex flex-col">
              {/* Mobile Logo */}
              <div className="flex items-center gap-2 mb-6 mt-2">
                <MatrixGlobe size={32} isProcessing={false} />
                <span className="text-lg font-bold matrix-text">APEX CORE</span>
              </div>

              {/* Mobile Nav links */}
              {isLanding && (
                <nav className="flex flex-col gap-1 mb-6">
                  {navLinkDefs.map((link) => (
                    <SheetClose asChild key={link.anchor}>
                      <button
                        onClick={() => handleNavClick(link.anchor)}
                        className="text-left text-base text-foreground hover:text-primary px-3 py-2.5 rounded-md transition-colors hover:bg-primary/5 font-medium"
                      >
                        {t(link.key)}
                      </button>
                    </SheetClose>
                  ))}
                </nav>
              )}

              {/* Mobile auth buttons */}
              {!isAuthenticated && (
                <div className="flex flex-col gap-3 mt-auto">
                  <SheetClose asChild>
                    <Button variant="outline" asChild className="w-full border-primary/30 text-foreground hover:text-primary">
                      <Link href="/login">{t('nav.login')}</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow">
                      <Link href="/register">{t('nav.register')}</Link>
                    </Button>
                  </SheetClose>
                </div>
              )}

              {isAuthenticated && user && (
                <div className="flex flex-col gap-2 mt-auto">
                  <SheetClose asChild>
                    <Button variant="ghost" asChild className="w-full justify-start text-foreground hover:text-primary">
                      <Link href="/dashboard">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        {t('nav.dashboard')}
                      </Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button variant="ghost" asChild className="w-full justify-start text-foreground hover:text-primary">
                      <Link href="/settings">
                        <Settings className="w-4 h-4 mr-2" />
                        {t('nav.settings')}
                      </Link>
                    </Button>
                  </SheetClose>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('nav.logout')}
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
