import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useGetAdminStats, useListUsers, useUpdateUser, useDeleteUser, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Zap, Clock, DollarSign, Search, Shield, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getListUsersQueryKey, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";

export default function AdminPanel() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editTokens, setEditTokens] = useState("");
  const [editRole, setEditRole] = useState("");
  const limit = 20;

  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: meLoading } = useGetMe();

  const { data: stats, isLoading: statsLoading } = useGetAdminStats({
    query: { enabled: currentUser?.role === "admin" }
  });

  const { data: users, isLoading: usersLoading } = useListUsers(
    { limit, offset: (page - 1) * limit, search: search || undefined },
    { query: { enabled: currentUser?.role === "admin" } }
  );

  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  useEffect(() => {
    if (!meLoading && currentUser?.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [meLoading, currentUser, setLocation]);

  if (!meLoading && currentUser?.role !== "admin") {
    return null;
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await updateMutation.mutateAsync({
        userId: editingUser.id,
        data: {
          tokenBalance: parseInt(editTokens) || undefined,
          role: editRole || undefined
        }
      });
      toast.success("User updated");
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    } catch (error: any) {
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await deleteMutation.mutateAsync({ userId });
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
    } catch (error: any) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Control Panel</h1>
          <p className="text-muted-foreground">Manage users, view platform statistics, and control tokens.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-3xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Generations</CardTitle>
              <Zap className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-3xl font-bold">{stats?.totalGenerations.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Today</CardTitle>
              <Clock className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-3xl font-bold">{stats?.activeToday.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-3xl font-bold text-primary">${stats?.revenueTotal.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Card className="bg-card">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and edit user accounts and token balances.</CardDescription>
            </div>
            <div className="w-full sm:w-72 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search users by email..." 
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : users && users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/20">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "outline"} className={user.role === "admin" ? "bg-primary/20 text-primary border-primary/30" : ""}>
                            {user.role === "admin" && <Shield className="w-3 h-3 mr-1" />}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs uppercase">{user.planName || "Free"}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {user.tokenBalance.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog open={!!editingUser && editingUser.id === user.id} onOpenChange={(open) => {
                              if (open) {
                                setEditingUser(user);
                                setEditTokens(user.tokenBalance.toString());
                                setEditRole(user.role);
                              } else {
                                setEditingUser(null);
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit User: {user.email}</DialogTitle>
                                  <DialogDescription>Modify token balance and role permissions.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Token Balance</label>
                                    <Input 
                                      type="number" 
                                      value={editTokens} 
                                      onChange={(e) => setEditTokens(e.target.value)} 
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Role</label>
                                    <Select value={editRole} onValueChange={setEditRole}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                                  <Button onClick={handleUpdateUser} disabled={updateMutation.isPending}>Save Changes</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.id === currentUser?.id || deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No users found matching "{search}"
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="p-4 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Showing page {page}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={!users || users.length < limit}>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
