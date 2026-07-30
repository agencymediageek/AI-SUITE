import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { BackToTop } from '@/components/ui/back-to-top';
import { Navbar } from '@/components/layout/Navbar';
import { ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LandingFooter } from '@/pages/landing';

const faqItems = [
  {
    category: 'Geral',
    items: [
      {
        q: 'O que é o APEX CORE MEETING?',
        a: 'O APEX CORE MEETING é uma plataforma de inteligência artificial enterprise que executa ações reais durante suas reuniões — deploy de sites, publicação de documentos, configuração de infraestrutura — tudo em tempo real, enquanto você fala.',
      },
      {
        q: 'Para quem é o APEX CORE?',
        a: 'O APEX CORE foi criado para equipes executivas, founders, CTOs e líderes que precisam transformar decisões em entregas imediatas. É ideal para reuniões de lançamento de produto, apresentações para clientes, board sessions e revisões de engenharia.',
      },
      {
        q: 'Preciso instalar alguma coisa?',
        a: 'Não. O APEX CORE MEETING é 100% no navegador. Basta criar sua conta, configurar sua sala e começar a operar. Sem downloads, sem instalações, sem configurações complexas.',
      },
      {
        q: 'Em quais idiomas o APEX CORE funciona?',
        a: 'O APEX CORE suporta Português (BR), Inglês e Espanhol. Você pode configurar o idioma da IA por sala de reunião.',
      },
    ],
  },
  {
    category: 'Tecnologia',
    items: [
      {
        q: 'Como o APEX CORE executa ações reais?',
        a: 'Via APIs de DNS, hospedagem, documentos e serviços de nuvem. Quando você fala um comando, o APEX CORE interpreta, planeja e executa as ações necessárias usando integrações seguras com provedores de infraestrutura.',
      },
      {
        q: 'O que é o Matrix Globe?',
        a: 'O Matrix Globe é a representação visual da IA em tempo real. Ele pulsa e se anima quando o APEX CORE está processando seus comandos, dando visibilidade total ao que está sendo executado.',
      },
      {
        q: 'O que é o Terminal ao Vivo?',
        a: 'É um painel em tempo real que mostra exatamente o que o APEX CORE está executando — comandos de infraestrutura, chamadas de API, status de deploy — com total transparência.',
      },
    ],
  },
  {
    category: 'Planos e Pagamento',
    items: [
      {
        q: 'Posso renomear a IA com minha marca?',
        a: 'Sim! A partir do plano Pro você tem acesso ao White-Label completo. Renomeie a IA, personalize a interface e apresente como sua própria solução de inteligência artificial para clientes.',
      },
      {
        q: 'Posso cancelar quando quiser?',
        a: 'Sim, sem fidelidade. Você pode cancelar sua assinatura a qualquer momento sem multas ou custos adicionais. Também oferecemos 7 dias de garantia de satisfação — se não gostar, devolvemos.',
      },
      {
        q: 'Vocês oferecem desconto anual?',
        a: 'Sim! Ao optar pelo plano anual você tem 2 meses gratuitos (equivalente a ~17% de desconto). Entre em contato com nossa equipe para obter seu link personalizado.',
      },
    ],
  },
  {
    category: 'Segurança',
    items: [
      {
        q: 'Meus dados de reunião são seguros?',
        a: 'Absolutamente. Utilizamos criptografia end-to-end (E2E) em todos os dados de reunião. Estamos em conformidade com a LGPD e adotamos arquitetura zero-knowledge — seus dados são seus e nunca são usados para treinar modelos externos.',
      },
      {
        q: 'Onde os dados são armazenados?',
        a: 'Todos os dados são armazenados em servidores no Brasil, em conformidade com a Lei Geral de Proteção de Dados (LGPD). Você tem total controle sobre seus dados e pode solicitar exclusão a qualquer momento.',
      },
    ],
  },
];

export default function Faq() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <Navbar />
      <div className="scan-lines fixed inset-0 pointer-events-none z-0" />

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
            <span className="text-xs font-mono text-primary tracking-widest uppercase">FAQ</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 text-foreground">
            Perguntas <span className="matrix-text">frequentes</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Tudo o que você precisa saber sobre o APEX CORE MEETING.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-3xl space-y-12">
          {faqItems.map((section) => (
            <div key={section.category}>
              <h2 className="text-lg font-semibold text-primary font-mono mb-4 tracking-wider uppercase">
                {section.category}
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {section.items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`${section.category}-${i}`}
                    className="border border-primary/20 rounded-xl px-4 bg-card/40 backdrop-blur"
                  >
                    <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline hover:text-primary text-sm sm:text-base py-5">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 blur-[80px] pointer-events-none" />
            <div className="relative bg-card/60 border border-primary/30 rounded-2xl p-10 terminal-glow">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
                Ainda tem dúvidas?
              </h2>
              <p className="text-muted-foreground mb-6">
                Nossa equipe está pronta para ajudar. Entre em contato diretamente.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow">
                  <Link href="/contato">
                    Falar com a equipe
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-primary/30 text-foreground hover:text-primary hover:bg-primary/5">
                  <a href="mailto:contato@techsites.ai">contato@techsites.ai</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
      <BackToTop />
    </div>
  );
}
