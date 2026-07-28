import { Workflow, Shield, Server, Boxes, Cloud, Zap, Github, CreditCard } from 'lucide-react';

const integrations = [
  {
    icon: Workflow,
    name: 'N8N',
    description: 'Orquestração de workflows',
  },
  {
    icon: Cloud,
    name: 'Cloudflare',
    description: 'DNS e proteção DDoS',
  },
  {
    icon: Github,
    name: 'GitHub',
    description: 'Versionamento e CI/CD',
    isReactIcon: true,
  },
  {
    icon: Shield,
    name: 'Let\'s Encrypt',
    description: 'Certificados SSL gratuitos',
  },
  {
    icon: Server,
    name: 'PM2',
    description: 'Process manager Node.js',
  },
  {
    icon: CreditCard,
    name: 'Stripe',
    description: 'Pagamentos e billing',
    isReactIcon: true,
  },
  {
    icon: Boxes,
    name: 'Envato',
    description: 'CodeCanyon/ThemeForest API',
  },
  {
    icon: Zap,
    name: 'Nginx',
    description: 'Reverse proxy e balanceamento',
  },
];

export function Integrations() {
  return (
    <section id="integracoes" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-mono font-bold mb-4 text-foreground">
            Integrações Nativas
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ecossistema completo de ferramentas enterprise já integrado e configurado.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {integrations.map((integration, index) => {
            const Icon = integration.icon;
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors border border-primary/20">
                  {integration.isReactIcon ? (
                    <Icon className="w-8 h-8 text-primary" />
                  ) : (
                    <Icon className="w-8 h-8 text-primary" />
                  )}
                </div>
                <h3 className="text-lg font-mono font-bold mb-2 text-foreground">
                  {integration.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {integration.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Integration flow diagram */}
        <div className="mt-16 bg-card border border-border rounded-lg p-8 max-w-4xl mx-auto">
          <div className="font-mono text-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-primary">→</span>
              <span className="text-muted-foreground">Webhook Stripe recebe pagamento</span>
            </div>
            <div className="flex items-center gap-3 ml-6">
              <span className="text-primary">→</span>
              <span className="text-muted-foreground">N8N inicia workflow de deploy</span>
            </div>
            <div className="flex items-center gap-3 ml-12">
              <span className="text-primary">→</span>
              <span className="text-muted-foreground">Envato API valida licença do produto</span>
            </div>
            <div className="flex items-center gap-3 ml-12">
              <span className="text-primary">→</span>
              <span className="text-muted-foreground">SSH conecta à VPS via credenciais seguras</span>
            </div>
            <div className="flex items-center gap-3 ml-12">
              <span className="text-primary">→</span>
              <span className="text-muted-foreground">GitHub Actions clona repositório</span>
            </div>
            <div className="flex items-center gap-3 ml-12">
              <span className="text-primary">→</span>
              <span className="text-muted-foreground">PM2 inicia aplicação Node.js</span>
            </div>
            <div className="flex items-center gap-3 ml-12">
              <span className="text-primary">→</span>
              <span className="text-muted-foreground">Nginx configura reverse proxy</span>
            </div>
            <div className="flex items-center gap-3 ml-12">
              <span className="text-primary">→</span>
              <span className="text-muted-foreground">Certbot gera certificado SSL</span>
            </div>
            <div className="flex items-center gap-3 ml-12">
              <span className="text-primary">→</span>
              <span className="text-muted-foreground">Cloudflare atualiza DNS</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-primary font-bold">✓</span>
              <span className="text-primary font-bold">Site disponível com HTTPS em 3 minutos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
