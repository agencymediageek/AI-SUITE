import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

export function VaultHero() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((prev) => (prev < 5 ? prev + 1 : prev));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const statusLines = [
    { text: 'site registrado: loja-autopeças-roma.com', delay: 0 },
    { text: 'auditoria: 14 erros corrigidos', delay: 1 },
    { text: 'robôs ativos: prospecção B2B [ON], chatbot [ON], SEO monitor [ON]', delay: 2 },
    { text: 'backup: hoje 03:14 — OK', delay: 3 },
    { text: 'créditos: 1.847 disponíveis', delay: 4 },
  ];

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-pattern opacity-40" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-fade-in" style={{ animationDelay: '0ms' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-mono text-primary">
                O coração que ninguém vê — mas todo site precisa
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-6 animate-fade-in leading-tight" style={{ animationDelay: '100ms' }}>
            Seu site registrado.
            <br />
            <span className="glow-text">Seus dados protegidos.</span>
            <br />
            Suas automações rodando.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
            Quando você instala o TechSites AI, o WaasHost assume o controle nos bastidores — registra o perfil completo do seu negócio, guarda backups, gerencia créditos e mantém centenas de robôs trabalhando 24/7.
          </p>

          {/* Terminal Panel */}
          <div className="max-w-3xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="bg-card/50 backdrop-blur-sm border border-card-border rounded-lg overflow-hidden glow-border">
              {/* Terminal header */}
              <div className="bg-muted/30 border-b border-card-border px-4 py-3 flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]/60" />
                  <div className="w-3 h-3 rounded-full bg-[#10B981]/60" />
                </div>
                <span className="text-xs font-mono text-muted-foreground ml-2">
                  WaasHost Monitor v2.4
                </span>
              </div>

              {/* Terminal content */}
              <div className="p-6 font-mono text-sm space-y-3">
                {statusLines.map((line, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 transition-all duration-500 ${
                      visibleLines > index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-primary/90">{line.text}</span>
                  </div>
                ))}
                {visibleLines >= 5 && (
                  <div className="flex items-center gap-3 pt-2 animate-fade-in">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-muted-foreground">Sistema operacional</span>
                    <span className="terminal-cursor ml-auto" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[200px]">
              Acessar Meu Painel
            </Button>
            <Button size="lg" variant="outline" className="min-w-[200px]" asChild>
              <a href="#como-funciona">Como funciona</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
