/**
 * /api-keys — Página de conexão WP TechSites
 *
 * Dois modos:
 *
 *  A) FLUXO AUTOMÁTICO (plugin redireciona aqui)
 *     URL: /api-keys?site_url=https://meusite.com&email=admin@meusite.com&name=Meu+Site
 *     1. Registra conta automaticamente
 *     2. Redireciona para authorize-application.php do WordPress com a chave embutida no success_url
 *     3. WordPress aprova → volta para o plugin com user_login, password, techsites_key
 *     4. Plugin salva tudo automaticamente
 *
 *  B) FLUXO MANUAL (usuário acessa diretamente)
 *     - Passo 1: Criar conta / colar chave
 *     - Passo 2: Conectar WP REST manualmente
 *     - Passo 3: Pronto
 */
import { useState, useEffect, useRef } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getApiBaseUrl, getApiKey, getWpApiHeaders, saveApiKey } from '@/lib/api-headers';
import {
  Key, CheckCircle2, Copy, Loader2, AlertTriangle, Globe, ShieldCheck,
  ArrowRight, Lock, Unlock, Eye, EyeOff, RefreshCw, Zap, ExternalLink,
} from 'lucide-react';

// ── helpers ───────────────────────────────────────────────────────────────────
const mask = (k: string) => `${k.slice(0, 8)}${'•'.repeat(18)}${k.slice(-4)}`;

