import React from 'react';
import { Zap } from 'lucide-react';
import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:glow-primary transition-all duration-300">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-white leading-none">
                  TechSites <span className="text-primary">A.I.</span>
                </span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">
                  Powered by MediaGeek
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              O único plugin que transforma seu site WordPress em um ecossistema inteligente trabalhando por você 24 horas por dia.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Plataforma</h4>
            <ul className="space-y-4">
              <li><a href="/#como-funciona" className="text-muted-foreground hover:text-primary transition-colors">Como Funciona</a></li>
              <li><a href="/#recursos" className="text-muted-foreground hover:text-primary transition-colors">Recursos</a></li>
              <li><a href="/#precos" className="text-muted-foreground hover:text-primary transition-colors">Preços</a></li>
              <li><Link href="/plataforma" className="text-muted-foreground hover:text-primary transition-colors">Plataforma Pro</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Ecossistema</h4>
            <ul className="space-y-4">
              <li><a href="https://waas.host" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">WaasHost Infraestrutura</a></li>
              <li><a href="https://mediageek.io" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">MediaGeek Inc.</a></li>
              <li><a href="#terms" className="text-muted-foreground hover:text-primary transition-colors">Termos de Uso</a></li>
              <li><a href="#privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacidade</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TechSites A.I. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            Feito no Brasil
          </div>
        </div>
      </div>
    </footer>
  );
}