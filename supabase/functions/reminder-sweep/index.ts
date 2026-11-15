import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!supabaseUrl || !serviceKey) throw new Error("Supabase Edge Function environment is not configured.");

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Row = Record<string, unknown>;

async function loadAll(table: "profiles" | "bills" | "notifications", columns: string): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select(columns).range(from, from + 999);
    if (error) throw error;
    const batch = (data ?? []) as unknown as Row[];
    rows.push(...batch);
    if (batch.length < 1000) return rows;
  }
}

function dayNumber(value: string | Date): number {
  const date = new Date(value);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function daysUntil(value: string): number {
  return Math.round((dayNumber(value) - dayNumber(new Date())) / 86_400_000);
}

function sameUtcDay(left: string, right: Date): boolean {
  return dayNumber(left) === dayNumber(right);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (request.headers.get("authorization") !== `Bearer ${serviceKey}`) return json({ error: "Unauthorized" }, 401);

  try {
    const body = await request.json().catch(() => null) as { action?: string; notificationIds?: string[] } | null;
    if (body?.action === "record-email") {
      const ids = Array.isArray(body.notificationIds) ? body.notificationIds.filter((id) => typeof id === "string") : [];
      if (ids.length) {
        const { error } = await supabase.from("notifications").update({ channel: "EMAIL" }).in("id", ids);
        if (error) throw error;
      }
      return json({ ok: true });
    }
    if (body?.action !== "run") return json({ error: "Invalid action" }, 400);

    const [profiles, bills, notifications] = await Promise.all([
      loadAll("profiles", "id, name, email, notify_email, currency, lead_days"),
      loadAll("bills", "id, user_id, name, amount, category, due_date, recurrence, notes, reminder_days_before, last_notified_at, is_paid"),
      loadAll("notifications", "id, user_id, bill_id, channel, created_at"),
    ]);
    const profileById = new Map(profiles.map((profile) => [String(profile.id), profile]));
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const notifiedToday = new Set(notifications
      .filter((item) => item.bill_id && dayNumber(String(item.created_at)) >= dayNumber(todayStart))
      .map((item) => `${item.user_id}:${item.bill_id}`));
    const summary = { users: profiles.length, checked: 0, notified: 0, emailed: 0, skipped: 0, failed: 0 };
    const reminders: Row[] = [];
    const now = new Date().toISOString();

    for (const bill of bills) {
      if (bill.is_paid) continue;
      const profile = profileById.get(String(bill.user_id));
      if (!profile) continue;
      summary.checked += 1;
      const days = daysUntil(String(bill.due_date));
      const window = Math.min(Number(bill.reminder_days_before), Number(profile.lead_days));
      if (days > window || days < -7) continue;
      if (bill.last_notified_at && sameUtcDay(String(bill.last_notified_at), new Date())) {
        summary.skipped += 1;
        continue;
      }
      const key = `${bill.user_id}:${bill.id}`;
      if (notifiedToday.has(key)) {
        summary.skipped += 1;
        continue;
      }
      const dueDate = new Date(String(bill.due_date));
      const dateLabel = dueDate.toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric" });
      const title = days < 0 ? `${bill.name} is overdue` : days === 0 ? `${bill.name} is due today` : `${bill.name} is due in ${days} day${days === 1 ? "" : "s"}`;
      const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: String(profile.currency || "USD") }).format(Number(bill.amount));
      const message = `${amount} · due ${dateLabel}. Open Mcpatenz Bill Tracker to mark it as paid.`;
      const { data: notification, error: insertError } = await supabase.from("notifications").insert({
        user_id: String(profile.id), bill_id: String(bill.id), title, body: message, channel: "IN_APP",
      }).select("id").single();
      if (insertError) {
        summary.failed += 1;
        console.error("[reminder-sweep] Notification insert failed:", insertError.message);
        continue;
      }
      const { error: updateError } = await supabase.from("bills").update({ last_notified_at: now }).eq("id", String(bill.id));
      if (updateError) {
        summary.failed += 1;
        console.error("[reminder-sweep] Bill timestamp update failed:", updateError.message);
        continue;
      }
      notifiedToday.add(key);
      summary.notified += 1;
      reminders.push({
        notificationId: notification.id,
        user: {
          id: profile.id, name: profile.name, email: profile.email,
          notifyEmail: profile.notify_email, currency: profile.currency,
          role: "USER", avatar: null, leadDays: profile.lead_days, createdAt: now,
        },
        bill: {
          id: bill.id, userId: bill.user_id, name: bill.name, amount: bill.amount,
          category: bill.category, dueDate: bill.due_date, recurrence: bill.recurrence,
          notes: bill.notes, isPaid: false, paidAt: null,
          reminderDaysBefore: bill.reminder_days_before, lastNotifiedAt: now,
          createdAt: now, updatedAt: now,
        },
        days,
      });
    }
    return json({ ...summary, reminders });
  } catch (error) {
    console.error("[reminder-sweep] Failed:", error);
    return json({ error: "Reminder sweep failed" }, 500);
  }
});
