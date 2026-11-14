"use client";

import { motion } from "motion/react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import type { DashboardData } from "@/lib/dashboard";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { formatCurrency } from "@/lib/format";

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 30 - (value / max) * 26;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 32" className="h-8 w-20 overflow-visible" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatsCards({
  data,
  currency,
}: {
  data: DashboardData;
  currency: string;
}) {
  const { stats, series } = data;
  const delta =
    stats.paidLastMonth > 0
      ? ((stats.paidThisMonth - stats.paidLastMonth) / stats.paidLastMonth) * 100
      : null;
  const progress =
    stats.paidThisMonth + stats.dueThisMonth > 0
      ? Math.min(
          100,
          (stats.paidThisMonth / (stats.paidThisMonth + stats.dueThisMonth)) * 100,
        )
      : 0;

  const cards = [
    {
      label: "Due this month",
      value: stats.dueThisMonth,
      format: (value: number) => formatCurrency(value, currency),
      icon: Clock,
      accent: "#8b5cf6",
      sub: `${stats.dueThisMonthCount} bill${stats.dueThisMonthCount === 1 ? "" : "s"} remaining`,
      extra: null,
    },
    {
      label: "Paid this month",
      value: stats.paidThisMonth,
      format: (value: number) => formatCurrency(value, currency),
      icon: CheckCircle2,
      accent: "#2dd4a7",
      sub: delta === null ? "No prior month yet" : `${Math.abs(delta).toFixed(0)}% vs last month`,
      extra:
        delta === null ? null : (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
              delta >= 0 ? "bg-mint/10 text-mint" : "bg-rose/10 text-rose"
            }`}
          >
            <TrendingUp className={`size-3 ${delta >= 0 ? "" : "rotate-180"}`} />
            {delta >= 0 ? "+" : "−"}
            {Math.abs(delta).toFixed(0)}%
          </span>
        ),
    },
    {
      label: "Overdue",
      value: stats.overdue,
      format: (value: number) => formatCurrency(value, currency),
      icon: AlertTriangle,
      accent: stats.overdueCount > 0 ? "#fb7185" : "#2dd4a7",
      sub:
        stats.overdueCount > 0
          ? `${stats.overdueCount} bill${stats.overdueCount === 1 ? "" : "s"} need attention`
          : "Nothing overdue — nice",
      extra: null,
    },
    {
      label: "Due next 7 days",
      value: stats.dueSoonCount,
      format: (value: number) => Math.round(value).toString(),
      icon: CalendarClock,
      accent: "#22d3ee",
      sub: stats.nextBill
        ? `Next: ${stats.nextBill.name}`
        : "No upcoming bills",
      extra: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.article
            key={card.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="group relative overflow-hidden rounded-2xl border border-line bg-white/[0.03] p-4 transition-colors duration-300 hover:border-line-strong hover:bg-white/[0.045] sm:p-5"
          >
            <div
              className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25"
              style={{ backgroundColor: card.accent }}
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  {card.label}
                </p>
                <p className="mt-2 truncate font-display text-[1.65rem] font-bold tracking-tight text-white">
                  <AnimatedNumber value={card.value} format={card.format} />
                </p>
              </div>
              <span
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border"
                style={{
                  backgroundColor: `${card.accent}14`,
                  borderColor: `${card.accent}2e`,
                  color: card.accent,
                }}
              >
                <Icon className="size-4" />
              </span>
            </div>

            <div className="relative mt-3 flex min-h-5 items-center justify-between gap-2">
              <span className="truncate text-[11px] text-slate-400">{card.sub}</span>
              {card.extra}
              {card.label === "Due this month" ? (
                <Sparkline values={series.map((point) => point.paid)} color="#a78bfa" />
              ) : null}
            </div>

            {card.label === "Paid this month" ? (
              <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-violet to-mint"
                />
              </div>
            ) : null}
          </motion.article>
        );
      })}
    </div>
  );
}
