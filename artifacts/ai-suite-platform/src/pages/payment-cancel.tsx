import { Link } from "wouter";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { MediaGeekLogo } from "@/components/logo";

export default function PaymentCancel() {
  const { locale } = useI18n();
  const pt = locale === "pt";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-10">
        <MediaGeekLogo size="md" />
      </div>

      <div className="w-full max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <XCircle className="w-10 h-10 text-muted-foreground" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {pt ? "Pagamento Cancelado" : "Payment Cancelled"}
          </h1>
          <p className="text-muted-foreground">
            {pt
              ? "Seu pagamento foi cancelado e nenhum valor foi cobrado. Você pode tentar novamente quando quiser."
              : "Your payment was cancelled and you were not charged. You can try again whenever you're ready."}
          </p>
        </div>

        {/* Info box */}
        <div className="bg-muted/40 rounded-2xl p-5 text-left space-y-2 border border-border">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              {pt
                ? "Se teve algum problema durante o pagamento, entre em contato pelo nosso suporte. Aceitamos cartão de crédito via Stripe (fora do Brasil) e Mercado Pago (Brasil)."
                : "If you experienced any issues during checkout, please contact our support. We accept credit card via Stripe (outside Brazil) and Mercado Pago (Brazil)."}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3 pt-2">
          <Link href="/pricing">
            <Button
              size="lg"
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20 gap-2"
            >
              {pt ? "Voltar para Planos" : "Back to Pricing"}
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/contato">
            <Button variant="ghost" size="lg" className="w-full rounded-xl text-muted-foreground">
              {pt ? "Falar com Suporte" : "Contact Support"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
