import { useState } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getApiBaseUrl, getWpApiHeaders } from '@/lib/api-headers';
import { Loader2, Newspaper, CheckCircle2, ExternalLink, Image } from 'lucide-react';

export default function ArticleWithImagesPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [city, setCity] = useState('');
  const [niche, setNiche] = useState('directory');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ postUrl?: string; title?: string; message?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
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
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar artigo');
      setResult(data);
      toast({
        title: '✅ Artigo publicado!',
        description: data.title || 'Artigo com imagens criado no WordPress',
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Artigo com Imagens</h1>
          <p className="text-muted-foreground">
            Gera um artigo SEO completo com imagens do Unsplash e publica direto no seu WordPress em segundos.
          </p>
        </div>

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
                  placeholder="Ex: Melhores restaurantes do Batel"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade (opcional)</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Ex: Curitiba"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nicho</Label>
                  <Select value={niche} onValueChange={setNiche}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="directory">Guia/Diretório</SelectItem>
                      <SelectItem value="food">Gastronomia</SelectItem>
                      <SelectItem value="tourism">Turismo</SelectItem>
                      <SelectItem value="health">Saúde & Bem-estar</SelectItem>
                      <SelectItem value="real-estate">Imóveis</SelectItem>
                      <SelectItem value="business">Negócios</SelectItem>
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
                  placeholder="Ex: restaurantes curitiba, batel, jantar"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <Image className="w-4 h-4 flex-shrink-0" />
            <span>Imagens profissionais do Unsplash serão adicionadas automaticamente ao artigo</span>
          </div>

          <Button type="submit" disabled={loading || !topic.trim()} className="w-full" size="lg">
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando artigo com imagens...</>
            ) : (
              <><Newspaper className="w-4 h-4 mr-2" /> Gerar e Publicar Artigo</>
            )}
          </Button>
        </form>

        {result && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{result.title || 'Artigo publicado!'}</p>
                  <p className="text-sm text-muted-foreground mt-1">{result.message || 'Artigo publicado com imagens no WordPress'}</p>
                  {result.postUrl && (
                    <a href={result.postUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> Ver artigo no WordPress
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
