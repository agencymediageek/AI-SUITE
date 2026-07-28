import { Clock, Cog, TrendingUp, Shield } from 'lucide-react';

const metrics = [
  {
    icon: Clock,
    value: '3 min',
    label: 'de deploy',
  },
  {
    icon: Cog,
    value: '50+',
    label: 'automações ativas',
  },
  {
    icon: TrendingUp,
    value: '99.9%',
    label: 'uptime garantido',
  },
  {
    icon: Shield,
    value: 'SSL',
    label: 'automático',
  },
];

export function MetricsBar() {
  return (
    <section className="py-16 border-y border-border bg-card/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors border border-primary/20">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-primary mb-1 glow-text">
                  {metric.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {metric.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
