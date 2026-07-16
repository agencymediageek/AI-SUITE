import { useGetDashboardStats, useGetRecentGenerations, useGetTrendingTools, useGetUserFavorites } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Activity, Clock, TrendingUp, Star, ArrowRight, History } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recent, isLoading: recentLoading } = useGetRecentGenerations();
  const { data: trending, isLoading: trendingLoading } = useGetTrendingTools();
  const { data: favorites, isLoading: favoritesLoading } = useGetUserFavorites();
  const { t } = useI18n();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t("dash.title")}</h1>
          <p className="text-muted-foreground">{t("dash.welcome")}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dash.token_balance")}</CardTitle>
              <Zap className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <div className="text-3xl font-bold">{stats?.tokenBalance.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.planName}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dash.tokens_used")}</CardTitle>
              <Activity className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <div className="text-3xl font-bold">{stats?.tokensUsed.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dash.billing_cycle")}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dash.total_generations")}</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-3xl font-bold">{stats?.totalGenerations.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dash.favorites")}</CardTitle>
              <Star className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-3xl font-bold">{stats?.favoriteCount.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <Card className="lg:col-span-2 bg-card">
            <CardHeader>
              <CardTitle>{t("dash.usage_overview")}</CardTitle>
              <CardDescription>{t("dash.usage_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {statsLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : stats?.generationsByDay && stats.generationsByDay.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.generationsByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickFormatter={(val) => {
                          const d = new Date(val);
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    {t("dash.no_activity")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <Card className="bg-card flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                {t("dash.quick_access")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {favoritesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : favorites && favorites.length > 0 ? (
                <div className="space-y-3">
                  {favorites.slice(0, 5).map((tool: any) => (
                    <Link key={tool.id} href={`/tools/${tool.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors cursor-pointer group">
                        <div className="flex flex-col">
                          <span className="font-medium group-hover:text-primary transition-colors">{tool.label}</span>
                          <span className="text-xs text-muted-foreground">{tool.category}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-lg">
                  <Star className="w-8 h-8 text-muted-foreground mb-3 opacity-20" />
                  <p className="text-sm text-muted-foreground mb-4">{t("dash.no_favorites")}</p>
                  <Link href="/tools">
                    <Button variant="outline" size="sm">{t("dash.explore_tools")}</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trending Tools */}
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                {t("dash.trending")}
              </CardTitle>
              <Link href="/tools">
                <Button variant="ghost" size="sm" className="text-xs">{t("dash.view_all")}</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {trendingLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : trending && trending.length > 0 ? (
                <div className="space-y-3">
                  {trending.map((tool: any) => (
                    <Link key={tool.id} href={`/tools/${tool.id}`}>
                      <div className="flex items-center p-3 rounded-lg border border-border bg-background hover:border-accent/30 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded bg-accent/10 flex items-center justify-center mr-4">
                          <Zap className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium group-hover:text-accent transition-colors truncate">{tool.label}</span>
                            {tool.isPro && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">PRO</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{tool.description || tool.category}</p>
                        </div>
                        <div className="text-xs font-mono text-muted-foreground shrink-0">{tool.tokenCost} <Zap className="w-3 h-3 inline pb-[2px]" /></div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">{t("dash.no_trending")}</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Generations */}
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                {t("dash.recent")}
              </CardTitle>
              <Link href="/history">
                <Button variant="ghost" size="sm" className="text-xs">{t("dash.view_history")}</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : recent && recent.length > 0 ? (
                <div className="space-y-4">
                  {recent.slice(0, 4).map((record: any) => (
                    <div key={record.id} className="flex flex-col pb-4 border-b border-border/50 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-primary">{record.toolLabel}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {record.prompt || t("dash.no_prompt")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="w-10 h-10 text-muted-foreground mb-3 opacity-20" />
                  <p className="text-sm text-muted-foreground">{t("dash.no_recent")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
