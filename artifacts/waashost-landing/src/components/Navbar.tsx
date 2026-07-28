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
            <span className="font-mono font-bold text-xl glow-text">WaasHost</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#produto" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Produto
            </a>
            <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <a href="#integracoes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Integrações
            </a>
            <a href="#precos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Entrar
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Começar Agora
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
