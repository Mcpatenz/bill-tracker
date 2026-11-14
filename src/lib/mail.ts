import nodemailer from "nodemailer";
import type { Bill, User } from "@prisma/client";
import { formatCurrency } from "./format";
import { daysUntil, formatLongDate } from "./dates";

export type MailResult = { delivered: boolean; reason?: string };

type MailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const brand = {
  bg: "#070b14",
  card: "#0d1424",
  border: "#1e2a44",
  text: "#e7ecf7",
  muted: "#93a0bb",
  violet: "#8b5cf6",
  mint: "#2dd4a7",
  danger: "#fb7185",
};

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

type EmailContent = {
  preview: string;
  eyebrow: string;
  heading: string;
  body: string;
  billName?: string;
  amount?: string;
  dueDate?: string;
  accent: string;
  ctaLabel?: string;
  ctaHref?: string;
};

function renderEmail(content: EmailContent): string {
  const rows =
    content.billName && content.amount
      ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.card};border:1px solid ${brand.border};border-radius:16px;margin:24px 0;">
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${brand.muted};">Bill</p>
            <p style="margin:6px 0 18px;font-size:20px;font-weight:700;color:${brand.text};">${esc(content.billName)}</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;">
                  <p style="margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${brand.muted};">Amount</p>
                  <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:${content.accent};">${esc(content.amount)}</p>
                </td>
                <td style="vertical-align:top;text-align:right;">
                  <p style="margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${brand.muted};">Due date</p>
                  <p style="margin:6px 0 0;font-size:15px;font-weight:600;color:${brand.text};">${esc(content.dueDate ?? "")}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`
      : "";

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:${brand.bg};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(content.preview)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.bg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td style="padding-bottom:20px;">
                <span style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;border-radius:10px;background:linear-gradient(135deg,${brand.violet},${brand.mint});color:#0b0f1a;font-weight:800;font-size:18px;">B</span>
                <span style="margin-left:10px;font-size:17px;font-weight:700;color:${brand.text};vertical-align:middle;">Mcpatenz Bill Tracker</span>
              </td>
            </tr>
            <tr>
              <td style="background:linear-gradient(180deg,#101a30,#0b1220);border:1px solid ${brand.border};border-radius:24px;padding:36px 32px;overflow:hidden;">
                <p style="margin:0 0 10px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${content.accent};font-weight:700;">${esc(content.eyebrow)}</p>
                <h1 style="margin:0;font-size:26px;line-height:1.3;color:${brand.text};font-weight:800;">${esc(content.heading)}</h1>
                <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:${brand.muted};">${content.body}</p>
                ${rows}
                ${
                  content.ctaHref
                    ? `<a href="${esc(content.ctaHref)}" style="display:inline-block;background:linear-gradient(135deg,${brand.violet},#6d4df0);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 22px;border-radius:12px;">${esc(content.ctaLabel ?? "Open Mcpatenz Bill Tracker")}</a>`
                    : ""
                }
                <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#64748b;">
                  You are receiving this because reminders are enabled for this bill.
                  Manage your preferences in <a href="${siteUrl()}/dashboard/settings" style="color:${brand.muted};">notification settings</a>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 8px;text-align:center;font-size:12px;color:#64748b;line-height:1.6;">
                Mcpatenz Bill Tracker · Never miss another due date<br/>
                <a href="${siteUrl()}" style="color:#64748b;">${esc(siteUrl().replace(/^https?:\/\//, ""))}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function deliver(payload: MailPayload): Promise<MailResult> {
  const from = process.env.EMAIL_FROM || "Mcpatenz Bill Tracker <onboarding@resend.dev>";

  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        console.error("[mail] Resend error:", response.status, detail);
        return { delivered: false, reason: `Resend responded ${response.status}` };
      }
      return { delivered: true };
    } catch (error) {
      console.error("[mail] Resend request failed:", error);
      return { delivered: false, reason: "Resend request failed" };
    }
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.info(
      `[mail:dev] SMTP is not configured. Email for ${payload.to} would have been sent:\nSubject: ${payload.subject}\n${payload.text}`,
    );
    return { delivered: false, reason: "SMTP not configured" };
  }

  try {
    const transport = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: (process.env.SMTP_SECURE ?? "true") === "true",
      auth: { user, pass },
    });

    await transport.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    return { delivered: true };
  } catch (error) {
    console.error("[mail] SMTP send failed:", error);
    return { delivered: false, reason: "SMTP send failed" };
  }
}

export async function sendBillReminderEmail(
  user: User,
  bill: Bill,
  daysLeft: number,
): Promise<MailResult> {
  const to = user.notifyEmail || user.email;
  const amount = formatCurrency(bill.amount, user.currency);
  const due = formatLongDate(bill.dueDate);

  const heading =
    daysLeft < 0
      ? `${bill.name} is overdue`
      : daysLeft === 0
        ? `${bill.name} is due today`
        : `${bill.name} is due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;

  const body =
    daysLeft < 0
      ? `This bill passed its due date ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} ago. Settle it soon to avoid late fees.`
      : daysLeft === 0
        ? "Today is the due date. Take a moment to mark it as paid once you are done."
        : `A friendly heads-up from Mcpatenz Bill Tracker — your payment window closes soon.`;

  const html = renderEmail({
    preview: heading,
    eyebrow: daysLeft < 0 ? "Overdue reminder" : "Upcoming bill",
    heading,
    body,
    billName: bill.name,
    amount,
    dueDate: due,
    accent: daysLeft < 0 ? brand.danger : brand.mint,
    ctaLabel: "View bill",
    ctaHref: `${siteUrl()}/dashboard/bills`,
  });

  const text = `${heading}\n\nAmount: ${amount}\nDue date: ${due}\n\n${body}\n\nOpen Mcpatenz Bill Tracker: ${siteUrl()}/dashboard/bills`;

  return deliver({
    to,
    subject: `${heading} · ${amount}`,
    html,
    text,
  });
}

export async function sendTestEmail(user: User): Promise<MailResult> {
  const to = user.notifyEmail || user.email;
  const html = renderEmail({
    preview: "Your Mcpatenz Bill Tracker reminders are working",
    eyebrow: "Email check",
    heading: "Reminders are wired up",
    body: `Hi ${esc(user.name.split(" ")[0] ?? "there")}, this is a test from Mcpatenz Bill Tracker. When a bill reaches its reminder window, we will email this address automatically.`,
    accent: brand.mint,
    ctaLabel: "Open dashboard",
    ctaHref: `${siteUrl()}/dashboard`,
  });

  return deliver({
    to,
    subject: "Your Mcpatenz Bill Tracker email reminders are working",
    html,
    text: `Hi ${user.name}, your Mcpatenz Bill Tracker email reminders are working. Reminders will be delivered to ${to}.`,
  });
}

export function reminderPreview(bill: Bill, currency: string, daysLeft: number): string {
  const amount = formatCurrency(bill.amount, currency);
  if (daysLeft < 0) return `${bill.name} is ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} overdue · ${amount}`;
  if (daysLeft === 0) return `${bill.name} is due today · ${amount}`;
  return `${bill.name} is due in ${daysLeft} day${daysLeft === 1 ? "" : "s"} · ${amount}`;
}

export function dueInDays(bill: Bill): number {
  return daysUntil(bill.dueDate);
}
