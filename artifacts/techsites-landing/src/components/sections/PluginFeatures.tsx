import { useLang } from '@/context/LangContext';
import {
  Search,
  Edit2,
  Users,
  MessageSquare,
  ShoppingCart,
  Image,
  FileText,
  BarChart2,
  Zap,
  Calculator,
  Globe,
  Shield,
} from 'lucide-react';

export function PluginFeatures() {
  const { t } = useLang();

  const services = [
    {
      icon: Search,
      title: t('SEO Repair', 'Correção de SEO'),
      description: t('Auto-fix titles, meta tags, images', 'Corrige títulos, meta tags, imagens'),
    },
    {
      icon: Edit2,
      title: t('WYSIWYG Editor', 'Editor WYSIWYG'),
      description: t('Edit live on screen', 'Edite ao vivo na tela'),
    },
    {
      icon: Users,
      title: t('B2B Prospecting', 'Prospecção B2B'),
      description: t('Find and reach clients via WhatsApp', 'Encontra e contata clientes via WhatsApp'),
    },
    {
      icon: MessageSquare,
      title: t('Sales Chatbot', 'Chatbot de Vendas'),
      description: t('Captures leads 24/7', 'Captura leads 24/7'),
    },
    {
      icon: ShoppingCart,
      title: t('Amazon Affiliates', 'Afiliados Amazon'),
      description: t('Scrapes products + inserts affiliate links', 'Scraping de produtos + links de afiliado'),
    },
    {
      icon: Image,
      title: t('Logo & Brand', 'Logo & Marca'),
      description: t('New logo in minutes', 'Nova logo em minutos'),
    },
    {
      icon: FileText,
      title: t('Auto Content', 'Conteúdo Automático'),
      description: t('Blog posts written and published', 'Artigos escritos e publicados'),
    },
    {
      icon: BarChart2,
      title: t('Market Research', 'Pesquisa de Mercado'),
      description: t('Competitor analysis and reports', 'Análise de concorrentes e relatórios'),
    },
    {
      icon: Zap,
      title: t('WhatsApp Campaigns', 'Campanhas WhatsApp'),
      description: t('Automated follow-up sequences', 'Sequências de follow-up automáticas'),
    },
    {
      icon: Calculator,
      title: t('Custom Tools', 'Ferramentas Customizadas'),
      description: t('Calculators, quizzes, schedulers', 'Calculadoras, quizzes, agendadores'),
    },
    {
      icon: Globe,
      title: t('Landing Pages', 'Landing Pages'),
      description: t('AI writes, designs and publishes', 'IA escreve, cria design e publica'),
    },
    {
      icon: Shield,
      title: t('Backup & Security', 'Backup & Segurança'),
      description: t('Daily backup + monitoring', 'Backup diário + monitoramento'),
    },
  ];

  return (
    <section id="plugin" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Price Highlight Card */}
        <div className="max-w-md mx-auto mb-16 bg-card border-2 border-primary glow-border rounded-2xl p-8 text-center">
          <div className="text-6xl font-black text-white mb-2">$10</div>
          <div className="text-lg font-semibold text-primary mb-4">
            {t('200 AI credits included', '200 créditos de IA inclusos')}
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {t(
              'One-time purchase. Credits never expire. Add more anytime.',
              'Compra única. Créditos não expiram. Adicione mais quando quiser.'
            )}
          </p>
          <a
            href="#"
            className="inline-flex items-center justify-center w-full bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-bold hover:opacity-90 transition-all duration-300"
          >
            {t('Buy Plugin — $10', 'Comprar Plugin — $10')}
          </a>
        </div>

        {/* Headline */}
        <h2 className="text-3xl md:text-5xl font-black text-center text-white mb-16">
          {t('What your $10 unlocks.', 'O que seus $10 desbloqueiam.')}
        </h2>

        {/* Services Grid 3x4 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <div
                key={i}
                className="bg-card border border-card-border rounded-xl p-6 hover:border-primary/40 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
