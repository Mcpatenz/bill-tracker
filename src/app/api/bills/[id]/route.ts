import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapBill } from "@/lib/supabase/records";
import { getApiUser } from "@/lib/auth";
import { billUpdateSchema } from "@/lib/validation";
import { apiError, serverError, unauthorized, validationError } from "@/lib/api";
import { parseDueDate } from "@/lib/dates";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const parsed = billUpdateSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);
    const data = parsed.data;
    const supabase = await createClient();
    const update = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.amount !== undefined ? { amount: data.amount } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.dueDate !== undefined ? { due_date: parseDueDate(data.dueDate).toISOString(), last_notified_at: null } : {}),
      ...(data.recurrence !== undefined ? { recurrence: data.recurrence } : {}),
      ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}),
      ...(data.reminderDaysBefore !== undefined ? { reminder_days_before: data.reminderDaysBefore } : {}),
    };
    const { data: bill, error } = await supabase.from("bills").update(update).eq("id", id).eq("user_id", user.id).select("*").maybeSingle();
    if (error) throw error;
    if (!bill) return apiError("Bill not found.", 404);
    if (data.dueDate !== undefined) {
      const { error: notificationError } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).eq("bill_id", bill.id).is("read_at", null);
      if (notificationError) console.error("[bills] Failed to clear bill notifications:", notificationError);
    }
    return NextResponse.json({ bill: mapBill(bill) });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: bill, error: lookupError } = await supabase.from("bills").select("id").eq("id", id).eq("user_id", user.id).maybeSingle();
    if (lookupError) throw lookupError;
    if (!bill) return apiError("Bill not found.", 404);
    const now = new Date().toISOString();
    const { error: notificationError } = await supabase.from("notifications").update({ read_at: now }).eq("user_id", user.id).eq("bill_id", bill.id).is("read_at", null);
    if (notificationError) throw notificationError;
    const { error } = await supabase.from("bills").delete().eq("id", bill.id).eq("user_id", user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
