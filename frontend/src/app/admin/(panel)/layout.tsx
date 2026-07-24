"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  ScrollText,
  Settings,
  Users,
  UserPlus,
  X,
} from "lucide-react";
import { me, logout, type AdminMe } from "@/lib/admin";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/admin/membership", label: "Membership", icon: UserPlus },
  { href: "/admin/contact", label: "Contact", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/users", label: "Users", icon: Users, superOnly: true },
  { href: "/admin/audit", label: "Audit log", icon: ScrollText, superOnly: true },
];

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminMe | null | "loading">("loading");
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    let active = true;
    me().then((u) => {
      if (!active) return;
      if (u) setAdmin(u);
      else router.replace("/admin/login");
    });
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    setDrawer(false); // close mobile drawer on navigation
  }, [pathname]);

  async function onLogout() {
    await logout();
    router.replace("/admin/login");
  }

  if (admin === "loading" || admin === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface text-ink-muted">
        Loading...
      </div>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-brand-green text-surface">
      <div className="flex h-16 items-center px-6">
        <Image src="/siteo-logo.jpg" alt="SITEO" width={1600} height={400} className="h-6 w-auto" />
        <span className="ml-3 text-sm font-medium text-surface/60">Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
        {NAV.filter((item) => !item.superOnly || admin.role === "super_admin").map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mb-1 flex items-center gap-3 rounded-card px-3 py-2.5 text-base transition-colors",
                active ? "bg-brand-green-light text-surface" : "text-surface/70 hover:bg-brand-green-light/60 hover:text-surface",
              )}
            >
              <item.icon className="size-5" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-surface/15 p-4">
        <div className="mb-3 px-2">
          <p className="truncate text-sm font-medium text-surface">{admin.username}</p>
          <p className="text-xs text-surface/50">{admin.role.replace("_", " ")}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-card px-3 py-2.5 text-base text-surface/80 transition-colors hover:bg-brand-green-light/60 hover:text-surface"
        >
          <LogOut className="size-5" strokeWidth={1.75} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-surface">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
        <Image src="/siteo-logo.jpg" alt="SITEO" width={1600} height={400} className="h-6 w-auto" />
        <button
          type="button"
          className="flex size-11 items-center justify-center text-brand-green"
          aria-label="Open menu"
          onClick={() => setDrawer(true)}
        >
          <Menu className="size-6" />
        </button>
      </div>

      {/* Mobile drawer (sibling, no backdrop-filter ancestor) */}
      {drawer && (
        <>
          <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setDrawer(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
            <button
              type="button"
              className="absolute right-3 top-4 z-10 flex size-10 items-center justify-center text-surface/80"
              aria-label="Close menu"
              onClick={() => setDrawer(false)}
            >
              <X className="size-6" />
            </button>
            {sidebar}
          </aside>
        </>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
