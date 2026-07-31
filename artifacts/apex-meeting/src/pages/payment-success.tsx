import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { CheckCircle, Zap, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { useI18n } from '@/lib/i18n';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { t, language } = useI18n();
  const [countdown, setCountdown] = useState(8);

  // Parse URL params
  const params = new URLSearchParams(window.location.search);
  const gateway = params.get('gateway') || 'stripe';
  const planId = params.get('plan') || '';
  const status = params.get('status') || 'approved';

  const isPending = status === 'pending';

  useEffect(() => {
    if (isPending) return; // Don't auto-redirect for pending
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          setLocation('/dashboard');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPending, setLocation]);

  const planLabel: Record<string, Record<string, string>> = {
    starter: { pt: 'Starter', en: 'Starter', es: 'Starter' },
    pro: { pt: 'Pro', en: 'Pro', es: 'Pro' },
    'single-meeting': { pt: 'Sessão Única', en: 'Single Session', es: 'Sesión Única' },
    enterprise: { pt: 'Enterprise', en: 'Enterprise', es: 'Enterprise' },
  };
  const planName = planLabel[planId]?.[language] || planId;

  return (
    <div className="min-h-[100dvh] bg-black text-foreground">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100dvh-80px)] px-4">
        <Card className="bg-card/50 border-primary/20 p-10 max-w-md w-full text-center space-y-6 terminal-glow">
          {isPending ? (
            <>
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                  <Clock className="w-10 h-10 text-yellow-500" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2 text-yellow-400">
                  {t('payment.pending.title')}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {t('payment.pending.desc')}
                </p>
              </div>
              <Button asChild className="w-full bg-primary text-primary-foreground terminal-glow">
                <Link href="/dashboard">
                  {t('payment.success.cta')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <h1 className="text-2xl font-bold matrix-text">
                    {t('payment.success.title')}
                  </h1>
                </div>
                {planName && (
                  <p className="text-primary font-semibold text-lg mb-2">
                    {language === 'pt' ? `Plano ${planName} ativado!`
                      : language === 'es' ? `¡Plan ${planName} activado!`
                      : `${planName} Plan activated!`}
                  </p>
                )}
                <p className="text-muted-foreground text-sm">
                  {t('payment.success.desc')}
                </p>
              </div>

              <div className="bg-card/40 border border-primary/10 rounded-lg p-3 text-xs text-muted-foreground font-mono">
                {language === 'pt'
                  ? `Redirecionando para o dashboard em ${countdown}s...`
                  : language === 'es'
                  ? `Redirigiendo al dashboard en ${countdown}s...`
                  : `Redirecting to dashboard in ${countdown}s...`}
              </div>

              <div className="flex gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 border-primary/30 hover:border-primary/60"
                >
                  <Link href="/pricing">
                    {t('payment.success.plans')}
                  </Link>
                </Button>
                <Button
                  asChild
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow"
                >
                  <Link href="/dashboard">
                    {t('payment.success.cta')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
