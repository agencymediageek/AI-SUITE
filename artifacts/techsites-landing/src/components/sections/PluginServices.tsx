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

export function PluginServices() {
  const { t } = useLang();

  const services = [
    {
      icon: Search,
      title: t('SEO Repair in 1 Click', 'Correção de SEO em 1 Clique'),
      description: t(
        'AI identifies and fixes titles, meta tags, heavy images and missing keywords automatically.',
        'A IA identifica e corrige títulos, meta tags, imagens pesadas e palavras-chave ausentes automaticamente.'
      ),
    },
    {
      icon: Edit2,
      title: t('Inline WYSIWYG Editor', 'Editor WYSIWYG Inline'),
      description: t(
        'Edit any text, image or section of your site directly on screen — without opening the WordPress panel.',
        'Edite qualquer texto, imagem ou seção do site diretamente na tela — sem abrir o painel WordPress.'
      ),
    },
    {
      icon: Users,
      title: t('B2B Prospecting Robots', 'Robôs de Prospecção B2B'),
      description: t(
        'AI scans your region and sends automated proposals to potential clients via WhatsApp.',
        'IA escaneia sua região e envia propostas automáticas para clientes em potencial pelo WhatsApp.'
      ),
    },
    {
      icon: MessageSquare,
      title: t('Sales Chatbot', 'Chatbot de Vendas'),
      description: t(
        'Attends visitors, captures leads and schedules appointments while you sleep.',
        'Atende visitantes, captura leads e agenda compromissos enquanto você dorme.'
      ),
    },
    {
      icon: ShoppingCart,
      title: t('Amazon Affiliate Products', 'Produtos Afiliado Amazon'),
      description: t(
        'Scrapes Amazon products, generates review articles, and indexes them on your site with affiliate links already inserted.',
        'Faz scraping de produtos Amazon, gera artigos review e indexa em seu site já com link de afiliado.'
      ),
    },
    {
      icon: Image,
      title: t('Logo & Brand Design', 'Design de Logo e Marca'),
      description: t(
        'Request a new logo, update your brand colors or create a full visual identity — AI delivers in minutes.',
        'Peça uma logo nova, atualize suas cores de marca ou crie uma identidade visual completa — a IA entrega em minutos.'
      ),
    },
    {
      icon: FileText,
      title: t('Auto Content Creation', 'Criação de Conteúdo Automático'),
      description: t(
        'Blog posts, product descriptions and social media content created and published automatically in your style.',
        'Artigos de blog, descrições de produtos e posts para redes sociais criados e publicados automaticamente no seu estilo.'
      ),
    },
    {
      icon: BarChart2,
      title: t('Advanced Research & Reports', 'Pesquisas Avançadas com Relatórios'),
      description: t(
        'Market analysis, competitor monitoring and business intelligence reports for strategic decisions.',
        'Análise de mercado, monitoramento de concorrentes e relatórios de inteligência para decisões estratégicas.'
      ),
    },
    {
      icon: Zap,
      title: t('WhatsApp Campaigns', 'Campanhas WhatsApp'),
      description: t(
        'Automated sending to your customer base with AI-generated messages and complete follow-up sequences.',
        'Disparo automatizado para sua base de clientes com mensagens geradas por IA e sequências de follow-up.'
      ),
    },
    {
      icon: Calculator,
      title: t('Custom Web Tools', 'Ferramentas Web Personalizadas'),
      description: t(
        'Add a price calculator, quiz, appointment scheduler or any interactive tool to any page of your site.',
        'Adicione calculadora de preços, quiz, agendador ou qualquer ferramenta interativa em qualquer página do seu site.'
      ),
    },
    {
      icon: Globe,
      title: t('Landing Page Builder', 'Construtor de Landing Pages'),
      description: t(
        'Create high-conversion landing pages for campaigns, launches and promotions — AI writes, designs and publishes.',
        'Crie landing pages de alta conversão para campanhas, lançamentos e promoções — IA escreve, design e publica.'
      ),
    },
    {
      icon: Shield,
      title: t('Site Backup & Security', 'Backup e Segurança do Site'),
      description: t(
        'Daily automatic backups, security monitoring and one-click restoration. Your site always protected.',
        'Backups automáticos diários, monitoramento de segurança e restauração em 1 clique. Seu site sempre protegido.'
      ),
    },
  ];

  return (
    <section id="plugin" className="py-20 px-6 bg-card/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('Everything your business needs. One plugin.', 'Tudo que seu negócio precisa. Em um plugin.')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(
              'Think of anything your website could do. TechSites AI can make it happen.',
              'Pense em qualquer coisa que seu site pudesse fazer. O TechSites AI pode fazer acontecer.'
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
