import { useLocation } from 'wouter';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { MetricCard } from '@/components/ui/metric-card';
import { ToolCard } from '@/components/ui/tool-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetWpDashboard, getGetWpDashboardQueryKey } from '@workspace/api-client-react';
import { getWpApiHeaders } from '@/lib/api-headers';
import { Coins, TrendingUp, Zap, Globe, Lightbulb } from 'lucide-react';

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  
  const { data: dashboard, isLoading, error } = useGetWpDashboard({
    query: {
      queryKey: getGetWpDashboardQueryKey(),
    },
    request: {
      headers: getWpApiHeaders(),
    },
  });

  if (error) {
    return (
      <DashboardShell>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle>Error Loading Dashboard</CardTitle>
            <CardDescription>
              {error.message || 'Failed to load your dashboard data. Please try refreshing the page.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </DashboardShell>
    );
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </DashboardShell>
    );
  }

  const site = dashboard?.site;
  const tools = dashboard?.tools || [];

  const toolRouteMap: Record<string, string> = {
    'content': '/tools/content',
    'colors': '/tools/colors',
    'menu': '/tools/menu',
  };

  return (
    <DashboardShell>
      <div className="space-y-6 animate-slide-in-up">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              {site?.siteName || 'Your Site'} • <span className="text-foreground font-medium">{site?.siteUrl}</span>
            </p>
          </div>
          <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/30">
            {site?.plan || 'Free Plan'}
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Credits Remaining"
            value={site?.credits?.toLocaleString() || '0'}
            icon={Coins}
            className="pulse-border"
          />
          <MetricCard
            label="Current Plan"
            value={site?.plan || 'Free'}
            icon={TrendingUp}
          />
          <MetricCard
            label="Site Status"
            value="Connected"
            icon={Globe}
          />
          <MetricCard
            label="Tools Available"
            value={tools.filter(t => t.available).length}
            icon={Zap}
          />
        </div>

        {/* Usage Tip */}
        {dashboard?.usageTip && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-3 p-4">
              <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">Pro Tip</p>
                <p className="text-sm text-muted-foreground">{dashboard.usageTip}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tools Grid */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">AI Tools</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => (
              <div
                key={tool.id}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                className="animate-slide-in-up"
              >
                <ToolCard
                  name={tool.name}
                  icon={tool.icon}
                  credits={tool.credits}
                  available={tool.available}
                  onClick={() => {
                    const route = toolRouteMap[tool.id];
                    if (route) {
                      setLocation(route);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Getting Started</CardTitle>
            <CardDescription>
              New to WP TechSites? Here's what you can do next:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Generate SEO-optimized content for your pages and posts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Apply consistent brand colors across your entire site</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Build professional navigation menus tailored to your niche</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Complete the plugin setup to sync tools with your WordPress admin</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
