import { useState } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getApiBaseUrl, getWpApiHeaders } from '@/lib/api-headers';
import { Loader2, MapPin, Store, CheckCircle2, Plus, X } from 'lucide-react';

const PRESET_CATEGORIES = [
  'restaurantes', 'hotéis', 'turismo', 'saúde', 'serviços', 'compras',
  'bares', 'academia', 'beleza', 'educação', 'imóveis', 'automóveis',
];

export default function PopulateDirectoryPage() {
  const { toast } = useToast();
  const [city, setCity] = useState('Curitiba');
  const [categories, setCategories] = useState<string[]>(['restaurantes', 'hotéis']);
  const [countPerCategory, setCountPerCategory] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; total: number; categories: string[] } | null>(null);

  const toggleCategory = (cat: string) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !categories.length) {
      toast({ title: 'Preencha cidade e categorias', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}wp/populate-directory`, {
        method: 'POST',
        headers: { ...getWpApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, categories, count_per_category: countPerCategory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao popular');
      setResult({ created: data.created || 0, total: data.total || 0, categories });
      toast({
        title: `✅ ${data.created || data.total || 0} listings criados!`,
        description: `Cidade: ${city} — ${categories.length} categorias`,
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Popular Diretório</h1>
          <p className="text-muted-foreground">
            Importa listings reais de qualquer cidade via BrightData — diretamente no seu WordPress.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4" /> Configurar Importação
              </CardTitle>
              <CardDescription>
                Escolha a cidade e as categorias que serão populadas automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Ex: Curitiba, São Paulo, Rio de Janeiro..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Categorias <span className="text-muted-foreground text-xs">({categories.length} selecionadas)</span></Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        categories.includes(cat)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {categories.includes(cat) ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : null}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="count">Listings por categoria</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="count"
                    type="range"
                    min={5} max={30} step={5}
                    value={countPerCategory}
                    onChange={e => setCountPerCategory(Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <Badge variant="outline" className="w-12 justify-center font-mono">
                    {countPerCategory}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Total estimado: <strong>{categories.length * countPerCategory} listings</strong> — 
                  custo: <strong>{Math.ceil(categories.length * countPerCategory * 0.5)} créditos</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading || !categories.length} className="w-full" size="lg">
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importando listings...</>
            ) : (
              <><Store className="w-4 h-4 mr-2" /> Popular Diretório — {city}</>
            )}
          </Button>
        </form>

        {result && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">
                    {result.created || result.total} listings criados em {city}!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Categorias: {result.categories.join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
