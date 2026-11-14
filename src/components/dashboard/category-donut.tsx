"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import type { DashboardData } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/format";

export function CategoryDonut({
  data,
  currency,
}: {
  data: DashboardData;
  currency: string;
}) {
  const total = data.categories.reduce((sum, category) => sum + category.amount, 0);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-white/[0.03] p-4 sm:p-5">
      <div>
        <h2 className="font-display text-sm font-semibold text-white">By category</h2>
        <p className="mt-0.5 text-[11px] text-slate-400">Unpaid bills, current cycle</p>
      </div>

      {data.categories.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-white/[0.04] text-slate-400">
            <PieIcon className="size-5" />
          </span>
          <p className="mt-3 text-sm font-medium text-white">Nothing to split yet</p>
          <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-slate-400">
            Add your first unpaid bill to see the category breakdown.
          </p>
        </div>
      ) : (
        <>
          <div className="relative mx-auto mt-2 h-[170px] w-full max-w-[210px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categories}
                    dataKey="amount"
                    nameKey="label"
                    innerRadius={54}
                    outerRadius={76}
                    paddingAngle={3}
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {data.categories.map((category) => (
                      <Cell key={category.value} fill={category.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0];
                      const entry = item?.payload as
                        | { label?: string; amount?: number }
                        | undefined;
                      return (
                        <div className="rounded-lg border border-line-strong bg-ink-900/95 px-2.5 py-1.5 text-[11px] shadow-xl">
                          <span className="text-slate-400">{entry?.label}</span>
                          <span className="ml-2 font-semibold text-white">
                            {formatCurrency(entry?.amount ?? 0, currency)}
                          </span>
                        </div>
                      );
                    }}
                  />
                </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase tracking-wide text-slate-400">Total</span>
              <span className="mt-0.5 font-display text-lg font-bold text-white">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>

          <ul className="mt-3 space-y-2">
            {data.categories.slice(0, 5).map((category) => (
              <li key={category.value} className="flex items-center gap-2 text-[11px]">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="truncate text-slate-400">{category.label}</span>
                <span className="ml-auto shrink-0 font-medium text-slate-200">
                  {formatCurrency(category.amount, currency)}
                </span>
                <span className="w-8 shrink-0 text-right text-slate-400">
                  {Math.round(category.share * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
