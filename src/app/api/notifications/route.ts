import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapNotification } from "@/lib/supabase/records";
import { getApiUser } from "@/lib/auth";
import { syncUserReminders } from "@/lib/reminders";
import { serverError, unauthorized } from "@/lib/api";

export async function GET() {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();
    await syncUserReminders(user.id);
    const supabase = await createClient();
    const [notificationsResult, unreadResult] = await Promise.all([
      supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(12),
      supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("read_at", null),
    ]);
    if (notificationsResult.error) throw notificationsResult.error;
    if (unreadResult.error) throw unreadResult.error;
    return NextResponse.json({ notifications: (notificationsResult.data ?? []).map(mapNotification), unread: unreadResult.count ?? 0 });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();
    const body = await request.json().catch(() => null);
    const id = body && typeof body === "object" && typeof (body as { id?: unknown }).id === "string" ? (body as { id: string }).id : null;
    const supabase = await createClient();
    let query = supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
    if (id) query = query.eq("id", id);
    const { error } = await query;
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
