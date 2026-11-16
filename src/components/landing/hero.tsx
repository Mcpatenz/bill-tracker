"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "motion/react";
import {
  BellRing,
  Check,
  CheckCircle2,
  Download,
  Sparkles,
} from "lucide-react";
import { formatStatNumber, formatStatRate } from "@/lib/format";
import type { SiteStats } from "@/lib/site-stats";

const HeroScene = dynamic(
  () => import("@/components/three/hero-scene").then((mod) => mod.HeroScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="relative size-56 animate-pulse-glow rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.45),transparent_65%)]" />
      </div>
    ),
  },
);

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const apkUrl =
  "https://github.com/Mcpatenz/bill-tracker/releases/latest/download/BillTracker.apk";

export function Hero({ stats }: { stats: SiteStats }) {
  return (
    <section className="relative overflow-hidden pb-16 pt-28 sm:pt-32 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-60 [mask-image:radial-gradient(ellipse_at_50%_20%,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -left-40 top-10 size-[520px] animate-aurora rounded-full bg-violet/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 top-40 size-[460px] animate-aurora rounded-full bg-mint/12 blur-[120px] [animation-delay:-6s]" />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.02fr_1fr] lg:gap-6 lg:px-10">
        <motion.div variants={container} initial="hidden" animate="show" className="relative z-10">
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet/25 bg-violet/10 px-3.5 py-1.5 text-xs font-medium text-violet-soft">
              <Sparkles className="size-3.5" />
              Smart bill tracking, minus the stress
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-[4.1rem]"
          >
            Never miss <br className="hidden sm:block" />
            <span className="text-gradient">another due date.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-400 sm:text-base"
          >
            Mcpatenz Bill Tracker keeps every bill, subscription and recurring payment in one calm view —
            then emails you automatically before the due date. No spreadsheets. No late fees. No
            last-minute panic.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={apkUrl}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet to-[#6d4df0] px-6 text-sm font-semibold text-white shadow-[0_18px_44px_-16px_rgba(139,92,246,0.55)]"
            >
              <Download className="size-4" />
              Download Android APK
            </a>

            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-white/[0.04] px-6 text-sm font-semibold text-slate-100 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06]"
            >
              <BellRing className="size-4 text-mint" />
              Sign in
            </Link>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400"
          >
            {["Free forever plan", "No card required", "Email reminders included"].map((label) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-mint" />
                {label}
              </span>
            ))}
          </motion.div>

          <motion.div
            variants={item}
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-6 text-xs text-slate-400"
          >
            <span>
              <span className="font-semibold text-slate-200">{formatStatNumber(stats.billsTracked)}</span>{" "}
              bills tracked
            </span>
            <span>
              <span className="font-semibold text-slate-200">{formatStatNumber(stats.currencies)}</span>{" "}
              currencies supported
            </span>
            <span>
              <span className="font-semibold text-slate-200">{formatStatRate(stats.onTimeRate)}</span>{" "}
              paid on time
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto h-[360px] w-full max-w-[560px] sm:h-[440px] lg:h-[540px]"
        >
          <div className="pointer-events-none absolute inset-8 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.22),transparent_65%)] blur-2xl" />
          <div className="absolute inset-0">
            <HeroScene />
          </div>

          <div className="pointer-events-none absolute left-0 top-6 animate-float sm:left-2">
            <div className="glass-card flex items-center gap-3 rounded-2xl px-3.5 py-2.5">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-amber/15 text-amber">
                <BellRing className="size-4" />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-white">Electricity</p>
                <p className="text-[10px] text-slate-400">Reminder sent · due today</p>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-10 right-0 animate-float-slow sm:right-2">
            <div className="glass-card flex items-center gap-3 rounded-2xl px-3.5 py-2.5">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-mint/15 text-mint">
                <CheckCircle2 className="size-4" />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-white">Apartment rent</p>
                <p className="text-[10px] text-slate-400">₱1,450 marked as paid</p>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-1 left-2 hidden animate-float-slow [animation-delay:-3s] sm:block">
            <div className="glass-card flex items-center gap-2.5 rounded-2xl px-3.5 py-2">
              <span className="size-2 rounded-full bg-mint shadow-[0_0_12px_2px_rgba(45,212,167,0.6)]" />
              <p className="text-[10px] font-medium text-slate-300">All bills under control</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
