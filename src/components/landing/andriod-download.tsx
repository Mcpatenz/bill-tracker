import { Download, Smartphone } from "lucide-react";

const apkUrl =
  "https://github.com/Mcpatenz/bill-tracker/releases/latest/download/BillTracker.apk";

export function AndroidDownload() {
  return (
    <section aria-labelledby="android-download-title" className="relative px-5 pb-12 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl border border-violet/25 bg-gradient-to-r from-violet/10 via-white/[0.03] to-mint/10 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex items-start gap-4">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl border border-violet/25 bg-violet/10 text-violet-soft">
            <Smartphone className="size-6" aria-hidden="true" />
          </span>

          <div>
            <h2 id="android-download-title" className="font-display text-xl font-bold text-white sm:text-2xl">
              Take your bills with you
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
              Get the Android app and keep your bills and reminders close, wherever you go.
            </p>
          </div>
        </div>

        <a
          href={apkUrl}
          className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet to-[#6d4df0] px-5 text-sm font-semibold text-white shadow-[0_14px_36px_-16px_rgba(139,92,246,0.8)] transition hover:brightness-110 sm:w-auto"
        >
          <Download className="size-4" aria-hidden="true" />
          Download Android APK
        </a>
      </div>
    </section>
  );
}
