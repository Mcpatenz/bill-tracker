import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { SettingsClient } from "@/components/dashboard/settings-client";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const user = await requireUser();

  const smtpConfigured = Boolean(
    process.env.RESEND_API_KEY ||
      (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
  );

  return (
    <SettingsClient
      user={{
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        notifyEmail: user.notifyEmail,
        currency: user.currency,
        leadDays: user.leadDays,
      }}
      smtpConfigured={smtpConfigured}
    />
  );
}
