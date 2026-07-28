import { useLang } from '@/context/LangContext';
import {
  Search, Edit2, Users, MessageSquare, ShoppingCart, Image,
  FileText, BarChart2, Zap, Calculator, Globe, Shield,
} from 'lucide-react';

const services = [
  {
    icon: Search,
    title_en: 'SEO Repair in 1 Click',
    title_pt: 'Correção de SEO em 1 Clique',
    desc_en: 'Scans every page title, meta description, image alt tag and heading structure. Identifies exactly which keywords you\'re losing to competitors and fixes everything automatically — without touching a single file.',
    desc_pt: 'Escaneia cada título, meta descrição, alt de imagem e estrutura de cabeçalhos. Identifica exatamente quais palavras-chave você está perdendo para concorrentes e corrige tudo automaticamente — sem tocar em um único arquivo.',
  },
  {
    icon: Edit2,
    title_en: 'Inline WYSIWYG Editor',
    title_pt: 'Editor WYSIWYG Inline',
    desc_en: 'Click any text, image or button directly on your live site and edit it on the spot. Changes auto-save to your database. No theme editor, no developer, no FTP — just point, click and publish.',
    desc_pt: 'Clique em qualquer texto, imagem ou botão diretamente no site ao vivo e edite na hora. Mudanças se salvam automaticamente. Sem editor de tema, sem programador, sem FTP — aponte, clique e publique.',
  },
  {
    icon: Users,
    title_en: 'B2B Prospecting Robots',
    title_pt: 'Robôs de Prospecção B2B',
    desc_en: 'AI scrapes local businesses in your area, validates contacts and sends personalized WhatsApp proposals automatically — while you sleep. New qualified leads arrive in your dashboard every morning.',
    desc_pt: 'IA escaneia empresas locais na sua região, valida contatos e envia propostas personalizadas no WhatsApp automaticamente — enquanto você dorme. Novos leads qualificados chegam no seu painel toda manhã.',
  },
  {
    icon: MessageSquare,
    title_en: 'Sales Chatbot 24/7',
    title_pt: 'Chatbot de Vendas 24/7',
    desc_en: 'A fully trained AI assistant answers visitor questions, captures contact data, books appointments and qualifies leads around the clock. Converts visitors even at 3 AM when no human is available.',
    desc_pt: 'Assistente de IA treinado no seu negócio responde perguntas, captura contatos, agenda compromissos e qualifica leads a qualquer hora. Converte visitantes mesmo às 3h da manhã sem nenhum humano disponível.',
  },
  {
    icon: ShoppingCart,
    title_en: 'Amazon Affiliate Products',
    title_pt: 'Produtos Afiliado Amazon',
    desc_en: 'AI searches Amazon for products matching your niche, writes SEO-optimized review and comparison articles in your voice, and publishes them with your affiliate links already embedded and ready to earn.',
    desc_pt: 'IA busca produtos Amazon relacionados ao seu nicho, escreve artigos de review e comparativo otimizados para SEO no seu estilo, e os publica com seu link de afiliado já embutido e pronto para gerar renda.',
  },
  {
    icon: Image,
    title_en: 'Logo & Brand Design',
    title_pt: 'Design de Logo e Marca',
    desc_en: 'Describe your business in one sentence. AI generates multiple logo concepts, color palettes and typography sets in minutes. Download your new brand identity in full resolution — ready for print and web.',
    desc_pt: 'Descreva seu negócio em uma frase. A IA gera conceitos de logo, paletas de cores e tipografias em minutos. Baixe sua nova identidade visual em alta resolução — pronta para impressão e web.',
  },
  {
    icon: FileText,
    title_en: 'Automatic Content Creation',
    title_pt: 'Criação de Conteúdo Automático',
    desc_en: 'Set a topic, tone and publishing schedule. AI writes SEO-optimized articles in your brand voice, adds relevant images and publishes directly to your WordPress — consistently, without you writing a single word.',
    desc_pt: 'Defina um tema, tom e frequência de publicação. A IA escreve artigos otimizados para SEO com sua voz de marca, adiciona imagens e publica direto no seu WordPress — sem você escrever uma única palavra.',
  },
  {
    icon: BarChart2,
    title_en: 'Market Research & Reports',
    title_pt: 'Pesquisa de Mercado e Relatórios',
    desc_en: 'Monitor your top competitors daily, track their pricing, content and positioning changes, and receive weekly intelligence reports pointing out the exact gaps your business can exploit right now.',
    desc_pt: 'Monitore seus principais concorrentes diariamente, acompanhe mudanças de preço, conteúdo e posicionamento, e receba relatórios semanais de inteligência com as lacunas exatas que seu negócio pode explorar.',
  },
  {
    icon: Zap,
    title_en: 'WhatsApp Campaigns',
    title_pt: 'Campanhas WhatsApp',
    desc_en: 'Upload a contact list or let AI build one from your niche. Write the message once — AI personalizes each version and sends with automated multi-step follow-up sequences until the lead converts.',
    desc_pt: 'Envie uma lista de contatos ou deixe a IA montar uma do seu nicho. Escreva a mensagem uma vez — a IA personaliza cada versão e envia com sequência automática de follow-up em várias etapas.',
  },
  {
    icon: Calculator,
    title_en: 'Custom Interactive Tools',
    title_pt: 'Ferramentas Interativas',
    desc_en: 'Request a price calculator, loan estimator, quiz, BMI checker or appointment scheduler. AI builds it as an embeddable widget and places it on any page of your site — fully functional in minutes.',
    desc_pt: 'Peça uma calculadora de preços, simulador de financiamento, quiz, calculadora de IMC ou agendador de consultas. A IA constrói como widget embutível e coloca em qualquer página do seu site — funcional em minutos.',
  },
  {
    icon: Globe,
    title_en: 'Landing Page Builder',
    title_pt: 'Construtor de Landing Pages',
    desc_en: 'Describe your campaign, product or promotion in plain language. AI writes the entire copy, designs the layout in your brand colors and publishes it as a live page — ready to collect leads and convert.',
    desc_pt: 'Descreva sua campanha, produto ou promoção em linguagem simples. A IA escreve todo o texto, cria o layout nas suas cores de marca e publica como página ao vivo — pronta para capturar leads e converter.',
  },
  {
    icon: Shield,
    title_en: 'Backup & Security',
    title_pt: 'Backup e Segurança',
    desc_en: 'Daily automatic snapshots of your entire site. Real-time malware scanning, login brute-force protection and one-click restoration to any previous version. Your data is never lost, your site never compromised.',
    desc_pt: 'Snapshots automáticos diários de todo o site. Varredura de malware em tempo real, proteção contra força bruta no login e restauração em 1 clique para qualquer versão anterior. Seus dados nunca se perdem.',
  },
];

