"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Palette,
  Wrench,
  CreditCard,
  Users,
  Plug,
  Globe,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin-mg", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin-mg/identity", label: "Identidade Visual", icon: Palette },
  { href: "/admin-mg/tools", label: "Ferramentas", icon: Wrench },
  { href: "/admin-mg/plans", label: "Planos e Preços", icon: CreditCard },
  { href: "/admin-mg/users", label: "Usuários", icon: Users },
  { href: "/admin-mg/integrations", label: "Integrações", icon: Plug },
  { href: "/admin-mg/domain", label: "Domínio e SSL", icon: Globe },
];

interface AdminMgSidebarProps {
  onNavigate?: () => void;
}

export function AdminMgSidebar({ onNavigate }: AdminMgSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">MG</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">CloneseMG</p>
            <p className="text-xs text-muted-foreground mt-0.5">Painel Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="h-3 w-3 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          CloneseMG White-Label v1.0
        </p>
      </div>
    </div>
  );
}
