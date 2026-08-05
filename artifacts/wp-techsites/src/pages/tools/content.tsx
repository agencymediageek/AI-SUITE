import { useState } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWpGenerateContent } from '@workspace/api-client-react';
import { getWpApiHeaders } from '@/lib/api-headers';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Copy, CheckCircle2, FileText, ClipboardCopy } from 'lucide-react';

export default function ContentGeneratorPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('page');
  const [tone, setTone] = useState('professional');
  const [language, setLanguage] = useState('en');
  
  const [result, setResult] = useState<{
    title: string;
    content: string;
    metaDescription?: string | null;
    excerpt?: string | null;
    creditsUsed?: number;
    creditsRemaining?: number;
  } | null>(null);
  
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const generateMutation = useWpGenerateContent({
    mutation: {
      onSuccess: (data) => {
        setResult(data);
        toast({
          title: 'Content Generated!',
          description: `Used ${data.creditsUsed || 0} credits. ${data.creditsRemaining || 0} remaining.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Generation Failed',
          description: error.message || 'Please try again.',
          variant: 'destructive',
        });
      },
    },
    request: {
      headers: getWpApiHeaders(),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate({
      data: {
        topic,
        type,
        tone,
        language,
      },
    });
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: 'Copied!',
      description: `${field} copied to clipboard.`,
    });
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

        {/* How it works */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <ClipboardCopy className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-foreground">📋 O que acontece com o conteúdo gerado?</p>
              <p className="text-muted-foreground">
                O conteúdo é gerado e exibido aqui na tela. Você pode <strong>copiar cada seção</strong> (título, meta description, HTML) e colar diretamente no editor do WordPress. 
                Não é publicado automaticamente — você tem controle total antes de publicar.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Generator Form */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Content</CardTitle>
            <CardDescription>
              Describe what you want to write about, and AI will create a complete page or post for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Tema ou Descrição *</Label>
                <Input
                  id="topic"
                  placeholder="Ex: '10 dicas para aumentar as vendas online'"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  data-testid="input-topic"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Content Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type" data-testid="select-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="page">Página</SelectItem>
                      <SelectItem value="post">Artigo de Blog</SelectItem>
                      <SelectItem value="section">Seção de Página</SelectItem>
                      <SelectItem value="email-marketing">E-mail Marketing</SelectItem>
                      <SelectItem value="social">Post para Redes Sociais</SelectItem>
                      <SelectItem value="ad">Anúncio / Copy de Vendas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
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
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={generateMutation.isPending}
                data-testid="button-generate-content"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando conteúdo…
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Gerar Conteúdo
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result Display */}
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
                <Badge variant="secondary">
                  {result.creditsUsed} credits used
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Title</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result.title, 'Title')}
                    data-testid="button-copy-title"
                  >
                    {copiedField === 'Title' ? (
                      <CheckCircle2 className="w-4 h-4 text-chart-3" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="p-4 bg-background rounded-lg border border-border">
                  <p className="text-lg font-semibold text-foreground">{result.title}</p>
                </div>
              </div>

              {/* Meta Description */}
              {result.metaDescription && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Meta Description</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(result.metaDescription!, 'Meta Description')}
                        data-testid="button-copy-meta"
                      >
                        {copiedField === 'Meta Description' ? (
                          <CheckCircle2 className="w-4 h-4 text-chart-3" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="p-3 bg-background rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">{result.metaDescription}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Excerpt */}
              {result.excerpt && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Excerpt</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(result.excerpt!, 'Excerpt')}
                        data-testid="button-copy-excerpt"
                      >
                        {copiedField === 'Excerpt' ? (
                          <CheckCircle2 className="w-4 h-4 text-chart-3" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="p-3 bg-background rounded-lg border border-border">
                      <p className="text-sm text-foreground">{result.excerpt}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Full Content */}
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Full HTML Content</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result.content, 'Content')}
                    data-testid="button-copy-content"
                  >
                    {copiedField === 'Content' ? (
                      <CheckCircle2 className="w-4 h-4 text-chart-3" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
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
                  Paste this content directly into your WordPress editor or copy individual sections as needed.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
