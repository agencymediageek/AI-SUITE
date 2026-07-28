import { Lock, MapPin, DatabaseBackup, Shield, KeyRound, Activity } from 'lucide-react';

const features = [
  {
    title: 'Dados Criptografados',
    description: 'Transferência via API criptografada ponta a ponta. Seus dados nunca ficam expostos em trânsito ou em repouso.',
    icon: Lock,
    iconColor: 'text-blue-400',
    iconBg: 'from-blue-950 via-blue-900 to-blue-800',
    glowColor: 'rgba(96,165,250,0.4)',
    borderHover: 'hover:border-blue-500/40',
  },
  {
    title: 'Servidores no Brasil',
    description: 'Hospedagem em servidores Hostinger KVM4 com SSD NVMe — máxima velocidade e latência mínima para o público brasileiro.',
    icon: MapPin,
    iconColor: 'text-emerald-400',
    iconBg: 'from-emerald-950 via-emerald-900 to-emerald-800',
    glowColor: 'rgba(52,211,153,0.4)',
    borderHover: 'hover:border-emerald-500/40',
  },
  {
    title: 'Backup Diário Automático',
    description: 'Snapshots completos toda madrugada, sem intervenção do usuário. Mantidos externamente com retenção de 30 dias.',
    icon: DatabaseBackup,
    iconColor: 'text-amber-400',
    iconBg: 'from-amber-950 via-amber-900 to-amber-800',
    glowColor: 'rgba(251,191,36,0.4)',
    borderHover: 'hover:border-amber-500/40',
  },
  {
    title: 'SSL e HTTPS',
    description: 'Certificados automáticos via Let\'s Encrypt para todos os sites registrados e endpoints de API. Renovação automática, zero intervenção.',
    icon: Shield,
    iconColor: 'text-violet-400',
    iconBg: 'from-violet-950 via-violet-900 to-violet-800',
    glowColor: 'rgba(167,139,250,0.4)',
    borderHover: 'hover:border-violet-500/40',
  },
  {
    title: 'API com Autenticação',
    description: 'Chave única e isolada por site. Arquitetura multi-tenant sem nenhum acesso cruzado entre clientes.',
    icon: KeyRound,
    iconColor: 'text-pink-400',
    iconBg: 'from-pink-950 via-pink-900 to-rose-800',
    glowColor: 'rgba(244,114,182,0.4)',
    borderHover: 'hover:border-pink-500/40',
  },
  {
    title: '99.97% de Uptime',
    description: 'Monitoramento 24/7 com alertas automáticos de indisponibilidade, failover imediato e relatório mensal de disponibilidade.',
    icon: Activity,
    iconColor: 'text-sky-400',
    iconBg: 'from-sky-950 via-sky-900 to-sky-800',
    glowColor: 'rgba(56,189,248,0.4)',
    borderHover: 'hover:border-sky-500/40',
  },
];

export function SecurityGrid() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Infraestrutura de nível enterprise</h2>
          <p className="text-lg text-muted-foreground">
            A segurança e a performance que grandes portais exigem, agora disponível para o seu negócio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-card border border-card-border rounded-2xl overflow-hidden ${feature.borderHover} hover:scale-[1.02] transition-all duration-300 group`}
            >
              {/* Icon banner */}
              <div className={`relative h-32 bg-gradient-to-b ${feature.iconBg} flex items-center justify-center`}>
                {/* Radial glow */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ filter: 'blur(28px)' }}
                >
                  <div
                    className="w-16 h-16 rounded-full"
                    style={{ background: feature.glowColor }}
                  />
                </div>
                <feature.icon
                  className={`w-14 h-14 ${feature.iconColor} relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  strokeWidth={1.4}
                />
              </div>

              {/* Text body */}
              <div className="p-6">
                <h3 className="font-bold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
