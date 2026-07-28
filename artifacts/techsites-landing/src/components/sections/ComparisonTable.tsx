import { useLang } from '@/context/LangContext';

export function ComparisonTable() {
  const { t } = useLang();

  const rows = [
    {
      role: t('SEO Agency', 'Agência SEO'),
      monthlyCost: '$2,000/mo',
      withTechSites: t('AI corrects automatically — included', 'IA corrige automaticamente — incluso'),
    },
    {
      role: t('Web Designer', 'Web Designer'),
      monthlyCost: '$3,500/mo',
      withTechSites: t('WYSIWYG editor — you control it', 'Editor WYSIWYG — você mesmo controla'),
    },
    {
      role: t('Developer', 'Programador'),
      monthlyCost: '$5,000/mo',
      withTechSites: t('Plugin updates and maintains without code', 'Plugin atualiza e mantém sem código'),
    },
    {
      role: t('Traffic Manager', 'Gestor de Tráfego'),
      monthlyCost: '$2,500/mo',
      withTechSites: t('Prospecting robots active 24/7', 'Robôs de prospecção ativos 24/7'),
    },
    {
      role: t('Copywriter', 'Redator'),
      monthlyCost: '$1,500/mo',
      withTechSites: t('AI creates content in your style', 'IA cria conteúdo no seu estilo'),
    },
    {
      role: t('Marketing Agency', 'Agência de Marketing'),
      monthlyCost: '$3,000/mo',
      withTechSites: t('WhatsApp campaigns and chatbot — automated', 'Campanhas WhatsApp e chatbot — automatizados'),
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            {t('What you stop paying. What you start gaining.', 'O que você para de pagar. O que começa a ganhar.')}
          </h2>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-border bg-muted/30">
              <div className="text-sm font-semibold text-white uppercase tracking-wider">
                {t('Professional', 'Profissional')}
              </div>
              <div className="text-sm font-semibold text-white uppercase tracking-wider">
                {t('Monthly Cost', 'Custo Mensal')}
              </div>
              <div className="text-sm font-semibold text-white uppercase tracking-wider">
                {t('With TechSites AI', 'Com TechSites AI')}
              </div>
            </div>

            {/* Rows */}
            {rows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-4 p-6 border-b border-border last:border-b-0"
              >
                <div className="text-white font-medium">{row.role}</div>
                <div className="text-muted-foreground">{row.monthlyCost}</div>
                <div className="text-muted-foreground">{row.withTechSites}</div>
              </div>
            ))}

            {/* Total */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-primary/10 border-t-2 border-primary">
              <div className="text-white font-bold uppercase">TOTAL</div>
              <div className="text-white font-bold">$17,500/mo</div>
              <div className="text-primary font-bold">
                {t('TechSites AI: from $97/mo', 'TechSites AI: a partir de R$97/mês')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
