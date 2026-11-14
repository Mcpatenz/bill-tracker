import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, BellRing, CheckCircle2, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { CategoryIcon } from "@/components/ui/category-icon";
import { formatStatNumber } from "@/lib/format";
import { getSiteStats } from "@/lib/site-stats";

const preview = [
  { name: "Apartment rent", category: "HOUSING", amount: "₱1,450", due: "Due in 3 days" },
  { name: "Electricity", category: "UTILITIES", amount: "₱128.40", due: "Due today" },
  { name: "Netflix", category: "SUBSCRIPTIONS", amount: "₱15.49", due: "Reminder sent" },
];

export async function AuthShell({
  children,
  headline = "Every bill. One calm place.",
}: {
  children: ReactNode;
  headline?: string;
}) {
  const stats = await getSiteStats();

  return (
    <div className="relative grid min-h-dvh lg:grid-cols-2">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_75%)]" />

      <aside className="relative hidden overflow-hidden border-r border-line bg-ink-900/60 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -left-32 top-16 size-[420px] animate-aurora rounded-full bg-violet/20 blur-[110px]" />
        <div className="pointer-events-none absolute -right-24 bottom-10 size-[360px] animate-aurora rounded-full bg-mint/12 blur-[110px] [animation-delay:-7s]" />

        <div className="relative">
          <Logo markClassName="h-9 w-9 text-lg" />
          <div className="mt-16 max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet/25 bg-violet/10 px-3 py-1.5 text-xs font-medium text-violet-soft">
              <Sparkles className="size-3.5" />
              Reminders that arrive before the due date
            </span>
            <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white xl:text-[2.9rem]">
              {headline}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
              Track rent, utilities, subscriptions and loans in one place. Mcpatenz Bill Tracker emails you before
              each due date so nothing slips through.
            </p>
          </div>
        </div>

        <div className="relative my-10 max-w-md">
          <div className="glass-card rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-300">Today</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/10 px-2.5 py-1 text-[10px] font-medium text-mint">
                <BellRing className="size-3" />
                Reminder preview
              </span>
            </div>
            <div className="space-y-2">
              {preview.map((bill) => (
                <div
                  key={bill.name}
                  className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.03] px-3 py-2.5"
                >
                  <CategoryIcon category={bill.category} className="size-4" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-white">{bill.name}</p>
                    <p className="text-[10px] text-slate-400">{bill.due}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-200">{bill.amount}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-mint/20 bg-mint/[0.06] px-3 py-2 text-[11px] text-mint-soft">
              <CheckCircle2 className="size-3.5 shrink-0" />
              Your next reminder is scheduled automatically.
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 shrink-0 text-mint" />
            <span>
              {formatStatNumber(stats.members)}{" "}
              {stats.members === 1 ? "member" : "members"} ·{" "}
              {formatStatNumber(stats.billsTracked)} bills tracked
            </span>
          </div>
          <span>© {new Date().getFullYear()} Mcpatenz Bill Tracker</span>
        </div>
      </aside>

      <div className="relative flex min-h-dvh flex-col px-5 py-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden">
            <Logo markClassName="h-8 w-8 text-base" />
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Back home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
