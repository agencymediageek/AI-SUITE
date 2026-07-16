import { Link } from "wouter";
import { Globe } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { MediaGeekLogo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const { t, locale, setLocale } = useI18n();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background dark text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <Link href="/" className="cursor-pointer">
            <MediaGeekLogo size="md" />
          </Link>

          <nav className="flex items-center gap-5">
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              {t("nav.pricing")}
            </Link>
            <Link href="/tools" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              {t("nav.tools")}
            </Link>

            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                  <Globe className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                <DropdownMenuItem
                  onClick={() => setLocale("pt")}
                  className={locale === "pt" ? "text-primary font-semibold" : ""}
                >
                  🇧🇷 Português
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLocale("en")}
                  className={locale === "en" ? "text-primary font-semibold" : ""}
                >
                  🇺🇸 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2">
              {token ? (
                <Link href="/dashboard">
                  <Button variant="default" size="sm">{t("nav.dashboard")}</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">{t("nav.signin")}</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="rounded-full px-5 shadow-sm shadow-primary/20">{t("nav.get_started")}</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/40 py-10 mt-auto bg-card/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <MediaGeekLogo size="sm" />
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/tools" className="hover:text-foreground transition-colors">{t("footer.tools")}</Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">{t("footer.pricing")}</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">{t("footer.login")}</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">{t("footer.register")}</Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} MediaGeek AI Suite. {t("footer.rights")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
