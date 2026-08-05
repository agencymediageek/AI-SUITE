import { useState } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useWpApplyColors } from '@workspace/api-client-react';
import { getWpApiHeaders } from '@/lib/api-headers';
import { ToolInfoCard } from '@/components/ui/tool-info-card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Palette, Copy, CheckCircle2 } from 'lucide-react';

export default function BrandColorsPage() {
  const { toast } = useToast();
  const [primaryColor, setPrimaryColor] = useState('#0891b2');
  const [secondaryColor, setSecondaryColor] = useState('#6366f1');
  const [style, setStyle] = useState('modern');
  
  const [result, setResult] = useState<{
    css: string;
    primaryColor: string;
    secondaryColor: string;
    creditsUsed?: number;
  } | null>(null);
  
  const [copied, setCopied] = useState(false);

  const applyMutation = useWpApplyColors({
    mutation: {
      onSuccess: (data) => {
        setResult(data);
        toast({
          title: 'Brand Colors Generated!',
          description: `Used ${data.creditsUsed || 0} credits. CSS ready to apply.`,
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
    applyMutation.mutate({
      data: {
        primaryColor,
        secondaryColor,
        style,
      },
    });
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.css);
      setCopied(true);
      toast({
        title: 'CSS Copied!',
        description: 'Paste into your theme\'s custom CSS or style.css',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6 animate-slide-in-up max-w-5xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Brand Colors</h1>
            <p className="text-muted-foreground">
              Apply consistent brand colors across your entire WordPress site.
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            <Palette className="w-3 h-3 mr-1" />
            5 credits
          </Badge>
        </div>

        <ToolInfoCard
          steps={[
            { icon: '🎨', text: 'Insira a cor principal da sua marca (hex, nome ou picker)' },
            { icon: '🤖', text: 'A IA gera uma paleta completa com variações de fundo, texto, destaque e botões' },
            { icon: '⚡', text: 'Clique em "Aplicar" — o CSS é injetado automaticamente no tema ativo do WordPress' },
          ]}
          result={{ label: '🎨 Aplicado no WordPress', color: 'purple', detail: '— CSS customizado injetado sem editar código' }}
        />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Color Picker Form */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Colors</CardTitle>
              <CardDescription>
                Select primary and secondary brand colors, then generate custom CSS.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 rounded border border-input cursor-pointer"
                      data-testid="input-primary-color"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm font-mono"
                      data-testid="input-primary-color-hex"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Main brand color for buttons, links, and highlights
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <input
                      id="secondaryColor"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-16 h-10 rounded border border-input cursor-pointer"
                      data-testid="input-secondary-color"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm font-mono"
                      data-testid="input-secondary-color-hex"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Accent color for secondary elements and contrast
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style">Style Preset</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger id="style" data-testid="select-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How colors are applied to elements
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={applyMutation.isPending}
                  data-testid="button-generate-colors"
                >
                  {applyMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating CSS...
                    </>
                  ) : (
                    <>
                      <Palette className="w-4 h-4 mr-2" />
                      Generate Brand CSS
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Color Preview</CardTitle>
              <CardDescription>
                See how your brand colors look on common elements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <span className="text-sm font-medium">Primary</span>
                  <div
                    className="w-20 h-10 rounded-md border border-border shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <span className="text-sm font-medium">Secondary</span>
                  <div
                    className="w-20 h-10 rounded-md border border-border shadow-sm"
                    style={{ backgroundColor: secondaryColor }}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-3">
                <h3
                  className="text-xl font-bold"
                  style={{ color: primaryColor }}
                >
                  Sample Heading
                </h3>
                <p className="text-sm text-foreground">
                  This is example body text. Links would appear in your{' '}
                  <span
                    className="font-medium underline cursor-pointer"
                    style={{ color: primaryColor }}
                  >
                    primary color
                  </span>.
                </p>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-md text-sm font-medium text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 rounded-md text-sm font-medium text-white"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Secondary Button
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CSS Output */}
        {result && (
          <Card className="border-chart-3/30 bg-chart-3/5">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>Generated CSS</CardTitle>
                  <CardDescription>
                    Copy this CSS and paste it into your WordPress theme's custom CSS section.
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {result.creditsUsed} credits used
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="absolute top-2 right-2 z-10"
                  data-testid="button-copy-css"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-chart-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" />
                      Copy CSS
                    </>
                  )}
                </Button>
                <pre className="p-4 bg-background rounded-lg border border-border overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
                  {result.css}
                </pre>
              </div>

              <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <Palette className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs text-foreground">
                  <p className="font-medium mb-1">How to apply:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Go to Appearance → Customize → Additional CSS in WordPress</li>
                    <li>Paste the generated CSS</li>
                    <li>Click "Publish" to apply changes site-wide</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
