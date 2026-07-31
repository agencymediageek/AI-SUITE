"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Zap, TrendingUp, DollarSign, Activity } from "lucide-react";

interface Metrics {
  totalUsers: number;
  activeUsers7d: number;
  totalGenerations: number;
  totalTokensUsed: number;
  revenue: number;
  topTools: { tool: string; count: number }[];
  dailyGenerations: { day: string; count: number }[];
  recentUsers: { id: string; email: string; name: string; role: string; created_at: string }[];
}

export default function AdminMgDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin-mg/metrics")
      .then((r) => r.json())
      .then((d) => { setMetrics(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total de Usuários", value: metrics?.totalUsers ?? 0, icon: Users, color: "text-blue-500" },
    { label: "Ativos (7 dias)", value: metrics?.activeUsers7d ?? 0, icon: Activity, color: "text-green-500" },
    { label: "Gerações Totais", value: metrics?.totalGenerations ?? 0, icon: Zap, color: "text-purple-500" },
    { label: "Receita Total", value: `R$ ${(metrics?.revenue ?? 0).toFixed(2)}`, icon: DollarSign, color: "text-yellow-500" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-24 bg-muted/30 rounded-xl" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral da sua plataforma white-label</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{card.label}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-muted/50 ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top Tools + Recent Users */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Tools */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ferramentas Mais Usadas</CardTitle>
          </CardHeader>
          <CardContent>
            {(metrics?.topTools || []).length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">Sem dados ainda</p>
            ) : (
              <div className="space-y-3">
                {(metrics?.topTools || []).map((tool, i) => {
                  const max = metrics?.topTools?.[0]?.count || 1;
                  const pct = Math.round((Number(tool.count) / Number(max)) * 100);
                  return (
                    <div key={tool.tool} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{tool.tool || "—"}</span>
                        <span className="font-medium">{tool.count}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Últimos Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {(metrics?.recentUsers || []).length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">Sem usuários ainda</p>
            ) : (
              <div className="space-y-3">
                {(metrics?.recentUsers || []).map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {(u.name || u.email)[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.name || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
