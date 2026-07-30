import { Link } from 'wouter';
import { MatrixGlobe } from '@/components/meeting/MatrixGlobe';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Zap, 
  Globe, 
  Terminal, 
  Rocket, 
  Shield, 
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Play
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { BackToTop } from '@/components/ui/back-to-top';

export default function Landing() {
  const { t } = useI18n();

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Execution',
      description: 'Deploy websites, configure DNS, and publish documents while the meeting is still happening.',
    },
    {
      icon: Globe,
      title: 'White-Label Ready',
      description: 'Rename APEX CORE to your own AI identity. Your brand, your intelligence.',
    },
    {
      icon: Terminal,
      title: 'Live Terminal Output',
      description: 'Watch infrastructure being built in real-time with full transparency.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Military-grade encryption and compliance with SOC 2 Type II standards.',
    },
    {
      icon: Sparkles,
      title: 'Voice + Vision',
      description: 'APEX CORE sees your camera feed and listens to your commands simultaneously.',
    },
    {
      icon: Rocket,
      title: 'Instant Deploy',
      description: 'From spoken word to live infrastructure in under 60 seconds.',
    },
  ];

  const useCases = [
    {
      title: 'Product Launch Meetings',
      description: 'Executive says "build the landing page" — APEX CORE deploys it before the meeting ends.',
    },
    {
      title: 'Client Presentations',
      description: 'Demo a proof-of-concept live while presenting. No delays, no follow-ups.',
    },
    {
      title: 'Board Sessions',
      description: 'Generate and publish board documents, financial reports, and compliance assets on command.',
    },
    {
      title: 'Engineering Reviews',
      description: 'Configure staging environments, DNS records, and CI/CD pipelines via voice.',
    },
  ];

  const stats = [
    { value: '< 60s', label: 'Deploy Time' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Available' },
    { value: '∞', label: 'Possibilities' },
  ];

  return (
    <div className="min-h-[100dvh] bg-black text-foreground relative overflow-hidden">
      {/* Scan lines effect */}
      <div className="scan-lines fixed inset-0 pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-[text-reveal_0.8s_ease-out]">
              <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
                <span className="text-sm font-mono text-primary">ENTERPRISE AI INTELLIGENCE</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                <span className="matrix-text">IA que executa</span>
                <br />
                <span className="text-foreground">enquanto você fala</span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                APEX CORE não apenas assiste reuniões — ele constrói sites, publica documentos e configura infraestrutura antes da reunião terminar.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 terminal-glow">
                  <Link href="/register" data-testid="link-hero-cta">
                    <Zap className="w-5 h-5 mr-2" />
                    {t('hero.cta')}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary/10 text-lg px-8">
                  <Play className="w-5 h-5 mr-2" />
                  {t('hero.demo')}
                </Button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 pt-8">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-bold matrix-text font-mono">{stat.value}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
                <MatrixGlobe size={500} isProcessing={false} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="matrix-text">Superpowers</span> for C-Suite
            </h2>
            <p className="text-xl text-muted-foreground">Execute at the speed of thought</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={i} 
                  className="bg-card/50 backdrop-blur border-primary/20 p-6 hover:border-primary/40 transition-all terminal-glow hover:scale-105"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 relative bg-gradient-to-b from-black via-primary/5 to-black">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for <span className="cyan-text">Mission-Critical</span> Moments
            </h2>
            <p className="text-xl text-muted-foreground">Where decisions turn into reality instantly</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, i) => (
              <div key={i} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Card className="bg-card/80 backdrop-blur border-primary/20 p-8 relative">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 font-mono font-bold text-black">
                      {(i + 1).toString().padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3 text-foreground">{useCase.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="matrix-text">How It Works</span>
            </h2>
            <p className="text-xl text-muted-foreground">Three steps to operational intelligence</p>
          </div>

          <div className="space-y-12">
            {[
              { step: '01', title: 'Configure Your Meeting', desc: 'Set up the AI name, language, and available resources (voice, camera, site builder, documents).' },
              { step: '02', title: 'Start Live Session', desc: 'APEX CORE activates. Speak your commands — the Matrix Globe pulses as it processes.' },
              { step: '03', title: 'Watch It Execute', desc: 'Real-time terminal output shows infrastructure being built. Sites go live. Documents publish. DNS configures.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-8 group">
                <div className="text-6xl font-bold font-mono matrix-text opacity-30 group-hover:opacity-100 transition-opacity">
                  {item.step}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold mb-2 text-foreground">{item.title}</h3>
                  <p className="text-lg text-muted-foreground">{item.desc}</p>
                  <div className="w-16 h-1 bg-primary/50 mt-4 group-hover:w-32 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-20 px-4 relative bg-gradient-to-b from-black via-secondary/5 to-black">
        <div className="container mx-auto max-w-5xl text-center">
          <Shield className="w-16 h-16 text-secondary mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Enterprise-Grade <span className="cyan-text">Security</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            APEX CORE meets the highest security standards. SOC 2 Type II compliant. End-to-end encryption. Zero-knowledge architecture. Your commands, your data, your control.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground font-mono">
            {['SOC 2 Type II', 'ISO 27001', 'GDPR Compliant', 'Zero Trust', 'E2E Encryption'].map((cert) => (
              <div key={cert} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {cert}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 blur-[120px]" />
            <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 rounded-2xl p-12 terminal-glow">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Ready to <span className="matrix-text">Execute</span>?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join the executives who operate at machine speed. Your first meeting room is free.
              </p>
              <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-12 py-6 h-auto">
                <Link href="/register" data-testid="link-cta-register">
                  Start Your First Session
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/20 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded flex items-center justify-center font-mono font-bold text-black text-sm">
                A
              </div>
              <span className="text-lg font-bold matrix-text">APEX CORE MEETING</span>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              © 2024 APEX CORE. Enterprise AI Intelligence.
            </p>
          </div>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}
