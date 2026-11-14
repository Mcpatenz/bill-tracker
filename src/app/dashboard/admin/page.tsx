import type { Metadata } from "next";
import { AlertTriangle, ReceiptText, ShieldCheck, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAdminOverview } from "@/lib/admin";
import { AdminUsersTable } from "@/components/admin/admin-users-table";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const admin = await requireAdmin();
  const { users, stats } = await getAdminOverview();

  const cards = [
    { label: "Registered users", value: stats.users, icon: Users, tone: "text-violet-soft" },
    { label: "Admins", value: stats.admins, icon: ShieldCheck, tone: "text-mint" },
    { label: "Bills tracked", value: stats.bills, icon: ReceiptText, tone: "text-sky" },
    {
      label: "Unpaid bills",
      value: stats.unpaidBills,
      icon: AlertTriangle,
      tone: "text-amber",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
            Restricted access
          </p>
          <h2 className="mt-1 font-display text-[1.6rem] font-bold tracking-tight text-white sm:text-3xl">
            Admin<span className="text-gradient">.</span>
          </h2>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Review registered accounts, inspect their bills and remove accounts when necessary.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet/25 bg-violet/10 px-3 py-1.5 text-[11px] font-semibold text-violet-soft">
          <ShieldCheck className="size-3.5" />
          Admin dashboard
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-line bg-white/[0.03] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">{card.label}</p>
                <Icon className={`size-4 ${card.tone}`} />
              </div>
              <p className="mt-1.5 font-display text-2xl font-bold text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      <AdminUsersTable users={users} currentUserId={admin.id} />
    </div>
  );
}
