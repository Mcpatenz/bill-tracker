import { createClient } from "./supabase/server";
import { mapBill, mapProfile, type BillRecord, type UserRecord } from "./supabase/records";
import { daysUntil, sameUtcDay } from "./dates";
import { sendBillReminderEmail } from "./mail";
import { formatCurrency } from "./format";

export type ReminderSummary = {
  users: number;
  checked: number;
  notified: number;
  emailed: number;
  skipped: number;
  failed: number;
};

type ReminderBill = {
  name: string;
  amount: number;
  dueDate: Date;
};

function reminderMessage(bill: ReminderBill, days: number, currency: string) {
  const amount = formatCurrency(bill.amount, currency);
  const title =
    days < 0
      ? `${bill.name} is overdue`
      : days === 0
        ? `${bill.name} is due today`
        : `${bill.name} is due in ${days} day${days === 1 ? "" : "s"}`;
  const body = `${amount} · due ${new Date(bill.dueDate).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
  })}. Open Mcpatenz Bill Tracker to mark it as paid.`;
  return { title, body };
}

export async function syncUserReminders(userId: string): Promise<number> {
  const supabase = await createClient();
  const [profileResult, billsResult, notificationsResult] = await Promise.all([
    supabase.from("profiles").select("id, email, name, is_admin, avatar, notify_email, currency, lead_days, created_at, updated_at").eq("id", userId).maybeSingle(),
    supabase.from("bills").select("*").eq("user_id", userId).eq("is_paid", false),
    supabase.from("notifications").select("bill_id").eq("user_id", userId).not("bill_id", "is", null).gte("created_at", new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString()),
  ]);
  if (profileResult.error) throw profileResult.error;
  if (billsResult.error) throw billsResult.error;
  if (notificationsResult.error) throw notificationsResult.error;
  if (!profileResult.data) return 0;

  const user = mapProfile(profileResult.data);
  const bills = (billsResult.data ?? []).map(mapBill);
  const notifiedToday = new Set((notificationsResult.data ?? []).map((notification) => notification.bill_id));
  const now = new Date();
  let created = 0;
  for (const bill of bills) {
    const days = daysUntil(bill.dueDate);
    const window = bill.reminderDaysBefore;
    if (days > window || days < -7) continue;
    if (bill.lastNotifiedAt && sameUtcDay(bill.lastNotifiedAt, now)) continue;
    if (notifiedToday.has(bill.id)) continue;
    const { title, body } = reminderMessage(bill, days, user.currency);
    const { error } = await supabase.from("notifications").insert({ user_id: userId, bill_id: bill.id, title, body, channel: "IN_APP" });
    if (error) throw error;
    notifiedToday.add(bill.id);
    created += 1;
  }
  return created;
}

type WorkerReminder = {
  notificationId: string;
  days: number;
  user: Omit<UserRecord, "createdAt"> & { createdAt: string };
  bill: Omit<BillRecord, "dueDate" | "paidAt" | "lastNotifiedAt" | "createdAt" | "updatedAt"> & {
    dueDate: string;
    paidAt: string | null;
    lastNotifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export async function runReminderSweep(): Promise<ReminderSummary> {
  const projectUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!projectUrl || !serviceKey) throw new Error("The reminder worker is not configured.");

  const response = await fetch(`${projectUrl}/functions/v1/reminder-sweep`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ action: "run" }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Reminder worker failed with status ${response.status}.`);

  const result = await response.json() as ReminderSummary & { reminders: WorkerReminder[] };
  const summary: ReminderSummary = {
    users: result.users,
    checked: result.checked,
    notified: result.notified,
    emailed: 0,
    skipped: result.skipped,
    failed: result.failed,
  };
  const deliveredIds: string[] = [];
  for (const reminder of result.reminders ?? []) {
    try {
      const user: UserRecord = {
        ...reminder.user,
        createdAt: new Date(reminder.user.createdAt),
      };
      const bill: BillRecord = {
        ...reminder.bill,
        dueDate: new Date(reminder.bill.dueDate),
        paidAt: reminder.bill.paidAt ? new Date(reminder.bill.paidAt) : null,
        lastNotifiedAt: reminder.bill.lastNotifiedAt ? new Date(reminder.bill.lastNotifiedAt) : null,
        createdAt: new Date(reminder.bill.createdAt),
        updatedAt: new Date(reminder.bill.updatedAt),
      };
      const sent = await sendBillReminderEmail(user, bill, reminder.days);
      if (sent.delivered) {
        summary.emailed += 1;
        deliveredIds.push(reminder.notificationId);
      }
    } catch (error) {
      summary.failed += 1;
      console.error("[reminders] Failed to send reminder email:", error);
    }
  }

  if (deliveredIds.length) {
    const recordResponse = await fetch(`${projectUrl}/functions/v1/reminder-sweep`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ action: "record-email", notificationIds: deliveredIds }),
      cache: "no-store",
    });
    if (!recordResponse.ok) {
      summary.failed += deliveredIds.length;
      summary.emailed -= deliveredIds.length;
      console.error("[reminders] Could not record delivered email notifications.");
    }
  }
  return summary;
}
