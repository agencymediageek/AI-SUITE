import { useState } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getApiBaseUrl, getWpApiHeaders } from '@/lib/api-headers';
import {
  Loader2, Layout, Wand2, Eye, CheckCircle2, ExternalLink,
  PlusCircle, Globe
} from 'lucide-react';

const PAGE_TEMPLATES = [
  { value: 'landing', label: '🚀 Landing Page' },
  { value: 'about', label: '👋 Sobre Nós' },
  { value: 'services', label: '💼 Serviços' },
  { value: 'contact', label: '📞 Contato' },
  { value: 'blog', label: '📝 Blog / Notícias' },
  { value: 'gallery', label: '🖼️ Galeria' },
  { value: 'faq', label: '❓ FAQ' },
  { value: 'pricing', label: '💰 Preços / Planos' },
  { value: 'directory', label: '📍 Directory / Listagens' },
  { value: 'custom', label: '✏️ Página personalizada' },
];

const NICHES = [
  'Gastronomia', 'Turismo', 'Saúde & Bem-estar', 'Tecnologia', 'Moda & Beleza',
  'Educação', 'Imóveis', 'Automotivo', 'Pet Shop', 'Jurídico', 'Financeiro', 'Outro',
];

export default function PageBuilderPage() {
  const { toast } = useToast();
  const [pageName, setPageName] = useState('');
  const [template, setTemplate] = useState('landing');
  const [niche, setNiche] = useState('');
  const [description, setDescription] = useState('');
  const [addToMenu, setAddToMenu] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ html: string; wp_page_url?: string; title?: string } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [previewMode, setPreviewMode] = useState<'html' | 'preview'>('preview');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageName.trim()) {
      toast({ title: 'Informe o nome da página', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const prompt = `Crie uma ${PAGE_TEMPLATES.find(t => t.value === template)?.label || template} chamada "${pageName}" para o nicho de ${niche || 'negócios'}. ${description}`;
      const res = await fetch(`${getApiBaseUrl()}wp/page-from-url`, {
        method: 'POST',
        headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `generate:${pageName}`,
          page_type: template,
          niche: niche || 'geral',
          description: prompt,
          page_name: pageName,
          add_to_menu: addToMenu,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar página');
      setResult({
        html: data.html || data.content || data.page_content || `<div class="page-preview"><h1>${pageName}</h1><p>Página gerada com sucesso!</p></div>`,
        wp_page_url: data.wp_page_url || data.pageUrl,
        title: data.title || pageName,
      });
      toast({ title: '✅ Página gerada!', description: `"${pageName}" está pronta para publicar.` });
    } catch (err: any) {
      // Fallback: generate content
      try {
        const res2 = await fetch(`${getApiBaseUrl()}wp/generate-content`, {
          method: 'POST',
          headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: `${template} page: ${pageName} — ${description || niche}`,
            type: 'page',
            tone: 'professional',
            language: 'pt',
          }),
        });
        const data2 = await res2.json();
        if (!res2.ok) throw new Error(data2.error || err.message);
        setResult({ html: data2.content || '', title: data2.title || pageName });
        toast({ title: '✅ Conteúdo gerado!' });
      } catch (err2: any) {
        toast({ title: 'Erro', description: err2.message, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!result) return;
    setPublishing(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}wp/create-page`, {
        method: 'POST',
        headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result.title || pageName,
          content: result.html,
          add_to_menu: addToMenu,
          status: 'publish',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPublished(true);
        if (data.page_url || data.wp_page_url) {
          setResult(prev => prev ? { ...prev, wp_page_url: data.page_url || data.wp_page_url } : prev);
        }
        toast({ title: '✅ Página publicada no WordPress!' });
      } else {
        throw new Error(data.error || 'Erro ao publicar');
      }
    } catch {
      toast({ title: 'Copie o HTML', description: 'Cole manualmente no editor do WordPress.', variant: 'default' });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6 animate-slide-in-up max-w-5xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Construtor de Página</h1>
            <p className="text-sm text-muted-foreground">
              Gere páginas HTML completas com hero, cards e CSS seguindo a identidade do seu site — publique direto no WordPress.
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/30 border">
            <Layout className="w-3 h-3 mr-1" /> AI Builder
          </Badge>
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleGenerate} className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Configurar Página</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="page-name">Nome da Página *</Label>
                    <Input
                      id="page-name"
                      value={pageName}
                      onChange={e => setPageName(e.target.value)}
                      placeholder="Ex: Nossos Serviços, Sobre Nós..."
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Tipo de Página</Label>
                    <Select value={template} onValueChange={setTemplate}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAGE_TEMPLATES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Nicho / Segmento</Label>
                    <Select value={niche} onValueChange={setNiche}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {NICHES.map(n => (
                          <SelectItem key={n} value={n.toLowerCase()}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description">Descrição / Instruções</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Ex: Página com hero animado, 3 cards de serviços, depoimentos de clientes e formulário de contato..."
                      className="min-h-[100px] text-sm resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border">
                    <input
                      type="checkbox"
                      id="add-menu"
                      checked={addToMenu}
                      onChange={e => setAddToMenu(e.target.checked)}
                      className="accent-primary"
                    />
                    <Label htmlFor="add-menu" className="text-sm cursor-pointer">
                      Adicionar ao menu de navegação
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" disabled={loading || !pageName} className="w-full" size="lg">
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando página...</>
                ) : (
                  <><Wand2 className="w-4 h-4 mr-2" />Gerar Página com IA</>
                )}
              </Button>
            </form>
          </div>

          {/* Preview */}
          <div className="lg:col-span-3">
            <Card className={`h-full ${result ? 'border-primary/20' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    {result ? result.title || pageName : 'Preview'}
                  </CardTitle>
                  {result && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant={previewMode === 'preview' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('preview')}
                        className="h-7 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />Visual
                      </Button>
                      <Button
                        variant={previewMode === 'html' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('html')}
                        className="h-7 text-xs"
                      >
                        HTML
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-3">
                    {previewMode === 'preview' ? (
                      <div className="border border-border rounded-lg overflow-hidden bg-white" style={{ height: '380px' }}>
                        <iframe
                          srcDoc={result.html}
                          className="w-full h-full"
                          title="Page Preview"
                          sandbox="allow-same-origin"
                        />
                      </div>
                    ) : (
                      <Textarea
                        value={result.html}
                        onChange={e => setResult(prev => prev ? { ...prev, html: e.target.value } : prev)}
                        className="font-mono text-xs min-h-[380px] resize-none"
                      />
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={handlePublish}
                        disabled={publishing || published}
                        className="flex-1"
                      >
                        {published ? (
                          <><CheckCircle2 className="w-4 h-4 mr-2" />Publicado!</>
                        ) : publishing ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publicando...</>
                        ) : (
                          <><PlusCircle className="w-4 h-4 mr-2" />Publicar no WordPress</>
                        )}
                      </Button>
                      {result.wp_page_url && (
                        <Button variant="outline" size="icon" asChild>
                          <a href={result.wp_page_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                    {addToMenu && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Será adicionada ao menu de navegação automaticamente.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[380px] text-center">
                    <Layout className="w-12 h-12 text-muted-foreground/20 mb-3" />
                    <p className="text-sm text-muted-foreground">Configure a página e clique<br />em "Gerar Página com IA"</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">HTML completo com hero, cards e CSS</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
