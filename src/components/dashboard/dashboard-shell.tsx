"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { Topbar } from "@/components/dashboard/topbar";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bills", label: "Bills", icon: ReceiptText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const adminNavItem = { href: "/dashboard/admin", label: "Admin", icon: ShieldCheck };

export type ShellUser = {
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  notifyEmail: string | null;
  currency: string;
};

export function DashboardShell({
  user,
  unread,
  children,
}: {
  user: ShellUser;
  unread: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const navigation = user.role === "ADMIN" ? [...navItems, adminNavItem] : navItems;

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative min-h-dvh">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_60%)]" />
        <div className="absolute inset-0 dot-grid opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
      </div>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-line bg-ink-900/70 px-4 py-5 backdrop-blur-xl lg:flex">
        <div className="px-2">
          <Logo markClassName="h-8 w-8 text-base" />
        </div>

        <nav aria-label="Dashboard" className="mt-8 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-violet/20 to-violet/5 text-white"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {active ? (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-violet to-mint" />
                ) : null}
                <Icon
                  className={`size-4.5 transition-colors ${
                    active ? "text-violet-soft" : "text-slate-400 group-hover:text-slate-300"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-2xl border border-line bg-gradient-to-br from-white/[0.045] to-transparent p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <Sparkles className="size-3 text-violet-soft" />
              Reminders
            </p>
            <p className="mt-2 flex items-center gap-2 text-xs font-medium text-white">
              <span className="size-1.5 rounded-full bg-mint shadow-[0_0_8px_1px_rgba(45,212,167,0.6)]" />
              Email delivery active
            </p>
            <p className="mt-1 truncate text-[11px] text-slate-400">
              {user.notifyEmail ?? user.email}
            </p>
            <Link
              href="/dashboard/settings"
              className="mt-2.5 inline-flex text-[11px] font-semibold text-violet-soft transition hover:text-white"
            >
              Manage reminders →
            </Link>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-line bg-white/[0.02] p-2.5">
            <Avatar
              name={user.name}
              avatar={user.avatar}
              className="size-9"
              textClassName="text-xs"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user.name}</p>
              <p className="truncate text-[10px] text-slate-400">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/[0.06] hover:text-rose"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <Topbar key={unread} user={user} initialUnread={unread} />
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-7">
          {children}
        </main>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink-950/92 backdrop-blur-xl lg:hidden"
      >
        <div className={`mx-auto grid max-w-md ${user.role === "ADMIN" ? "grid-cols-4" : "grid-cols-3"} px-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-1.5`}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors ${
                  active ? "text-white" : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <span
                  className={`inline-flex size-9 items-center justify-center rounded-xl transition-all ${
                    active
                      ? "bg-gradient-to-br from-violet/30 to-mint/15 text-violet-soft"
                      : "text-slate-400"
                  }`}
                >
                  <Icon className="size-4.5" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
