"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      <div className="aurora pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />
      <div className="relative">
        <Logo className="justify-center" />
        <p className="mt-10 font-display text-[11px] font-semibold uppercase tracking-[0.24em] text-rose">
          Something went wrong
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          We hit a snag
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          The page could not load. This is usually temporary — try again in a
          moment. If it keeps happening, refresh the page.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-7 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-ink-950 transition hover:bg-slate-200"
        >
          <RotateCcw className="size-4" />
          Try again
        </button>
      </div>
    </main>
  );
}
