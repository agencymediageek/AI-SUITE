import { useEffect, useState } from 'react';
import { Terminal, Zap, Shield, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  const [deployTime, setDeployTime] = useState(180);

  useEffect(() => {
    if (deployTime > 0) {
      const timer = setTimeout(() => setDeployTime(deployTime - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setDeployTime(180), 500);
    }
  }, [deployTime]);

  const minutes = Math.floor(deployTime / 60);
  const seconds = deployTime % 60;

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden grid-pattern">
      {/* Animated grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8 animate-fade-in-up">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-mono text-primary">Sistema de deploy automatizado</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-mono font-bold mb-6 leading-tight">
            Deploy em{' '}
            <span className="text-primary glow-text">1 clique</span>
            <br />
            <span className="text-foreground/80">Infraestrutura enterprise</span>
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Qualquer produto CodeCanyon rodando na VPS do seu cliente em menos de 3 minutos. 
            Automação N8N + SSH. Zero código, zero terminal, zero erros.
          </p>

          {/* Deploy timer */}
          <div className="inline-flex flex-col items-center gap-3 mb-12">
            <div className="flex items-baseline gap-2">
              <span className="text-7xl sm:text-8xl font-mono font-bold text-primary glow-text">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Terminal className="w-4 h-4" />
              <span className="text-sm font-mono">média de deploy em produção</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 h-14 glow-border">
              <Rocket className="w-5 h-5 mr-2" />
              Começar Agora
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-primary/30 hover:bg-primary/5">
              <Terminal className="w-5 h-5 mr-2" />
              Ver Demonstração
            </Button>
          </div>

          {/* Terminal preview */}
          <div className="max-w-3xl mx-auto bg-card border border-border rounded-lg overflow-hidden glow-border">
            <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/80" />
                <div className="w-3 h-3 rounded-full bg-secondary/80" />
                <div className="w-3 h-3 rounded-full bg-primary/80" />
              </div>
              <span className="text-xs font-mono text-muted-foreground ml-2">deploy@waashost.com</span>
            </div>
            <div className="p-6 font-mono text-sm text-left space-y-2 bg-card/50">
              <div className="flex items-center gap-2">
                <span className="text-primary">$</span>
                <span className="text-foreground">ssh deploy@vps.cliente.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">→</span>
                <span className="text-muted-foreground">Conectando à VPS...</span>
                <span className="text-primary">✓</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">→</span>
                <span className="text-muted-foreground">Instalando dependências...</span>
                <span className="text-primary">✓</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">→</span>
                <span className="text-muted-foreground">Configurando Nginx + SSL...</span>
                <span className="text-primary">✓</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">→</span>
                <span className="text-muted-foreground">Iniciando PM2...</span>
                <span className="text-primary">✓</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Zap className="w-4 h-4" />
                <span className="font-bold">Deploy completo! Site disponível em https://cliente.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
