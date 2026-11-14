"use client";

import { Reveal } from "@/components/ui/reveal";
import { formatStatNumber, formatStatRate } from "@/lib/format";
import type { SiteStats } from "@/lib/site-stats";

export function StatsStrip({ stats }: { stats: SiteStats }) {
  const items = [
    { value: formatStatNumber(stats.billsThisMonth), label: "bills tracked this month" },
    { value: formatStatRate(stats.onTimeRate), label: "paid on time" },
    { value: formatStatNumber(stats.currencies), label: "currencies supported" },
    {
      value: formatStatNumber(stats.members),
      label: stats.members === 1 ? "member tracking bills" : "members tracking bills",
    },
  ];

  return (
    <section aria-label="Mcpatenz Bill Tracker by the numbers" className="relative">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="glass-panel grid grid-cols-2 gap-y-8 rounded-2xl px-6 py-7 sm:px-10 lg:grid-cols-4">
            {items.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center text-center ${
                  index > 0 ? "lg:border-l lg:border-line" : ""
                }`}
              >
                <span className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {stat.value}
                </span>
                <span className="mt-1 text-xs text-slate-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
