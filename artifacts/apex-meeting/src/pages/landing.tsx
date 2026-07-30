import { Link } from 'wouter';
import { MatrixGlobe } from '@/components/meeting/MatrixGlobe';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Zap,
  Globe,
  Terminal,
  Rocket,
  Shield,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Lock,
  Cloud,
} from 'lucide-react';
import { BackToTop } from '@/components/ui/back-to-top';

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// ─── Shared Footer ────────────────────────────────────────────────────────────
export function LandingFooter() {
  return (
    <footer className="bg-background border-t border-primary/20 py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <MatrixGlobe size={32} isProcessing={false} />
              <span className="text-base font-bold matrix-text">APEX CORE</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              IA que executa enquanto você fala. Enterprise AI para C-Suite.
            </p>
          </div>

          {/* Produto */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Produto</h4>
            <ul className="space-y-2">
              <li><button onClick={() => scrollTo('recursos')} className="text-sm text-muted-foreground hover:text-primary transition-colors">Recursos</button></li>
              <li><button onClick={() => scrollTo('planos')} className="text-sm text-muted-foreground hover:text-primary transition-colors">Planos</button></li>
              <li><button onClick={() => scrollTo('como-funciona')} className="text-sm text-muted-foreground hover:text-primary transition-colors">Como Funciona</button></li>
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Preços</Link></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Empresa</h4>
            <ul className="space-y-2">
              <li><Link href="/sobre" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sobre</Link></li>
              <li><Link href="/contato" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contato</Link></li>
              <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-muted-foreground">Termos de Uso</span></li>
              <li><span className="text-sm text-muted-foreground">Privacidade</span></li>
              <li><span className="text-sm text-muted-foreground">LGPD</span></li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Suporte</h4>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">Central de Ajuda</Link></li>
              <li><Link href="/contato" className="text-sm text-muted-foreground hover:text-primary transition-colors">Falar com vendas</Link></li>
              <li><a href="mailto:contato@techsites.ai" className="text-sm text-muted-foreground hover:text-primary transition-colors">contato@techsites.ai</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground font-mono">
            © 2026 APEX CORE MEETING. Powered by TechSites AI.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-primary" /> LGPD</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-primary" /> E2E</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-primary" /> SLA 99.9%</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function Landing() {
  const features = [
    {
      icon: Zap,
      title: 'Execução em Tempo Real',
      description: 'Deploy de sites, configuração de DNS e publicação de documentos enquanto a reunião ainda acontece.',
    },
    {
      icon: Globe,
      title: 'White-Label Total',
      description: 'Renomeie o APEX CORE com a identidade da sua empresa. Sua marca, sua inteligência.',
    },
    {
      icon: Terminal,
      title: 'Terminal ao Vivo',
      description: 'Acompanhe a infraestrutura sendo construída em tempo real com total transparência.',
    },
    {
      icon: Shield,
      title: 'Segurança Enterprise',
      description: 'Criptografia de ponta a ponta, conformidade com LGPD e arquitetura zero-knowledge.',
    },
    {
      icon: Sparkles,
      title: 'Voz + Visão',
      description: 'O APEX CORE lê sua câmera e escuta seus comandos simultaneamente.',
    },
    {
      icon: Rocket,
      title: 'Deploy em < 60s',
      description: 'Da palavra falada à infraestrutura ao vivo em menos de 60 segundos.',
    },
  ];

  const useCases = [
    {
      title: 'Lançamento de Produtos',
      description: 'O executivo diz "construa a landing page" — o APEX CORE publica antes da reunião terminar.',
    },
    {
      title: 'Apresentação para Clientes',
      description: 'Demonstre provas de conceito ao vivo durante a apresentação. Sem delays, sem follow-ups.',
    },
    {
      title: 'Board Sessions',
      description: 'Gere e publique documentos do board, relatórios financeiros e ativos de conformidade sob comando.',
    },
    {
      title: 'Revisões de Engenharia',
      description: 'Configure ambientes de staging, registros DNS e pipelines CI/CD por voz.',
    },
  ];

  const plans = [
    {
      name: 'Starter',
      price: 'R$297',
      period: '/mês',
      highlight: false,
      features: [
        '1 sala de reunião',
        '5 sessões por mês',
        'IA APEX CORE padrão',
        'Suporte por email',
        'Terminal ao vivo',
      ],
      cta: 'Começar agora',
      ctaHref: '/register',
    },
    {
      name: 'Pro',
      price: 'R$697',
      period: '/mês',
      highlight: true,
      badge: 'Mais Popular',
      features: [
        '10 salas de reunião',
        'Sessões ilimitadas',
        'White-label completo',
        'Deploy automático',
        'Terminal ao vivo',
        'Suporte prioritário',
      ],
      cta: 'Começar agora',
      ctaHref: '/register',
    },
    {
      name: 'Enterprise',
      price: 'Sob consulta',
      period: '',
      highlight: false,
      features: [
        'Salas ilimitadas',
        'Subdomínio próprio',
        'SLA 99.9%',
        'Onboarding dedicado',
        'Integrações customizadas',
        'Suporte 24/7',
      ],
      cta: 'Falar com vendas',
      ctaHref: '/contato',
    },
  ];

  const faqItems = [
    {
      q: 'O que é o APEX CORE MEETING?',
      a: 'O APEX CORE MEETING é uma plataforma de inteligência artificial enterprise que executa ações reais durante suas reuniões — deploy de sites, publicação de documentos, configuração de infraestrutura — tudo em tempo real, enquanto você fala.',
    },
    {
      q: 'Preciso instalar alguma coisa?',
      a: 'Não. O APEX CORE MEETING é 100% no navegador. Basta criar sua conta, configurar sua sala e começar a operar. Sem downloads, sem instalações.',
    },
    {
      q: 'Como o APEX CORE executa ações reais?',
      a: 'Via APIs de DNS, hospedagem, documentos e serviços de nuvem. Quando você fala um comando, o APEX CORE interpreta, planeja e executa as ações necessárias usando integrações seguras com provedores de infraestrutura.',
    },
    {
      q: 'Posso renomear a IA com minha marca?',
      a: 'Sim! A partir do plano Pro você tem acesso ao White-Label completo. Renomeie a IA, personalize a interface e apresente como sua própria solução de inteligência artificial.',
    },
    {
      q: 'Meus dados de reunião são seguros?',
      a: 'Absolutamente. Utilizamos criptografia end-to-end (E2E) em todos os dados de reunião. Estamos em conformidade com a LGPD e adotamos arquitetura zero-knowledge — seus dados são seus.',
    },
    {
      q: 'Posso cancelar quando quiser?',
      a: 'Sim, sem fidelidade. Você pode cancelar sua assinatura a qualquer momento sem multas ou custos adicionais. Oferecemos também 7 dias de garantia de satisfação.',
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground relative overflow-hidden">
      <Navbar />
      {/* Scan lines */}
      <div className="scan-lines fixed inset-0 pointer-events-none z-0" />

      {/* ── HERO ── */}
      <section id="inicio" className="relative pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
                <span className="text-xs font-mono text-primary tracking-widest">⚡ ENTERPRISE AI INTELLIGENCE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="text-foreground">IA que </span>
                <span className="matrix-text">executa</span>
                <br />
                <span className="text-foreground">enquanto você fala</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
                APEX CORE não apenas assiste reuniões — ele constrói sites, publica documentos e configura infraestrutura antes da reunião terminar.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 terminal-glow"
                >
                  <Link href="/register" data-testid="link-hero-cta">
                    <Zap className="w-5 h-5 mr-2" />
                    Começar grátis
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF]/10 text-base px-8"
                  onClick={() => scrollTo('como-funciona')}
                >
                  Ver demo →
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-primary" /> Sem fidelidade
                </span>
                <span className="flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-primary" /> 100% em nuvem
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-primary" /> Setup em 3 minutos
                </span>
              </div>
            </div>

            {/* Right — Globe */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                <MatrixGlobe size={480} isProcessing={false} />
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 border border-primary/20 rounded-2xl bg-card/40 backdrop-blur p-6">
            {[
              { value: '3 passos', label: 'de setup' },
              { value: 'IA 24/7', label: 'disponível' },
              { value: '< 60s', label: 'execução' },
              { value: '∞', label: 'possibilidades' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold matrix-text font-mono">{stat.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-primary tracking-widest uppercase bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full">
              COMO FUNCIONA
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-6 mb-4 text-foreground">
              Da reunião ao mundo real em{' '}
              <span className="matrix-text">3 passos</span>
            </h2>
          </div>

          <div className="space-y-12">
            {[
              {
                step: '01',
                title: 'Configure sua sala',
                desc: 'Defina o nome da IA, idioma e recursos disponíveis (voz, câmera, construtor de sites, documentos).',
              },
              {
                step: '02',
                title: 'Inicie a sessão ao vivo',
                desc: 'O APEX CORE ativa. Fale seus comandos — o Matrix Globe pulsa enquanto processa.',
              },
              {
                step: '03',
                title: 'Assista a execução',
                desc: 'O terminal em tempo real mostra a infraestrutura sendo construída. Sites entram no ar. Documentos publicados. DNS configurado.',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-6 sm:gap-10 group">
                <div className="text-5xl sm:text-6xl font-bold font-mono matrix-text opacity-30 group-hover:opacity-100 transition-opacity shrink-0">
                  {item.step}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">{item.title}</h3>
                  <p className="text-base sm:text-lg text-muted-foreground">{item.desc}</p>
                  <div className="w-16 h-1 bg-primary/50 mt-4 group-hover:w-32 transition-all duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECURSOS ── */}
      <section id="recursos" className="py-24 px-4 relative bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-primary tracking-widest uppercase bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full">
              RECURSOS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-6 mb-4 text-foreground">
              Superpoderes para o{' '}
              <span className="matrix-text">C-Suite</span>
            </h2>
            <p className="text-lg text-muted-foreground">Execute na velocidade do pensamento</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={i}
                  className="bg-card/50 backdrop-blur border-primary/20 p-6 hover:border-primary/50 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CASOS DE USO ── */}
      <section id="casos" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Feito para{' '}
              <span className="text-[#00FFFF]">Momentos de Decisão</span>
            </h2>
            <p className="text-lg text-muted-foreground">Onde decisões se transformam em realidade instantaneamente</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc, i) => (
              <div key={i} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Card className="bg-card/80 backdrop-blur border-primary/20 p-8 relative h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0 font-mono font-bold text-black text-sm">
                      {(i + 1).toString().padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-foreground">{uc.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{uc.description}</p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="py-24 px-4 relative bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-primary tracking-widest uppercase bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full">
              PLANOS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-6 mb-4 text-foreground">
              Escolha seu <span className="matrix-text">plano</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan, i) => (
              <div key={i} className="relative flex flex-col">
                {plan.highlight && (
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/60 to-primary/20 pointer-events-none animate-pulse" />
                )}
                <Card
                  className={`relative flex flex-col h-full p-8 ${
                    plan.highlight
                      ? 'bg-card border-primary shadow-lg shadow-primary/20'
                      : 'bg-card/50 border-primary/20'
                  }`}
                >
                  {plan.badge && (
                    <span className="inline-flex self-start mb-4 text-xs font-mono font-bold text-black bg-primary px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold matrix-text font-mono">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-8">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`w-full ${
                      plan.highlight
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow'
                        : 'bg-card border border-primary/30 text-foreground hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    <Link href={plan.ctaHref}>{plan.cta}</Link>
                  </Button>
                </Card>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8 space-x-4">
            <span>✓ 7 dias de garantia</span>
            <span>✓ Cancele quando quiser</span>
            <span>✓ Sem fidelidade</span>
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-primary tracking-widest uppercase bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-6 mb-4 text-foreground">
              Perguntas <span className="matrix-text">frequentes</span>
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
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
      </section>

      {/* ── CONTATO / FINAL CTA ── */}
      <section id="contato" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-4xl">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 blur-[120px] pointer-events-none" />
            <div className="relative bg-gradient-to-br from-primary/10 to-[#00FFFF]/5 border border-primary/40 rounded-2xl p-10 sm:p-16 text-center terminal-glow">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 text-foreground">
                Pronto para{' '}
                <span className="matrix-text">Executar</span>?
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Junte-se aos executivos que operam na velocidade das máquinas. Sua primeira sala de reunião é gratuita.
              </p>
              <Button
                size="lg"
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-12 py-6 h-auto terminal-glow"
              >
                <Link href="/register" data-testid="link-cta-register">
                  Criar conta grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <p className="mt-8 text-sm text-muted-foreground">
                Dúvidas?{' '}
                <a href="mailto:contato@techsites.ai" className="text-primary hover:underline">
                  contato@techsites.ai
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <LandingFooter />

      <BackToTop />
    </div>
  );
}
