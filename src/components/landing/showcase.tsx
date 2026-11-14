"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  BellRing,
  Check,
  CircleDollarSign,
  Mail,
  TrendingUp,
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { CategoryIcon } from "@/components/ui/category-icon";

const bars = [38, 52, 44, 66, 58, 78];
const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];

const previewBills = [
  { name: "Apartment rent", category: "HOUSING", amount: "₱1,450", due: "Due in 3 days" },
  { name: "Electricity", category: "UTILITIES", amount: "₱128.40", due: "Due today" },
  { name: "Fiber internet", category: "INTERNET", amount: "₱59.99", due: "Due in 6 days" },
];

export function Showcase() {
  return (
    <section id="insights" className="relative scroll-mt-24 overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/3 size-[600px] -translate-x-1/2 rounded-full bg-violet/10 blur-[140px]" />
      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-10">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mint-soft">
            Your month, in one glance
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Clarity that actually sticks
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
            A dashboard built around the only questions that matter: what is due, what is paid and
            where did it all go?
          </p>

          <ul className="mt-8 space-y-4">
            {[
              {
                icon: BellRing,
                title: "Reminder engine",
                body: "Custom lead days per bill, delivered by email and recorded in-app.",
              },
              {
                icon: TrendingUp,
                title: "Six-month trends",
                body: "Compare what you paid with what is scheduled, month over month.",
              },
              {
                icon: CircleDollarSign,
                title: "Category breakdown",
                body: "Housing, utilities, subscriptions — see the real shape of your spending.",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.title} className="flex gap-3.5">
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-mint/20 bg-mint/10 text-mint">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{feature.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{feature.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <Link
            href="/login"
            className="group mt-9 inline-flex items-center gap-2 text-sm font-semibold text-violet-soft transition hover:text-white"
          >
            Explore your dashboard
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-violet/20 via-transparent to-mint/15 blur-2xl" />
            <div className="glass-card border-gradient relative overflow-hidden rounded-3xl p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose/70" />
                  <span className="size-2.5 rounded-full bg-amber/70" />
                  <span className="size-2.5 rounded-full bg-mint/70" />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-line bg-white/[0.03] px-3 py-1.5 text-[10px] text-slate-400">
                  <span className="size-1.5 rounded-full bg-mint" />
                  app.mcpatenz.com/dashboard
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-line bg-white/[0.03] px-2 py-1 text-[10px] text-slate-400">
                  <Mail className="size-3 text-mint" />
                  reminders on
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-ink-900/80 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                      Good morning, Alex
                    </p>
                    <p className="mt-1 font-display text-base font-semibold text-white sm:text-lg">
                      Here is what is due
                    </p>
                  </div>
                  <span className="hidden rounded-lg bg-gradient-to-r from-violet to-[#6d4df0] px-3 py-1.5 text-[10px] font-semibold text-white sm:inline-flex">
                    + Add bill
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  {[
                    { label: "Due this month", value: "₱1,711", color: "#a78bfa" },
                    { label: "Paid this month", value: "₱1,654", color: "#2dd4a7" },
                    { label: "Overdue", value: "₱320", color: "#fb7185" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-line bg-white/[0.025] p-2.5 sm:p-3"
                    >
                      <p className="text-[9px] uppercase tracking-wide text-slate-400 sm:text-[10px]">
                        {stat.label}
                      </p>
                      <p
                        className="mt-1 font-display text-sm font-bold sm:text-base"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-xl border border-line bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium text-slate-400">Payments · last 6 months</p>
                    <div className="flex items-center gap-1 text-[9px] text-mint">
                      <TrendingUp className="size-2.5" />
                      +8.4%
                    </div>
                  </div>
                  <div className="mt-3 flex h-24 items-end gap-2 sm:h-28">
                    {bars.map((height, index) => (
                      <div key={months[index]} className="flex flex-1 flex-col items-center gap-1.5">
                        <motion.div
                          initial={{ height: 0, opacity: 0.4 }}
                          whileInView={{ height: `${height}%`, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                          className="w-full rounded-t-md bg-gradient-to-t from-violet/30 via-violet/70 to-mint/80"
                        />
                        <span className="text-[8px] text-slate-400">{months[index]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {previewBills.map((bill) => (
                    <div
                      key={bill.name}
                      className="flex items-center gap-2.5 rounded-xl border border-line bg-white/[0.025] px-2.5 py-2"
                    >
                      <CategoryIcon category={bill.category} className="size-3.5" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-white">{bill.name}</p>
                        <p className="text-[9px] text-slate-400">{bill.due}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-200">{bill.amount}</span>
                      <span className="inline-flex size-5 items-center justify-center rounded-full bg-mint/15 text-mint">
                        <Check className="size-3" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
