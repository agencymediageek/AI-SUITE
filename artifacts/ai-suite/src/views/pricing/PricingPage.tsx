"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { Check, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { AVAILABLE_FEATURES } from "@/lib/features";

interface PricingPlan {
    id: string;
    name: string;
    price: number;
    tokens: number;
    interval: 'month' | 'year';
    features: string[];
    aiTools?: string[];
    description?: string;
    popular?: boolean;
    cta?: string;
}

function PricingPageContent() {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [processingGateway, setProcessingGateway] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const { toast } = useToast();
    const { user, refreshUser } = useAuth();
    const { settings } = useSettings();
    const { t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const processedSessions = useRef<Set<string>>(new Set());

    useEffect(() => {
        fetchPlans();
        refreshUser().catch(console.error);
    }, [refreshUser]);

    useEffect(() => {
        if (searchParams) {
            const success = searchParams.get('success');
            const canceled = searchParams.get('canceled');
            const sessionId = searchParams.get('session_id') || searchParams.get('token');

            if (success && sessionId && !processedSessions.current.has(sessionId)) {
                processedSessions.current.add(sessionId);
                const gateway = searchParams.get('gateway') || 'stripe';

                // Verify the session on the backend to credit tokens securely
                fetch(`/api/checkout/verify?${searchParams.toString()}`)
                    .then(res => res.json())
                    .then(data => {
                        console.log("[Verification Debug]", data);
                        if (data.success && data.status === 'paid') {
                            toast({
                                title: "Upgrade Realizado!",
                                description: "Tokens adicionados à sua conta com sucesso.",
                                variant: "default",
                                className: "bg-green-600 text-white border-none"
                            });
                            refreshUser();
                        } else if (data.error) {
                            toast({
                                title: "Verification Error",
                                description: data.error,
                                variant: "destructive"
                            });
                        } else {
                            const isDeclined = data.error?.includes('INSTRUMENT_DECLINED');
                            const errorMsg = data.error ? ` - ${data.error}` : '';

                            toast({
                                title: isDeclined ? "Payment Declined" : "Payment Pending",
                                description: isDeclined
                                    ? "PayPal declined this card. Please try again using a different test card number (e.g. use a Mastercard test card)."
                                    : `Status: ${data.providerStatus || 'Processing'}${errorMsg}. Tokens will be added shortly.`,
                                variant: isDeclined ? "destructive" : "default",
                                duration: isDeclined ? 15000 : 5000,
                                action: data.recoveryUrl ? (
                                    <ToastAction
                                        altText="Try Again"
                                        onClick={() => window.location.href = data.recoveryUrl}
                                    >
                                        Try Again
                                    </ToastAction>
                                ) : undefined
                            });
                        }
                    })
                    .catch((err) => {
                        toast({
                            title: "Verification Error",
                            description: "Could not verify payment status immediately.",
                            variant: "destructive"
                        });
                    })
                    .finally(() => {
                        // Clean up URL
                        const newUrl = window.location.pathname;
                        window.history.replaceState({}, '', newUrl);
                    });
            } else if (canceled && !processedSessions.current.has('canceled')) {
                processedSessions.current.add('canceled');
                toast({
                    title: "Payment Canceled",
                    description: "You canceled the checkout process.",
                    variant: "destructive"
                });
                // Clean up URL
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        }
    }, [searchParams, refreshUser, toast]);

    const fetchPlans = async () => {
        try {
            const res = await fetch("/api/plans");
            if (!res.ok) throw new Error("Failed to fetch plans");
            const data = await res.json();
            setPlans(data.plans.filter((p: any) => p.isActive));
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to load pricing plans",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const processPayment = async (plan: PricingPlan, gateway?: string) => {
        if (!user) {
            router.push("/login?redirect=/pricing");
            return;
        }

        setProcessingId(plan.id);
        setProcessingGateway(gateway || settings?.paymentGateway || 'stripe');
        try {
            const intentRes = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: plan.id, ...(gateway ? { gateway } : {}) })
            });

            if (!intentRes.ok) {
                const errData = await intentRes.json();
                throw new Error(errData.error || "Checkout setup failed");
            }
            const { url } = await intentRes.json();

            if (url) {
                window.location.href = url;
            } else {
                throw new Error("No checkout URL returned from server.");
            }
        } catch (error: any) {
            toast({
                title: "Payment Initialization Failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive"
            });
            setProcessingId(null);
            setProcessingGateway(null);
        }
    };

    const handleCancelSubscription = async () => {

        if (window.location.href.includes('mounikai')) {

            toast({
                title: "Demo Version",
                description: "In the demo, this feature is disabled",
                variant: "default"
            });
            return;
        }
        if (!confirm("Are you sure you want to cancel your monthly subscription? You will lose premium access immediately.")) {
            return;
        }
        setCancelling(true);
        try {
            const res = await fetch("/api/subscription/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to cancel subscription");
            }
            toast({
                title: "Subscription Cancelled",
                description: "Your monthly subscription has been successfully cancelled.",
                variant: "default",
                className: "bg-red-600 text-white border-none"
            });
            refreshUser();
        } catch (error: any) {
            toast({
                title: "Cancellation Failed",
                description: error.message || "Failed to cancel subscription. Please try again.",
                variant: "destructive"
            });
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-ai-primary" />
            </div>
        );
    }

    return (
        <div className="container py-10 px-4 md:px-0 mx-auto max-w-6xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 ai-gradient-text">
                    Escolha seu Plano
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
                    Adquira mais tokens e desbloqueie recursos premium de IA. Escolha o plano ideal para você.
                </p>

            </div>

            {plans.length === 0 ? (
                <div className="text-center text-muted-foreground p-10 border border-dashed rounded-xl">
                    Nenhum plano ativo no momento. Tente novamente em breve.
                </div>
            ) : (
                <>
                {/* Aviso USD + Mercado Pago — card destaque */}
                <div className="mb-10 flex justify-center">
                    <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-600 rounded-2xl px-8 py-5 text-center max-w-2xl w-full shadow-sm">
                        <p className="text-amber-900 dark:text-amber-200 font-extrabold tracking-widest uppercase text-sm mb-1">
                            💵 OS PREÇOS ESTÃO EM DÓLAR AMERICANO (USD)
                        </p>
                        {(settings as any)?.mercadoPagoEnabled && (
                            <p className="text-amber-800 dark:text-amber-300 text-xs mt-2">
                                no checkout via <strong>mercado pago</strong> o valor é convertido automaticamente para <strong>reais (BRL)</strong> — pague via <strong>pix</strong> ou <strong>parcele no cartão</strong>.
                            </p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan) => {
                        const isCurrentPlan = user?.planId === plan.id;
                        return (
                            <Card key={plan.id} className={`flex flex-col border-ai-primary/20 hover:border-ai-primary/50 transition-all hover:shadow-lg hover:-translate-y-1 relative ${plan.popular ? 'ring-2 ring-ai-primary ring-offset-2' : ''} ${isCurrentPlan ? 'ring-2 ring-green-500 ring-offset-2 border-green-500/40' : ''}`}>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <CreditCard className="w-24 h-24" />
                                </div>
                                <CardHeader>
                                    {isCurrentPlan && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                            <Badge className="bg-green-600 hover:bg-green-600/90 border-0 shadow-xl text-white px-4 py-1 uppercase text-[10px] font-bold tracking-wider">
                                                {t("Current Plan")}
                                            </Badge>
                                        </div>
                                    )}
                                    {!isCurrentPlan && plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                            <Badge className="bg-ai-primary hover:bg-ai-primary/90 border-0 shadow-xl text-white px-4 py-1 uppercase text-[10px] font-bold tracking-wider">
                                                Mais Popular
                                            </Badge>
                                        </div>
                                    )}
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <CardDescription>
                                        {plan.description || ((plan.interval === 'month' || !plan.interval) ? t('Monthly Billed') : t('Yearly Billed'))}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold">
                                            {plan.price === 0 && plan.name.toLowerCase().includes('enterprise') ? (
                                                "Custom"
                                            ) : (
                                                new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: settings?.metadata?.platformCurrency || 'USD',
                                                    maximumFractionDigits: 0
                                                }).format(plan.price)
                                            )}
                                        </span>
                                        {plan.price > 0 && <span className="text-muted-foreground">/{t(plan.interval || 'month')}</span>}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-green-500" />
                                            <span className="font-semibold">{plan.tokens.toLocaleString()} Tokens</span>
                                        </div>
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <Check className="w-5 h-5 text-ai-primary" />
                                                <span className="text-sm">{feature}</span>
                                            </div>
                                        ))}
                                        {plan.aiTools && plan.aiTools.length > 0 && (
                                            <Accordion type="single" collapsible className="w-full">
                                                <AccordionItem value="tools" className="border-none">
                                                    <AccordionTrigger className="py-2 text-sm hover:no-underline font-medium text-ai-primary flex gap-2 w-full text-left">
                                                        {t("Included AI Tools")} ({plan.aiTools.length})
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {plan.aiTools.map(toolId => {
                                                                const feature = AVAILABLE_FEATURES.find(f => f.id === toolId);
                                                                return feature ? (
                                                                    <Badge key={toolId} variant="secondary" className="text-[10px] font-normal bg-ai-primary/10 text-ai-primary hover:bg-ai-primary/20">
                                                                        {feature.label}
                                                                    </Badge>
                                                                ) : null;
                                                            })}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-2">
                                    {plan.price === 0 && !isCurrentPlan ? (
                                        <div className="w-full text-center py-3 rounded-lg bg-muted text-muted-foreground text-sm font-medium">
                                            ✅ Plano Gratuito — faça cadastro para começar
                                        </div>
                                    ) : (
                                    <Button
                                        className={`w-full ${isCurrentPlan ? 'bg-green-600 hover:bg-green-600 cursor-not-allowed opacity-80' : 'bg-ai-primary hover:bg-ai-primary/90'}`}
                                        size="lg"
                                        onClick={() => !isCurrentPlan && processPayment(plan, settings?.paymentGateway || 'stripe')}
                                        disabled={isCurrentPlan || processingId === plan.id}
                                    >
                                        {isCurrentPlan ? (
                                            <>
                                                <Check className="w-4 h-4 mr-2" /> Plano Atual
                                            </>
                                        ) : (processingId === plan.id && processingGateway !== 'mercadopago') ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecionando...
                                            </>
                                        ) : (
                                            <>💳 Pagar com Stripe</>
                                        )}
                                    </Button>
                                    )}
                                    {!isCurrentPlan && (settings as any)?.mercadoPagoEnabled && plan.price > 0 && (
                                        <Button
                                            className="w-full bg-[#009EE3] hover:bg-[#007FC3] text-white"
                                            size="lg"
                                            onClick={() => processPayment(plan, 'mercadopago')}
                                            disabled={processingId === plan.id}
                                        >
                                            {(processingId === plan.id && processingGateway === 'mercadopago') ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecionando...
                                                </>
                                            ) : (
                                                <>💙 Pagar com Mercado Pago</>
                                            )}
                                        </Button>
                                    )}
                                    {isCurrentPlan && plan.price > 0 && (
                                        <Button
                                            variant="outline"
                                            className="w-full border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                                            size="sm"
                                            onClick={() => handleCancelSubscription()}
                                            disabled={cancelling}
                                        >
                                            {cancelling ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cancelando...
                                                </>
                                            ) : (
                                                "Cancelar Assinatura"
                                            )}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
                </>
            )}
        </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-ai-primary" /></div>}>
            <PricingPageContent />
        </Suspense>
    );
}
