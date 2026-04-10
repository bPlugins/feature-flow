"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Zap,
  LayoutDashboard,
  MessageSquare,
  Map,
  FileText,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
  ChevronDown,
  Shield,
} from "lucide-react";
import { useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { isSuperAdmin } from "@/lib/superadmin";

interface DashboardShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  children: React.ReactNode;
}

import { CreditCard, Webhook } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/feedback", icon: MessageSquare, label: "Feedback" },
  { href: "/dashboard/roadmap", icon: Map, label: "Roadmap" },
  { href: "/dashboard/changelog", icon: FileText, label: "Changelog" },
  { href: "/dashboard/webhooks", icon: Webhook, label: "Webhooks" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
];

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdmin = isSuperAdmin(user.email);

  // Build nav items dynamically
  const allNavItems = [
    ...navItems.filter(item => !(isAdmin && item.href === '/dashboard/billing')),
    ...(isAdmin
      ? [{ href: "/dashboard/admin", icon: Shield, label: "Admin" }]
      : []),
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border
          flex flex-col transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">FeatureFlow</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Project button */}
        <div className="px-4 py-4">
          <Link
            href="/dashboard/new-project"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {allNavItems.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
            const isAdminItem = item.href === "/dashboard/admin";
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? isAdminItem
                        ? "bg-red-500/10 text-red-500"
                        : "bg-primary/10 text-primary"
                      : isAdminItem
                        ? "text-red-400/70 hover:text-red-500 hover:bg-red-500/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }
                `}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
                {isAdminItem && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-500 text-[9px] font-bold">
                    SA
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-border">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-surface border border-border rounded-xl shadow-xl animate-scale-in">
                {isAdmin && (
                  <div className="px-3 py-1.5 text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Super Admin
                  </div>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center h-16 px-6 border-b border-border bg-surface/50 backdrop-blur-sm shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-4 text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          {isAdmin && (
            <span className="mr-3 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Super Admin
            </span>
          )}
          <ThemeToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
