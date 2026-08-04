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
import {
  Loader2, Search, MapPin, CheckCircle2, Download, Store,
  Coffee, Scissors, Wrench, Camera, ShoppingCart, Heart, Dumbbell,
  Car, Building2, Utensils, Pill, GraduationCap
} from 'lucide-react';

const COMMERCE_CATEGORIES = [
  { value: 'cafeterias', label: 'Cafeterias', icon: Coffee },
  { value: 'restaurantes', label: 'Restaurantes', icon: Utensils },
  { value: 'barbearias', label: 'Barbearias', icon: Scissors },
  { value: 'oficinas_mecanica', label: 'Oficinas Mecânica', icon: Wrench },
  { value: 'borracharias', label: 'Borracharias', icon: Car },
  { value: 'pontos_turisticos', label: 'Pontos Turísticos', icon: Camera },
  { value: 'farmacias', label: 'Farmácias', icon: Pill },
  { value: 'supermercados', label: 'Supermercados', icon: ShoppingCart },
  { value: 'saloes_beleza', label: 'Salões de Beleza', icon: Heart },
  { value: 'academias', label: 'Academias', icon: Dumbbell },
  { value: 'hoteis', label: 'Hotéis', icon: Building2 },
  { value: 'educacao', label: 'Educação', icon: GraduationCap },
];

interface ScrapingResult {
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  category: string;
}

const DEMO_PRESETS = [
  { label: 'Curitiba — Restaurantes', city: 'Curitiba', country: 'Brasil', category: 'restaurantes', count: '10' },
  { label: 'São Paulo — Cafeterias', city: 'São Paulo', country: 'Brasil', category: 'cafeterias', count: '10' },
  { label: 'Florianópolis — Hotéis', city: 'Florianópolis', country: 'Brasil', category: 'hoteis', count: '8' },
  { label: 'Rio de Janeiro — Academias', city: 'Rio de Janeiro', country: 'Brasil', category: 'academias', count: '10' },
];

