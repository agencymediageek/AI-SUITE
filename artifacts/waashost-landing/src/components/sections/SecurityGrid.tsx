import { Lock, MapPin, DatabaseBackup, Shield, KeyRound, Activity } from 'lucide-react';

const features = [
  {
    title: 'Dados Criptografados',
    description: 'Transferência via API criptografada. Seus dados nunca ficam expostos.',
    icon: Lock,
  },
  {
    title: 'Servidores no Brasil',
    description: 'Hospedagem em servidores Hostinger KVM4 com SSD NVMe para máxima velocidade e menor latência.',
    icon: MapPin,
  },
  {
    title: 'Backup Diário Automático',
    description: 'Snapshots completos sem intervenção do usuário, mantidos seguros externamente.',
    icon: DatabaseBackup,
  },
  {
    title: 'SSL e HTTPS',
    description: 'Certificados automáticos via Let\'s Encrypt para todos os sites registrados e endpoints de API.',
    icon: Shield,
  },
  {
    title: 'API com Autenticação',
    description: 'Chave única por site. Arquitetura isolada sem acesso cruzado entre clientes.',
    icon: KeyRound,
  },
  {
    title: '99.97% de Uptime',
    description: 'Monitoramento 24/7 com alertas automáticos de indisponibilidade e failover.',
    icon: Activity,
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
              className="bg-card border border-card-border p-6 rounded-lg flex items-start gap-4 hover:bg-card/80 transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-primary/20">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
