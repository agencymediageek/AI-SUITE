import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useListPlans } from '@workspace/api-client-react';
import { useI18n } from '@/lib/i18n';
import { Check, Zap } from 'lucide-react';

function PricingContent() {
  const { data: plans, isLoading } = useListPlans();
  const { t } = useI18n();

  const intervalLabel = (interval: string) => {
    if (interval === 'monthly') return t('pricing.mo');
    if (interval === 'yearly') return t('pricing.yr');
    return t('pricing.lifetime');
  };

  return (
    <div className="min-h-[100dvh] bg-black text-foreground">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold matrix-text mb-4">{t('pricing.title')}</h1>
            <p className="text-xl text-muted-foreground">
              {t('pricing.subtitle')}
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
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
          ) : plans && plans.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`bg-card/50 border-primary/20 p-8 terminal-glow hover:border-primary/40 transition-all relative ${
                    plan.isPopular ? 'border-primary/60 scale-105' : ''
                  }`}
                  data-testid={`card-plan-${plan.id}`}
                >
                  {plan.isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      {t('pricing.popular')}
                    </Badge>
                  )}

                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    )}
                    <div className="mb-2">
                      <span className="text-4xl font-bold matrix-text">
                        ${plan.price}
                      </span>
                      <span className="text-muted-foreground">
                        /{intervalLabel(plan.interval)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {plan.tokenAllowance.toLocaleString()} {t('pricing.tokens')}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.isPopular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                    }`}
                    data-testid={`button-subscribe-${plan.id}`}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {t('pricing.choose')} {plan.name}
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card/50 border-primary/20 p-12 text-center">
              <p className="text-muted-foreground">{t('pricing.noPlans')}</p>
            </Card>
          )}

          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">
              {t('pricing.note')}
            </p>
          </div>
        </div>
      </div>
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
