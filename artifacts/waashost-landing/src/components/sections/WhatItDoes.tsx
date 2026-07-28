import { Server, Database, Coins, Cpu } from 'lucide-react';

const features = [
  {
    title: 'Registro Automático do Site',
    description: 'Quando o plugin é instalado, seu site é adicionado à base central com perfil completo do negócio.',
    icon: Server,
  },
  {
    title: 'Cofre de Dados e Backups',
    description: 'Histórico completo do site, snapshots automáticos e proteção contra perda de dados.',
    icon: Database,
  },
  {
    title: 'Central de Créditos',
    description: 'Gerencie, recarregue e acompanhe o consumo dos créditos que alimentam as automações.',
    icon: Coins,
  },
  {
    title: 'Motor de Automações',
    description: 'Orquestra todas as tarefas N8N: scraping, campanhas WhatsApp, relatórios e robôs de negócios.',
    icon: Cpu,
  },
];

export function WhatItDoes() {
  return (
    <section id="como-funciona" className="py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">A base que sustenta tudo</h2>
          <p className="text-lg text-muted-foreground">
            A infraestrutura silenciosa que processa dados e move o seu negócio digital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card/40 border border-card-border p-8 rounded-lg hover:border-primary/50 transition-colors group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <feature.icon className="w-24 h-24 text-primary" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
