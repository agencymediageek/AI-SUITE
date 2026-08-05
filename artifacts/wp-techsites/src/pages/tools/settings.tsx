import { useState } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getApiKey } from '@/lib/api-headers';
import {
  Settings, Key, Globe, Bell, Shield, Coins, CheckCircle2,
  ExternalLink, Copy, Zap, Users
} from 'lucide-react';

const PLANS = [
  { value: 'starter', label: 'Starter', credits: 200, price: 'R$ 97/mês', color: 'text-muted-foreground' },
  { value: 'pro', label: 'Pro', credits: 1000, price: 'R$ 197/mês', color: 'text-primary' },
  { value: 'agency', label: 'Agency', credits: 5000, price: 'R$ 497/mês', color: 'text-amber-500' },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const apiKey = getApiKey();
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('pt');
  const [autoAudit, setAutoAudit] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [currentPlan] = useState('starter');

  const handleCopyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast({ title: 'Chave copiada!' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}${'•'.repeat(20)}${apiKey.slice(-4)}` : '—';

  return (
    <DashboardShell>
      <div className="space-y-6 animate-slide-in-up max-w-3xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Configurações</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie sua conta, plano, integrações e preferências do WP TechSites.
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/30 border">
            <Settings className="w-3 h-3 mr-1" /> Config
          </Badge>
        </div>

        {/* Plan & Credits */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Coins className="w-4 h-4 text-primary" /> Plano & Créditos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              {PLANS.map(plan => (
                <div key={plan.value}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    currentPlan === plan.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-bold text-sm ${plan.color}`}>{plan.label}</p>
                    {currentPlan === plan.value && (
                      <Badge variant="outline" className="text-[10px] border-primary text-primary px-1.5 py-0">Atual</Badge>
                    )}
                  </div>
                  <p className="text-2xl font-black text-foreground">{plan.credits.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">créditos/mês</p>
                  <p className="text-xs font-medium text-muted-foreground mt-2">{plan.price}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Créditos disponíveis</p>
                <p className="text-xs text-muted-foreground">Renovam em 30 dias</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-primary">200</p>
                <p className="text-xs text-muted-foreground">/ 200 total</p>
              </div>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <a href="/planos">
                <Zap className="w-4 h-4 mr-2 text-primary" />
                Ver Planos & Fazer Upgrade
                <ExternalLink className="w-3.5 h-3.5 ml-2 text-muted-foreground" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* API Key */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" /> Chave de Conexão
            </CardTitle>
            <CardDescription>
              Esta chave conecta o plugin do seu WordPress ao WP TechSites.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border font-mono text-xs text-muted-foreground truncate">
                {maskedKey}
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyKey} className="flex-shrink-0">
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-green-600" />
              Chave segura — nunca exposta publicamente no frontend do site.
            </p>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Preferências
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Idioma padrão das ferramentas</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">🇧🇷 Português</SelectItem>
                  <SelectItem value="en">🇺🇸 Inglês</SelectItem>
                  <SelectItem value="es">🇪🇸 Espanhol</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" /> Notificações
              </p>
              {[
                { id: 'auto-audit', label: 'Auditoria SEO automática ao conectar', desc: 'Analisa o site automaticamente na primeira conexão', state: autoAudit, setter: setAutoAudit },
                { id: 'email-notif', label: 'Alertas por e-mail', desc: 'Notificações de créditos baixos e atualizações do plugin', state: emailNotif, setter: setEmailNotif },
              ].map(item => (
                <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => item.setter(!item.state)}
                    className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
                      item.state ? 'bg-primary' : 'bg-muted border border-border'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                      item.state ? 'left-[18px]' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plugin info */}
        <Card className="border-dashed">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" /> Informações do Plugin
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
              {[
                ['Versão do Plugin', 'v2.4.1'],
                ['Dashboard', 'v2.4.1'],
                ['Status', '✅ Conectado'],
                ['API Server', '✅ Online'],
                ['Suporte', 'suporte@techsites.ai'],
                ['Documentação', 'docs.techsites.ai'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
