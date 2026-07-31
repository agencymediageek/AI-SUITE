import { useState } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useWpGenerateMenu } from '@workspace/api-client-react';
import { getWpApiHeaders } from '@/lib/api-headers';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Menu as MenuIcon, Link2 } from 'lucide-react';

export default function MenuBuilderPage() {
  const { toast } = useToast();
  const [niche, setNiche] = useState('');
  const [language, setLanguage] = useState('en');
  
  const [result, setResult] = useState<{
    menuItems: Array<{ label: string; slug: string; icon: string }>;
    creditsUsed?: number;
    creditsRemaining?: number;
  } | null>(null);

  const generateMutation = useWpGenerateMenu({
    mutation: {
      onSuccess: (data) => {
        setResult(data);
        toast({
          title: 'Menu Generated!',
          description: `Created ${data.menuItems.length} menu items. Used ${data.creditsUsed || 0} credits.`,
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
        niche,
        language,
      },
    });
  };

  const iconMap: Record<string, string> = {
    'home': '🏠',
    'about': 'ℹ️',
    'services': '⚙️',
    'products': '📦',
    'portfolio': '💼',
    'blog': '📝',
    'contact': '📧',
    'team': '👥',
    'pricing': '💰',
    'faq': '❓',
    'testimonials': '⭐',
    'gallery': '🖼️',
  };

  return (
    <DashboardShell>
      <div className="space-y-6 animate-slide-in-up max-w-5xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Menu Builder</h1>
            <p className="text-muted-foreground">
              Generate professional navigation menus tailored to your niche.
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            <MenuIcon className="w-3 h-3 mr-1" />
            5 credits
          </Badge>
        </div>

        {/* Generator Form */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Menu</CardTitle>
            <CardDescription>
              Tell us about your site's niche, and we'll suggest the best menu structure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="niche">Site Niche or Industry *</Label>
                <Input
                  id="niche"
                  placeholder="e.g., 'Photography studio', 'Digital marketing agency', 'Coffee shop'"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  required
                  data-testid="input-niche"
                />
                <p className="text-xs text-muted-foreground">
                  Describe your business or website focus in a few words
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Menu Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language" data-testid="select-menu-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={generateMutation.isPending}
                data-testid="button-generate-menu"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Menu...
                  </>
                ) : (
                  <>
                    <MenuIcon className="w-4 h-4 mr-2" />
                    Generate Menu
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
                  <CardTitle>Suggested Menu Items</CardTitle>
                  <CardDescription>
                    Review these menu items and add them to your WordPress navigation.
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {result.creditsUsed} credits used
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {result.menuItems.map((item, index) => {
                  const emoji = iconMap[item.icon] || item.icon;
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                      data-testid={`menu-item-${index}`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                          {emoji}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{item.label}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Link2 className="w-3 h-3 text-muted-foreground" />
                            <code className="text-xs text-muted-foreground font-mono">
                              /{item.slug}
                            </code>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Page {index + 1}
                      </Badge>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <MenuIcon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs text-foreground">
                  <p className="font-medium mb-1">How to apply:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Go to Appearance → Menus in WordPress</li>
                    <li>Create pages matching the suggested slugs</li>
                    <li>Add these pages to your navigation menu</li>
                    <li>Arrange them in the order shown above</li>
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
