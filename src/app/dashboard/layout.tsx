import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { syncUserReminders } from "@/lib/reminders";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  await syncUserReminders(user.id);
  const unread = await prisma.notification.count({
    where: { userId: user.id, readAt: null },
  });

  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        notifyEmail: user.notifyEmail,
        currency: user.currency,
      }}
      unread={unread}
    >
      {children}
    </DashboardShell>
  );
}
