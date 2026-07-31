import { useState } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useListPlans } from '@workspace/api-client-react';
import { useI18n } from '@/lib/i18n';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { Check, Zap, MessageSquare, Sparkles } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  interval: string;
  tokenAllowance: number;
  features: string[];
  isPopular?: boolean;
}

function PricingContent() {
  const { data: plans, isLoading } = useListPlans();
  const { t, language } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function handleChoose(plan: Plan) {
    if (plan.id === 'enterprise') {
      window.location.href = '/contato';
      return;
    }
    setSelectedPlan(plan);
    setModalOpen(true);
  }

  function getPriceLabel(plan: Plan) {
    if (plan.price === 0) {
      return language === 'pt' ? 'Sob consulta' : language === 'es' ? 'Precio a consultar' : 'Custom pricing';
    }
    return `$${plan.price}`;
  }

  function getIntervalLabel(interval: string, price: number) {
    if (price === 0) return '';
    if (interval === 'one-time') {
      return language === 'pt' ? ' /sessão' : language === 'es' ? ' /sesión' : ' /session';
    }
    if (interval === 'monthly') return `/${t('pricing.mo')}`;
    if (interval === 'yearly') return `/${t('pricing.yr')}`;
    return `/${t('pricing.lifetime')}`;
  }

  // Sort: starter, pro, single-meeting, enterprise
  const ORDER = ['starter', 'pro', 'single-meeting', 'enterprise'];
  const sortedPlans = plans
    ? [...plans].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id))
    : [];

  const skeletons = (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="bg-card/50 border-primary/20 p-8 animate-pulse">
          <div className="h-6 bg-primary/20 rounded w-1/2 mb-4" />
          <div className="h-10 bg-primary/20 rounded w-2/3 mb-6" />
          <div className="space-y-3">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-4 bg-primary/20 rounded" />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-black text-foreground">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-primary text-sm font-mono uppercase tracking-widest">
                {t('pricing.badge')}
              </span>
            </div>
            <h1 className="text-5xl font-bold matrix-text mb-4">{t('pricing.title')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </div>

          {isLoading ? skeletons : sortedPlans.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedPlans.map((plan) => {
                const isEnterprise = plan.price === 0;
                const isOneTime = plan.interval === 'one-time';

                return (
                  <Card
                    key={plan.id}
                    className={`bg-card/50 border-primary/20 p-7 terminal-glow hover:border-primary/40 transition-all relative flex flex-col ${
                      plan.isPopular ? 'border-primary/60 scale-[1.02] shadow-lg shadow-primary/10' : ''
                    } ${isOneTime ? 'border-dashed' : ''}`}
                    data-testid={`card-plan-${plan.id}`}
                  >
                    {plan.isPopular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground whitespace-nowrap">
                        {t('pricing.popular')}
                      </Badge>
                    )}
                    {isOneTime && (
                      <Badge
                        variant="outline"
                        className="absolute -top-3 left-1/2 -translate-x-1/2 border-primary/40 text-primary whitespace-nowrap bg-black"
                      >
                        {t('pricing.oneTime')}
                      </Badge>
                    )}

                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
                      {plan.description && (
                        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                          {plan.description}
                        </p>
                      )}
                      <div className="mb-1">
                        <span className="text-3xl font-bold matrix-text">
                          {getPriceLabel(plan)}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {getIntervalLabel(plan.interval, plan.price)}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2.5 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleChoose(plan as Plan)}
                      className={`w-full mt-auto ${
                        plan.isPopular
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow'
                          : isEnterprise
                          ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:border-primary/40'
                      }`}
                      data-testid={`button-subscribe-${plan.id}`}
                    >
                      {isEnterprise ? (
                        <>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {t('pricing.contact')}
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          {t('pricing.choose')} {plan.name}
                        </>
                      )}
                    </Button>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-card/50 border-primary/20 p-12 text-center">
              <p className="text-muted-foreground">{t('pricing.noPlans')}</p>
            </Card>
          )}

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              {t('pricing.note')}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2 font-mono">
              {t('pricing.guarantee')}
            </p>
          </div>
        </div>
      </div>

      <CheckoutModal
        plan={selectedPlan}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPlan(null);
        }}
      />
    </div>
  );
}

export default function Pricing() {
  return (
    <ProtectedRoute>
      <PricingContent />
    </ProtectedRoute>
  );
}
