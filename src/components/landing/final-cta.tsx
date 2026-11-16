"use client";

import Link from "next/link";
import { Download, KeyRound, Sparkles } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

export function FinalCta() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-line-strong bg-gradient-to-br from-[#121a30] via-ink-900 to-[#0b1a1d] px-6 py-14 text-center sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute -left-20 top-0 size-[380px] animate-pulse-glow rounded-full bg-violet/25 blur-[110px]" />
            <div className="pointer-events-none absolute -right-16 bottom-0 size-[360px] animate-pulse-glow rounded-full bg-mint/20 blur-[110px] [animation-delay:-1.5s]" />
            <div className="pointer-events-none absolute inset-0 dot-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

            <div className="relative mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/10 px-3.5 py-1.5 text-xs font-medium text-mint-soft">
                <Sparkles className="size-3.5" />
                Android access, on the go
              </span>

              <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.08]">
                Keep every bill in your pocket.
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-400">
                Download the APK and open the same bill tracking dashboard from your Android device.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="https://github.com/Mcpatenz/bill-tracker/releases/latest/download/BillTracker.apk"
                  className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet to-[#6d4df0] px-7 text-sm font-semibold text-white shadow-[0_18px_44px_-16px_rgba(139,92,246,0.55)]"
                >
                  <Download className="size-4" />
                  Download Android APK
                </a>

                <Link
                  href="/login"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line bg-white/[0.04] px-7 text-sm font-semibold text-slate-100 transition hover:border-white/10 hover:bg-white/[0.05]"
                >
                  <KeyRound className="size-4 text-mint" />
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