export function PluginFeatures() {
  const { t } = useLang();

  return (
    <section id="plugin" className="py-24 bg-muted/20">
      <div className="container mx-auto px-6">

        {/* Price callout — top anchor */}
        <div className="max-w-lg mx-auto mb-20 bg-card border-2 border-primary/60 rounded-2xl p-8 text-center shadow-lg shadow-primary/10">
          <p className="text-xs uppercase tracking-widest text-primary font-bold mb-3">
            {t('One-time purchase · Credits never expire', 'Compra única · Créditos não expiram')}
          </p>
          <div className="text-8xl font-black text-foreground mb-1 leading-none">$10</div>
          <p className="text-xl font-semibold text-primary mb-2">
            {t('200 AI credits included', '200 créditos de IA inclusos')}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {t(
              'Install on any WordPress site. Audit, fix and deploy AI employees immediately. Add more credits anytime as your business grows.',
              'Instale em qualquer site WordPress. Audite, corrija e ative funcionários digitais imediatamente. Adicione mais créditos quando quiser conforme seu negócio cresce.'
            )}
          </p>
          <a
            href="#pricing"
            className="flex items-center justify-center w-full bg-primary text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-primary/90 transition-colors"
          >
            {t('Get the Plugin — $10', 'Obter o Plugin — $10')}
          </a>
        </div>

        {/* Section headline */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">
            {t('What your $10 unlocks.', 'O que seus $10 desbloqueiam.')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(
              'One plugin replaces an entire floor of professionals. Every service below runs on AI — 24 hours a day, 7 days a week, for a fraction of the cost.',
              'Um plugin substitui um andar inteiro de profissionais. Cada serviço abaixo roda em IA — 24 horas por dia, 7 dias por semana, por uma fração do custo.'
            )}
          </p>
        </div>

        {/* Services grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {t(s.title_en, s.title_pt)}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(s.desc_en, s.desc_pt)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
