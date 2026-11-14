"use client";

import Link from "next/link";
import { ArrowRight, BellRing, ListPlus, UserPlus } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const steps = [
  {
    icon: UserPlus,
    title: "Create your free account",
    description:
      "Sign up with an email address in under a minute. Add the inbox where you want reminders delivered.",
    accent: "#8b5cf6",
  },
  {
    icon: ListPlus,
    title: "Add your bills",
    description:
      "Set the amount, due date, category and how often it repeats. Choose how many days before due to be reminded.",
    accent: "#22d3ee",
  },
  {
    icon: BellRing,
    title: "Relax — reminders run themselves",
    description:
      "On the due date window, Mcpatenz Bill Tracker emails you automatically. Mark the bill paid and the next cycle schedules itself.",
    accent: "#2dd4a7",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mint-soft">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Set it up once. Stay ahead all year.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
            Three small steps today, and every future due date is handled for you.
          </p>
        </Reveal>

        <div className="relative mt-14 grid gap-5 lg:grid-cols-3">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-12 hidden h-px bg-gradient-to-r from-violet/40 via-cyan/40 to-mint/40 lg:block" />
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={index * 0.09}>
                <div className="group relative h-full rounded-2xl border border-line bg-white/[0.025] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:bg-white/[0.045]">
                  <div className="flex items-center justify-between">
                    <span
                      className="relative inline-flex size-12 items-center justify-center rounded-2xl border bg-ink-900"
                      style={{ borderColor: `${step.accent}35`, color: step.accent }}
                    >
                      <Icon className="size-5" />
                      <span
                        className="absolute -inset-1 rounded-2xl opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-40"
                        style={{ backgroundColor: step.accent }}
                      />
                    </span>
                    <span className="font-display text-4xl font-extrabold text-white/[0.06]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-10 flex justify-center">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-xl border border-line bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-line-strong hover:bg-white/[0.07]"
          >
            Start now — it is free
            <ArrowRight className="size-4 text-mint transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
