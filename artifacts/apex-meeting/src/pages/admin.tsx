import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  useGetAdminStats, 
  useListUsers,
  getGetAdminStatsQueryKey,
  getListUsersQueryKey
} from '@workspace/api-client-react';
import { Users, Activity, TrendingUp, DollarSign } from 'lucide-react';

function AdminContent() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats({
    query: { queryKey: getGetAdminStatsQueryKey() }
  });

  const { data: users, isLoading: usersLoading } = useListUsers({}, {
    query: { queryKey: getListUsersQueryKey({}) }
  });

  return (
    <div className="min-h-[100dvh] bg-black text-foreground">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold matrix-text mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and user management</p>
          </div>

          {/* Stats Overview */}
          {statsLoading ? (
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-card/50 border-primary/20 p-6 animate-pulse">
                  <div className="h-4 bg-primary/20 rounded w-24 mb-4" />
                  <div className="h-8 bg-primary/20 rounded w-16" />
                </Card>
              ))}
            </div>
          ) : stats ? (
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="bg-card/50 border-primary/20 p-6 terminal-glow hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground font-mono uppercase">Total Users</p>
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold matrix-text font-mono" data-testid="text-total-users">{stats.totalUsers}</p>
              </Card>

              <Card className="bg-card/50 border-primary/20 p-6 terminal-glow hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground font-mono uppercase">Generations</p>
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
                <p className="text-3xl font-bold cyan-text font-mono" data-testid="text-total-generations">{stats.totalGenerations}</p>
              </Card>

              <Card className="bg-card/50 border-primary/20 p-6 terminal-glow hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground font-mono uppercase">Active Today</p>
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold matrix-text font-mono" data-testid="text-active-today">{stats.activeToday}</p>
              </Card>

              <Card className="bg-card/50 border-primary/20 p-6 terminal-glow hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground font-mono uppercase">Revenue</p>
                  <DollarSign className="w-5 h-5 text-secondary" />
                </div>
                <p className="text-3xl font-bold cyan-text font-mono" data-testid="text-revenue">${stats.revenueTotal.toLocaleString()}</p>
              </Card>
            </div>
          ) : null}

          {/* Users Table */}
          <Card className="bg-card/50 border-primary/20 p-6">
            <h2 className="text-2xl font-bold mb-6">Users</h2>
            
            {usersLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-primary/20 rounded animate-pulse" />
                ))}
              </div>
            ) : users && users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="text-left py-3 px-4 text-sm font-mono text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-mono text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-mono text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-mono text-muted-foreground">Plan</th>
                      <th className="text-right py-3 px-4 text-sm font-mono text-muted-foreground">Tokens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors" data-testid={`row-user-${user.id}`}>
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{user.email}</td>
                        <td className="py-3 px-4">
                          <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className={user.role === 'admin' ? 'bg-primary text-primary-foreground' : ''}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {user.planName || <span className="text-muted-foreground">Free</span>}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-sm">{user.tokenBalance.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminContent />
    </ProtectedRoute>
  );
}
