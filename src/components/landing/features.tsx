"use client";

import {
  BellRing,
  ChartColumn,
  MonitorSmartphone,
  Repeat,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const features = [
  {
    icon: Wallet,
    title: "Every bill in one view",
    description:
      "See what is due this month, what is overdue and what is coming next — without opening five different apps.",
    accent: "#8b5cf6",
  },
  {
    icon: BellRing,
    title: "Automatic email reminders",
    description:
      "Reminders arrive before the due date, straight to Gmail or any inbox. Choose how many days of headroom you want.",
    accent: "#2dd4a7",
  },
  {
    icon: Repeat,
    title: "Recurring bills roll forward",
    description:
      "Mark rent or a subscription as paid and Mcpatenz Bill Tracker schedules the next cycle automatically. One-time bills close cleanly.",
    accent: "#22d3ee",
  },
  {
    icon: ChartColumn,
    title: "Spending insights",
    description:
      "A six-month payment history and category breakdown show exactly where the money goes — no spreadsheet required.",
    accent: "#fbbf24",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description:
      "Passwords are hashed, sessions are signed and your bills stay yours. No ads, no data resale, no surprises.",
    accent: "#fb7185",
  },
  {
    icon: MonitorSmartphone,
    title: "Every device, every screen",
    description:
      "A layout that feels native on a desktop, laptop, tablet, Android phone and iPhone. One account, everywhere.",
    accent: "#38bdf8",
  },
];

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-soft">
            Everything in one place
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            The calm way to stay on top of bills
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
            Mcpatenz Bill Tracker removes the mental load of due dates. Organize, pay and understand your bills
            with a tool that is genuinely pleasant to use.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={index * 0.05}>
                <article className="group relative h-full overflow-hidden rounded-2xl border border-line bg-white/[0.025] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:bg-white/[0.045]">
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                    style={{ backgroundColor: feature.accent }}
                  />
                  <span
                    className="relative inline-flex size-11 items-center justify-center rounded-xl border"
                    style={{
                      backgroundColor: `${feature.accent}14`,
                      borderColor: `${feature.accent}2e`,
                      color: feature.accent,
                    }}
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="relative mt-5 font-display text-base font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
