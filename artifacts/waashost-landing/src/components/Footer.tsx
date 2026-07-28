import { Terminal, Mail, MapPin, Linkedin } from 'lucide-react';
import { Github, Twitter } from 'lucide-react';
import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Terminal className="w-6 h-6 text-primary" />
              <span className="font-mono font-bold text-xl glow-text">&gt;_ WaasHost</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              O cofre central e a infraestrutura invisível por trás do ecossistema TechSites AI.
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-6">
              Parte do Ecossistema MediaGeek
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-mono font-bold text-foreground mb-4">Produto</h4>
            <ul className="space-y-3">
              <li>
                <a href="/#como-funciona" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="/#recursos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Recursos
                </a>
              </li>
              <li>
                <a href="/#creditos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Créditos
                </a>
              </li>
              <li>
                <Link href="/infraestrutura" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Infraestrutura Legada
                </Link>
              </li>
            </ul>
          </div>

          {/* Ecossistema */}
          <div>
            <h4 className="font-mono font-bold text-foreground mb-4">Ecossistema</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://techsites.ai" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  TechSites AI
                </a>
              </li>
              <li>
                <a href="https://mediageek.io" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  MediaGeek
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-mono font-bold text-foreground mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">contato@waashost.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  São Paulo, SP<br />
                  Brasil
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 WaasHost. Infraestrutura operada pela MediaGeek.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacidade" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacidade
            </Link>
            <Link href="/termos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
