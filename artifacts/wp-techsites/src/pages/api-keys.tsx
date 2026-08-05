/**
 * /api-keys — Página para obter a chave WP TechSites e conectar o WP REST API.
 *
 * Fluxo de 3 passos:
 *   1. Obter Chave API WP TechSites (do plugin ou criando conta aqui)
 *   2. Conectar credenciais WP REST (usuário + Application Password)
 *   3. Pronto — todas as ferramentas liberadas
 *
 * IMPORTANTE: As credenciais WP REST SÓ podem ser salvas APÓS ter a Chave API WP TechSites.
 * Se o usuário tentar conectar o WP REST sem a chave, o server retornará 401.
 * Esta página trata esse caso com uma mensagem clara.
 */
import { useState, useEffect } from 'react';
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
  ArrowRight, Lock, Unlock, Eye, EyeOff, RefreshCw,
} from 'lucide-react';

// ── helpers ───────────────────────────────────────────────────────────────────
const mask = (k: string) => `${k.slice(0, 8)}${'•'.repeat(18)}${k.slice(-4)}`;

// ── Component ─────────────────────────────────────────────────────────────────
export default function ApiKeysPage() {
  const { toast } = useToast();
  const [apiKey, setApiKeyState] = useState<string | null>(getApiKey());
  const [restConnected, setRestConnected] = useState(false);
  const [restUser, setRestUser] = useState('');

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
    // Auto-fill site URL from any hint in page (e.g. if plugin redirected here)
    const params = new URLSearchParams(window.location.search);
    const su = params.get('site_url');
    if (su) setRegSiteUrl(decodeURIComponent(su));
    const em = params.get('email');
    if (em) setRegEmail(decodeURIComponent(em));
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
      toast({
        title: 'Erro ao conectar WP REST',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setRestLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
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

        {/* ── Progress bar ────────────────────────────────────────────────── */}
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
                {step > n
                  ? <CheckCircle2 className="w-3.5 h-3.5" />
                  : <span>{n}</span>
                }
                {label}
              </div>
              {i < arr.length - 1 && <div className="flex-1 h-px bg-border" />}
            </div>
          ))}
        </div>

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
                  <Button onClick={handlePaste} disabled={!pasteValue.trim()}>
                    Salvar
                  </Button>
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
                    <Input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="voce@exemplo.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Seu nome</Label>
                    <Input
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="João Silva"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>URL do site WordPress *</Label>
                  <Input
                    value={regSiteUrl}
                    onChange={e => setRegSiteUrl(e.target.value)}
                    placeholder="https://meusite.com"
                  />
                  <p className="text-xs text-muted-foreground">URL principal do seu WordPress — sem barra no final</p>
                </div>

                <Button onClick={handleRegister} disabled={regLoading || !regEmail || !regSiteUrl} className="w-full">
                  {regLoading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando conta...</>
                    : <><Key className="w-4 h-4 mr-2" />Criar conta e obter chave grátis</>}
                </Button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex-1 h-px bg-border" />
                  ou
                  <div className="flex-1 h-px bg-border" />
                </div>

                <button
                  className="w-full text-xs text-primary hover:underline py-1"
                  onClick={() => setPasteMode(true)}
                >
                  Já tenho uma chave — colar aqui →
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── PASSO 2 — Conectar WP REST ─────────────────────────────────── */}
        <Card className={`transition-opacity ${
          step === 2 ? 'border-primary/40 shadow-sm' :
          step > 2 ? 'border-green-500/30' :
          'opacity-50 pointer-events-none'
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
                <button
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  onClick={() => setRestConnected(false)}
                >
                  <RefreshCw className="w-3 h-3" /> Reconectar
                </button>
              </div>
            ) : (
              <>
                {/* Warning: password type clarification */}
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
                  <Input
                    value={wpUrl}
                    onChange={e => setWpUrl(e.target.value)}
                    placeholder="https://be.net.techsites.ai"
                  />
                  <p className="text-xs text-muted-foreground">URL raiz do WordPress — sem /wp-admin ou /wp-json</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Usuário WordPress *</Label>
                    <Input
                      value={wpUser}
                      onChange={e => setWpUser(e.target.value)}
                      placeholder="admin"
                      autoComplete="username"
                    />
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
                      <button
                        type="button"
                        onClick={() => setShowPass(v => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleConnectRest}
                  disabled={restLoading || !apiKey || !wpUrl || !wpUser || !wpPass}
                  className="w-full"
                >
                  {restLoading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando credenciais...</>
                    : <><Globe className="w-4 h-4 mr-2" />Testar e Conectar WordPress</>}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* ── PASSO 3 — Tudo pronto ──────────────────────────────────────── */}
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
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 h-7"
                onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/api`); toast({ title: 'URL copiada!' }); }}
              >
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
