import { Link } from 'wouter';
import { MatrixGlobe } from '@/components/meeting/MatrixGlobe';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToTop } from '@/components/ui/back-to-top';
import { Navbar } from '@/components/layout/Navbar';
import { CheckCircle2, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { LandingFooter } from '@/pages/landing';
import { useI18n } from '@/lib/i18n';

export default function Sobre() {
  const { t } = useI18n();

  const values = [
    { icon: Zap,    title: t('sobre.values.v1.title'), description: t('sobre.values.v1.desc') },
    { icon: Shield, title: t('sobre.values.v2.title'), description: t('sobre.values.v2.desc') },
    { icon: Globe,  title: t('sobre.values.v3.title'), description: t('sobre.values.v3.desc') },
  ];

  const missionPills = t('sobre.mission.pills').split(',');

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <Navbar />
      <div className="scan-lines fixed inset-0 pointer-events-none z-0" />

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="flex justify-center mb-8">
            <MatrixGlobe size={120} isProcessing={false} />
          </div>
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
            <span className="text-xs font-mono text-primary tracking-widest uppercase">{t('sobre.badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
            <span className="text-foreground">{t('sobre.title1')}</span>
            <br />
            <span className="matrix-text">{t('sobre.title2')}</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t('sobre.subtitle')}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-foreground">
            {t('sobre.story.title')} <span className="matrix-text">{t('sobre.story.title2')}</span>
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p dangerouslySetInnerHTML={{ __html: t('sobre.story.p1') }} />
            <p>{t('sobre.story.p2')}</p>
            <p dangerouslySetInnerHTML={{ __html: t('sobre.story.p3') }} />
            <p>{t('sobre.story.p4')}</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t('sobre.values.title')} <span className="matrix-text">{t('sobre.values.title2')}</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <Card key={i} className="bg-card/50 border-primary/20 p-6 hover:border-primary/50 transition-all">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto max-w-4xl">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 blur-[100px] pointer-events-none" />
            <div className="relative bg-card/60 border border-primary/30 rounded-2xl p-10 sm:p-16 text-center terminal-glow">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
                {t('sobre.mission.title')} <span className="matrix-text">{t('sobre.mission.title2')}</span>
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                {t('sobre.mission.text')}
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-8">
                {missionPills.map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {item}
                  </span>
                ))}
              </div>
              <Button
                size="lg"
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow"
              >
                <Link href="/register">
                  {t('sobre.mission.cta')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
      <BackToTop />
    </div>
  );
}
