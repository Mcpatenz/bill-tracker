import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CalendarClock,
  CreditCard,
  Mail,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAdminUserDetail } from "@/lib/admin";
import { Avatar } from "@/components/ui/avatar";
import { AdminUserBills } from "@/components/admin/admin-user-bills";
import { AdminUserProfileForm } from "@/components/admin/admin-user-profile-form";
import { formatCurrency } from "@/lib/format";
import { formatDate } from "@/lib/dates";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "User details",
  robots: { index: false, follow: false },
};

export default async function AdminUserPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const detail = await getAdminUserDetail(id);
  if (!detail) notFound();

  const { user, bills, stats } = detail;

  const cards = [
    { label: "Bills", value: stats.totalBills, tone: "text-white" },
    { label: "Unpaid", value: stats.unpaidBills, tone: "text-amber" },
    { label: "Overdue", value: stats.overdueBills, tone: "text-rose" },
    { label: "Paid", value: stats.paidBills, tone: "text-mint" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="size-3.5" />
          All users
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              name={user.name}
              avatar={user.avatar}
              className="size-12"
              textClassName="text-sm"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {user.name}
                </h2>
                {user.role === "ADMIN" ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-violet/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-soft">
                    <ShieldCheck className="size-2.5" />
                    Admin
                  </span>
                ) : null}
              </div>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span className="rounded-lg border border-line bg-white/[0.03] px-2.5 py-1.5">
              Joined {formatDate(user.createdAt)}
            </span>
            <span className="rounded-lg border border-line bg-white/[0.03] px-2.5 py-1.5">
              {user.currency} · {user.leadDays}-day lead
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-line bg-white/[0.03] p-3.5"
            >
              <p className="text-[10px] uppercase tracking-wide text-slate-400">{card.label}</p>
              <p className={`mt-1 font-display text-xl font-bold ${card.tone}`}>{card.value}</p>
            </div>
          ))}
          <div className="col-span-2 rounded-2xl border border-line bg-white/[0.03] p-3.5 sm:col-span-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Outstanding balance
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-white">
                  {formatCurrency(stats.outstanding, user.currency)}
                </p>
              </div>
              <Wallet className="size-5 text-violet-soft" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white/[0.03] p-4">
          <h3 className="font-display text-sm font-semibold text-white">Account</h3>
          <dl className="mt-3 space-y-2.5 text-[11px]">
            <div className="flex items-start justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-slate-400">
                <Mail className="size-3.5" />
                Reminder email
              </dt>
              <dd className="truncate text-right font-medium text-slate-200">
                {user.notifyEmail ?? user.email}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-slate-400">
                <CreditCard className="size-3.5" />
                Payments
              </dt>
              <dd className="font-medium text-slate-200">{user.paymentCount}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-slate-400">
                <Bell className="size-3.5" />
                Notifications
              </dt>
              <dd className="font-medium text-slate-200">{user.notificationCount}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-slate-400">
                <CalendarClock className="size-3.5" />
                Currency
              </dt>
              <dd className="font-medium text-slate-200">{user.currency}</dd>
            </div>
          </dl>
        </div>
      </div>

      <AdminUserProfileForm user={user} />
      <AdminUserBills userId={user.id} bills={bills} currency={user.currency} />
    </div>
  );
}
