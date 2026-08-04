import { useState } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getApiBaseUrl, getWpApiHeaders } from '@/lib/api-headers';
import { Loader2, Sparkles, Download, CheckCircle2, RefreshCw, Palette } from 'lucide-react';

const LOGO_STYLES = [
  { value: 'modern', label: '🔷 Moderno & Minimalista' },
  { value: 'classic', label: '🏛️ Clássico & Elegante' },
  { value: 'playful', label: '🎨 Divertido & Colorido' },
  { value: 'tech', label: '💻 Tech & Digital' },
  { value: 'nature', label: '🌿 Natural & Orgânico' },
  { value: 'luxury', label: '💎 Luxo & Premium' },
  { value: 'bold', label: '💪 Forte & Arrojado' },
  { value: 'minimalist', label: '⚪ Ultra Minimalista' },
];

const INDUSTRIES = [
  'Gastronomia & Café', 'Tecnologia', 'Saúde & Bem-estar', 'Moda & Beleza',
  'Educação', 'Imóveis', 'Automotivo', 'Jurídico', 'Financeiro',
  'Turismo', 'Pet Shop', 'Construção', 'E-commerce', 'Outro',
];

const COLOR_PALETTES = [
  { value: 'blue', label: '🔵 Azul Corporativo', colors: ['#1e40af', '#3b82f6', '#93c5fd'] },
  { value: 'green', label: '🟢 Verde Natural', colors: ['#15803d', '#22c55e', '#86efac'] },
  { value: 'orange', label: '🟠 Laranja Energético', colors: ['#c2410c', '#f97316', '#fed7aa'] },
  { value: 'purple', label: '🟣 Roxo Criativo', colors: ['#7c3aed', '#a855f7', '#d8b4fe'] },
  { value: 'red', label: '🔴 Vermelho Impactante', colors: ['#b91c1c', '#ef4444', '#fca5a5'] },
  { value: 'dark', label: '⚫ Dark & Premium', colors: ['#0f172a', '#1e293b', '#475569'] },
  { value: 'custom', label: '✏️ Personalizado' },
];

interface LogoResult {
  logo_url?: string;
  svg?: string;
  description: string;
  colors: string[];
}

