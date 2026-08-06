import { useState, useRef, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getApiBaseUrl, getWpApiHeaders } from '@/lib/api-headers';
import { Loader2, Wand2, Copy, CheckCircle2, FileText, ClipboardCopy } from 'lucide-react';
import { ToolInfoCard } from '@/components/ui/tool-info-card';

interface ContentResult {
  title: string;
  content: string;
  metaDescription?: string | null;
  excerpt?: string | null;
  creditsUsed?: number;
  creditsRemaining?: number;
}

export default function ContentGeneratorPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('post');
  const [tone, setTone] = useState('professional');
  const [language, setLanguage] = useState('pt-BR');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
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
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    if (mountedRef.current) { setLoading(true); setResult(null); }

    try {
      const res = await fetch(`${getApiBaseUrl()}wp/generate-content`, {
        method: 'POST',
        headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, type, tone, language }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!mountedRef.current) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar conteúdo');
      setResult(data);
      toast({
        title: '✅ Conteúdo gerado!',
        description: `Usado ${data.creditsUsed ?? 5} créditos. ${data.creditsRemaining ?? 0} restantes.`,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (!mountedRef.current) return;
      if (err?.name === 'AbortError') {
        toast({ title: '⏱️ Tempo esgotado', description: 'O servidor demorou mais de 60s. Tente novamente.', variant: 'destructive' });
      } else {
        toast({ title: 'Erro ao gerar conteúdo', description: err.message, variant: 'destructive' });
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: 'Copiado!', description: `${field} copiado.` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <DashboardShell>
      <div className="space-y-6 animate-slide-in-up max-w-5xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gerador de Conteúdo IA</h1>
            <p className="text-muted-foreground">
              Crie conteúdo SEO otimizado para páginas, posts e e-mails do seu WordPress.
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            <Wand2 className="w-3 h-3 mr-1" />
            5 créditos
          </Badge>
        </div>

        <ToolInfoCard
          steps={[
            { icon: '✍️', text: 'Descreva o tema, tipo de conteúdo e tom desejado' },
            { icon: '🤖', text: 'A IA gera título, meta description e HTML completo otimizado para SEO' },
            { icon: '📋', text: 'Copie cada seção e cole diretamente no editor do WordPress' },
          ]}
          result={{ label: '📋 Exibido na tela', color: 'purple', detail: '— Copie e cole no WP' }}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCopy className="w-4 h-4" /> Configurar Conteúdo
            </CardTitle>
            <CardDescription>
              Descreva o que quer escrever e a IA cria título, meta description e HTML completo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Tema ou Descrição *</Label>
                <Input
                  id="topic"
                  placeholder="Ex: 10 dicas para aumentar as vendas online com WordPress"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  data-testid="input-topic"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Conteúdo</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type" data-testid="select-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post">Artigo de Blog</SelectItem>
                      <SelectItem value="page">Página</SelectItem>
                      <SelectItem value="section">Seção de Página</SelectItem>
                      <SelectItem value="email-marketing">E-mail Marketing</SelectItem>
                      <SelectItem value="social">Post para Redes Sociais</SelectItem>
                      <SelectItem value="ad">Anúncio / Copy de Vendas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Tom</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone" data-testid="select-tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Profissional</SelectItem>
                      <SelectItem value="friendly">Amigável</SelectItem>
                      <SelectItem value="persuasive">Persuasivo</SelectItem>
                      <SelectItem value="technical">Técnico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (BR)</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !topic.trim()}
                data-testid="button-generate-content"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando conteúdo… aguarde</>
                ) : (
                  <><Wand2 className="w-4 h-4 mr-2" />Gerar Conteúdo</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-chart-3/30 bg-chart-3/5">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>Conteúdo Gerado</CardTitle>
                  <CardDescription>
                    Copie as seções individualmente e cole no editor do WordPress.
                  </CardDescription>
                </div>
                {result.creditsUsed && (
                  <Badge variant="secondary">{result.creditsUsed} créditos usados</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Título</Label>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(result.title, 'Título')}
                    data-testid="button-copy-title">
                    {copiedField === 'Título'
                      ? <CheckCircle2 className="w-4 h-4 text-chart-3" />
                      : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="p-4 bg-background rounded-lg border border-border">
                  <p className="text-lg font-semibold text-foreground">{result.title}</p>
                </div>
              </div>

              {result.metaDescription && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Meta Description</Label>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(result.metaDescription!, 'Meta Description')}
                        data-testid="button-copy-meta">
                        {copiedField === 'Meta Description'
                          ? <CheckCircle2 className="w-4 h-4 text-chart-3" />
                          : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="p-3 bg-background rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">{result.metaDescription}</p>
                    </div>
                  </div>
                </>
              )}

              {result.excerpt && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Resumo (Excerpt)</Label>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(result.excerpt!, 'Resumo')}
                        data-testid="button-copy-excerpt">
                        {copiedField === 'Resumo'
                          ? <CheckCircle2 className="w-4 h-4 text-chart-3" />
                          : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="p-3 bg-background rounded-lg border border-border">
                      <p className="text-sm text-foreground">{result.excerpt}</p>
                    </div>
                  </div>
                </>
              )}

              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Conteúdo HTML Completo</Label>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(result.content, 'Conteúdo')}
                    data-testid="button-copy-content">
                    {copiedField === 'Conteúdo'
                      ? <CheckCircle2 className="w-4 h-4 text-chart-3" />
                      : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="p-4 bg-background rounded-lg border border-border max-h-96 overflow-y-auto">
                  <div
                    className="prose prose-sm max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: result.content }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-xs text-foreground">
                  Cole o conteúdo diretamente no editor do WordPress (modo HTML/código) ou copie seções individuais.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
