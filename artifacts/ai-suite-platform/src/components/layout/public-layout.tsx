import { Link } from "wouter";
import { Globe, Menu, X, Sun, Moon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { MediaGeekLogo } from "@/components/logo";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { label: locale === "pt" ? "HOME" : "HOME", href: "/" },
    { label: locale === "pt" ? "COMO FUNCIONA" : "HOW IT WORKS", href: "/como-funciona" },
    { label: locale === "pt" ? "PREÇOS" : "PRICING", href: "/pricing" },
    { label: "FAQ", href: "/faq" },
    { label: locale === "pt" ? "CONTATO" : "CONTACT", href: "/contato" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          {/* Logo — icon only on mobile, full on desktop */}
          <Link href="/" className="cursor-pointer shrink-0">
            <span className="hidden sm:block">
              <MediaGeekLogo size="md" />
            </span>
            <span className="sm:hidden">
              <MediaGeekLogo size="sm" variant="icon" />
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Dark/Light toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                  <Globe className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                <DropdownMenuItem onClick={() => setLocale("pt")} className={locale === "pt" ? "text-primary font-semibold" : ""}>
                  🇧🇷 Português
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale("en")} className={locale === "en" ? "text-primary font-semibold" : ""}>
                  🇺🇸 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {token ? (
              <Link href="/tools">
                <Button variant="default" size="sm" className="hidden sm:inline-flex">{t("nav.dashboard")}</Button>
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

            {/* Hamburger — mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
            <nav className="container mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {!token && (
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                  {locale === "pt" ? "ENTRAR" : "SIGN IN"}
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/40 py-10 mt-auto bg-card/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <MediaGeekLogo size="sm" />
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link href="/como-funciona" className="hover:text-foreground transition-colors">{t("footer.how_it_works")}</Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">{t("footer.pricing")}</Link>
              <Link href="/faq" className="hover:text-foreground transition-colors">{t("footer.faq")}</Link>
              <Link href="/contato" className="hover:text-foreground transition-colors">{t("footer.contact")}</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">{t("footer.login")}</Link>
            </div>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              © {new Date().getFullYear()} MediaGeek AI Suite. {t("footer.rights")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
