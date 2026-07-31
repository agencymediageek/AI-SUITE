"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Shield, ShieldCheck, ShieldAlert, RefreshCw, Terminal } from "lucide-react";
import { toast } from "sonner";

interface DomainInfo {
  domain: string;
  appUrl: string;
  pm2Process: string;
  ssl: { valid: boolean; expiry: string | null; daysLeft: number | null };
}

export default function DomainPage() {
  const [info, setInfo] = useState<DomainInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    fetch("/api/admin-mg/domain")
      .then((r) => r.json())
      .then((d) => { setInfo(d); setLoading(false); });
  }, []);

  const renewSsl = async () => {
    setRenewing(true);
    try {
      const res = await fetch("/api/admin-mg/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "renew-ssl" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("SSL renovado com sucesso!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setRenewing(false);
    }
  };

  const reloadPm2 = async () => {
    setReloading(true);
    try {
      const res = await fetch("/api/admin-mg/reload", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Processo recarregado!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setReloading(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2].map(i=><div key={i} className="h-32 bg-muted rounded-xl"/>)}</div>;

  const ssl = info?.ssl;
  const sslOk = ssl?.valid && (ssl.daysLeft ?? 0) > 7;
  const sslWarn = ssl?.valid && (ssl.daysLeft ?? 0) <= 14;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Domínio e SSL</h1>
        <p className="text-muted-foreground text-sm mt-1">Status do domínio e certificado desta instância</p>
      </div>

      {/* Domain info */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" /> Domínio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">URL da Instância</p>
              <p className="font-mono font-medium mt-0.5">{info?.appUrl || "—"}</p>
            </div>
            <a href={info?.appUrl} target="_blank" rel="noopener" className="text-primary hover:underline text-sm">Abrir ↗</a>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Hostname</p>
              <p className="font-mono font-medium mt-0.5">{info?.domain || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SSL */}
      <Card className={`border-0 shadow-sm ${sslWarn ? "border-l-4 border-l-yellow-500" : sslOk ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"}`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            {sslOk ? <ShieldCheck className="h-4 w-4 text-green-500" /> : <ShieldAlert className="h-4 w-4 text-red-500" />}
            Certificado SSL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Status</p>
              <p className={`font-semibold mt-1 ${sslOk ? "text-green-500" : sslWarn ? "text-yellow-500" : "text-red-500"}`}>
                {ssl?.valid ? (sslWarn ? "⚠️ Expirando em breve" : "✅ Válido") : "❌ Inválido / Expirado"}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Dias Restantes</p>
              <p className="font-semibold mt-1">{ssl?.daysLeft ?? "—"} dias</p>
            </div>
          </div>

          {ssl?.expiry && (
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Expira em</p>
              <p className="font-medium mt-0.5">{new Date(ssl.expiry).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
            </div>
          )}

          <Button
            variant="outline"
            onClick={renewSsl}
            disabled={renewing}
            className="w-full"
          >
            {renewing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
            Renovar SSL (Certbot)
          </Button>
        </CardContent>
      </Card>

      {/* PM2 */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Terminal className="h-4 w-4" /> Processo PM2
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-xl">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Nome do Processo</p>
            <p className="font-mono font-medium mt-0.5">{info?.pm2Process}</p>
          </div>
          <Button
            variant="outline"
            onClick={reloadPm2}
            disabled={reloading}
            className="w-full"
          >
            {reloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            PM2 Reload (zero downtime)
          </Button>
          <p className="text-xs text-muted-foreground">
            O reload substitui workers gradualmente — o app não fica offline durante o processo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
