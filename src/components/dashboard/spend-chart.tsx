"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartColumn } from "lucide-react";
import type { DashboardData } from "@/lib/dashboard";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";

function ChartTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; dataKey?: string | number }>;
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-line-strong bg-ink-900/95 px-3 py-2.5 shadow-xl backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <div key={String(entry.dataKey)} className="flex items-center gap-2 text-[11px]">
            <span
              className="size-1.5 rounded-full"
              style={{
                backgroundColor: entry.dataKey === "paid" ? "#a78bfa" : "#22d3ee",
              }}
            />
            <span className="capitalize text-slate-400">{entry.dataKey}</span>
            <span className="ml-auto font-semibold text-white">
              {formatCurrency(entry.value ?? 0, currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SpendChart({
  data,
  currency,
}: {
  data: DashboardData;
  currency: string;
}) {
  const hasPayments = data.series.some((point) => point.paid > 0);

  return (
    <div className="rounded-2xl border border-line bg-white/[0.03] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-sm font-semibold text-white">Cash flow</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">Paid vs scheduled · last 6 months</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-violet" />
            Paid
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-cyan/60" />
            Scheduled
          </span>
        </div>
      </div>

      <div className="mt-4 h-[248px] w-full">
        {!hasPayments ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-line text-center">
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-white/[0.04] text-slate-400">
              <ChartColumn className="size-5" />
            </span>
            <p className="mt-3 text-sm font-medium text-white">No payments yet</p>
            <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-slate-400">
              Mark a bill as paid and your spending history starts building here.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.series} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.35} />
                </linearGradient>
                <linearGradient id="dueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="rgba(148,163,184,0.1)"
                strokeDasharray="3 6"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10 }}
                width={44}
                tickFormatter={(value: number) => formatCompactCurrency(value, currency)}
              />
              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.06)" }}
                content={<ChartTooltip currency={currency} />}
              />
              <Bar
                dataKey="paid"
                fill="url(#paidGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={22}
              />
              <Bar
                dataKey="due"
                fill="url(#dueGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
