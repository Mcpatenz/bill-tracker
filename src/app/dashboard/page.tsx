import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import { greeting, formatLongDate } from "@/lib/dates";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SpendChart } from "@/components/dashboard/spend-chart";
import { CategoryDonut } from "@/components/dashboard/category-donut";
import { UpcomingList } from "@/components/dashboard/upcoming-list";
import { RemindersCard } from "@/components/dashboard/reminders-card";
import { QuickAdd } from "@/components/bills/quick-add";

export const metadata: Metadata = {
  title: "Overview",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);

  const smtpConfigured = Boolean(
    process.env.RESEND_API_KEY ||
      (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
  );

  const firstName = user.name.split(" ")[0] || user.name;
  const summary =
    data.stats.activeBills === 0
      ? "Add your first bill and Mcpatenz Bill Tracker will handle the reminders."
      : data.stats.overdueCount > 0
        ? `${data.stats.overdueCount} bill${data.stats.overdueCount === 1 ? "" : "s"} overdue — a quick payment will clear the noise.`
        : data.stats.dueSoonCount > 0
          ? `${data.stats.dueSoonCount} bill${data.stats.dueSoonCount === 1 ? "" : "s"} due in the next 7 days.`
          : "You are all caught up. Nothing due in the next week.";

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
            {formatLongDate(new Date())}
          </p>
          <h2 className="mt-1 font-display text-[1.6rem] font-bold tracking-tight text-white sm:text-3xl">
            {greeting()}, {firstName}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{summary}</p>
        </div>
        <QuickAdd currency={user.currency} defaultLeadDays={user.leadDays} />
      </div>

      <StatsCards data={data} currency={user.currency} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SpendChart data={data} currency={user.currency} />
        </div>
        <CategoryDonut data={data} currency={user.currency} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UpcomingList bills={data.upcoming} currency={user.currency} />
        </div>
        <RemindersCard
          email={user.notifyEmail ?? user.email}
          leadDays={user.leadDays}
          nextBill={data.stats.nextBill}
          smtpConfigured={smtpConfigured}
        />
      </div>
    </div>
  );
}
