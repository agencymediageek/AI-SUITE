import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useGetMe, useLogoutUser } from "@workspace/api-client-react";
import { LayoutDashboard, Zap, History, Settings, LogOut, Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: user, isLoading } = useGetMe({
    query: {
      retry: false,
      refetchOnWindowFocus: false,
    }
  });

  const logoutMutation = useLogoutUser();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync(undefined);
    } catch (error) {
      console.error("Logout failed on server", error);
    }
    logout();
    setLocation("/");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Tools", href: "/tools", icon: Zap },
    { label: "History", href: "/history", icon: History },
    { label: "Account", href: "/account", icon: Settings },
  ];

  if (user?.role === "admin") {
    navItems.push({ label: "Admin", href: "/admin", icon: Shield });
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background dark text-foreground">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="font-sans font-bold text-xl tracking-tight text-primary">
          AI<span className="text-foreground">Suite</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-0 z-50 transform transition-transform duration-200 ease-in-out bg-card border-r border-border md:relative md:translate-x-0 md:w-64 md:flex md:flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="hidden md:flex p-6 items-center border-b border-border">
          <Link href="/dashboard" className="font-sans font-bold text-2xl tracking-tight flex items-center gap-2 cursor-pointer text-primary">
            <Zap className="w-6 h-6 fill-primary" />
            <span>AI<span className="text-foreground">Suite</span></span>
          </Link>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <div className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors
                  ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}
                `}>
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.name || "User"}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.planName || "Free Plan"}</span>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
