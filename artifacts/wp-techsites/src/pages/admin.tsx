import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getApiBaseUrl } from '@/lib/api-headers';
import { Globe, Coins, Users, Wifi, WifiOff, RefreshCw, ShieldCheck, Plus } from 'lucide-react';

const ADMIN_TOKEN = 'techsites-admin-2026';

interface WpSite {
  id: number;
  apiKey: string;
  siteName: string;
  siteUrl: string;
  ownerEmail: string;
  ownerName: string;
  plan: string;
  credits: number;
  isActive: boolean;
  wpConnected: boolean;
  createdAt: string;
  lastSeenAt: string | null;
}

function planColor(plan: string) {
  if (plan === 'pro') return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
  if (plan === 'starter') return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
  return 'bg-muted text-muted-foreground border-border';
}

export default function AdminPage() {
  const { toast } = useToast();
  const [sites, setSites] = useState<WpSite[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creditInput, setCreditInput] = useState('');

  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}wp/admin/sites`, {
        headers: { 'X-Admin-Token': ADMIN_TOKEN },
      });
      if (!res.ok) throw new Error('Unauthorized');
      setSites(await res.json());
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateSite = async (id: number, patch: Record<string, any>) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}wp/admin/sites/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': ADMIN_TOKEN },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error('Failed');
      await fetchSites();
      setEditingId(null);
      toast({ title: 'Atualizado!' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const totalCredits = sites?.reduce((s, x) => s + x.credits, 0) ?? 0;
  const connected = sites?.filter(s => s.wpConnected).length ?? 0;

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">WP TechSites Admin</h1>
                <p className="text-xs text-muted-foreground">Painel de Controle — TechSites</p>
              </div>
            </div>
            <Button onClick={fetchSites} disabled={loading} size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {sites ? 'Atualizar' : 'Carregar Sites'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* KPI Cards */}
        {sites && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{sites.length}</p>
                  <p className="text-sm text-muted-foreground">Sites Registrados</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{connected}</p>
                  <p className="text-sm text-muted-foreground">WP Conectados</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCredits.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Créditos Totais</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sites table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" /> Sites Conectados
            </CardTitle>
            <CardDescription>
              Todos os sites WordPress gerenciados pela plataforma WP TechSites
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sites && !loading && (
              <div className="text-center py-12 text-muted-foreground">
                <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Clique em "Carregar Sites" para ver os dados</p>
              </div>
            )}
            {loading && (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}
              </div>
            )}
            {sites && sites.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">Nenhum site registrado ainda.</p>
            )}
            {sites && sites.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-left">
                      <th className="pb-3 font-medium">Site</th>
                      <th className="pb-3 font-medium">Dono</th>
                      <th className="pb-3 font-medium">Plano</th>
                      <th className="pb-3 font-medium">Créditos</th>
                      <th className="pb-3 font-medium">WP</th>
                      <th className="pb-3 font-medium">Ativo</th>
                      <th className="pb-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sites.map(site => (
                      <tr key={site.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 pr-4">
                          <div>
                            <p className="font-medium text-foreground">{site.siteName}</p>
                            <a href={site.siteUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline truncate max-w-[200px] block">
                              {site.siteUrl}
                            </a>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div>
                            <p className="text-foreground">{site.ownerName || '—'}</p>
                            <p className="text-xs text-muted-foreground">{site.ownerEmail}</p>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className={planColor(site.plan)}>
                            {site.plan}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          {editingId === site.id ? (
                            <div className="flex gap-1 items-center">
                              <Input
                                value={creditInput}
                                onChange={e => setCreditInput(e.target.value)}
                                className="w-20 h-7 text-xs"
                                type="number"
                                min="0"
                              />
                              <Button size="sm" className="h-7 px-2 text-xs"
                                onClick={() => updateSite(site.id, { credits: Number(creditInput) })}>
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingId(site.id); setCreditInput(String(site.credits)); }}
                              className="font-medium text-foreground hover:text-primary transition-colors"
                            >
                              {site.credits.toLocaleString()} <span className="text-xs text-muted-foreground">✏️</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {site.wpConnected
                            ? <Wifi className="w-4 h-4 text-green-600" />
                            : <WifiOff className="w-4 h-4 text-muted-foreground" />}
                        </td>
                        <td className="py-3 pr-4">
                          <Button
                            variant="ghost" size="sm"
                            className={`h-7 px-2 text-xs ${site.isActive ? 'text-green-600' : 'text-destructive'}`}
                            onClick={() => updateSite(site.id, { isActive: !site.isActive })}
                          >
                            {site.isActive ? 'Ativo' : 'Inativo'}
                          </Button>
                        </td>
                        <td className="py-3">
                          <div className="text-xs text-muted-foreground">
                            {site.lastSeenAt
                              ? new Date(site.lastSeenAt).toLocaleDateString('pt-BR')
                              : 'Nunca'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Keys */}
        {sites && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Keys</CardTitle>
              <CardDescription>Chaves para copiar e instalar nos sites</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {sites.map(site => (
                <div key={site.id} className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground w-40 truncate">{site.siteName}</span>
                  <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono flex-1 truncate">
                    {site.apiKey}
                  </code>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs"
                    onClick={() => { navigator.clipboard.writeText(site.apiKey); toast({ title: 'Copiado!' }); }}>
                    Copiar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
