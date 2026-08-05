import { useState, useRef, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getApiBaseUrl, getWpApiHeaders } from '@/lib/api-headers';
import { Loader2, Newspaper, CheckCircle2, ExternalLink, Image, Info, Globe } from 'lucide-react';

export default function ArticleWithImagesPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [city, setCity] = useState('');
  const [niche, setNiche] = useState('directory');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ postUrl?: string; title?: string; message?: string } | null>(null);
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 60_000); // 60s — AI + images

    if (mountedRef.current) { setLoading(true); setResult(null); }

    try {
      const res = await fetch(`${getApiBaseUrl()}wp/article-with-images`, {
        method: 'POST',
        headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          city: city || undefined,
          niche,
          keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!mountedRef.current) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar artigo');
      setResult(data);
      toast({ title: '✅ Artigo publicado!', description: data.title || 'Artigo com imagens criado no WordPress' });
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (!mountedRef.current) return;
      if (err?.name === 'AbortError') {
        toast({ title: '⏱️ Tempo esgotado', description: 'O servidor demorou mais de 60s. O WordPress pode não estar conectado.', variant: 'destructive' });
      } else {
        toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6 animate-slide-in-up max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Artigo com Imagens</h1>
          <p className="text-muted-foreground">
            Gera um artigo SEO completo com imagens do Unsplash e publica direto no seu WordPress.
          </p>
        </div>

        {/* How it works */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Globe className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-foreground space-y-1">
              <p className="font-semibold">📤 O que acontece com o artigo gerado?</p>
              <p className="text-muted-foreground">
                A IA escreve o artigo, busca <strong>imagens do Unsplash</strong> relacionadas ao tema e
                publica automaticamente como <strong>rascunho no seu WordPress</strong> via API REST.
                Você verá um link direto para revisar e publicar no WP Admin.
              </p>
              <p className="text-muted-foreground">⚠️ Requer WordPress conectado com credenciais REST (veja Configurações).</p>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Newspaper className="w-4 h-4" /> Configurar Artigo
              </CardTitle>
              <CardDescription>
                A IA escreve, busca imagens relevantes e publica automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Tema do artigo *</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Ex: Como descalcificar a glândula pineal naturalmente"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade (opcional)</Label>
                  <Input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="Ex: Curitiba" />
                </div>
                <div className="space-y-2">
                  <Label>Nicho</Label>
                  <Select value={niche} onValueChange={setNiche}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="directory">Guia/Diretório</SelectItem>
                      <SelectItem value="food">Gastronomia</SelectItem>
                      <SelectItem value="tourism">Turismo</SelectItem>
                      <SelectItem value="health">Saúde & Bem-estar</SelectItem>
                      <SelectItem value="real-estate">Imóveis</SelectItem>
                      <SelectItem value="business">Negócios</SelectItem>
                      <SelectItem value="spirituality">Espiritualidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Palavras-chave SEO (opcional, separadas por vírgula)</Label>
                <Input
                  id="keywords"
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  placeholder="Ex: glândula pineal, terceiro olho, detox"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <Image className="w-4 h-4 flex-shrink-0" />
            <span>Imagens profissionais do Unsplash adicionadas automaticamente · Custo: 15 créditos</span>
          </div>

          <Button type="submit" disabled={loading || !topic.trim()} className="w-full" size="lg">
            {loading
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando artigo com imagens… aguarde até 60s</>
              : <><Newspaper className="w-4 h-4 mr-2" /> Gerar e Publicar Artigo</>}
          </Button>
          {loading && (
            <p className="text-xs text-center text-muted-foreground -mt-4">
              A IA está escrevendo e buscando imagens. Não feche esta página.
            </p>
          )}
        </form>

        {result && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{result.title || 'Artigo publicado!'}</p>
                  <p className="text-sm text-muted-foreground mt-1">{result.message || 'Artigo salvo como rascunho no WordPress'}</p>
                  {result.postUrl && (
                    <a href={result.postUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> Abrir rascunho no WordPress
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
