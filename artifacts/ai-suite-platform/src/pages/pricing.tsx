import { Link } from "wouter";
import { useListPlans, useSubscribeToPlan, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Loader2, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/public-layout";
import { useI18n } from "@/lib/i18n";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Pricing() {
  const { data: plans, isLoading } = useListPlans();
  const { data: user } = useGetMe({ query: { retry: false } });
  const subscribeMutation = useSubscribeToPlan();
  const { t, locale, setLocale, formatPrice } = useI18n();

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      window.location.href = "/register";
      return;
    }
    try {
      const res = await subscribeMutation.mutateAsync({ data: { planId } });
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        toast.success(locale === "pt" ? "Assinatura realizada!" : "Subscribed successfully!");
      }
    } catch (error: any) {
      toast.error(error?.message || (locale === "pt" ? "Erro ao assinar" : "Failed to subscribe"));
    }
  };

  return (
    <PublicLayout>
      <div className="space-y-16 py-12 px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 px-4 py-1 text-xs uppercase tracking-widest">
            {locale === "pt" ? "Planos" : "Plans"}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{t("pricing.title")}</h1>
          <p className="text-xl text-muted-foreground">{t("pricing.subtitle")}</p>

          {/* Currency toggle */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="text-sm text-muted-foreground">
              {locale === "pt" ? "Exibindo preços em" : "Showing prices in"}:
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-full">
                  <Globe className="w-3.5 h-3.5" />
                  {locale === "pt" ? "🇧🇷 Real (R$)" : "🇺🇸 Dollar (USD)"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLocale("pt")} className={locale === "pt" ? "text-primary font-semibold" : ""}>
                  🇧🇷 Português — Real (R$)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale("en")} className={locale === "en" ? "text-primary font-semibold" : ""}>
                  🇺🇸 English — Dollar (USD)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
                      disabled={isCurrentPlan || subscribeMutation.isPending}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {isCurrentPlan
                        ? t("pricing.current_plan")
                        : subscribeMutation.isPending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : t("pricing.subscribe")}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            {locale === "pt" ? "Nenhum plano disponível no momento." : "No pricing plans available at the moment."}
          </div>
        )}

        {/* Free trial note */}
        <p className="text-center text-sm text-muted-foreground">{t("pricing.free_trial")}</p>

        {/* CTA for non-users */}
        {!user && (
          <div className="text-center space-y-4 max-w-md mx-auto">
            <p className="text-muted-foreground">
              {locale === "pt" ? "Ainda não tem conta?" : "Don't have an account yet?"}
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
