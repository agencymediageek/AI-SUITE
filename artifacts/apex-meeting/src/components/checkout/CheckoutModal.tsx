import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Loader2, X, ShieldCheck, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';

interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  interval: string;
  features: string[];
  isPopular?: boolean;
}

interface CheckoutModalProps {
  plan: Plan | null;
  open: boolean;
  onClose: () => void;
}

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') + '/api';

async function createStripeSession(planId: string): Promise<string> {
  const token = localStorage.getItem('apex_meeting_token');
  const res = await fetch(`${API_BASE}/payments/stripe/create-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao criar sessão Stripe');
  }
  const data = await res.json();
  return data.sessionUrl;
}

async function createMpPreference(planId: string): Promise<string> {
  const token = localStorage.getItem('apex_meeting_token');
  const res = await fetch(`${API_BASE}/payments/mp/create-preference`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao criar preferência MP');
  }
  const data = await res.json();
  return data.checkoutUrl;
}

export function CheckoutModal({ plan, open, onClose }: CheckoutModalProps) {
  const [loading, setLoading] = useState<'stripe' | 'mp' | null>(null);
  const { toast } = useToast();
  const { t, language } = useI18n();

  if (!plan) return null;

  const isEnterprise = plan.price === 0;
  const isOneTime = plan.interval === 'one-time';

  const priceLabel = isEnterprise
    ? (language === 'pt' ? 'Sob consulta' : language === 'es' ? 'Precio a consultar' : 'Custom pricing')
    : `$${plan.price}`;

  const intervalLabel = isEnterprise
    ? ''
    : isOneTime
    ? (language === 'pt' ? ' por sessão' : language === 'es' ? ' por sesión' : ' per session')
    : (language === 'pt' ? '/mês' : language === 'es' ? '/mes' : '/mo');

  async function handleStripe() {
    if (!plan) return;
    setLoading('stripe');
    try {
      const url = await createStripeSession(plan.id);
      window.location.href = url;
    } catch (err: any) {
      toast({
        title: t('checkout.error'),
        description: err.message,
        variant: 'destructive',
      });
      setLoading(null);
    }
  }

  async function handleMp() {
    if (!plan) return;
    setLoading('mp');
    try {
      const url = await createMpPreference(plan.id);
      window.location.href = url;
    } catch (err: any) {
      toast({
        title: t('checkout.error'),
        description: err.message,
        variant: 'destructive',
      });
      setLoading(null);
    }
  }

  function handleEnterprise() {
    window.location.href = '/contato';
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-black border border-primary/30 text-foreground max-w-md terminal-glow">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold matrix-text flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              {t('checkout.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            {t('checkout.subtitle')}
          </DialogDescription>
        </DialogHeader>

        {/* Plan Summary */}
        <div className="bg-card/40 border border-primary/20 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base">{plan.name}</span>
              {plan.isPopular && (
                <Badge className="bg-primary text-primary-foreground text-xs">
                  {t('pricing.popular')}
                </Badge>
              )}
              {isOneTime && (
                <Badge variant="outline" className="border-primary/40 text-primary text-xs">
                  {t('checkout.oneTime')}
                </Badge>
              )}
            </div>
            <span className="font-bold text-xl matrix-text">
              {priceLabel}
              <span className="text-sm font-normal text-muted-foreground">{intervalLabel}</span>
            </span>
          </div>
          {plan.description && (
            <p className="text-xs text-muted-foreground">{plan.description}</p>
          )}
        </div>

        <Separator className="border-primary/10" />

        {isEnterprise ? (
          <div className="space-y-3">
            <p className="text-sm text-center text-muted-foreground">
              {t('checkout.enterprise.desc')}
            </p>
            <Button
              onClick={handleEnterprise}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow"
            >
              {t('checkout.enterprise.cta')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-center text-muted-foreground font-mono">
              {t('checkout.choose.gateway')}
            </p>

            {/* Stripe */}
            <Button
              onClick={handleStripe}
              disabled={!!loading}
              className="w-full h-14 bg-card/60 border border-primary/30 hover:border-primary/60 hover:bg-card/80 text-foreground flex items-center gap-3 transition-all"
              variant="outline"
            >
              {loading === 'stripe' ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <CreditCard className="w-5 h-5 text-primary" />
              )}
              <div className="text-left">
                <div className="font-semibold text-sm">{t('checkout.stripe.title')}</div>
                <div className="text-xs text-muted-foreground">{t('checkout.stripe.desc')}</div>
              </div>
            </Button>

            {/* Mercado Pago */}
            <Button
              onClick={handleMp}
              disabled={!!loading}
              className="w-full h-14 bg-card/60 border border-[#009EE3]/30 hover:border-[#009EE3]/60 hover:bg-card/80 text-foreground flex items-center gap-3 transition-all"
              variant="outline"
            >
              {loading === 'mp' ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#009EE3]" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="16" fill="#009EE3" />
                  <path d="M8 17.5c0-3.6 4.2-7.5 8-7.5s8 3.9 8 7.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="16" cy="20" r="2.5" fill="white" />
                </svg>
              )}
              <div className="text-left">
                <div className="font-semibold text-sm">{t('checkout.mp.title')}</div>
                <div className="text-xs text-muted-foreground">{t('checkout.mp.desc')}</div>
              </div>
            </Button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary/60" />
              <span>{t('checkout.secure')}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
