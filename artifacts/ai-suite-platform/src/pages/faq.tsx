import { PublicLayout } from "@/components/layout/public-layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

export default function FAQ() {
  const { locale } = useI18n();
  const isPt = locale === "pt";
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = isPt ? [
    {
      q: "O que é a MediaGeek AI Suite?",
      a: "É uma plataforma SaaS com mais de 100 ferramentas de IA especializadas para criadores de conteúdo, agências e profissionais de marketing digital. Em vez de pagar múltiplas assinaturas, você acessa tudo em um único painel com preço fixo.",
    },
    {
      q: "Preciso de cartão de crédito para começar?",
      a: "Não. Você pode criar sua conta gratuita agora mesmo sem nenhum dado de pagamento. Você recebe tokens gratuitos para testar as ferramentas e só paga quando quiser fazer upgrade.",
    },
    {
      q: "O que são tokens?",
      a: "Tokens são a moeda da plataforma. Cada ferramenta consome uma quantidade de tokens por geração (ex: 10 tokens para um texto, 50 para uma imagem). Seu plano define quantos tokens você recebe por mês. Tokens não utilizados não acumulam para o próximo mês.",
    },
    {
      q: "Posso cancelar minha assinatura a qualquer momento?",
      a: "Sim, sem multa e sem burocracia. Você pode cancelar pelo painel a qualquer momento e seu acesso continua até o fim do período já pago.",
    },
    {
      q: "A plataforma funciona em português?",
      a: "Sim! A interface detecta automaticamente se você está no Brasil e exibe em português com preços em Real (R$). Você pode alternar para inglês a qualquer momento pelo ícone de globo no menu.",
    },
    {
      q: "Posso usar a plataforma no celular?",
      a: "Sim. A MediaGeek AI Suite é totalmente responsiva e funciona em qualquer dispositivo — celular, tablet ou computador.",
    },
    {
      q: "Qual a diferença entre os planos Starter, Pro e Enterprise?",
      a: "O Starter é ideal para quem está começando (5.000 tokens/mês, 50+ ferramentas). O Pro é o mais popular para agências e criadores ativos (25.000 tokens/mês, 100+ ferramentas, webhooks N8N, modelos avançados). O Enterprise é para grandes equipes com volume alto e recursos exclusivos como white-label e suporte dedicado.",
    },
    {
      q: "O conteúdo gerado é meu? Posso usar comercialmente?",
      a: "Sim. Todo o conteúdo gerado pela plataforma pertence a você e pode ser usado comercialmente sem restrições.",
    },
    {
      q: "O que é integração com N8N?",
      a: "N8N é uma ferramenta de automação de fluxos de trabalho. Com os planos Pro e Enterprise, você pode conectar as ferramentas da MediaGeek a qualquer sistema via webhooks N8N — automatizando publicações, relatórios, campanhas e muito mais.",
    },
    {
      q: "Existe API para integrar com meus sistemas?",
      a: "Sim. Planos Pro e Enterprise incluem acesso à API REST autenticada para integrar as ferramentas diretamente nos seus aplicativos, sistemas internos ou fluxos automatizados.",
    },
    {
      q: "Como funciona o pagamento? Aceita Mercado Pago?",
      a: "Sim! Aceitamos Mercado Pago, o método de pagamento mais utilizado no Brasil. Você pode pagar com cartão de crédito, débito, Pix ou saldo do Mercado Pago. O checkout é 100% seguro e processado diretamente pelo Mercado Pago.",
    },
    {
      q: "Posso ter mais de um usuário na mesma conta?",
      a: "Atualmente cada conta é individual. O plano Enterprise inclui gestão de times — entre em contato pelo Contato para saber mais sobre licenças para equipes.",
    },
  ] : [
    {
      q: "What is MediaGeek AI Suite?",
      a: "It's a SaaS platform with 100+ specialized AI tools for content creators, agencies, and digital marketing professionals. Instead of paying multiple subscriptions, you access everything in a single dashboard at a fixed price.",
    },
    {
      q: "Do I need a credit card to get started?",
      a: "No. You can create your free account right now without any payment details. You receive free tokens to test the tools and only pay when you want to upgrade.",
    },
    {
      q: "What are tokens?",
      a: "Tokens are the platform's currency. Each tool consumes a number of tokens per generation (e.g. 10 tokens for text, 50 for an image). Your plan defines how many tokens you receive per month. Unused tokens don't carry over to the next month.",
    },
    {
      q: "Can I cancel my subscription at any time?",
      a: "Yes, with no penalty and no hassle. You can cancel from your dashboard at any time and your access continues until the end of the already-paid period.",
    },
    {
      q: "Is the platform available in Portuguese?",
      a: "Yes! The interface automatically detects if you're in Brazil and displays in Portuguese with prices in Brazilian Real (R$). You can switch to English at any time using the globe icon in the menu.",
    },
    {
      q: "Can I use the platform on mobile?",
      a: "Yes. MediaGeek AI Suite is fully responsive and works on any device — phone, tablet, or computer.",
    },
    {
      q: "What's the difference between Starter, Pro, and Enterprise plans?",
      a: "Starter is for those just getting started (5,000 tokens/month, 50+ tools). Pro is the most popular for active agencies and creators (25,000 tokens/month, 100+ tools, N8N webhooks, advanced models). Enterprise is for large teams with high volume and exclusive features like white-label and dedicated support.",
    },
    {
      q: "Do I own the generated content? Can I use it commercially?",
      a: "Yes. All content generated by the platform belongs to you and can be used commercially without restrictions.",
    },
    {
      q: "What is N8N integration?",
      a: "N8N is a workflow automation tool. With Pro and Enterprise plans, you can connect MediaGeek tools to any system via N8N webhooks — automating publishing, reports, campaigns, and much more.",
    },
    {
      q: "Is there an API to integrate with my systems?",
      a: "Yes. Pro and Enterprise plans include access to an authenticated REST API to integrate tools directly into your applications, internal systems, or automated workflows.",
    },
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-20 pb-12 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
            {isPt ? (
              <>Perguntas <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Frequentes</span></>
            ) : (
              <>Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Questions</span></>
            )}
          </h1>
          <p className="text-lg text-muted-foreground">
            {isPt
              ? "Encontre respostas para as dúvidas mais comuns sobre a MediaGeek AI Suite."
              : "Find answers to the most common questions about MediaGeek AI Suite."}
          </p>
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="py-8 pb-20 px-4">
        <div className="container mx-auto max-w-3xl space-y-3">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/50 bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 hover:bg-muted/30 transition-colors"
              >
                <span className="font-semibold text-sm leading-snug">{item.q}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Still have questions */}
      <section className="py-16 px-4 bg-card/30 border-t border-border/40 text-center">
        <div className="container mx-auto max-w-xl">
          <h2 className="text-2xl font-bold mb-3">
            {isPt ? "Ainda tem dúvidas?" : "Still have questions?"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isPt
              ? "Nossa equipe e o assistente de IA estão prontos para te ajudar."
              : "Our team and AI assistant are ready to help you."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contato">
              <Button size="lg" className="rounded-full px-8 w-full sm:w-auto">
                {isPt ? "Falar com a Equipe" : "Talk to the Team"} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="rounded-full px-8 w-full sm:w-auto">
                {isPt ? "Criar Conta Grátis" : "Create Free Account"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
