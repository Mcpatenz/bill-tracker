import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      <div className="aurora pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />
      <div className="relative">
        <Logo className="justify-center" />
        <p className="mt-10 font-display text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-soft">
          404
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          This page slipped through
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          The link may be outdated or the page may have moved. Your bills are
          still safe and waiting on the dashboard.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-ink-950 transition hover:bg-slate-200"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-line-strong bg-white/[0.04] px-4 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
