import { useState } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getApiBaseUrl, getWpApiHeaders } from '@/lib/api-headers';
import {
  Loader2, Edit3, Wand2, Copy, CheckCircle2, Bold, Italic,
  List, AlignLeft, Image, Link, Heading1, Heading2
} from 'lucide-react';

const IMPROVE_ACTIONS = [
  { value: 'melhorar_seo', label: '🎯 Melhorar SEO' },
  { value: 'reescrever', label: '✍️ Reescrever com mais qualidade' },
  { value: 'expandir', label: '📝 Expandir o conteúdo' },
  { value: 'resumir', label: '✂️ Resumir' },
  { value: 'traduzir_en', label: '🇺🇸 Traduzir para Inglês' },
  { value: 'traduzir_es', label: '🇪🇸 Traduzir para Espanhol' },
  { value: 'tom_profissional', label: '💼 Tom mais profissional' },
  { value: 'tom_informal', label: '🎉 Tom mais descontraído' },
  { value: 'adicionar_cta', label: '🚀 Adicionar Call-to-Action' },
];

export default function WysiwygPage() {
  const { toast } = useToast();
  const [postId, setPostId] = useState('');
  const [postType, setPostType] = useState('post');
  const [content, setContent] = useState('');
  const [action, setAction] = useState('melhorar_seo');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const handleImprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({ title: 'Cole o conteúdo que deseja melhorar', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const instruction = action === 'custom'
        ? customPrompt
        : IMPROVE_ACTIONS.find(a => a.value === action)?.label.split(' ').slice(1).join(' ') || action;

      const res = await fetch(`${getApiBaseUrl()}wp/chat-editor`, {
        method: 'POST',
        headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId || null,
          post_type: postType,
          action: instruction,
          content,
          message: `${instruction}: ${content.slice(0, 500)}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao processar');
      setResult(data.content || data.improved_content || data.result || data.message || '');
      toast({ title: '✅ Conteúdo melhorado com IA!' });
    } catch (err: any) {
      // Fallback: use generate-content
      try {
        const res2 = await fetch(`${getApiBaseUrl()}wp/generate-content`, {
          method: 'POST',
          headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: `${action}: ${content.slice(0, 300)}`,
            type: postType,
            tone: 'professional',
            language: 'pt',
          }),
        });
        const data2 = await res2.json();
        if (!res2.ok) throw new Error(data2.error || err.message);
        setResult(data2.content || '');
        toast({ title: '✅ Conteúdo processado!' });
      } catch (err2: any) {
        toast({ title: 'Erro', description: err2.message, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      toast({ title: 'Copiado!', description: 'Cole no editor do WordPress.' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePublish = async () => {
    if (!result || !postId) return;
    setPublishing(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}wp/update-post`, {
        method: 'POST',
        headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, content: result }),
      });
      if (res.ok) {
        setPublished(true);
        toast({ title: '✅ Publicado no WordPress!' });
      } else {
        throw new Error('Erro ao publicar');
      }
    } catch {
      // Copy as fallback
      handleCopy();
      toast({ title: 'Copiado para área de transferência', description: 'Cole manualmente no WordPress.' });
    } finally {
      setPublishing(false);
    }
  };

  const insertTag = (tag: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const replacement = tag === 'h2' ? `<h2>${selected || 'Título'}</h2>` :
      tag === 'b' ? `<b>${selected}</b>` :
      tag === 'i' ? `<i>${selected}</i>` :
      tag === 'ul' ? `<ul>\n  <li>${selected || 'Item'}</li>\n</ul>` :
      selected;
    setContent(content.slice(0, start) + replacement + content.slice(end));
  };

  return (
    <DashboardShell>
      <div className="space-y-6 animate-slide-in-up max-w-4xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Editor WYSIWYG</h1>
            <p className="text-sm text-muted-foreground">
              Edite qualquer página ou post com assistência de IA — melhore SEO, reescreva, traduza e muito mais.
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/30 border">
            <Edit3 className="w-3 h-3 mr-1" /> IA Powered
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Left: Input */}
          <form onSubmit={handleImprove} className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Origem do Conteúdo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="post-id">ID do Post/Página</Label>
                    <Input id="post-id" value={postId} onChange={e => setPostId(e.target.value)} placeholder="Ex: 42" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tipo</Label>
                    <Select value={postType} onValueChange={setPostType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="post">Post</SelectItem>
                        <SelectItem value="page">Página</SelectItem>
                        <SelectItem value="listing">Listing</SelectItem>
                        <SelectItem value="product">Produto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Editor de Conteúdo</CardTitle>
                <CardDescription>Cole ou escreva o conteúdo a ser editado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-1.5 rounded-lg bg-muted/50 border border-border flex-wrap">
                  {[
                    { icon: Bold, tag: 'b', title: 'Negrito' },
                    { icon: Italic, tag: 'i', title: 'Itálico' },
                    { icon: Heading2, tag: 'h2', title: 'Subtítulo' },
                    { icon: List, tag: 'ul', title: 'Lista' },
                  ].map(({ icon: Icon, tag, title }) => (
                    <button
                      key={tag}
                      type="button"
                      title={title}
                      onClick={() => insertTag(tag)}
                      className="p-1.5 rounded hover:bg-background hover:shadow-sm transition-all text-muted-foreground hover:text-foreground"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                  <div className="w-px h-4 bg-border mx-1" />
                  <span className="text-xs text-muted-foreground px-1">HTML suportado</span>
                </div>
                <Textarea
                  id="content-editor"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Cole aqui o conteúdo do post/página que deseja melhorar com IA..."
                  className="min-h-[200px] font-mono text-xs resize-y"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-primary" /> Ação de IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMPROVE_ACTIONS.map(a => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                    <SelectItem value="custom">💬 Instrução personalizada</SelectItem>
                  </SelectContent>
                </Select>
                {action === 'custom' && (
                  <Input
                    value={customPrompt}
                    onChange={e => setCustomPrompt(e.target.value)}
                    placeholder="Ex: Adicione mais exemplos práticos e estatísticas..."
                  />
                )}
                <Button type="submit" disabled={loading || !content.trim()} className="w-full">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processando com IA...</>
                  ) : (
                    <><Wand2 className="w-4 h-4 mr-2" />Melhorar com IA</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>

          {/* Right: Result */}
          <div className="space-y-4">
            <Card className={result ? 'border-primary/20' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Resultado</CardTitle>
                  {result && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                        Copiar
                      </Button>
                      {postId && (
                        <Button size="sm" onClick={handlePublish} disabled={publishing || published}>
                          {published ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : publishing ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null}
                          {published ? 'Publicado!' : 'Publicar no WP'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/30 rounded-lg border border-border max-h-[420px] overflow-y-auto">
                      <div
                        className="prose prose-sm max-w-none text-foreground text-xs"
                        dangerouslySetInnerHTML={{ __html: result }}
                      />
                    </div>
                    <Separator />
                    <Textarea
                      value={result}
                      onChange={e => setResult(e.target.value)}
                      className="min-h-[120px] font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      ↑ Edite o HTML acima e clique em Publicar.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Edit3 className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Cole o conteúdo e clique em<br />"Melhorar com IA"</p>
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
