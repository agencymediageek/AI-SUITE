import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2, Clock, Zap, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { MediaGeekLogo } from "@/components/logo";

export default function PaymentSuccess() {
  const { locale } = useI18n();
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(8);

  // Parse query params
  const params = new URLSearchParams(window.location.search);
  const gateway = params.get("gateway") || "mp";
  const plan = params.get("plan") || "";
  const status = params.get("status") || "approved";
  const isPending = status === "pending";

  useEffect(() => {
    if (isPending) return; // Don't auto-redirect for pending
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setLocation("/tools");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPending, setLocation]);

  const pt = locale === "pt";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-10">
        <MediaGeekLogo size="md" />
      </div>

      <div className="w-full max-w-md text-center space-y-6">
        {/* Status icon */}
        <div className="flex justify-center">
          {isPending ? (
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
          )}
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isPending
              ? pt ? "Pagamento em Processamento" : "Payment Processing"
              : pt ? "Pagamento Confirmado!" : "Payment Confirmed!"}
          </h1>
          <p className="text-muted-foreground">
            {isPending
              ? pt
                ? "Seu pagamento está sendo processado. Assim que confirmado, seu plano será ativado automaticamente."
                : "Your payment is being processed. Once confirmed, your plan will be activated automatically."
              : pt
                ? "Seu plano foi ativado. Aproveite todas as ferramentas premium da MediaGeek AI Suite."
                : "Your plan has been activated. Enjoy all the premium tools in MediaGeek AI Suite."}
          </p>
        </div>

        {/* Gateway badge */}
        <div className="inline-flex items-center gap-2 bg-muted/60 rounded-full px-4 py-2 text-sm text-muted-foreground">
          {gateway === "mp" ? (
            <>
              <span className="text-base">💳</span>
              <span>{pt ? "Pago via Mercado Pago" : "Paid via Mercado Pago"}</span>
            </>
          ) : (
            <>
              <span className="text-base">💳</span>
              <span>{pt ? "Pago via Stripe" : "Paid via Stripe"}</span>
            </>
          )}
        </div>

        {/* Feature highlights */}
        {!isPending && (
          <div className="bg-card border border-border rounded-2xl p-5 text-left space-y-3">
            <p className="text-sm font-semibold text-foreground mb-3">
              {pt ? "O que você desbloqueou:" : "What you've unlocked:"}
            </p>
            {[
              pt ? "100+ ferramentas de IA premium" : "100+ premium AI tools",
              pt ? "Créditos de tokens renovados" : "Refreshed token credits",
              pt ? "Geração sem fila prioritária" : "Priority queue generation",
              pt ? "Histórico ilimitado" : "Unlimited history",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Zap className="w-3 h-3 text-emerald-500" />
                </div>
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA buttons */}
        <div className="space-y-3 pt-2">
          {!isPending && (
            <Link href="/tools">
              <Button
                size="lg"
                className="w-full rounded-xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20 gap-2"
              >
                {pt ? "Acessar Ferramentas" : "Access Tools"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}

          {!isPending && (
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              {pt
                ? `Redirecionando automaticamente em ${countdown}s...`
                : `Auto-redirecting in ${countdown}s...`}
            </p>
          )}

          {isPending && (
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full rounded-xl">
                {pt ? "Ir para o Painel" : "Go to Dashboard"}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
