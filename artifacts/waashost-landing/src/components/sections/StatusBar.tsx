import { Network, FileSearch, ShieldCheck, Zap } from 'lucide-react';

const metrics = [
  {
    value: '4.200+',
    label: 'Sites Registrados',
    status: 'Online agora',
    icon: Network,
  },
  {
    value: '50.000+',
    label: 'Automações Ativas',
    status: 'Processadas hoje',
    icon: Zap,
  },
  {
    value: '99.97%',
    label: 'Uptime',
    status: 'Últimos 365 dias',
    icon: ShieldCheck,
  },
  {
    value: '2.1M+',
    label: 'Créditos Processados',
    status: 'Este mês',
    icon: FileSearch,
  },
];

export function StatusBar() {
  return (
    <section className="py-12 border-y border-border bg-card/30 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex flex-col items-start p-6 bg-card border border-card-border rounded-lg relative overflow-hidden"
            >
              <div className="flex items-center justify-between w-full mb-4">
                <metric.icon className="w-5 h-5 text-primary" />
                <div className="flex items-center gap-2 text-xs font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
                  <span className="text-muted-foreground">{metric.status}</span>
                </div>
              </div>
              <div className="text-3xl font-bold font-mono text-foreground mb-2">
                {metric.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
