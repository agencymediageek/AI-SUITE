import { useState, useEffect } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { useGetUserProfile, useUpdateUserProfile, useGetAiUsage } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { getGetUserProfileQueryKey, getGetMeQueryKey } from "@workspace/api-client-react";
import { toast } from "sonner";
import {
  User, Zap, Save, CheckCircle2, CreditCard,
  AlertTriangle, XCircle, ArrowRight, Sparkles,
  BarChart3, Clock,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

// ─── Plan status helpers ──────────────────────────────────────────────────────

type PlanStatus = "active" | "expiring" | "expired" | "free";

function getPlanStatus(planExpiresAt: string | null | undefined, planId: string | null | undefined): PlanStatus {
  if (!planId || !planExpiresAt) return "free";
  const expires = new Date(planExpiresAt);
  const now = new Date();
  const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 7) return "expiring";
  return "active";
}

function daysLeft(planExpiresAt: string | null | undefined): number {
  if (!planExpiresAt) return 0;
  return Math.ceil((new Date(planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Account() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useGetUserProfile();
  const { data: usage, isLoading: usageLoading } = useGetAiUsage();
  const { locale } = useI18n();
  const pt = locale === "pt";

  const updateMutation = useUpdateUserProfile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "billing">("profile");

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({ data: { name, email } });
      toast.success(pt ? "Perfil atualizado com sucesso" : "Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch (error: any) {
      toast.error(error?.message || (pt ? "Falha ao atualizar perfil" : "Failed to update profile"));
    }
  };

  const planExpiresAt = (profile as any)?.planExpiresAt ?? null;
  const paymentGateway = (profile as any)?.paymentGateway ?? null;
  const planStatus = getPlanStatus(planExpiresAt, profile?.planId);
  const remaining = daysLeft(planExpiresAt);

  const usagePercent = usage && (usage.tokensUsed + usage.tokenBalance) > 0
    ? Math.min(100, Math.round((usage.tokensUsed / (usage.tokensUsed + usage.tokenBalance)) * 100))
    : 0;

  const planStatusConfig = {
    active: {
      label: pt ? "Ativo" : "Active",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    expiring: {
      label: pt ? `Expira em ${remaining}d` : `Expires in ${remaining}d`,
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    expired: {
      label: pt ? "Expirado" : "Expired",
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/20",
    },
    free: {
      label: pt ? "Gratuito" : "Free",
      icon: Sparkles,
      color: "text-muted-foreground",
      bg: "bg-muted",
      border: "border-border",
    },
  };

  const statusCfg = planStatusConfig[planStatus];
  const StatusIcon = statusCfg.icon;

  const tabs = [
    { id: "profile" as const, label: pt ? "Perfil" : "Profile", icon: User },
    { id: "billing" as const, label: pt ? "Plano & Cobrança" : "Plan & Billing", icon: CreditCard },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {pt ? "Configurações da Conta" : "Account Settings"}
          </h1>
          <p className="text-muted-foreground">
            {pt ? "Gerencie seu perfil, plano e uso de tokens." : "Manage your profile, plan, and token usage."}
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-border">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ────────────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Profile form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    {pt ? "Informações Pessoais" : "Personal Information"}
                  </CardTitle>
                  <CardDescription>
                    {pt ? "Atualize seus dados pessoais" : "Update your personal details"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profileLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{pt ? "Nome Completo" : "Full Name"}</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{pt ? "Endereço de E-mail" : "Email Address"}</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background" />
                      </div>
                    </form>
                  )}
                </CardContent>
                <CardFooter>
                  <Button form="profile-form" type="submit" disabled={updateMutation.isPending} className="gap-2">
                    {updateMutation.isPending ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {pt ? "Salvar Alterações" : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Sidebar: usage summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {pt ? "Uso de Tokens" : "Token Usage"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {usageLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{pt ? "Usado" : "Used"}</span>
                        <span className="font-mono font-medium">
                          {usage?.tokensUsed.toLocaleString()} / {((usage?.tokensUsed ?? 0) + (usage?.tokenBalance ?? 0)).toLocaleString()}
                        </span>
                      </div>
                      <Progress
                        value={usagePercent}
                        className="h-2 bg-muted"
                        indicatorClassName={usagePercent > 80 ? "bg-destructive" : "bg-primary"}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {usage?.tokenBalance.toLocaleString()} {pt ? "tokens restantes" : "tokens remaining"}
                      </p>
                      <div className="pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{pt ? "Total de Gerações" : "Total Generations"}</span>
                          <span className="font-mono font-medium">{profile?.totalGenerations?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("billing")}>
                    {pt ? "Ver Plano" : "View Plan"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>

              {usage?.topTools && usage.topTools.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      {pt ? "Ferramentas Mais Usadas" : "Most Used Tools"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {usage.topTools.slice(0, 3).map((tool, idx) => (
                        <div key={tool.toolId} className="flex items-center justify-between text-sm">
                          <span className="truncate pr-2">{idx + 1}. {tool.label}</span>
                          <span className="font-mono text-muted-foreground">{tool.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* ── BILLING TAB ────────────────────────────────────────────────── */}
        {activeTab === "billing" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">

              {/* Current plan card */}
              <Card className={`border ${statusCfg.border}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        {pt ? "Plano Atual" : "Current Plan"}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {pt ? "Detalhes da sua assinatura ativa" : "Your active subscription details"}
                      </CardDescription>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusCfg.label}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {profileLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-8 w-40" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ) : (
                    <>
                      {/* Plan name */}
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          {pt ? "Plano" : "Plan"}
                        </p>
                        <p className="text-2xl font-bold">
                          {profile?.planName || (pt ? "Gratuito" : "Free")}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Expiry */}
                        <div className={`rounded-xl p-4 ${statusCfg.bg}`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <Clock className={`w-4 h-4 ${statusCfg.color}`} />
                            <p className="text-xs text-muted-foreground">{pt ? "Validade" : "Valid until"}</p>
                          </div>
                          {planExpiresAt ? (
                            <>
                              <p className="font-semibold text-sm">
                                {new Date(planExpiresAt).toLocaleDateString(
                                  pt ? "pt-BR" : "en-US",
                                  { day: "numeric", month: "long", year: "numeric" }
                                )}
                              </p>
                              {planStatus === "expiring" && (
                                <p className={`text-xs mt-1 font-medium ${statusCfg.color}`}>
                                  {pt ? `⚠️ Apenas ${remaining} dias restantes` : `⚠️ Only ${remaining} days left`}
                                </p>
                              )}
                              {planStatus === "expired" && (
                                <p className="text-xs mt-1 font-medium text-destructive">
                                  {pt ? "❌ Plano expirado" : "❌ Plan expired"}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">{pt ? "Sem data de expiração" : "No expiry"}</p>
                          )}
                        </div>

                        {/* Gateway */}
                        <div className="rounded-xl p-4 bg-muted/40">
                          <div className="flex items-center gap-2 mb-1.5">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{pt ? "Forma de Pagamento" : "Payment Method"}</p>
                          </div>
                          {paymentGateway ? (
                            <p className="font-semibold text-sm">
                              {paymentGateway === "mp" ? "🇧🇷 Mercado Pago" : "💳 Stripe"}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">{pt ? "Nenhum" : "None"}</p>
                          )}
                        </div>
                      </div>

                      {/* Token allowance */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" />
                            {pt ? "Tokens disponíveis" : "Tokens available"}
                          </span>
                          <span className="font-mono font-semibold">
                            {usageLoading ? "..." : usage?.tokenBalance.toLocaleString()}
                          </span>
                        </div>
                        <Progress
                          value={usagePercent}
                          className="h-2 bg-muted"
                          indicatorClassName={
                            usagePercent > 80
                              ? "bg-destructive"
                              : planStatus === "expiring"
                                ? "bg-amber-500"
                                : "bg-primary"
                          }
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {usagePercent}% {pt ? "utilizado" : "used"}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  {/* Expired or free → strong CTA */}
                  {(planStatus === "free" || planStatus === "expired") && (
                    <Link href="/pricing" className="w-full">
                      <Button
                        className="w-full gap-2 bg-gradient-to-r from-primary to-accent shadow-sm shadow-primary/20"
                        size="lg"
                      >
                        <Sparkles className="w-4 h-4" />
                        {pt ? "Fazer Upgrade de Plano" : "Upgrade Your Plan"}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                  {/* Expiring → renew CTA */}
                  {planStatus === "expiring" && (
                    <Link href="/pricing" className="w-full">
                      <Button
                        className="w-full gap-2 border-amber-500 text-amber-500 hover:bg-amber-500/10"
                        variant="outline"
                        size="lg"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        {pt ? "Renovar Plano" : "Renew Plan"}
                      </Button>
                    </Link>
                  )}
                  {/* Active → upgrade option */}
                  {planStatus === "active" && (
                    <Link href="/pricing" className="w-full">
                      <Button variant="outline" className="w-full gap-2">
                        {pt ? "Ver Todos os Planos" : "View All Plans"}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                  <p className="text-xs text-center text-muted-foreground">
                    {pt
                      ? "Renovações via Mercado Pago (🇧🇷) ou Stripe (internacional)"
                      : "Renewals via Mercado Pago (🇧🇷) or Stripe (international)"}
                  </p>
                </CardFooter>
              </Card>

              {/* How plan activation works */}
              <Card className="bg-muted/30 border-border/50">
                <CardContent className="pt-5 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {pt ? "Como funciona a ativação" : "How plan activation works"}
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {(pt ? [
                      "Após o pagamento aprovado, seu plano é ativado automaticamente por webhook.",
                      "O plano dura 30 dias a partir da data de ativação.",
                      "Seus tokens são renovados imediatamente após a ativação.",
                      "Se o plano expirar, você retorna ao plano gratuito sem perder o histórico.",
                    ] : [
                      "After payment approval, your plan is activated automatically via webhook.",
                      "The plan lasts 30 days from the activation date.",
                      "Your tokens are refreshed immediately after activation.",
                      "If the plan expires, you return to the free plan without losing your history.",
                    ]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar: usage */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {pt ? "Resumo de Uso" : "Usage Summary"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {usageLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{pt ? "Tokens usados" : "Tokens used"}</span>
                        <span className="font-mono font-semibold">{usage?.tokensUsed.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{pt ? "Tokens restantes" : "Tokens left"}</span>
                        <span className="font-mono font-semibold">{usage?.tokenBalance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{pt ? "Total de gerações" : "Total generations"}</span>
                        <span className="font-mono font-semibold">{profile?.totalGenerations?.toLocaleString() || 0}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {usage?.topTools && usage.topTools.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      {pt ? "Ferramentas Mais Usadas" : "Most Used Tools"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {usage.topTools.slice(0, 5).map((tool, idx) => (
                        <div key={tool.toolId} className="flex items-center justify-between text-sm">
                          <span className="truncate pr-2">{idx + 1}. {tool.label}</span>
                          <Badge variant="secondary" className="font-mono text-xs">{tool.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
