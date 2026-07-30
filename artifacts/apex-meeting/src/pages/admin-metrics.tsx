import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  useGetAdminMetrics,
  useGetAdminMetricsRealtime,
  getGetAdminMetricsQueryKey,
  getGetAdminMetricsRealtimeQueryKey,
} from '@workspace/api-client-react';
import { useI18n } from '@/lib/i18n';
import {
  Users, Activity, TrendingUp, DollarSign, ArrowLeft, RefreshCw,
} from 'lucide-react';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const PIE_COLORS = ['#00FF41', '#00FFFF', '#A855F7', '#F59E0B', '#FF6B35', '#3B82F6'];

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, icon: Icon, color = 'text-primary', loading = false,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  loading?: boolean;
}) {
  return (
    <Card className="bg-card/50 border-primary/20 p-6 terminal-glow hover:border-primary/40 transition-all">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">{label}</p>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      {loading ? (
        <div className="h-9 bg-primary/20 rounded w-20 animate-pulse" />
      ) : (
        <p className={`text-3xl font-bold font-mono ${color}`}>{value}</p>
      )}
    </Card>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {subtitle && <p className="text-xs text-muted-foreground font-mono mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ── Chart tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-primary/30 rounded-lg px-3 py-2 text-sm font-mono shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.value}</p>
      ))}
    </div>
  );
}

// ── Date formatter (YYYY-MM-DD → MM/DD) ──────────────────────────────────────
function fmtDate(d: string) {
  const [, m, day] = d.split('-');
  return `${m}/${day}`;
}

// ── Currency formatter ────────────────────────────────────────────────────────
function fmtCurrency(v: number) {
  return `R$${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ── Pie label ─────────────────────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, outerRadius, name, percent }: any) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 30;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#9CA3AF" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontFamily="monospace">
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────
function MetricsContent() {
  const { t } = useI18n();

  const { data: metrics, isLoading, isFetching } = useGetAdminMetrics({
    query: {
      queryKey: getGetAdminMetricsQueryKey(),
      refetchInterval: 30_000,
    },
  });

  const { data: realtime } = useGetAdminMetricsRealtime({
    query: {
      queryKey: getGetAdminMetricsRealtimeQueryKey(),
      refetchInterval: 30_000,
    },
  });

  const activeSessions = realtime?.activeSessions ?? metrics?.activeSessions ?? 0;
  const meetingsToday  = realtime?.meetingsToday  ?? metrics?.meetingsToday  ?? 0;

  // Trim chart data to every 3rd day label for readability
  const chartData30 = (metrics?.newUsersPerDay ?? []).map(d => ({
    ...d,
    label: fmtDate(d.date),
  }));
  const meetingChartData = (metrics?.meetingsPerDay ?? []).map(d => ({
    ...d,
    label: fmtDate(d.date),
  }));

  return (
    <div className="min-h-[100dvh] bg-black text-foreground">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="mb-3 text-muted-foreground hover:text-primary -ml-2">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  {t('metrics.back')}
                </Button>
              </Link>
              <h1 className="text-4xl font-bold matrix-text mb-1">{t('metrics.title')}</h1>
              <p className="text-muted-foreground text-sm">{t('metrics.subtitle')}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin text-primary' : ''}`} />
              {t('metrics.days30')}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <KpiCard
              label={t('metrics.totalUsers')}
              value={metrics?.totalUsers ?? 0}
              icon={Users}
              color="text-primary"
              loading={isLoading}
            />
            <KpiCard
              label={t('metrics.meetingsToday')}
              value={meetingsToday}
              icon={TrendingUp}
              color="text-secondary"
              loading={isLoading}
            />
            <KpiCard
              label={t('metrics.mrr')}
              value={fmtCurrency(metrics?.estimatedMRR ?? 0)}
              icon={DollarSign}
              color="text-primary"
              loading={isLoading}
            />
            <KpiCard
              label={t('metrics.activeSessions')}
              value={activeSessions}
              icon={Activity}
              color="text-secondary"
              loading={isLoading}
            />
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-10">

            {/* Line chart — new users */}
            <Card className="bg-card/50 border-primary/20 p-6 lg:col-span-2">
              <SectionHeader title={t('metrics.newUsers.title')} subtitle={t('metrics.days30')} />
              {isLoading ? (
                <div className="h-52 bg-primary/10 rounded animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height={210}>
                  <LineChart data={chartData30} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="count" stroke="#00FF41" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00FF41' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Pie chart — users by plan */}
            <Card className="bg-card/50 border-primary/20 p-6">
              <SectionHeader title={t('metrics.byPlan.title')} />
              {isLoading ? (
                <div className="h-52 bg-primary/10 rounded animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={metrics?.usersByPlan ?? []}
                      dataKey="count"
                      nameKey="planName"
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      labelLine={false}
                      label={PieLabel}
                    >
                      {(metrics?.usersByPlan ?? []).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any, name: any) => [v, name]}
                      contentStyle={{ background: '#111', border: '1px solid #00FF4130', borderRadius: 8, fontFamily: 'monospace', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* Bar chart — meetings per day */}
          <Card className="bg-card/50 border-primary/20 p-6 mb-10">
            <SectionHeader title={t('metrics.meetings.title')} subtitle={t('metrics.days30')} />
            {isLoading ? (
              <div className="h-52 bg-primary/10 rounded animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={meetingChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" fill="#00FFFF" radius={[3, 3, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Top users table */}
          <Card className="bg-card/50 border-primary/20 p-6">
            <SectionHeader title={t('metrics.topUsers.title')} />
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-primary/10 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="text-left py-3 px-3 text-xs font-mono text-muted-foreground w-10">{t('metrics.rank')}</th>
                      <th className="text-left py-3 px-3 text-xs font-mono text-muted-foreground">{t('metrics.col.user')}</th>
                      <th className="text-left py-3 px-3 text-xs font-mono text-muted-foreground">{t('metrics.col.plan')}</th>
                      <th className="text-right py-3 px-3 text-xs font-mono text-muted-foreground">{t('metrics.col.meetings')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(metrics?.topUsers ?? []).map((user, i) => (
                      <tr key={user.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                        <td className="py-3 px-3 font-mono text-sm text-muted-foreground">{i + 1}</td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{user.email}</div>
                        </td>
                        <td className="py-3 px-3">
                          {user.planName ? (
                            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary text-xs font-mono">
                              {user.planName}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">{t('admin.free')}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-primary">
                          {user.meetingCount}
                        </td>
                      </tr>
                    ))}
                    {(metrics?.topUsers ?? []).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">
                          {t('admin.noUsers')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
}

export default function AdminMetrics() {
  return (
    <ProtectedRoute requireAdmin>
      <MetricsContent />
    </ProtectedRoute>
  );
}
