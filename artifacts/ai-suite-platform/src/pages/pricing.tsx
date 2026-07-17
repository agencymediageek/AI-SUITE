import { Link } from "wouter";
import { useListPlans, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Loader2, Globe, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/public-layout";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Gateway = "mp" | "stripe";

function gatewayLabel(gateway: Gateway, locale: string) {
  if (gateway === "mp") return locale === "pt" ? "Mercado Pago" : "Mercado Pago (Brazil)";
  return "Stripe";
}

function gatewayFlag(gateway: Gateway) {
  return gateway === "mp" ? "🇧🇷" : "💳";
}

export default function Pricing() {
  const { data: plans, isLoading } = useListPlans();
  const { data: user } = useGetMe({ query: { retry: false } });
  const { t, locale, setLocale, formatPrice } = useI18n();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  // Default gateway based on locale: PT (Brazil) → MP, EN → Stripe
  const defaultGateway: Gateway = locale === "pt" ? "mp" : "stripe";
  const [gateway, setGateway] = useState<Gateway>(defaultGateway);

  // Keep gateway in sync when locale auto-detects
  const effectiveGateway: Gateway = gateway;

  // Only planId is sent to the server — price and plan name are resolved server-side from the DB
  const handleSubscribe = async (planId: string) => {
    if (!user) {
      window.location.href = `${BASE}/register`;
      return;
    }

    setLoadingPlanId(planId);
    try {
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      if (effectiveGateway === "mp") {
        const res = await fetch(`${BASE}/api/payments/mp/create-preference`, {
          method: "POST",
          headers,
          body: JSON.stringify({ planId }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as any).error || res.statusText);
        }
        const data = await res.json() as any;
        const checkoutUrl = data.initPoint || data.sandboxInitPoint;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          toast.error(locale === "pt" ? "Não foi possível iniciar o pagamento." : "Could not start payment.");
        }
      } else {
        const res = await fetch(`${BASE}/api/payments/stripe/create-session`, {
          method: "POST",
          headers,
          body: JSON.stringify({ planId }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as any).error || res.statusText);
        }
        const data = await res.json() as any;
        if (data.sessionUrl) {
          window.location.href = data.sessionUrl;
        } else {
          toast.error(locale === "pt" ? "Não foi possível iniciar o pagamento." : "Could not start payment.");
        }
      }
    } catch (error: any) {
      toast.error(error?.message || (locale === "pt" ? "Erro ao processar pagamento" : "Payment error"));
    } finally {
      setLoadingPlanId(null);
    }
  };

  const pt = locale === "pt";

  return (
    <PublicLayout>
      <div className="space-y-16 py-12 px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 px-4 py-1 text-xs uppercase tracking-widest">
            {pt ? "Planos" : "Plans"}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{t("pricing.title")}</h1>
          <p className="text-xl text-muted-foreground">{t("pricing.subtitle")}</p>

          {/* Currency + Gateway row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* Currency toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-full">
                  <Globe className="w-3.5 h-3.5" />
                  {pt ? "🇧🇷 Real (R$)" : "🇺🇸 Dollar (USD)"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => { setLocale("pt"); setGateway("mp"); }} className={pt ? "text-primary font-semibold" : ""}>
                  🇧🇷 Português — Real (R$)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setLocale("en"); setGateway("stripe"); }} className={!pt ? "text-primary font-semibold" : ""}>
                  🇺🇸 English — Dollar (USD)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Gateway toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-full">
                  <CreditCard className="w-3.5 h-3.5" />
                  {gatewayFlag(effectiveGateway)} {gatewayLabel(effectiveGateway, locale)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setGateway("mp")} className={effectiveGateway === "mp" ? "text-primary font-semibold" : ""}>
                  🇧🇷 Mercado Pago — Real (R$)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGateway("stripe")} className={effectiveGateway === "stripe" ? "text-primary font-semibold" : ""}>
                  💳 Stripe — USD (International)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Gateway info */}
          <p className="text-xs text-muted-foreground">
            {effectiveGateway === "mp"
              ? pt
                ? "🇧🇷 Pagamento via Mercado Pago (R$) — Cartão, Pix e boleto"
                : "🇧🇷 Payment via Mercado Pago (BRL) — Card, Pix and boleto"
              : pt
                ? "💳 Pagamento via Stripe (USD) — Cartão de crédito internacional"
                : "💳 Payment via Stripe (USD) — International credit card"}
          </p>
        </div>

        {/* Plans grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-[520px] w-full rounded-2xl" />)}
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
            {plans.map((plan) => {
              const isCurrentPlan = user?.planId === plan.id;
              const isPopular = plan.isPopular;
              const usdPrice = parseFloat(String(plan.price)) || 0;
              const isFree = usdPrice === 0;

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col ${
                    isPopular
                      ? "border-primary shadow-xl shadow-primary/20 scale-[1.02] z-10"
                      : "border-border/50"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white uppercase tracking-widest text-[10px] font-bold px-4 py-1.5 shadow-sm shadow-primary/25">
                        {t("pricing.popular")}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8 pt-10">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="mt-2 min-h-[2.5rem]">{plan.description}</CardDescription>
                    <div className="mt-6 flex flex-col items-center">
                      <div className="flex items-baseline justify-center gap-x-1">
                        <span className="text-5xl font-extrabold tracking-tight">
                          {formatPrice(usdPrice)}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground mt-1">
                        / {plan.interval === "month" ? t("pricing.period.month") : t("pricing.period.year")}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-xl justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-mono font-bold text-sm">{plan.tokenAllowance.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">{t("pricing.tokens_mo")}</span>
                    </div>
                    <ul className="space-y-2.5 text-sm">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex gap-3 items-start">
                          <div className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-6 pb-8 flex flex-col gap-3">
                    <Button
                      className={`w-full rounded-xl ${isPopular ? "bg-gradient-to-r from-primary to-accent shadow-sm shadow-primary/20" : ""}`}
                      variant={isPopular ? "default" : "outline"}
                      disabled={isCurrentPlan || !!loadingPlanId || isFree}
                      onClick={() => !isFree && handleSubscribe(plan.id)}
                    >
                      {isCurrentPlan
                        ? t("pricing.current_plan")
                        : isFree
                          ? (pt ? "Gratuito" : "Free")
                          : loadingPlanId === plan.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : effectiveGateway === "mp"
                              ? `${pt ? "Assinar com" : "Subscribe with"} Mercado Pago`
                              : `${pt ? "Assinar com" : "Subscribe with"} Stripe`
                      }
                    </Button>
                    {!isFree && !isCurrentPlan && (
                      <p className="text-[10px] text-center text-muted-foreground">
                        {effectiveGateway === "mp"
                          ? (pt ? "Via Mercado Pago • R$ • Pix e cartão" : "Via Mercado Pago • BRL • Pix & card")
                          : (pt ? "Via Stripe • USD • Cartão internacional" : "Via Stripe • USD • International card")}
                      </p>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            {pt ? "Nenhum plano disponível no momento." : "No pricing plans available at the moment."}
          </div>
        )}

        {/* Free trial note */}
        <p className="text-center text-sm text-muted-foreground">{t("pricing.free_trial")}</p>

        {/* CTA for non-users */}
        {!user && (
          <div className="text-center space-y-4 max-w-md mx-auto">
            <p className="text-muted-foreground">
              {pt ? "Ainda não tem conta?" : "Don't have an account yet?"}
            </p>
            <Link href="/register">
              <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20">
                {t("hero.cta_primary")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
