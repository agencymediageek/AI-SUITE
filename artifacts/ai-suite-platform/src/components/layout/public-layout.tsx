import { Link } from "wouter";
import { Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background dark text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 cursor-pointer font-sans font-bold text-xl tracking-tight text-primary">
            <Zap className="w-6 h-6 fill-primary" />
            <span>AI<span className="text-foreground">Suite</span></span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Pricing</Link>
            <div className="flex items-center gap-3">
              {token ? (
                <Link href="/dashboard">
                  <Button variant="default">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="default">Get Started</Button>
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
      <footer className="border-t border-border py-8 mt-auto">
        <div className="container mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AI Suite Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
