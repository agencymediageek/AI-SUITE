import React from 'react';
import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                TechSites <span className="text-primary">A.I.</span>
              </span>
            </a>
            <p className="text-muted-foreground max-w-sm">
              Plataforma WaaS para agências modernas. Construa e publique sites profissionais com IA, editor WYSIWYG e automação Cloudflare + N8N.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Produto</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Diferenciais</a></li>
              <li><a href="#templates" className="text-muted-foreground hover:text-primary transition-colors">Templates</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Preços</a></li>
              <li><a href="#showcase" className="text-muted-foreground hover:text-primary transition-colors">Showcase</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Empresa</h4>
            <ul className="space-y-4">
              <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors">Sobre</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contato</a></li>
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
            Feito no Brasil 🇧🇷
          </div>
        </div>
      </div>
    </footer>
  );
}
