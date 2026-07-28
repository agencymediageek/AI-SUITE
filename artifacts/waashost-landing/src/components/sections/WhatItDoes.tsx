import { Server, Database, Coins, Cpu } from 'lucide-react';

const features = [
  {
    title: 'Registro Automático do Site',
    description: 'Quando o plugin é instalado, seu site é adicionado à base central com perfil completo do negócio — nome, categoria, localização e serviços — pronto para as automações.',
    icon: Server,
    iconColor: 'text-blue-400',
    iconBg: 'from-blue-950 via-blue-900 to-blue-800',
    glowColor: 'rgba(96,165,250,0.4)',
    borderHover: 'hover:border-blue-500/40',
  },
  {
    title: 'Cofre de Dados e Backups',
    description: 'Snapshots completos do site gerados automaticamente toda madrugada. Histórico completo de alterações e restauração em 1 clique para qualquer versão anterior.',
    icon: Database,
    iconColor: 'text-emerald-400',
    iconBg: 'from-emerald-950 via-emerald-900 to-emerald-800',
    glowColor: 'rgba(52,211,153,0.4)',
    borderHover: 'hover:border-emerald-500/40',
  },
  {
    title: 'Central de Créditos',
    description: 'Compre uma vez, use quando quiser. Gerencie, recarregue e acompanhe em tempo real o consumo de cada automação — sem mensalidade, sem surpresas.',
    icon: Coins,
    iconColor: 'text-amber-400',
    iconBg: 'from-amber-950 via-amber-900 to-amber-800',
    glowColor: 'rgba(251,191,36,0.4)',
    borderHover: 'hover:border-amber-500/40',
  },
  {
    title: 'Motor de Automações',
    description: 'Orquestra centenas de tarefas N8N em paralelo: scraping B2B, campanhas WhatsApp, geração de artigos, relatórios de SEO e robôs de vendas — tudo rodando 24/7.',
    icon: Cpu,
    iconColor: 'text-violet-400',
    iconBg: 'from-violet-950 via-violet-900 to-violet-800',
    glowColor: 'rgba(167,139,250,0.4)',
    borderHover: 'hover:border-violet-500/40',
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-card border border-card-border rounded-2xl overflow-hidden ${feature.borderHover} hover:scale-[1.02] transition-all duration-300 group`}
            >
              {/* Icon banner */}
              <div className={`relative h-36 bg-gradient-to-b ${feature.iconBg} flex items-center justify-center`}>
                {/* Radial glow */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ filter: 'blur(30px)' }}
                >
                  <div
                    className="w-20 h-20 rounded-full"
                    style={{ background: feature.glowColor }}
                  />
                </div>
                <feature.icon
                  className={`w-16 h-16 ${feature.iconColor} relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  strokeWidth={1.4}
                />
              </div>

              {/* Text body */}
              <div className="p-6">
                <h3 className="text-base font-bold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
