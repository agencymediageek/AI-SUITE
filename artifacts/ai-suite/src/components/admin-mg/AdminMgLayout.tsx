"use client";

import { useState } from "react";
import { AdminMgSidebar } from "./AdminMgSidebar";
import { Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface AdminMgLayoutProps {
  children: React.ReactNode;
}

export function AdminMgLayout({ children }: AdminMgLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0 border-r bg-card">
        <AdminMgSidebar />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <AdminMgSidebar onNavigate={() => setIsMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-card/50 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Admin White-Label</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/dashboard"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Voltar ao App
            </a>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}
