export default function DashboardLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-8 w-64 animate-pulse rounded-lg bg-white/[0.06]" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-xl bg-white/[0.06]" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-line bg-white/[0.03]"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-80 animate-pulse rounded-2xl border border-line bg-white/[0.03]" />
        <div className="h-80 animate-pulse rounded-2xl border border-line bg-white/[0.03]" />
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-line bg-white/[0.03]" />
      <span className="sr-only">Loading your dashboard</span>
    </div>
  );
}
