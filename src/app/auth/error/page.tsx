import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Email link expired",
  robots: { index: false, follow: false },
};

export default function AuthErrorPage() {
  return (
    <AuthShell headline="Let’s get you back on track.">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-soft">
          Link unavailable
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
          This email link has expired
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Request a fresh confirmation email, then open the newest link to finish signing in.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-violet px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet/90"
        >
          Return to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
