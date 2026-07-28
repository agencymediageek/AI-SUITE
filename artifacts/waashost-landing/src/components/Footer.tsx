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
              <span className="font-mono font-bold text-xl glow-text">WaasHost</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Deploy automatizado de SaaS em 3 minutos. Infraestrutura enterprise para agências.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-muted hover:bg-primary/20 rounded-lg flex items-center justify-center transition-colors border border-border hover:border-primary/30"
              >
                <Github className="w-4 h-4 text-foreground" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-muted hover:bg-primary/20 rounded-lg flex items-center justify-center transition-colors border border-border hover:border-primary/30"
              >
                <Twitter className="w-4 h-4 text-foreground" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-muted hover:bg-primary/20 rounded-lg flex items-center justify-center transition-colors border border-border hover:border-primary/30"
              >
                <Linkedin className="w-4 h-4 text-foreground" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-mono font-bold text-foreground mb-4">Produto</h4>
            <ul className="space-y-3">
              <li>
                <a href="#produto" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="#integracoes" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Integrações
                </a>
              </li>
              <li>
                <a href="#precos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Preços
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-mono font-bold text-foreground mb-4">Empresa</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/sobre" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/carreiras" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Carreiras
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contato
                </Link>
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
            © 2024 WaasHost. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacidade" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacidade
            </Link>
            <Link href="/termos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Termos de Uso
            </Link>
            <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
