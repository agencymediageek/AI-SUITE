"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

function SecretInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10 font-mono text-sm"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function IntegrationsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin-mg/config")
      .then((r) => r.json())
      .then((d) => { setSettings(d); setLoading(false); });
  }, []);

  const set = (key: string, value: any) => setSettings((s: any) => ({ ...s, [key]: value }));
  const setMeta = (key: string, value: any) => setSettings((s: any) => ({
    ...s, metadata: { ...(s?.metadata || {}), [key]: value }
  }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin-mg/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      toast.success("Integrações salvas!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i=><div key={i} className="h-32 bg-muted rounded-xl"/>)}</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Integrações</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure as chaves de API da sua instância</p>
      </div>

      {/* Payment */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Pagamentos</CardTitle>
          <CardDescription>Configure o gateway de cobrança</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <div>
              <p className="text-sm font-medium">Ativar pagamentos</p>
              <p className="text-xs text-muted-foreground">Habilita checkout e planos pagos</p>
            </div>
            <Switch
              checked={settings?.paymentEnabled || false}
              onCheckedChange={(v) => set("paymentEnabled", v)}
            />
          </div>

          <div className="space-y-2">
            <Label>Gateway</Label>
            <div className="flex gap-3">
              {["stripe", "mercadopago"].map((gw) => (
                <button
                  key={gw}
                  onClick={() => set("paymentGateway", gw)}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all ${settings?.paymentGateway === gw ? "border-primary bg-primary/5" : "border-muted"}`}
                >
                  {gw === "stripe" ? "💳 Stripe" : "🟦 Mercado Pago"}
                </button>
              ))}
            </div>
          </div>

          {settings?.paymentGateway === "stripe" || !settings?.paymentGateway ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Stripe Secret Key</Label>
                <SecretInput
                  value={settings?.stripeSecretKey || ""}
                  onChange={(v) => set("stripeSecretKey", v)}
                  placeholder="sk_live_..."
                />
              </div>
              <div className="space-y-2">
                <Label>Stripe Public Key</Label>
                <Input
                  value={settings?.stripePublicKey || ""}
                  onChange={(e) => set("stripePublicKey", e.target.value)}
                  placeholder="pk_live_..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Mercado Pago Access Token</Label>
              <SecretInput
                value={settings?.metadata?.mercadoPagoToken || ""}
                onChange={(v) => setMeta("mercadoPagoToken", v)}
                placeholder="APP_USR-..."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Keys */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Chaves de IA</CardTitle>
          <CardDescription>APIs de inteligência artificial</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Google Gemini API Key</Label>
            <SecretInput
              value={settings?.metadata?.geminiKey || ""}
              onChange={(v) => setMeta("geminiKey", v)}
              placeholder="AIza..."
            />
            <p className="text-xs text-muted-foreground">Usada para geração de texto, imagens e análises</p>
          </div>
          <div className="space-y-2">
            <Label>OpenRouter API Key (opcional)</Label>
            <SecretInput
              value={settings?.metadata?.openrouterKey || ""}
              onChange={(v) => setMeta("openrouterKey", v)}
              placeholder="sk-or-..."
            />
          </div>
        </CardContent>
      </Card>

      {/* SMTP */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">E-mail SMTP</CardTitle>
          <CardDescription>Para envio de confirmações e notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Host</Label>
              <Input
                value={settings?.metadata?.smtp?.host || ""}
                onChange={(e) => setMeta("smtp", { ...(settings?.metadata?.smtp || {}), host: e.target.value })}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Porta</Label>
              <Input
                value={settings?.metadata?.smtp?.port || "587"}
                onChange={(e) => setMeta("smtp", { ...(settings?.metadata?.smtp || {}), port: e.target.value })}
                placeholder="587"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>E-mail remetente</Label>
              <Input
                value={settings?.metadata?.smtp?.from || ""}
                onChange={(e) => setMeta("smtp", { ...(settings?.metadata?.smtp || {}), from: e.target.value })}
                placeholder="noreply@seudominio.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Usuário</Label>
              <Input
                value={settings?.metadata?.smtp?.user || ""}
                onChange={(e) => setMeta("smtp", { ...(settings?.metadata?.smtp || {}), user: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <SecretInput
                value={settings?.metadata?.smtp?.pass || ""}
                onChange={(v) => setMeta("smtp", { ...(settings?.metadata?.smtp || {}), pass: v })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
        Salvar todas as integrações
      </Button>
    </div>
  );
}