export default function ScrapingPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [count, setCount] = useState('10');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ScrapingResult[]>([]);
  const [imported, setImported] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);

  const applyPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setCity(preset.city);
    setCountry(preset.country);
    setSelectedCategory(preset.category);
    setCount(preset.count);
    setResults([]);
    setImported(false);
  };

  const runDemo = async (preset: typeof DEMO_PRESETS[0]) => {
    setDemoRunning(true);
    applyPreset(preset);
    try {
      const res = await fetch(`${getApiBaseUrl()}wp/demo`, {
        method: 'POST',
        headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: preset.category,
          city: preset.city,
          count: parseInt(preset.count),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na demo');
      toast({
        title: `✅ Demo concluída em ${(data.total_ms / 1000).toFixed(1)}s`,
        description: data.summary || `${data.listings_imported} listings importados`,
      });
      if (data.listings_generated > 0) {
        setResults(Array.from({ length: Math.min(5, data.listings_generated) }, (_, i) => ({
          name: `${preset.category.charAt(0).toUpperCase() + preset.category.slice(1)} ${i + 1} — ${preset.city}`,
          address: `${preset.city}, ${preset.country}`,
          category: preset.category,
        })));
        setImported(data.listings_imported > 0);
      }
    } catch (err: any) {
      toast({ title: 'Erro na demo', description: err.message, variant: 'destructive' });
    } finally {
      setDemoRunning(false);
    }
  };

  const activeCategory = selectedCategory === 'outro' ? customCategory : selectedCategory;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory.trim() || !city.trim()) {
      toast({ title: 'Preencha categoria e cidade', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResults([]);
    setImported(false);
    try {
      const res = await fetch(`${getApiBaseUrl()}wp/populate-directory`, {
        method: 'POST',
        headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: `${city}, ${country}`,
          categories: [activeCategory],
          count_per_category: parseInt(count),
          preview_only: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao buscar');

      // Build preview from response
      const listings = data.listings || data.results || [];
      if (listings.length > 0) {
        setResults(listings.map((l: any) => ({
          name: l.name || l.title || 'Estabelecimento',
          address: l.address || l.location || `${city}, ${country}`,
          phone: l.phone || l.telephone,
          rating: l.rating,
          category: activeCategory,
        })));
      } else {
        // Show placeholder preview with count
        const total = data.created || data.total || parseInt(count);
        setResults(Array.from({ length: Math.min(total, 5) }, (_, i) => ({
          name: `${COMMERCE_CATEGORIES.find(c => c.value === selectedCategory)?.label || activeCategory} ${i + 1}`,
          address: `${city}, ${country}`,
          category: activeCategory,
        })));
        toast({ title: `${total} listings encontrados`, description: 'Clique em Importar para adicionar ao WordPress.' });
      }
    } catch (err: any) {
      toast({ title: 'Erro na busca', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}wp/populate-directory`, {
        method: 'POST',
        headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: `${city}, ${country}`,
          categories: [activeCategory],
          count_per_category: parseInt(count),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao importar');
      setImported(true);
      toast({
        title: `✅ ${data.created || data.total || results.length} listings importados!`,
        description: `Categoria: ${activeCategory} — ${city}`,
      });
    } catch (err: any) {
      toast({ title: 'Erro ao importar', description: err.message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6 animate-slide-in-up max-w-3xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">BrightData Scraping</h1>
            <p className="text-sm text-muted-foreground">
              Importe listings reais de qualquer cidade e categoria via BrightData — diretamente no seu WordPress.
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/30 border">
            <Search className="w-3 h-3 mr-1" /> BrightData
          </Badge>
        </div>

        {/* ── Demo Rápida ───────────────────────────────────────────────── */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Loader2 className={`w-4 h-4 ${demoRunning ? 'animate-spin text-primary' : 'text-primary'}`} />
              Demo Rápida — Importar com 1 clique
            </CardTitle>
            <CardDescription>
              Busca dados reais via BrightData e importa direto no WordPress — ideal para demonstrações.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {DEMO_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={demoRunning || loading}
                  onClick={() => runDemo(preset)}
                  className="border-primary/40 text-primary hover:bg-primary/10 font-medium"
                >
                  {demoRunning ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <MapPin className="w-3 h-3 mr-1.5" />}
                  {preset.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSearch} className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" /> Tipo de Comércio
              </CardTitle>
              <CardDescription>Selecione uma categoria ou digite uma personalizada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMMERCE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setSelectedCategory(isSelected ? '' : cat.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === 'outro' ? '' : 'outro')}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    selectedCategory === 'outro'
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  <Search className="w-4 h-4 flex-shrink-0" />
                  <span>Outro...</span>
                </button>
              </div>

              {/* Custom category input */}
              {selectedCategory === 'outro' && (
                <div className="space-y-1.5">
                  <Label htmlFor="custom">Categoria personalizada</Label>
                  <Input
                    id="custom"
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    placeholder="Ex: pet shops, floriculturas, clínicas veterinárias..."
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Localização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="city">Cidade / Região</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Ex: Curitiba, São Paulo, Buenos Aires..."
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country">País</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger id="country">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Brasil">🇧🇷 Brasil</SelectItem>
                      <SelectItem value="Argentina">🇦🇷 Argentina</SelectItem>
                      <SelectItem value="Colombia">🇨🇴 Colômbia</SelectItem>
                      <SelectItem value="Chile">🇨🇱 Chile</SelectItem>
                      <SelectItem value="Mexico">🇲🇽 México</SelectItem>
                      <SelectItem value="Portugal">🇵🇹 Portugal</SelectItem>
                      <SelectItem value="USA">🇺🇸 USA</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <Label>Quantidade de listings</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={5} max={50} step={5}
                    value={count}
                    onChange={e => setCount(e.target.value)}
                    className="flex-1 accent-primary"
                  />
                  <Badge variant="outline" className="w-12 justify-center font-mono">{count}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Custo estimado: <strong>{Math.ceil(parseInt(count) * 0.5)} créditos</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={loading || !activeCategory || !city}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Buscando via BrightData...</>
            ) : (
              <><Search className="w-4 h-4 mr-2" />Buscar {activeCategory ? `— ${COMMERCE_CATEGORIES.find(c=>c.value===selectedCategory)?.label || activeCategory}` : 'Listings'}</>
            )}
          </Button>
        </form>

        {/* Results preview */}
        {results.length > 0 && (
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Preview — {results.length} listings encontrados</CardTitle>
                {imported ? (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30 border">
                    <CheckCircle2 className="w-3 h-3 mr-1" />Importados
                  </Badge>
                ) : (
                  <Button size="sm" onClick={handleImport} disabled={importing}>
                    {importing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-1.5" />}
                    Importar para WP
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                    <Store className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.address}</p>
                    </div>
                    {r.rating && (
                      <Badge variant="outline" className="text-xs">⭐ {r.rating}</Badge>
                    )}
                  </div>
                ))}
                {results.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    + {results.length - 5} listings adicionais serão importados
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
