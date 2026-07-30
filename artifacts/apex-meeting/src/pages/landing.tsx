import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { MatrixGlobe } from '@/components/meeting/MatrixGlobe';
import step1Img from '@/assets/step1-configure.jpg';
import step2Img from '@/assets/step2-live-session.jpg';
import step3Img from '@/assets/step3-execution.jpg';
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
  Smartphone,
  Play,
} from 'lucide-react';
import { BackToTop } from '@/components/ui/back-to-top';
import { useI18n } from '@/lib/i18n';
import { useBRLRate } from '@/hooks/useBRLRate';

function useGlobeSize() {
  const [size, setSize] = useState(() =>
    typeof window !== 'undefined'
      ? window.innerWidth < 640 ? 260 : window.innerWidth < 1024 ? 360 : 480
      : 480
  );
  useEffect(() => {
    const update = () =>
      setSize(window.innerWidth < 640 ? 260 : window.innerWidth < 1024 ? 360 : 480);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// ─── Shared Footer ────────────────────────────────────────────────────────────
export function LandingFooter() {
  const { t } = useI18n();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

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
              {t('landing.footer.brand')}
            </p>
          </div>

          {/* Produto */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">{t('footer.product')}</h4>
            <ul className="space-y-2">
              <li><button onClick={() => scrollTo('recursos')} className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.resources')}</button></li>
              <li><button onClick={() => scrollTo('planos')} className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.pricing')}</button></li>
              <li><button onClick={() => scrollTo('como-funciona')} className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.howWorks')}</button></li>
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.pricing')}</Link></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">{t('footer.company')}</h4>
            <ul className="space-y-2">
              <li><Link href="/sobre" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.about')}</Link></li>
              <li><Link href="/contato" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('nav.contato')}</Link></li>
              <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">{t('footer.legal')}</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-muted-foreground">{t('footer.terms')}</span></li>
              <li><span className="text-sm text-muted-foreground">{t('footer.privacy')}</span></li>
              <li><span className="text-sm text-muted-foreground">{t('footer.lgpd')}</span></li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">{t('footer.support')}</h4>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.help')}</Link></li>
              <li><Link href="/contato" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.sales')}</Link></li>
              <li><a href="mailto:contato@techsites.ai" className="text-sm text-muted-foreground hover:text-primary transition-colors">contato@techsites.ai</a></li>
            </ul>
          </div>
        </div>

        {/* App install + video row */}
        <div className="border-t border-primary/10 pt-8 mb-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Install button — always visible */}
          <Button
            variant="outline"
            size="sm"
            className="border-primary/40 text-primary hover:bg-primary/10 gap-2 font-mono text-sm"
            onClick={() => {
              if (installPrompt) {
                installPrompt.prompt();
                installPrompt.userChoice.then(() => setInstallPrompt(null));
              } else {
                const msg = t('nav.installAppHint');
                alert(msg);
              }
            }}
          >
            <Smartphone className="w-4 h-4" />
            {t('nav.installApp')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#00FFFF]/40 text-[#00FFFF] hover:bg-[#00FFFF]/10 gap-2 font-mono text-sm"
            onClick={() => window.open('https://demo.techsites.ai', '_blank')}
          >
            <Play className="w-4 h-4 fill-current" />
            {t('hero.demo')}
          </Button>
        </div>

        {/* Bottom row */}
        <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground font-mono">
            {t('footer.copyright')}
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
  const { t, language } = useI18n();

  // ── Conversão de preços (câmbio ao vivo, atualizado a cada 1h) ───────────
  const brlRate = useBRLRate(5.20);
  const formatPrice = (usd: number) =>
    language === 'pt'
      ? `R$${Math.ceil(usd * brlRate).toLocaleString('pt-BR')}`
      : `$${usd}`;

  const features = [
    { icon: Zap,      title: t('landing.f1.title'), description: t('landing.f1.desc') },
    { icon: Globe,    title: t('landing.f2.title'), description: t('landing.f2.desc') },
    { icon: Terminal, title: t('landing.f3.title'), description: t('landing.f3.desc') },
    { icon: Shield,   title: t('landing.f4.title'), description: t('landing.f4.desc') },
    { icon: Sparkles, title: t('landing.f5.title'), description: t('landing.f5.desc') },
    { icon: Rocket,   title: t('landing.f6.title'), description: t('landing.f6.desc') },
  ];

  const useCases = [
    { title: t('landing.uc1.title'), description: t('landing.uc1.desc') },
    { title: t('landing.uc2.title'), description: t('landing.uc2.desc') },
    { title: t('landing.uc3.title'), description: t('landing.uc3.desc') },
    { title: t('landing.uc4.title'), description: t('landing.uc4.desc') },
  ];

  const plans = [
    {
      name: 'Starter',
      price: formatPrice(57),
      period: t('landing.p1.period'),
      highlight: false,
      features: [t('landing.p1.f1'), t('landing.p1.f2'), t('landing.p1.f3'), t('landing.p1.f4'), t('landing.p1.f5')],
      cta: t('landing.p1.cta'),
      ctaHref: '/register',
    },
    {
      name: 'Pro',
      price: formatPrice(134),
      period: t('landing.p2.period'),
      highlight: true,
      badge: t('landing.plans.popular'),
      features: [t('landing.p2.f1'), t('landing.p2.f2'), t('landing.p2.f3'), t('landing.p2.f4'), t('landing.p2.f5'), t('landing.p2.f6')],
      cta: t('landing.p2.cta'),
      ctaHref: '/register',
    },
    {
      name: 'Enterprise',
      price: t('landing.p3.price'),
      period: '',
      highlight: false,
      features: [t('landing.p3.f1'), t('landing.p3.f2'), t('landing.p3.f3'), t('landing.p3.f4'), t('landing.p3.f5'), t('landing.p3.f6')],
      cta: t('landing.p3.cta'),
      ctaHref: '/contato',
    },
  ];

  const faqItems = [
    { q: t('landing.faq.q1'), a: t('landing.faq.a1') },
    { q: t('landing.faq.q2'), a: t('landing.faq.a2') },
    { q: t('landing.faq.q3'), a: t('landing.faq.a3') },
    { q: t('landing.faq.q4'), a: t('landing.faq.a4') },
    { q: t('landing.faq.q5'), a: t('landing.faq.a5') },
    { q: t('landing.faq.q6'), a: t('landing.faq.a6') },
  ];

  const steps = [
    { step: '01', title: t('landing.step1.title'), desc: t('landing.step1.desc'), img: step1Img },
    { step: '02', title: t('landing.step2.title'), desc: t('landing.step2.desc'), img: step2Img },
    { step: '03', title: t('landing.step3.title'), desc: t('landing.step3.desc'), img: step3Img },
  ];

  const stats = [
    { value: '3', label: t('stats.setup') },
    { value: 'AI 24/7', label: t('stats.available') },
    { value: '< 60s', label: t('stats.execution') },
    { value: '∞', label: t('stats.possibilities') },
  ];

  const globeSize = useGlobeSize();

  // Click-to-play: iframe only loads when user clicks → no performance penalty on page load

  return (
    <div className="min-h-[100dvh] bg-background text-foreground relative overflow-x-hidden">
      <Navbar />
      {/* Scan lines */}
      <div className="scan-lines fixed inset-0 pointer-events-none z-0" />

      {/* ── HERO ── */}
      <section id="inicio" className="relative pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-7xl w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left */}
            <div className="space-y-6 sm:space-y-8 min-w-0">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 border border-primary/30 rounded-full">
                <span className="text-xs font-mono text-primary tracking-widest">{t('landing.badge')}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="text-foreground">{t('landing.hero.p1')}</span>
                <span className="matrix-text">{t('landing.hero.hl')}</span>
                <br />
                <span className="text-foreground">{t('landing.hero.p2')}</span>
              </h1>

              <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-6 sm:px-8 terminal-glow"
                >
                  <Link href="/register" data-testid="link-hero-cta">
                    <Zap className="w-5 h-5 mr-2" />
                    {t('landing.hero.ctaFree')}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF]/10 text-base px-6 sm:px-8"
                  asChild
                >
                  <a href="https://demo.techsites.ai" target="_blank" rel="noopener noreferrer">
                    {t('hero.demo')}
                  </a>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-primary" /> {t('landing.trust.noContract')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-primary" /> {t('landing.trust.cloud')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-primary" /> {t('landing.trust.setup')}
                </span>
              </div>
            </div>

            {/* Right — Globe (responsive size via hook) */}
            <div className="relative flex justify-center lg:justify-end mt-4 lg:mt-0">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
                <MatrixGlobe size={globeSize} isProcessing={false} />
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 border border-primary/20 rounded-2xl bg-card/40 backdrop-blur p-6">
            {stats.map((stat, i) => (
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
              {t('landing.how.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-6 mb-4 text-foreground">
              {t('landing.how.title')}{' '}
              <span className="matrix-text">{t('landing.how.title2')}</span>
            </h2>
          </div>

          <div className="space-y-10">
            {steps.map((item, i) => (
              <div key={i} className={`flex flex-col lg:flex-row items-stretch gap-8 group ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                {/* Text side */}
                <div className="flex items-start gap-6 flex-1 min-w-0">
                  <div className="text-5xl sm:text-6xl font-bold font-mono matrix-text opacity-30 group-hover:opacity-100 transition-opacity shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">{item.title}</h3>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{item.desc}</p>
                    <div className="w-16 h-1 bg-primary/50 mt-5 group-hover:w-32 transition-all duration-300" />
                  </div>
                </div>
                {/* Image side */}
                <div className="lg:w-[420px] shrink-0">
                  <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/10 group-hover:border-primary/40 transition-all">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-52 lg:h-56 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur border border-primary/30 text-primary text-xs font-mono px-2 py-1 rounded-full">
                      {item.step}
                    </div>
                  </div>
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
              {t('landing.features.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-6 mb-4 text-foreground">
              {t('landing.features.title')}{' '}
              <span className="matrix-text">{t('landing.features.title2')}</span>
            </h2>
            <p className="text-lg text-muted-foreground">{t('landing.features.subtitle')}</p>
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
              {t('landing.cases.title')}{' '}
              <span className="text-[#00FFFF]">{t('landing.cases.title2')}</span>
            </h2>
            <p className="text-lg text-muted-foreground">{t('landing.cases.subtitle')}</p>
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
              {t('landing.plans.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-6 mb-4 text-foreground">
              {t('landing.plans.title')} <span className="matrix-text">{t('landing.plans.title2')}</span>
            </h2>
          </div>

          {/* Reunião Avulsa — one-time card */}
          <div className="mb-8">
            <div className="relative rounded-2xl border border-[#00FFFF]/40 bg-gradient-to-r from-[#00FFFF]/5 via-card/60 to-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-[#00FFFF]/20 to-primary/10 pointer-events-none opacity-0 hover:opacity-100 transition-opacity" />
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono font-bold text-[#00FFFF] bg-[#00FFFF]/10 border border-[#00FFFF]/30 px-3 py-1 rounded-full">
                    {t('landing.avulsa.badge')}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t('landing.avulsa.title')}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">{t('landing.avulsa.desc')}</p>
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                  {[t('landing.avulsa.f1'), t('landing.avulsa.f2'), t('landing.avulsa.f3'), t('landing.avulsa.f4')].map((f, fi) => (
                    <li key={fi} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00FFFF] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-4 shrink-0">
                <div>
                  <span className="text-4xl font-bold font-mono text-[#00FFFF]">{formatPrice(27)}</span>
                  <span className="text-muted-foreground text-sm ml-1">{t('landing.avulsa.period')}</span>
                </div>
                <Button
                  asChild
                  className="border border-[#00FFFF]/60 bg-[#00FFFF]/10 text-[#00FFFF] hover:bg-[#00FFFF]/20 font-semibold px-8"
                >
                  <Link href="/register">{t('landing.avulsa.cta')}</Link>
                </Button>
              </div>
            </div>
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
            <span>{t('landing.guarantee.days')}</span>
            <span>{t('landing.guarantee.cancel')}</span>
            <span>{t('landing.guarantee.noLock')}</span>
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-primary tracking-widest uppercase bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full">
              {t('faq.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-6 mb-4 text-foreground">
              {t('landing.faq.title')} <span className="matrix-text">{t('landing.faq.title2')}</span>
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
                {t('landing.hero.readyTitle')}{' '}
                <span className="matrix-text">{t('landing.hero.readyHl')}</span>?
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                {t('landing.hero.readySub')}
              </p>
              <Button
                size="lg"
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-12 py-6 h-auto terminal-glow"
              >
                <Link href="/register" data-testid="link-cta-register">
                  {t('landing.hero.ctaFinal')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <p className="mt-8 text-sm text-muted-foreground">
                {t('landing.hero.doubt')}{' '}
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
