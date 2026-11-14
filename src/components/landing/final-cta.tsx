"use client";

import Link from "next/link";
import { ArrowRight, KeyRound, Sparkles } from "lucide-react";
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
                Free forever · no card required
              </span>
              <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.08]">
                Your next late fee is{" "}
                <span className="text-gradient-accent">optional.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-400">
                Join thousands of people who stopped keeping bills in their head. Set it up in
                three minutes and let Mcpatenz Bill Tracker handle the rest.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet to-[#6d4df0] px-7 text-sm font-semibold text-white shadow-[0_18px_44px_-16px_rgba(139,92,246,1)] transition hover:brightness-110 active:scale-[0.98] sm:w-auto"
                >
                  Create free account
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line bg-white/[0.04] px-7 text-sm font-semibold text-slate-100 transition hover:border-line-strong hover:bg-white/[0.08] active:scale-[0.98] sm:w-auto"
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
