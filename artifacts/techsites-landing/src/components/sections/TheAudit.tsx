import { useLang } from '@/context/LangContext';
import { Download, ScanSearch, FileText, Zap } from 'lucide-react';

export function TheAudit() {
  const { t } = useLang();

  const steps = [
    {
      icon: Download,
      title: t('Install in 2 clicks', 'Instale em 2 cliques'),
      description: t(
        'Available on WordPress.org and Envato Market. No code, no FTP, no developer.',
        'Disponível no WordPress.org e Envato Market. Sem código, sem FTP, sem programador.'
      ),
    },
    {
      icon: ScanSearch,
      title: t('AI reads your entire site', 'A IA lê todo o seu site'),
      description: t(
        "The plugin scans every page, post, product, SEO tag and loads speed. It understands your business sector and saves everything to TechSites' central database.",
        'O plugin escaneia cada página, post, produto, tag SEO e velocidade. Entende o setor do seu negócio e salva tudo no banco central do TechSites.'
      ),
    },
    {
      icon: FileText,
      title: t('Receive a full diagnosis', 'Receba um diagnóstico completo'),
      description: t(
        "A visual report shows exactly what's hurting your sales: slow pages, broken SEO, missing content, unoptimized products.",
        'Um relatório visual mostra exatamente o que está prejudicando suas vendas: páginas lentas, SEO quebrado, conteúdo ausente, produtos sem otimização.'
      ),
    },
    {
      icon: Zap,
      title: t('Activate your digital employees', 'Ative seus funcionários digitais'),
      description: t(
        'Choose what to fix and deploy. With your credits, the AI corrects everything and activates automated robots specialized in your business.',
        'Escolha o que corrigir e ativar. Com seus créditos, a IA corrige tudo e ativa robôs automatizados especializados no seu tipo de negócio.'
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            {t(
              'Your site audited. Your business understood. In 60 seconds.',
              'Seu site auditado. Seu negócio compreendido. Em 60 segundos.'
            )}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
