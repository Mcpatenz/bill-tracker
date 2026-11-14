"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  ChevronDown,
  Inbox,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import type { ShellUser } from "@/components/dashboard/dashboard-shell";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  channel: string;
  billId: string | null;
  readAt: string | null;
  createdAt: string;
};

const titles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/bills": "Bills",
  "/dashboard/settings": "Settings",
};

function pageTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard/admin/users/")) return "User details";
  if (pathname.startsWith("/dashboard/admin")) return "Admin";
  return titles[pathname] ?? "Overview";
}

export function Topbar({
  user,
  initialUnread,
}: {
  user: ShellUser;
  initialUnread: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const title = pageTitle(pathname);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(initialUnread);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);

  const bellRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setBellOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  async function toggleBell() {
    const next = !bellOpen;
    setBellOpen(next);
    setMenuOpen(false);
    if (!next) return;

    setLoading(true);
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications ?? []);
        setUnread(data.unread ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    setMarking(true);
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((current) =>
        current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })),
      );
      setUnread(0);
    } finally {
      setMarking(false);
    }
  }

  function markRead(item: NotificationItem) {
    setBellOpen(false);
    if (item.readAt) return;

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === item.id
          ? { ...notification, readAt: new Date().toISOString() }
          : notification,
      ),
    );
    setUnread((value) => Math.max(0, value - 1));

    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    }).catch(() => {});
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink-950/75 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="lg:hidden">
            <Logo showWord={false} markClassName="h-8 w-8 text-base" />
          </div>
          <div className="min-w-0">
            <p className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 lg:block">
              Mcpatenz Bill Tracker
            </p>
            <h1 className="truncate font-display text-[15px] font-semibold text-white lg:text-base">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={toggleBell}
              aria-expanded={bellOpen}
              aria-haspopup="true"
              aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
              className="relative inline-flex size-10 items-center justify-center rounded-xl border border-line bg-white/[0.03] text-slate-400 transition hover:border-line-strong hover:bg-white/[0.06] hover:text-white"
            >
              <Bell className="size-4.5" />
              {unread > 0 ? (
                <span className="absolute right-2 top-2 flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-rose" />
                </span>
              ) : null}
            </button>

            <AnimatePresence>
              {bellOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="glass-card absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-2xl border-line-strong"
                >
                  <div className="flex items-center justify-between border-b border-line px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">Notifications</p>
                      {unread > 0 ? (
                        <span className="rounded-full bg-violet/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-soft">
                          {unread} new
                        </span>
                      ) : null}
                    </div>
                    {unread > 0 ? (
                      <button
                        type="button"
                        onClick={markAllRead}
                        disabled={marking}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 transition hover:text-white disabled:opacity-50"
                      >
                        <Check className="size-3" />
                        Mark all read
                      </button>
                    ) : null}
                  </div>

                  <div className="max-h-[340px] overflow-y-auto">
                    {loading ? (
                      <div className="space-y-2 p-3">
                        {[0, 1, 2].map((index) => (
                          <div
                            key={index}
                            className="h-14 animate-pulse rounded-xl bg-white/[0.04]"
                          />
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                        <span className="inline-flex size-11 items-center justify-center rounded-full bg-white/[0.04] text-slate-400">
                          <Inbox className="size-5" />
                        </span>
                        <p className="mt-3 text-sm font-medium text-white">You are all caught up</p>
                        <p className="mt-1 text-xs text-slate-400">
                          Reminders will appear here when bills approach their due date.
                        </p>
                      </div>
                    ) : (
                      <ul>
                        {notifications.map((item) => (
                          <li
                            key={item.id}
                            className="border-b border-line/60 last:border-0"
                          >
                            <Link
                              href={item.billId ? "/dashboard/bills" : "/dashboard"}
                              onClick={() => markRead(item)}
                              className="flex gap-3 px-4 py-3 transition hover:bg-white/[0.04]"
                            >
                              <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet/12 text-violet-soft">
                                {item.channel === "EMAIL" ? (
                                  <Mail className="size-3.5" />
                                ) : (
                                  <Bell className="size-3.5" />
                                )}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-semibold text-white">{item.title}</p>
                                  {!item.readAt ? (
                                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-mint" />
                                  ) : null}
                                </div>
                                <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-400">
                                  {item.body}
                                </p>
                                <p className="mt-1 text-[10px] text-slate-400">
                                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="border-t border-line px-4 py-2.5">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setBellOpen(false)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 transition hover:text-white"
                    >
                      <Settings className="size-3" />
                      Notification settings
                    </Link>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                setMenuOpen((value) => !value);
                setBellOpen(false);
              }}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              title="Account menu"
              className="flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] p-1 pr-2 transition hover:border-line-strong hover:bg-white/[0.06]"
            >
              <Avatar
                name={user.name}
                avatar={user.avatar}
                className="size-8"
                textClassName="text-[11px]"
              />
              <span className="hidden max-w-[110px] truncate text-xs font-medium text-slate-200 sm:block">
                {user.name.split(" ")[0]}
              </span>
              <ChevronDown
                className={`hidden size-3.5 text-slate-400 transition-transform sm:block ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {menuOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="glass-card absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border-line-strong"
                >
                  <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
                    <Avatar
                      name={user.name}
                      avatar={user.avatar}
                      className="size-9"
                      textClassName="text-xs"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                      <p className="truncate text-[11px] text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="p-1.5">
                    {user.role === "ADMIN" ? (
                      <Link
                        href="/dashboard/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                      >
                        <ShieldCheck className="size-4 text-violet-soft" />
                        Admin dashboard
                      </Link>
                    ) : null}
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <User className="size-4 text-slate-400" />
                      Profile & settings
                    </Link>
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-rose/10 hover:text-rose"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
