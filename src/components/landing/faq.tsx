"use client";

import { Plus } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const faqs = [
  {
    question: "How do email reminders work?",
    answer:
      "Every day, Mcpatenz Bill Tracker checks the bills whose reminder window is approaching. When a bill enters the window you chose, an email is sent to your notification address with the amount and due date — and a matching alert is stored inside your dashboard.",
  },
  {
    question: "Can I use my Gmail address?",
    answer:
      "Yes. Any email address works as your reminder inbox. If you self-host Mcpatenz Bill Tracker, connect Gmail with an App Password in the SMTP settings; on a hosted deployment just enter the address and reminders are delivered automatically.",
  },
  {
    question: "Does Mcpatenz Bill Tracker work on phones and tablets?",
    answer:
      "Mcpatenz Bill Tracker is built mobile-first. The interface adapts to desktop monitors, laptops, iPads and Android tablets, and both iOS and Android phones. You can even install it to your home screen for a native app feel.",
  },
  {
    question: "Can I track recurring bills?",
    answer:
      "Absolutely. Choose weekly, monthly or yearly recurrence. When you mark a recurring bill as paid, the next due date is calculated and scheduled automatically, so the same bill keeps rolling forward without re-entry.",
  },
  {
    question: "What happens if I miss a due date?",
    answer:
      "Overdue bills are highlighted on your dashboard and reminders continue for a short grace period. Once paid, the bill is cleared and a payment record is added to your spending history.",
  },
  {
    question: "Is my data private?",
    answer:
      "Your passwords are hashed with bcrypt, sessions use signed HTTP-only cookies, and your bills are only visible to your account. Mcpatenz Bill Tracker does not sell data or display ads.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8 lg:px-10">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-soft">
            Questions, answered
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you might be wondering
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-3">
          {faqs.map((faq, index) => (
            <Reveal key={faq.question} delay={index * 0.03}>
              <details className="group rounded-2xl border border-line bg-white/[0.025] px-5 py-4 transition-colors open:border-line-strong open:bg-white/[0.04] sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-white marker:content-none [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-white/[0.04] text-slate-400 transition-transform duration-300 group-open:rotate-45 group-open:border-violet/40 group-open:text-violet-soft">
                    <Plus className="size-3.5" />
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl pr-8 text-sm leading-relaxed text-slate-400">
                  {faq.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
