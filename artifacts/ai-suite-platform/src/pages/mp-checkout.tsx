import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useListPlans, useGetMe } from "@workspace/api-client-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Lock, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/public-layout";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY as string | undefined;
const USD_TO_BRL = 5.5;

declare global {
  interface Window {
    MercadoPago: any;
  }
}

function loadMPScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.MercadoPago) {
      resolve();
      return;
    }
    const existing = document.getElementById("mp-sdk");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = "mp-sdk";
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function MpCheckout() {
  const { planId } = useParams<{ planId: string }>();
  const [, navigate] = useLocation();
  const { data: plans, isLoading: plansLoading } = useListPlans();
  const { data: user, isLoading: userLoading } = useGetMe({ query: { retry: false } });
  const { formatPrice } = useI18n();

  const cardFormRef = useRef<any>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const plan = plans?.find((p) => p.id === planId);
  const priceBrl = plan
    ? Math.round(parseFloat(String(plan.price)) * USD_TO_BRL * 100) / 100
    : 0;

  // Redirect unauthenticated users
  useEffect(() => {
    if (!userLoading && user === null) {
      navigate(`/login`);
    }
  }, [user, userLoading, navigate, planId]);

  // Load MP SDK and initialize CardForm once plan + user are ready
  useEffect(() => {
    if (!plan || !user || !MP_PUBLIC_KEY) return;

    let mounted = true;

    loadMPScript()
      .then(() => {
        if (!mounted) return;

        const mp = new window.MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });

        const cardForm = mp.cardForm({
          amount: String(priceBrl),
          iframe: true,
          form: {
            id: "mp-card-form",
            cardholderName: {
              id: "mp-cardholderName",
              placeholder: "Nome como no cartão",
            },
            cardNumber: {
              id: "mp-cardNumber",
              placeholder: "0000 0000 0000 0000",
            },
            expirationDate: {
              id: "mp-expirationDate",
              placeholder: "MM/AA",
            },
            securityCode: {
              id: "mp-securityCode",
              placeholder: "CVV",
            },
            issuer: { id: "mp-issuer" },
            installments: { id: "mp-installments" },
            identificationType: { id: "mp-identificationType" },
            identificationNumber: {
              id: "mp-identificationNumber",
              placeholder: "000.000.000-00",
            },
            cardholderEmail: {
              id: "mp-cardholderEmail",
              value: user.email || "",
            },
          },
          callbacks: {
            onFormMounted: (err: any) => {
              if (err) {
                console.warn("MP CardForm mount error:", err);
                return;
              }
              if (mounted) setSdkReady(true);
            },
            onSubmit: async (event: Event) => {
              event.preventDefault();
              if (!mounted || submitting) return;
              setSubmitting(true);

              try {
                const {
                  token,
                  installments,
                  issuerId,
                  paymentMethodId,
                  identificationType,
                  identificationNumber,
                } = cardForm.getCardFormData();

                const authToken = localStorage.getItem("auth_token");
                const res = await fetch(`${BASE}/api/payments/mp/create-payment`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                  },
                  body: JSON.stringify({
                    planId,
                    token,
                    installments,
                    issuerId,
                    paymentMethodId,
                    identificationType,
                    identificationNumber,
                  }),
                });

                const result = (await res.json()) as any;

                if (result.status === "approved") {
                  navigate(`/payment/success?gateway=mp&plan=${planId}`);
                } else if (result.status === "pending") {
                  navigate(
                    `/payment/success?gateway=mp&plan=${planId}&status=pending`
                  );
                } else {
                  toast.error(
                    result.error ||
                      "Pagamento não aprovado. Verifique os dados do cartão."
                  );
                }
              } catch {
                toast.error("Erro de conexão. Tente novamente.");
              } finally {
                if (mounted) setSubmitting(false);
              }
            },
            onError: (errors: any[]) => {
              console.error("MP CardForm errors:", errors);
            },
          },
        });

        cardFormRef.current = cardForm;
      })
      .catch(() => {
        toast.error("Não foi possível carregar o SDK do Mercado Pago.");
      });

    return () => {
      mounted = false;
      try {
        cardFormRef.current?.unmount?.();
      } catch {
        // ignore unmount errors
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan?.id, user?.id, priceBrl]);

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (userLoading || plansLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (!plan) {
    return (
      <PublicLayout>
        <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
          <p className="text-muted-foreground">Plano não encontrado.</p>
          <Link href="/pricing">
            <Button variant="outline">Ver planos</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  if (!MP_PUBLIC_KEY) {
    return (
      <PublicLayout>
        <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
          <p className="text-destructive font-semibold">
            Checkout não configurado.
          </p>
          <p className="text-sm text-muted-foreground">
            Configure a variável <code>VITE_MP_PUBLIC_KEY</code> com a chave
            pública do Mercado Pago.
          </p>
        </div>
      </PublicLayout>
    );
  }

  // ─── Checkout form ──────────────────────────────────────────────────────────
  return (
    <PublicLayout>
      <div className="max-w-md mx-auto py-10 px-4 space-y-4">
        {/* Back */}
        <Link href="/pricing">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar para planos
          </button>
        </Link>

        {/* Plan summary */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">Plano {plan.name}</p>
              <p className="text-xs text-muted-foreground">Acesso por 30 dias</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">
                R$ {priceBrl.toFixed(2).replace(".", ",")}
              </p>
              <p className="text-xs text-muted-foreground">({formatPrice(parseFloat(String(plan.price)))} USD)</p>
            </div>
          </CardContent>
        </Card>

        {/* Card form */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <img
                src="https://http2.mlstatic.com/frontend-assets/ui-navigation/5.19.1/mercadopago/logo__large@2x.png"
                alt="Mercado Pago"
                className="h-5 dark:brightness-0 dark:invert"
              />
            </div>
            <CardTitle className="text-base">Dados do cartão</CardTitle>
            <CardDescription className="text-xs">
              Seus dados são criptografados e processados com segurança pelo Mercado Pago.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* MP injects iframes into the divs below by ID */}
            <form id="mp-card-form" className="space-y-4">

              {/* Cardholder name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nome no cartão</label>
                <div
                  id="mp-cardholderName"
                  className="mp-iframe-field border border-input rounded-md bg-background"
                />
              </div>

              {/* Card number */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Número do cartão</label>
                <div
                  id="mp-cardNumber"
                  className="mp-iframe-field border border-input rounded-md bg-background"
                />
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Validade</label>
                  <div
                    id="mp-expirationDate"
                    className="mp-iframe-field border border-input rounded-md bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">CVV</label>
                  <div
                    id="mp-securityCode"
                    className="mp-iframe-field border border-input rounded-md bg-background"
                  />
                </div>
              </div>

              {/* Issuer (populated by MP SDK, hidden if only one bank) */}
              <select id="mp-issuer" className="w-full border border-input rounded-md px-3 h-10 bg-background text-sm hidden" />

              {/* Installments */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Parcelas</label>
                <select
                  id="mp-installments"
                  className="w-full border border-input rounded-md px-3 h-10 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Identification */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tipo</label>
                  <select
                    id="mp-identificationType"
                    className="w-full border border-input rounded-md px-3 h-10 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-sm font-medium">CPF / CNPJ</label>
                  <div
                    id="mp-identificationNumber"
                    className="mp-iframe-field border border-input rounded-md bg-background"
                  />
                </div>
              </div>

              {/* Email (hidden — pre-filled from user account) */}
              <div className="hidden">
                <div id="mp-cardholderEmail" />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-primary to-accent"
                disabled={!sdkReady || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processando pagamento...
                  </>
                ) : !sdkReady ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Pagar R$ {priceBrl.toFixed(2).replace(".", ",")}
                  </>
                )}
              </Button>

              {/* Security note */}
              <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                Pagamento seguro e criptografado · Mercado Pago
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* MP iframe field sizing */}
      <style>{`
        .mp-iframe-field {
          height: 40px;
          padding: 0;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
        .mp-iframe-field iframe {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          background: transparent !important;
        }
      `}</style>
    </PublicLayout>
  );
}
