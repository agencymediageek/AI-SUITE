import { X, Check } from 'lucide-react';

const comparisons = [
  {
    aspect: 'Tempo de deploy',
    without: '4-6 horas configurando manualmente',
    with: '3 minutos automatizados',
  },
  {
    aspect: 'Conhecimento técnico',
    without: 'DevOps sênior necessário',
    with: 'Zero conhecimento técnico',
  },
  {
    aspect: 'Taxa de erro',
    without: '37% de deploys com problemas',
    with: '0% - automação validada',
  },
  {
    aspect: 'Custo por deploy',
    without: 'R$ 380 (6h × R$ 63/h)',
    with: 'R$ 0 - incluído no plano',
  },
  {
    aspect: 'SSL/HTTPS',
    without: 'Configuração manual complexa',
    with: 'Automático via Let\'s Encrypt',
  },
  {
    aspect: 'Monitoramento',
    without: 'Precisa contratar serviço separado',
    with: 'PM2 + logs em tempo real',
  },
];

export function Comparison() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-mono font-bold mb-4 text-foreground">
            Sem WaasHost vs Com WaasHost
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A diferença entre depender de DevOps e ter infraestrutura enterprise automatizada.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-border bg-muted/50">
              <div className="font-mono font-bold text-muted-foreground"></div>
              <div className="font-mono font-bold text-center text-foreground">Sem WaasHost</div>
              <div className="font-mono font-bold text-center text-primary">Com WaasHost</div>
            </div>

            {/* Rows */}
            {comparisons.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 gap-4 p-6 ${
                  index !== comparisons.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="font-medium text-foreground">{item.aspect}</div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <X className="w-5 h-5 text-destructive flex-shrink-0" />
                  <span className="text-sm">{item.without}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-primary">{item.with}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="text-4xl font-mono font-bold text-primary mb-2">96%</div>
              <div className="text-sm text-muted-foreground">Redução de tempo</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="text-4xl font-mono font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Automação garantida</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="text-4xl font-mono font-bold text-primary mb-2">R$ 380</div>
              <div className="text-sm text-muted-foreground">Economia por deploy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
