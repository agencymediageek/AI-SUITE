import { ShoppingCart, Key, Cog, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: ShoppingCart,
    number: '01',
    title: 'Cliente Compra',
    description: 'Seu cliente escolhe o produto CodeCanyon e finaliza o pagamento na sua plataforma.',
  },
  {
    icon: Key,
    number: '02',
    title: 'Credenciais VPS',
    description: 'Sistema solicita credenciais SSH da VPS do cliente de forma segura e automatizada.',
  },
  {
    icon: Cog,
    number: '03',
    title: 'Automação N8N',
    description: '50+ workflows N8N orquestram instalação, configuração Nginx, SSL e PM2 automaticamente.',
  },
  {
    icon: CheckCircle,
    number: '04',
    title: 'Site no Ar',
    description: 'Em menos de 3 minutos, o site está rodando com HTTPS, uptime 24/7 e monitoramento ativo.',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-mono font-bold mb-4 text-foreground">
            Como Funciona
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Quatro etapas automatizadas. Zero intervenção manual. Deploy em produção garantido.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative group">
                <div className="bg-card border border-border rounded-lg p-6 h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  {/* Step number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center font-mono font-bold text-primary">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors border border-primary/20">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-mono font-bold mb-3 text-foreground">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-primary/50 to-transparent transform -translate-y-1/2 z-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress visualization */}
        <div className="mt-16 max-w-4xl mx-auto bg-card border border-border rounded-lg p-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-mono text-muted-foreground">PROGRESSO DO DEPLOY</span>
            <span className="text-sm font-mono text-primary">100%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
          <div className="grid grid-cols-4 gap-4 mt-6 text-center">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Conexão SSH</div>
              <div className="text-sm font-mono text-primary">✓</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Instalação</div>
              <div className="text-sm font-mono text-primary">✓</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Nginx + SSL</div>
              <div className="text-sm font-mono text-primary">✓</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">PM2 Ativo</div>
              <div className="text-sm font-mono text-primary">✓</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
