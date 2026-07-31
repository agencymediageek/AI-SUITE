"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const PRESET_COLORS = [
  { name: "Roxo", hsl: "262 80% 50%" },
  { name: "Verde", hsl: "142 71% 45%" },
  { name: "Azul", hsl: "220 90% 50%" },
  { name: "Laranja", hsl: "25 95% 53%" },
  { name: "Rosa", hsl: "330 80% 60%" },
  { name: "Teal", hsl: "174 72% 40%" },
  { name: "Vermelho", hsl: "0 84% 60%" },
  { name: "Amarelo", hsl: "45 93% 47%" },
];

export default function IdentityPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin-mg/config")
      .then((r) => r.json())
      .then((d) => { setSettings(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin-mg/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success("Identidade salva com sucesso!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReload = async () => {
    setReloading(true);
    try {
      const res = await fetch("/api/admin-mg/reload", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao recarregar");
      toast.success("App recarregado! Alterações visíveis em segundos.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setReloading(false);
    }
  };

  const updateMeta = (key: string, value: string) => {
    setSettings((s: any) => ({ ...s, metadata: { ...(s?.metadata || {}), [key]: value } }));
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i=><div key={i} className="h-16 bg-muted rounded-xl"/>)}</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Identidade Visual</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure o nome, logo e cores da sua plataforma</p>
      </div>

      {/* Name + URL */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Informações do App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do SaaS</Label>
            <Input
              value={settings?.metadata?.siteName || settings?.siteName || ""}
              onChange={(e) => updateMeta("siteName", e.target.value)}
              placeholder="Meu AI SaaS"
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição curta</Label>
            <Input
              value={settings?.metadata?.siteDescription || ""}
              onChange={(e) => updateMeta("siteDescription", e.target.value)}
              placeholder="Sua plataforma de IA white-label"
            />
          </div>
          <div className="space-y-2">
            <Label>URL do Logo (opcional)</Label>
            <Input
              value={settings?.metadata?.logoUrl || ""}
              onChange={(e) => updateMeta("logoUrl", e.target.value)}
              placeholder="/logo.png"
            />
            <p className="text-xs text-muted-foreground">Coloque o arquivo em /public/logo.png da instância</p>
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Cor Primária</CardTitle>
          <CardDescription>Define botões, links e elementos de destaque</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {PRESET_COLORS.map((color) => {
              const isSelected = settings?.metadata?.primaryColor === color.hsl;
              return (
                <button
                  key={color.hsl}
                  onClick={() => updateMeta("primaryColor", color.hsl)}
                  className={`relative p-3 rounded-xl border-2 transition-all text-left ${isSelected ? "border-foreground" : "border-transparent"}`}
                >
                  <div
                    className="w-full h-8 rounded-lg mb-2"
                    style={{ backgroundColor: `hsl(${color.hsl})` }}
                  />
                  <p className="text-xs font-medium">{color.name}</p>
                  {isSelected && (
                    <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-foreground" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <Label>HSL personalizado</Label>
            <Input
              value={settings?.metadata?.primaryColor || ""}
              onChange={(e) => updateMeta("primaryColor", e.target.value)}
              placeholder="262 80% 50%"
            />
            <p className="text-xs text-muted-foreground">Formato: matiz graus% luminosidade%</p>
          </div>

          {settings?.metadata?.primaryColor && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: `hsl(${settings.metadata.primaryColor})` }} />
              <div>
                <p className="text-sm font-medium">Prévia da cor</p>
                <p className="text-xs text-muted-foreground font-mono">{settings.metadata.primaryColor}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {saved ? "Salvo!" : "Salvar"}
        </Button>
        <Button variant="outline" onClick={handleReload} disabled={reloading}>
          {reloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Aplicar (PM2 Reload)
        </Button>
      </div>
    </div>
  );
}
