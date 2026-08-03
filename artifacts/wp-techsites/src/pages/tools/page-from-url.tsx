import { useState } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getApiBaseUrl, getWpApiHeaders } from '@/lib/api-headers';
import { Loader2, Link2, FileText, CheckCircle2, ExternalLink } from 'lucide-react';

export default function PageFromUrlPage() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ pageUrl?: string; title?: string; message?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}wp/page-from-url`, {
        method: 'POST',
        headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_url: url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar página');
      setResult(data);
      toast({
        title: '✅ Página criada!',
        description: data.title || 'Página publicada no WordPress',
      });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6 animate-slide-in-up max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Página de Empresa</h1>
          <p className="text-muted-foreground">
            Cole a URL de qualquer empresa — a IA extrai as informações e cria uma página completa no seu WordPress.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Link2 className="w-4 h-4" /> URL da Empresa
            </CardTitle>
            <CardDescription>
              Funciona com qualquer site: Google My Business, site oficial, perfil de rede social, etc.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL para importar</Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://empresa.com.br"
                  required
                />
              </div>
              <Button type="submit" disabled={loading || !url.trim()} className="w-full" size="lg">
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando página...</>
                ) : (
                  <><FileText className="w-4 h-4 mr-2" /> Criar Página no WordPress</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="p-5">
            <h3 className="font-medium text-foreground mb-3 text-sm">O que a IA extrai automaticamente:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              {['Nome da empresa', 'Descrição completa', 'Endereço', 'Telefone', 'Horários', 'Website', 'Redes sociais', 'Fotos'].map(item => (
                <div key={item} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{result.title || 'Página criada!'}</p>
                  <p className="text-sm text-muted-foreground mt-1">{result.message || 'Publicada com sucesso no WordPress'}</p>
                  {result.pageUrl && (
                    <a href={result.pageUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> Ver página no WordPress
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