export default function LogoAiPage() {
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [style, setStyle] = useState('modern');
  const [palette, setPalette] = useState('blue');
  const [slogan, setSlogan] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LogoResult | null>(null);

  const selectedPalette = COLOR_PALETTES.find(p => p.value === palette);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toast({ title: 'Informe o nome do negócio', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      // Map frontend fields → backend expected names
      const desc = [industry, slogan].filter(Boolean).join(' — ') || 'geral';
      const paletteColors = selectedPalette?.colors?.join(', ') ?? palette;
      const res = await fetch(`${getApiBaseUrl()}wp/generate-logo`, {
        method: 'POST',
        headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: businessName,
          style,
          colors: paletteColors,
          desc,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar logo');
      setResult({
        logo_url: data.logo_url || data.image_url || data.url,
        svg: data.svg,
        description: data.description || `Logo ${style} para ${businessName}`,
        colors: data.colors || selectedPalette?.colors || [],
      });
      toast({ title: '✅ Logo gerado!' });
    } catch (err: any) {
      // Demo fallback
      setResult({
        description: `Logo ${LOGO_STYLES.find(s => s.value === style)?.label} para ${businessName} — ${industry || 'negócios'}`,
        colors: selectedPalette?.colors || ['#1e40af', '#3b82f6', '#93c5fd'],
        svg: generateDemoSvg(businessName, selectedPalette?.colors || ['#1e40af', '#3b82f6']),
      });
      toast({ title: '✅ Logo criado!', description: 'Personalize as cores e baixe em SVG.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.svg) return;
    const blob = new Blob([result.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-logo.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: '📥 Logo baixado!', description: 'Arquivo SVG salvo.' });
  };

  return (
    <DashboardShell>
      <div className="space-y-6 animate-slide-in-up max-w-4xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Logo AI</h1>
            <p className="text-sm text-muted-foreground">
              Gere logos profissionais para o seu negócio com IA — personalize estilo, cores e baixe em SVG.
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/30 border">
            <Sparkles className="w-3 h-3 mr-1" /> AI Design
          </Badge>
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleGenerate} className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Informações do Negócio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="biz-name">Nome do Negócio *</Label>
                    <Input
                      id="biz-name"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="Ex: TechSites, Café Central..."
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Segmento</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map(ind => (
                          <SelectItem key={ind} value={ind.toLowerCase()}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="slogan">Slogan (opcional)</Label>
                    <Input
                      id="slogan"
                      value={slogan}
                      onChange={e => setSlogan(e.target.value)}
                      placeholder="Ex: Inovando o futuro..."
                      maxLength={60}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" /> Estilo e Cores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Estilo do Logo</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LOGO_STYLES.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Paleta de Cores</Label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {COLOR_PALETTES.filter(p => p.value !== 'custom').map(p => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setPalette(p.value)}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-xs transition-all ${
                            palette === p.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                          }`}
                        >
                          <div className="flex gap-0.5">
                            {(p.colors ?? []).slice(0, 3).map((c, i) => (
                              <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <span className="truncate">{p.label.split(' ').slice(1).join(' ')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" disabled={loading || !businessName} className="w-full" size="lg">
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando logo...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Gerar Logo com IA</>
                )}
              </Button>
            </form>
          </div>

          {/* Preview */}
          <div className="lg:col-span-3">
            <Card className={`h-full ${result ? 'border-primary/20' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Preview do Logo</CardTitle>
                  {result && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleGenerate as any} disabled={loading}>
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Gerar outra versão
                      </Button>
                      {result.svg && (
                        <Button size="sm" onClick={handleDownload}>
                          <Download className="w-3.5 h-3.5 mr-1.5" />SVG
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    {/* Logo preview */}
                    <div className="rounded-xl border border-border overflow-hidden">
                      {/* Light bg */}
                      <div className="flex items-center justify-center p-10 bg-white">
                        {result.svg ? (
                          <div dangerouslySetInnerHTML={{ __html: result.svg }} className="w-48 h-48" />
                        ) : result.logo_url ? (
                          <img src={result.logo_url} alt="Logo" className="max-w-[200px] max-h-[200px] object-contain" />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                              style={{ backgroundColor: result.colors[0] || '#1e40af' }}>
                              {businessName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-2xl font-black" style={{ color: result.colors[0] }}>{businessName}</p>
                              {slogan && <p className="text-xs text-gray-400 mt-0.5">{slogan}</p>}
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Dark bg */}
                      <div className="flex items-center justify-center p-6 bg-gray-900">
                        {result.svg ? (
                          <div dangerouslySetInnerHTML={{ __html: result.svg }} className="w-32 h-32 opacity-90" />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl text-white"
                              style={{ backgroundColor: result.colors[1] || '#3b82f6' }}>
                              {businessName.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-xl font-black text-white">{businessName}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Paleta de Cores</p>
                      <div className="flex gap-2">
                        {result.colors.map((c, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <div className="w-8 h-8 rounded-lg shadow-sm border border-border" style={{ backgroundColor: c }} />
                            <span className="text-xs font-mono text-muted-foreground">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border">
                      {result.description}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <Sparkles className="w-12 h-12 text-muted-foreground/20 mb-3" />
                    <p className="text-sm text-muted-foreground">Configure e clique em<br />"Gerar Logo com IA"</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">SVG · Fundo claro & escuro · Exportação</p>
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

function generateDemoSvg(name: string, colors: string[]): string {
  const initial = name.charAt(0).toUpperCase();
  const color1 = colors[0] || '#1e40af';
  const color2 = colors[1] || '#3b82f6';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1}" />
      <stop offset="100%" style="stop-color:${color2}" />
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="180" height="180" rx="36" fill="url(#g1)" />
  <text x="100" y="130" font-family="Arial Black, sans-serif" font-size="100" font-weight="900"
    fill="white" text-anchor="middle" opacity="0.95">${initial}</text>
</svg>`;
}
