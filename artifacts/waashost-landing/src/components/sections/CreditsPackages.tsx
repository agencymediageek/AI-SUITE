import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const packages = [
  {
    name: 'Para começar',
    credits: 500,
    price: 47,
    description: 'Ideal para experimentar as automações básicas.',
    popular: false,
    features: [
      'Não expiram',
      'Auditorias SEO simples',
      'Até 10 artigos gerados',
      'Suporte via email'
    ]
  },
  {
    name: 'Mais popular',
    credits: 2000,
    price: 147,
    description: 'Equivale a 400 correções SEO, 100 campanhas WhatsApp ou 200 artigos.',
    popular: true,
    features: [
      'Não expiram',
      'Todas as automações',
      'Acesso a relatórios avançados',
      'Suporte prioritário',
      'Prospecção B2B'
    ]
  },
  {
    name: 'Máximo poder',
    credits: 5000,
    price: 297,
    description: 'Volume enterprise para quem depende intensamente de automações.',
    popular: false,
    features: [
      'Não expiram',
      'Todas as automações + betas',
      'APIs de alta prioridade',
      'Gerente de conta dedicado',
      'Treinamento de IA personalizado'
    ]
  }
];

export function CreditsPackages() {
  return (
    <section id="creditos" className="py-24 bg-card/30 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Carregue uma vez. Use quando quiser.</h2>
          <p className="text-lg text-muted-foreground">
            Sem mensalidades escondidas. Você compra créditos e as automações consomem conforme trabalham.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={`relative bg-card border rounded-xl p-8 flex flex-col ${
                pkg.popular 
                  ? 'border-primary shadow-[0_0_30px_rgba(0,212,255,0.15)] -translate-y-2' 
                  : 'border-card-border'
              } transition-transform`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                  Mais Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">{pkg.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-primary font-mono">{pkg.credits}</span>
                  <span className="text-sm font-mono text-muted-foreground">créditos</span>
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-xl font-bold">R$ {pkg.price}</span>
                  <span className="text-sm text-muted-foreground">/pacote</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed h-10">
                  {pkg.description}
                </p>
              </div>

              <div className="flex-grow">
                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 ${fIndex === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-sm ${fIndex === 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                className="w-full" 
                variant={pkg.popular ? 'default' : 'outline'}
              >
                Comprar Pacote
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm font-mono text-primary flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Créditos não expiram. Use no seu ritmo.
          </p>
        </div>
      </div>
    </section>
  );
}
