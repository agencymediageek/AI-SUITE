import { Terminal, Server, Shield, Workflow, Package, Gauge } from 'lucide-react';

const features = [
  {
    icon: Terminal,
    title: 'SSH Automatizado',
    description: 'Conexão segura e automática via SSH. Comandos executados remotamente sem intervenção manual.',
    tech: 'SSH + N8N',
  },
  {
    icon: Server,
    title: 'PM2 Management',
    description: 'Gerenciador de processos Node.js garantindo uptime 24/7 com restart automático em caso de falha.',
    tech: 'PM2 + Monit',
  },
  {
    icon: Shield,
    title: 'SSL/Nginx Auto',
    description: 'Configuração automática de Nginx como reverse proxy + certificado SSL via Let\'s Encrypt em segundos.',
    tech: 'Nginx + Certbot',
  },
  {
    icon: Workflow,
    title: 'N8N Orchestration',
    description: '50+ workflows N8N orquestrando cada etapa do deploy com logs em tempo real e rollback automático.',
    tech: 'N8N Workflows',
  },
  {
    icon: Package,
    title: 'Envato Integration',
    description: 'Integração nativa com API Envato/CodeCanyon para download e validação automática de licenças.',
    tech: 'Envato API',
  },
  {
    icon: Gauge,
    title: 'Painel de Controle',
    description: 'Dashboard completo com métricas em tempo real, logs de deploy, status de servidores e alertas.',
    tech: 'React + WebSocket',
  },
];

export function Features() {
  return (
    <section id="produto" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-mono font-bold mb-4 text-foreground">
            Infraestrutura Completa
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stack de produção enterprise. Automação de ponta a ponta. Zero configuração manual.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors border border-primary/20">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-mono font-bold mb-1 text-foreground">
                      {feature.title}
                    </h3>
                    <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-secondary/10 text-secondary border border-secondary/20">
                      {feature.tech}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Tech stack visualization */}
        <div className="mt-16 bg-card border border-border rounded-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-xl font-mono font-bold mb-6 text-center">Stack Tecnológica</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['N8N', 'Ubuntu', 'Nginx', 'Node.js', 'PM2', 'Let\'s Encrypt', 'GitHub', 'Stripe'].map((tech) => (
              <div
                key={tech}
                className="bg-muted/50 border border-border rounded-lg px-4 py-3 text-center font-mono text-sm hover:border-primary/30 transition-colors"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
