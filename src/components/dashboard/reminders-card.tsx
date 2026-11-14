"use client";

import { useState } from "react";
import { BellRing, Loader2, Send } from "lucide-react";
import type { DashboardBill } from "@/lib/dashboard";
import { useToast } from "@/components/ui/toast";

export function RemindersCard({
  email,
  leadDays,
  nextBill,
  smtpConfigured,
}: {
  email: string;
  leadDays: number;
  nextBill: DashboardBill | null;
  smtpConfigured: boolean;
}) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  async function sendTest() {
    setSending(true);
    try {
      const response = await fetch("/api/settings/test-email", { method: "POST" });
      const data = await response.json().catch(() => ({}));

      if (data.delivered) {
        toast({
          title: "Test email sent",
          description: `Check ${data.to} — it should arrive in a moment.`,
        });
      } else {
        toast({
          title: data.notConfigured ? "Email delivery is not configured" : "Test email failed",
          description:
            data.message ??
            "Add SMTP credentials to .env to send live reminders. Reminders are still recorded in-app.",
          variant: data.notConfigured ? "info" : "error",
        });
      }
    } catch {
      toast({
        title: "Network error",
        description: "Could not reach the server. Try again.",
        variant: "error",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-white/[0.03] p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-lg bg-violet/12 text-violet-soft">
          <BellRing className="size-4" />
        </span>
        <div>
          <h2 className="font-display text-sm font-semibold text-white">Reminder engine</h2>
          <p className="text-[10px] text-slate-400">In-app on load · email at 08:00 UTC</p>
        </div>
      </div>

      <dl className="mt-4 space-y-3 text-[11px]">
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-slate-400">Deliver to</dt>
          <dd className="truncate text-right font-medium text-slate-200">{email}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Lead time</dt>
          <dd className="font-medium text-slate-200">
            {leadDays} day{leadDays === 1 ? "" : "s"} before due
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-slate-400">Next reminder</dt>
          <dd className="truncate text-right font-medium text-slate-200">
            {nextBill ? nextBill.name : "No unpaid bills"}
          </dd>
        </div>
      </dl>

      <div
        className={`mt-4 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[10px] leading-relaxed ${
          smtpConfigured
            ? "border-mint/20 bg-mint/[0.06] text-mint-soft"
            : "border-amber/20 bg-amber/[0.06] text-amber"
        }`}
      >
        <span
          className={`mt-1 size-1.5 shrink-0 rounded-full ${
            smtpConfigured ? "bg-mint" : "bg-amber"
          }`}
        />
        {smtpConfigured
          ? "Live email delivery is connected. Reminders will reach your inbox automatically."
          : "Dev mode: emails are logged to the server console and reminders are recorded in-app. Add SMTP details to send live email."}
      </div>

      <button
        type="button"
        onClick={sendTest}
        disabled={sending}
        className="mt-auto inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-white/[0.04] text-[11px] font-semibold text-slate-200 transition hover:border-line-strong hover:bg-white/[0.07] disabled:opacity-60"
      >
        {sending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
        Send a test email
      </button>
    </div>
  );
}
