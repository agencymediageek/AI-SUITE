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
import { useI18n } from '@/lib/i18n';

export default function Faq() {
  const { t, language } = useI18n();

  const faqItems = [
    {
      categoryKey: 'faq.cat.general',
      items: [
        {
          q: { pt: 'O que é o APEX CORE MEETING?', en: 'What is APEX CORE MEETING?', es: '¿Qué es APEX CORE MEETING?' },
          a: { pt: 'O APEX CORE MEETING é uma plataforma de inteligência artificial enterprise que executa ações reais durante suas reuniões — deploy de sites, publicação de documentos, configuração de infraestrutura — tudo em tempo real, enquanto você fala.', en: 'APEX CORE MEETING is an enterprise AI platform that executes real actions during your meetings — site deployment, document publishing, infrastructure configuration — all in real time, while you speak.', es: 'APEX CORE MEETING es una plataforma de inteligencia artificial empresarial que ejecuta acciones reales durante tus reuniones — despliegue de sitios, publicación de documentos, configuración de infraestructura — todo en tiempo real, mientras hablas.' },
        },
        {
          q: { pt: 'Para quem é o APEX CORE?', en: 'Who is APEX CORE for?', es: '¿Para quién es APEX CORE?' },
          a: { pt: 'O APEX CORE foi criado para equipes executivas, founders, CTOs e líderes que precisam transformar decisões em entregas imediatas.', en: 'APEX CORE was created for executive teams, founders, CTOs, and leaders who need to transform decisions into immediate deliverables.', es: 'APEX CORE fue creado para equipos ejecutivos, founders, CTOs y líderes que necesitan transformar decisiones en entregas inmediatas.' },
        },
        {
          q: { pt: 'Preciso instalar alguma coisa?', en: 'Do I need to install anything?', es: '¿Necesito instalar algo?' },
          a: { pt: 'Não. O APEX CORE MEETING é 100% no navegador. Basta criar sua conta, configurar sua sala e começar a operar.', en: 'No. APEX CORE MEETING is 100% browser-based. Just create your account, set up your room, and start operating.', es: 'No. APEX CORE MEETING es 100% en el navegador. Solo crea tu cuenta, configura tu sala y comienza a operar.' },
        },
        {
          q: { pt: 'Em quais idiomas o APEX CORE funciona?', en: 'What languages does APEX CORE support?', es: '¿En qué idiomas funciona APEX CORE?' },
          a: { pt: 'O APEX CORE suporta Português (BR), Inglês e Espanhol. Você pode configurar o idioma da IA por sala de reunião.', en: 'APEX CORE supports Portuguese (BR), English, and Spanish. You can configure the AI language per meeting room.', es: 'APEX CORE soporta Português (BR), Inglés y Español. Puedes configurar el idioma de la IA por sala de reunión.' },
        },
      ],
    },
    {
      categoryKey: 'faq.cat.tech',
      items: [
        {
          q: { pt: 'Como o APEX CORE executa ações reais?', en: 'How does APEX CORE execute real actions?', es: '¿Cómo ejecuta APEX CORE acciones reales?' },
          a: { pt: 'Via APIs de DNS, hospedagem, documentos e serviços de nuvem. Quando você fala um comando, o APEX CORE interpreta, planeja e executa as ações necessárias usando integrações seguras.', en: 'Via DNS, hosting, document, and cloud service APIs. When you speak a command, APEX CORE interprets, plans, and executes the necessary actions using secure integrations.', es: 'A través de APIs de DNS, hospedaje, documentos y servicios en la nube. Cuando hablas un comando, APEX CORE interpreta, planifica y ejecuta las acciones necesarias mediante integraciones seguras.' },
        },
        {
          q: { pt: 'O que é o Matrix Globe?', en: 'What is the Matrix Globe?', es: '¿Qué es el Matrix Globe?' },
          a: { pt: 'O Matrix Globe é a representação visual da IA em tempo real. Ele pulsa e se anima quando o APEX CORE está processando seus comandos, dando visibilidade total ao que está sendo executado.', en: 'The Matrix Globe is the visual representation of the AI in real time. It pulses and animates when APEX CORE is processing your commands, giving full visibility into what is being executed.', es: 'El Matrix Globe es la representación visual de la IA en tiempo real. Pulsa y se anima cuando APEX CORE está procesando tus comandos, dando visibilidad total a lo que se está ejecutando.' },
        },
        {
          q: { pt: 'O que é o Terminal ao Vivo?', en: 'What is the Live Terminal?', es: '¿Qué es el Terminal en Vivo?' },
          a: { pt: 'É um painel em tempo real que mostra exatamente o que o APEX CORE está executando — comandos de infraestrutura, chamadas de API, status de deploy — com total transparência.', en: 'It\'s a real-time panel that shows exactly what APEX CORE is executing — infrastructure commands, API calls, deploy status — with full transparency.', es: 'Es un panel en tiempo real que muestra exactamente lo que APEX CORE está ejecutando — comandos de infraestructura, llamadas a API, estado del despliegue — con total transparencia.' },
        },
      ],
    },
    {
      categoryKey: 'faq.cat.plans',
      items: [
        {
          q: { pt: 'Posso renomear a IA com minha marca?', en: 'Can I rename the AI with my brand?', es: '¿Puedo renombrar la IA con mi marca?' },
          a: { pt: 'Sim! A partir do plano Pro você tem acesso ao White-Label completo. Renomeie a IA, personalize a interface e apresente como sua própria solução.', en: 'Yes! From the Pro plan onwards you get full White-Label access. Rename the AI, customize the interface, and present it as your own solution.', es: '¡Sí! A partir del plan Pro tienes acceso al White-Label completo. Renombra la IA, personaliza la interfaz y preséntala como tu propia solución.' },
        },
        {
          q: { pt: 'Posso cancelar quando quiser?', en: 'Can I cancel anytime?', es: '¿Puedo cancelar cuando quiera?' },
          a: { pt: 'Sim, sem fidelidade. Você pode cancelar sua assinatura a qualquer momento sem multas ou custos adicionais. Oferecemos 7 dias de garantia de satisfação.', en: 'Yes, no contracts. You can cancel your subscription at any time without penalties or additional costs. We offer a 7-day satisfaction guarantee.', es: 'Sí, sin contratos. Puedes cancelar tu suscripción en cualquier momento sin penalizaciones ni costos adicionales. Ofrecemos 7 días de garantía de satisfacción.' },
        },
        {
          q: { pt: 'Vocês oferecem desconto anual?', en: 'Do you offer annual discounts?', es: '¿Ofrecen descuentos anuales?' },
          a: { pt: 'Sim! Ao optar pelo plano anual você tem 2 meses gratuitos (≈17% de desconto). Entre em contato com nossa equipe.', en: 'Yes! With an annual plan you get 2 free months (≈17% discount). Contact our team for your personalized link.', es: '¡Sí! Con el plan anual obtienes 2 meses gratis (≈17% de descuento). Contacta con nuestro equipo.' },
        },
      ],
    },
    {
      categoryKey: 'faq.cat.security',
      items: [
        {
          q: { pt: 'Meus dados de reunião são seguros?', en: 'Is my meeting data secure?', es: '¿Son seguros mis datos de reunión?' },
          a: { pt: 'Absolutamente. Utilizamos criptografia end-to-end (E2E) em todos os dados. Estamos em conformidade com a LGPD e adotamos arquitetura zero-knowledge.', en: 'Absolutely. We use end-to-end encryption (E2E) on all data. We comply with LGPD and adopt a zero-knowledge architecture.', es: 'Absolutamente. Utilizamos cifrado de extremo a extremo (E2E) en todos los datos. Cumplimos con la LGPD y adoptamos una arquitectura zero-knowledge.' },
        },
        {
          q: { pt: 'Onde os dados são armazenados?', en: 'Where is data stored?', es: '¿Dónde se almacenan los datos?' },
          a: { pt: 'Todos os dados são armazenados em servidores no Brasil, em conformidade com a LGPD. Você tem total controle sobre seus dados.', en: 'All data is stored on servers in Brazil, in compliance with LGPD. You have full control over your data and can request deletion at any time.', es: 'Todos los datos se almacenan en servidores en Brasil, en cumplimiento con la LGPD. Tienes control total sobre tus datos.' },
        },
      ],
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <Navbar />
      <div className="scan-lines fixed inset-0 pointer-events-none z-0" />

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
            <span className="text-xs font-mono text-primary tracking-widest uppercase">{t('faq.badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 text-foreground">
            {t('faq.title1')} <span className="matrix-text">{t('faq.title2')}</span>
          </h1>
          <p className="text-lg text-muted-foreground">{t('faq.subtitle')}</p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-3xl space-y-12">
          {faqItems.map((section) => (
              <div key={section.categoryKey}>
                <h2 className="text-lg font-semibold text-primary font-mono mb-4 tracking-wider uppercase">
                  {t(section.categoryKey)}
                </h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {section.items.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`${section.categoryKey}-${i}`}
                      className="border border-primary/20 rounded-xl px-4 bg-card/40 backdrop-blur"
                    >
                      <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline hover:text-primary text-sm sm:text-base py-5">
                        {item.q[language] || item.q.pt}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                        {item.a[language] || item.a.pt}
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
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">{t('faq.stillDoubt')}</h2>
              <p className="text-muted-foreground mb-6">{t('faq.ctaText')}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow">
                  <Link href="/contato">
                    {t('faq.cta.talk')}
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
