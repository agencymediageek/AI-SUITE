import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useGetMe, useLogoutUser } from "@workspace/api-client-react";
import { LayoutDashboard, Zap, History, Settings, LogOut, Shield, Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { MediaGeekLogo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, locale, setLocale } = useI18n();

  const { data: user } = useGetMe({
    query: {
      retry: false,
      refetchOnWindowFocus: false,
    }
  });

  const logoutMutation = useLogoutUser();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync(undefined);
    } catch (error) {
      console.error("Logout failed on server", error);
    }
    logout();
    setLocation("/");
  };

  const closeMobile = () => setIsMobileMenuOpen(false);

  const navItems = [
    { label: t("app.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { label: t("app.tools"), href: "/tools", icon: Zap },
    { label: t("app.history"), href: "/history", icon: History },
    { label: t("app.account"), href: "/account", icon: Settings },
  ];

  if (user?.role === "admin") {
    navItems.push({ label: t("app.admin"), href: "/admin", icon: Shield });
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background dark text-foreground">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        {/* Icon-only logo on mobile */}
        <Link href="/dashboard">
          <MediaGeekLogo size="sm" variant="icon" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Overlay backdrop for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 w-72 bg-card border-r border-border flex flex-col
        transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 md:w-64 md:flex
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar header — desktop only */}
        <div className="hidden md:flex p-5 items-center border-b border-border shrink-0">
          <Link href="/dashboard" className="cursor-pointer">
            <MediaGeekLogo size="md" />
          </Link>
        </div>

        {/* Mobile sidebar header */}
        <div className="md:hidden flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <MediaGeekLogo size="sm" />
          <Button variant="ghost" size="icon" onClick={closeMobile}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={closeMobile}>
                <div className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors
                  ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}
                `}>
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-3 shrink-0">
          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground gap-2">
                <Globe className="w-4 h-4" />
                {locale === "pt" ? "🇧🇷 Português" : "🇺🇸 English"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="min-w-[140px]">
              <DropdownMenuItem onClick={() => setLocale("pt")} className={locale === "pt" ? "text-primary font-semibold" : ""}>
                🇧🇷 Português
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale("en")} className={locale === "en" ? "text-primary font-semibold" : ""}>
                🇺🇸 English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.name || "User"}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.planName || t("app.free_plan")}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("app.logout")}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
