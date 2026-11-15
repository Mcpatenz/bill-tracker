import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const { count: unread, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);
  if (error) throw error;

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
      unread={unread ?? 0}
    >
      {children}
    </DashboardShell>
  );
}