// ── Auto-connect mode component ───────────────────────────────────────────────
function AutoConnectFlow({ siteUrl, email: initEmail, name: initName }: {
  siteUrl: string;
  email: string;
  name: string;
}) {
  const { toast } = useToast();
  const [phase, setPhase] = useState<'input' | 'registering' | 'redirecting' | 'error'>('input');
  const [email, setEmail] = useState(initEmail);
  const [name, setName] = useState(initName);
  const [errorMsg, setErrorMsg] = useState('');
  const ranRef = useRef(false);

  const doAutoConnect = async (em: string, nm: string) => {
    if (ranRef.current) return;
    ranRef.current = true;
    setPhase('registering');

    try {
      const res = await fetch(`${getApiBaseUrl()}wp/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em, name: nm || em, siteUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar conta');

      const apiKey: string = data.apiKey;
      saveApiKey(apiKey);

      // Build WordPress authorize-application.php URL
      // success_url receives: user_login, password (from WP) + techsites_key (our key)
      const successUrl = `${siteUrl}/wp-admin/admin.php?page=wp-techsites&auth=sucesso&techsites_key=${encodeURIComponent(apiKey)}`;
      const rejectUrl  = `${siteUrl}/wp-admin/admin.php?page=wp-techsites&tab=settings&connected=0`;

      const wpAuthUrl = `${siteUrl}/wp-admin/authorize-application.php?${new URLSearchParams({
        app_name:    'WP TechSites AI',
        app_id:      '7e9f3a8b-2c4d-4f6e-b8a1-9d5c7e3f2b1a', // fixed UUID required by WP
        success_url: successUrl,
        reject_url:  rejectUrl,
      }).toString()}`;

      setPhase('redirecting');

      // Small delay so user sees "Redirecionando" state
      setTimeout(() => {
        window.location.href = wpAuthUrl;
      }, 1200);

    } catch (err: any) {
      ranRef.current = false;
      setPhase('error');
      setErrorMsg(err.message);
    }
  };

  // If email is pre-filled, auto-start immediately
  useEffect(() => {
    if (initEmail) {
      doAutoConnect(initEmail, initName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const siteName = (() => { try { return new URL(siteUrl).hostname; } catch { return siteUrl; } })();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="w-full max-w-md space-y-4">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-3xl">
            ⬡
          </div>
          <h1 className="text-2xl font-bold">WP TechSites AI</h1>
          <p className="text-muted-foreground text-sm">Conectando automaticamente com <strong>{siteName}</strong></p>
        </div>

        {/* Status card */}
        <Card className="border-primary/20">
          <CardContent className="pt-6 space-y-4">

            {/* Step indicators */}
            <div className="space-y-3">
              <StepRow
                n={1}
                label="Criar conta TechSites AI"
                status={phase === 'input' ? 'waiting' : phase === 'registering' ? 'active' : 'done'}
              />
              <StepRow
                n={2}
                label="Redirecionar para autorização WordPress"
                status={phase === 'redirecting' ? 'active' : (phase === 'registering' || phase === 'input') ? 'waiting' : 'done'}
              />
              <StepRow
                n={3}
                label="WordPress salva as credenciais"
                status="waiting"
                hint="Acontece no seu site"
              />
            </div>

            {/* Input phase: ask for email if not provided */}
            {phase === 'input' && !initEmail && (
              <div className="pt-2 space-y-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Para criar sua conta gratuita, informe seu e-mail:
                </p>
                <div className="space-y-1.5">
                  <Label>E-mail *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com"
                    onKeyDown={e => e.key === 'Enter' && email && doAutoConnect(email, name)}
                    autoFocus
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={!email}
                  onClick={() => doAutoConnect(email, name)}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Conectar com 1 clique
                </Button>
              </div>
            )}

            {/* Active phases */}
            {phase === 'registering' && (
              <div className="flex items-center gap-3 pt-2 border-t">
                <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
                <p className="text-sm text-muted-foreground">Criando conta e gerando sua chave API…</p>
              </div>
            )}

            {phase === 'redirecting' && (
              <div className="flex items-center gap-3 pt-2 border-t">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Conta criada! Redirecionando…</p>
                  <p className="text-xs text-muted-foreground">
                    Indo para a tela de autorização do WordPress em <strong>{siteName}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {phase === 'error' && (
              <div className="space-y-3 pt-2 border-t">
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Erro ao conectar</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{errorMsg}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => { ranRef.current = false; setPhase('input'); setEmail(''); }}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
                </Button>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Security note */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground px-1">
          <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          <p>
            Seu WordPress usa a tela nativa de autorização de aplicativos. Nenhuma senha de login é compartilhada.
            A chave gerada pode ser revogada em <strong>Usuários → Seu Perfil → Senhas de Aplicação</strong>.
          </p>
        </div>

        {/* Manual fallback link */}
        <p className="text-center text-xs text-muted-foreground">
          Problemas? <a href="/api-keys" className="text-primary hover:underline">Usar configuração manual →</a>
        </p>
      </div>
    </div>
  );
}

function StepRow({ n, label, status, hint }: { n: number; label: string; status: 'waiting' | 'active' | 'done'; hint?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
        status === 'done'   ? 'bg-green-500/20 text-green-600'
        : status === 'active' ? 'bg-primary text-primary-foreground'
        : 'bg-muted text-muted-foreground'
      }`}>
        {status === 'done' ? <CheckCircle2 className="w-4 h-4" /> : status === 'active' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : n}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-none ${status === 'waiting' ? 'text-muted-foreground' : 'text-foreground'}`}>{label}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ApiKeysPage() {
  const { toast } = useToast();
  const [apiKey, setApiKeyState] = useState<string | null>(getApiKey());
  const [restConnected, setRestConnected] = useState(false);
  const [restUser, setRestUser] = useState('');

  // URL params
  const [autoMode, setAutoMode] = useState(false);
  const [autoSiteUrl, setAutoSiteUrl] = useState('');
  const [autoEmail, setAutoEmail] = useState('');
  const [autoName, setAutoName] = useState('');

  // Step 1 — Register / paste key
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regSiteUrl, setRegSiteUrl] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteValue, setPasteValue] = useState('');
  const [copied, setCopied] = useState(false);

  // Step 2 — Connect WP REST
  const [wpUrl, setWpUrl] = useState('');
  const [wpUser, setWpUser] = useState('');
  const [wpPass, setWpPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [restLoading, setRestLoading] = useState(false);

  // Derive current step
  const step = !apiKey ? 1 : !restConnected ? 2 : 3;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const su = params.get('site_url');
    const em = params.get('email');
    const nm = params.get('name');

    if (su) {
      // Auto-connect mode: plugin redirected here
      setAutoMode(true);
      setAutoSiteUrl(decodeURIComponent(su));
      setAutoEmail(em ? decodeURIComponent(em) : '');
      setAutoName(nm ? decodeURIComponent(nm) : '');
    } else {
      // Manual mode: pre-fill from params if any
      if (em) setRegEmail(decodeURIComponent(em));
    }
  }, []);

  // ── Register new account ───────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!regEmail || !regSiteUrl) {
      toast({ title: 'Preencha e-mail e URL do site', variant: 'destructive' });
      return;
    }
    setRegLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}wp/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, name: regName, siteUrl: regSiteUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao registrar');
      saveApiKey(data.apiKey);
      setApiKeyState(data.apiKey);
      toast({
        title: data.message || '✅ Conta criada!',
        description: `Chave: ${data.apiKey.slice(0, 8)}… — Cole no plugin WordPress`,
      });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setRegLoading(false);
    }
  };

  // ── Paste existing key ─────────────────────────────────────────────────────
  const handlePaste = () => {
    const k = pasteValue.trim();
    if (!k) { toast({ title: 'Cole uma chave válida', variant: 'destructive' }); return; }
    saveApiKey(k);
    setApiKeyState(k);
    toast({ title: '✅ Chave salva!', description: 'Agora conecte o WP REST API abaixo.' });
  };

  // ── Copy API key ───────────────────────────────────────────────────────────
  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast({ title: '✅ Chave copiada!', description: 'Cole nas configurações do plugin WordPress.' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Connect WP REST ────────────────────────────────────────────────────────
  const handleConnectRest = async () => {
    if (!apiKey) {
      toast({ title: 'Obtenha a chave WP TechSites primeiro (Passo 1)', variant: 'destructive' });
      return;
    }
    if (!wpUrl || !wpUser || !wpPass) {
      toast({ title: 'Preencha URL, usuário e senha de aplicação', variant: 'destructive' });
      return;
    }
    setRestLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}wp/connect-rest`, {
        method: 'POST',
        headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ wp_rest_url: wpUrl, wp_user: wpUser, wp_app_password: wpPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciais inválidas');
      setRestConnected(true);
      setRestUser(data.wp_user || wpUser);
      toast({ title: data.message || '✅ WordPress conectado!', description: `Usuário: ${data.wp_user}` });
    } catch (err: any) {
      toast({ title: 'Erro ao conectar WP REST', description: err.message, variant: 'destructive' });
    } finally {
      setRestLoading(false);
    }
  };

  // ── Auto-connect mode: render dedicated flow ──────────────────────────────
  if (autoMode && autoSiteUrl) {
    return (
      <AutoConnectFlow
        siteUrl={autoSiteUrl}
        email={autoEmail}
        name={autoName}
      />
    );
  }

  // ── Manual mode ───────────────────────────────────────────────────────────
  return (
    <DashboardShell>
      <div className="space-y-6 animate-slide-in-up max-w-2xl">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Chaves & Conexão</h1>
            <p className="text-sm text-muted-foreground">
              Obtenha sua chave API WP TechSites e conecte o WordPress em 2 passos.
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/30 border shrink-0">
            <Key className="w-3 h-3 mr-1" /> API Keys
          </Badge>
        </div>

        {/* ── Progress bar ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {[
            { n: 1, label: 'Chave API' },
            { n: 2, label: 'WP REST' },
            { n: 3, label: 'Pronto' },
          ].map(({ n, label }, i, arr) => (
            <div key={n} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                step === n ? 'bg-primary text-primary-foreground'
                : step > n ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                : 'bg-muted text-muted-foreground'
              }`}>
                {step > n ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{n}</span>}
                {label}
              </div>
              {i < arr.length - 1 && <div className="flex-1 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* ── Plugin users: 1-click option ────────────────────────────────── */}
        {step === 1 && (
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-4 flex items-center gap-4">
              <Zap className="w-8 h-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Tem o plugin WordPress instalado?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vá em <strong>WP Admin → WP TechSites → Configurações</strong> e clique em
                  "Conectar com TechSites AI" para configurar tudo automaticamente em 1 clique.
                </p>
              </div>
              <a
                href="https://wp.techsites.ai/api/plugins/wp-techsites-plugin-v2.4.0.zip"
                className="shrink-0"
              >
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" /> Plugin
                </Button>
              </a>
            </CardContent>
          </Card>
        )}

        {/* ── PASSO 1 — Obter Chave API ───────────────────────────────────── */}
        <Card className={step === 1 ? 'border-primary/40 shadow-sm' : step > 1 ? 'border-green-500/30' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {step > 1
                ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                : <Key className="w-4 h-4 text-primary" />}
              Passo 1 — Chave API WP TechSites
            </CardTitle>
            <CardDescription>
              {step > 1
                ? 'Chave obtida e salva. O plugin WordPress já pode usar esta chave.'
                : 'Crie uma conta ou cole a chave gerada pelo plugin WordPress.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step > 1 && apiKey ? (
              /* Already have key — show masked + copy */
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border font-mono text-xs text-muted-foreground truncate">
                    {mask(apiKey)}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-green-500" />
                    Cole esta chave nas configurações do plugin WordPress
                  </p>
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    onClick={() => { saveApiKey(''); setApiKeyState(null); setRestConnected(false); }}
                  >
                    <RefreshCw className="w-3 h-3" /> Trocar chave
                  </button>
                </div>
              </div>
            ) : pasteMode ? (
              /* Paste existing key */
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Cole abaixo a chave gerada pelo plugin WordPress após a primeira configuração:</p>
                <div className="flex gap-2">
                  <Input
                    value={pasteValue}
                    onChange={e => setPasteValue(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="font-mono text-sm"
                  />
                  <Button onClick={handlePaste} disabled={!pasteValue.trim()}>Salvar</Button>
                </div>
                <button className="text-xs text-primary hover:underline" onClick={() => setPasteMode(false)}>
                  ← Criar nova conta
                </button>
              </div>
            ) : (
              /* Register form */
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    <strong>Ordem importante:</strong> A senha REST API do WordPress é diferente desta chave.
                    Primeiro obtenha a Chave API WP TechSites abaixo, depois conecte o WP REST no Passo 2.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>E-mail *</Label>
                    <Input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="voce@exemplo.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Seu nome</Label>
                    <Input value={regName} onChange={e => setRegName(e.target.value)} placeholder="João Silva" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>URL do site WordPress *</Label>
                  <Input value={regSiteUrl} onChange={e => setRegSiteUrl(e.target.value)} placeholder="https://meusite.com" />
                  <p className="text-xs text-muted-foreground">URL principal do seu WordPress — sem barra no final</p>
                </div>

                <Button onClick={handleRegister} disabled={regLoading || !regEmail || !regSiteUrl} className="w-full">
                  {regLoading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando conta...</>
                    : <><Key className="w-4 h-4 mr-2" />Criar conta e obter chave grátis</>}
                </Button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex-1 h-px bg-border" />ou<div className="flex-1 h-px bg-border" />
                </div>

                <button className="w-full text-xs text-primary hover:underline py-1" onClick={() => setPasteMode(true)}>
                  Já tenho uma chave — colar aqui →
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── PASSO 2 — Conectar WP REST ──────────────────────────────────── */}
        <Card className={`transition-opacity ${
          step === 2 ? 'border-primary/40 shadow-sm'
          : step > 2 ? 'border-green-500/30'
          : 'opacity-50 pointer-events-none'
        }`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {step > 2
                ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                : step === 2 ? <Unlock className="w-4 h-4 text-primary" />
                : <Lock className="w-4 h-4 text-muted-foreground" />}
              Passo 2 — Conectar WP REST API
              {step === 1 && <Badge variant="outline" className="text-xs ml-auto">Aguardando Passo 1</Badge>}
            </CardTitle>
            <CardDescription>
              {step > 2
                ? `Conectado como "${restUser}" — write-back ativo para publicar conteúdo automaticamente.`
                : 'Use o usuário administrador do WordPress e uma Senha de Aplicação (não é a senha de login).'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step > 2 ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">WordPress conectado com sucesso</p>
                  <p className="text-xs text-muted-foreground">Usuário: {restUser} · Write-back ativo</p>
                </div>
                <button className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1" onClick={() => setRestConnected(false)}>
                  <RefreshCw className="w-3 h-3" /> Reconectar
                </button>
              </div>
            ) : (
              <>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
                  <Globe className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                    <strong>Senha de Aplicação ≠ Senha de login.</strong> No WordPress Admin vá em
                    <strong> Usuários → Seu Perfil → Senhas de Aplicação</strong>, crie uma nova com o nome
                    "WP TechSites" e cole abaixo.
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>URL do WordPress *</Label>
                  <Input value={wpUrl} onChange={e => setWpUrl(e.target.value)} placeholder="https://meusite.com/wp-json" />
                  <p className="text-xs text-muted-foreground">URL raiz do WordPress — sem /wp-admin ou /wp-json</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Usuário WordPress *</Label>
                    <Input value={wpUser} onChange={e => setWpUser(e.target.value)} placeholder="admin" autoComplete="username" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Senha de Aplicação *</Label>
                    <div className="relative">
                      <Input
                        type={showPass ? 'text' : 'password'}
                        value={wpPass}
                        onChange={e => setWpPass(e.target.value)}
                        placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                        autoComplete="new-password"
                        className="pr-10 font-mono text-sm"
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button onClick={handleConnectRest} disabled={restLoading || !apiKey || !wpUrl || !wpUser || !wpPass} className="w-full">
                  {restLoading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando credenciais...</>
                    : <><Globe className="w-4 h-4 mr-2" />Testar e Conectar WordPress</>}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* ── PASSO 3 — Tudo pronto ────────────────────────────────────────── */}
        {step === 3 && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-green-700 dark:text-green-400 mb-1">Site totalmente conectado!</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Todas as ferramentas estão liberadas. O dashboard pode publicar conteúdo, artigos e listings diretamente no seu WordPress.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Auditoria SEO', to: '/tools/seo-audit' },
                      { label: 'Artigos em Massa', to: '/tools/seo-articles' },
                      { label: 'Chatbot IA', to: '/tools/chatbot' },
                      { label: 'Directory Builder', to: '/tools/scraping' },
                    ].map(tool => (
                      <a key={tool.to} href={tool.to}>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          {tool.label} <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info card: API server URL */}
        <Card className="border-dashed">
          <CardContent className="p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" /> URL do Servidor API (para configurar no plugin)
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-3 py-1.5 rounded-lg font-mono text-foreground truncate">
                {window.location.origin}/api
              </code>
              <Button variant="outline" size="sm" className="shrink-0 h-7" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/api`); toast({ title: 'URL copiada!' }); }}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Cole este endereço nas configurações do plugin WordPress — campo "API Server URL".</p>
          </CardContent>
        </Card>

      </div>
    </DashboardShell>
  );
}
