import { Link } from 'wouter';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Terminal className="w-6 h-6 text-primary" />
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xl glow-text">&gt;_ WaasHost</span>
              <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                Infraestrutura TechSites AI
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="/#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <a href="/#recursos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="/#creditos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Créditos
            </a>
            <Link href="/infraestrutura" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Infraestrutura
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Acessar Meu Painel
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
