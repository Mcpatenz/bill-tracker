import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapBill } from "@/lib/supabase/records";
import { getApiUser } from "@/lib/auth";
import { apiError, serverError, unauthorized } from "@/lib/api";
import { nextOccurrence, toDateInput } from "@/lib/dates";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: row, error: billError } = await supabase.from("bills").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
    if (billError) throw billError;
    if (!row) return apiError("Bill not found.", 404);
    const bill = mapBill(row);
    if (bill.isPaid) return apiError("This bill is already marked as paid.", 409);

    const paidAt = new Date();
    const recurring = bill.recurrence !== "ONCE";
    const nextDate = recurring ? nextOccurrence(bill.dueDate, bill.recurrence) : null;
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: user.id,
      bill_id: bill.id,
      amount: bill.amount,
      due_date: bill.dueDate.toISOString(),
      paid_at: paidAt.toISOString(),
      method: "MANUAL",
    });
    if (paymentError) throw paymentError;

    const update = recurring
      ? { due_date: nextDate!.toISOString(), is_paid: false, paid_at: paidAt.toISOString(), last_notified_at: null }
      : { is_paid: true, paid_at: paidAt.toISOString() };
    const { data: updatedRow, error: updateError } = await supabase.from("bills").update(update).eq("id", bill.id).eq("user_id", user.id).eq("is_paid", false).select("*").maybeSingle();
    if (updateError) throw updateError;
    if (!updatedRow) return apiError("This bill was already marked as paid.", 409);

    const { error: notificationError } = await supabase.from("notifications").update({ read_at: paidAt.toISOString() }).eq("user_id", user.id).eq("bill_id", bill.id).is("read_at", null);
    if (notificationError) console.error("[payments] Failed to clear bill notifications:", notificationError);

    return NextResponse.json({ bill: mapBill(updatedRow), rolledTo: nextDate ? toDateInput(nextDate) : null });
  } catch (error) {
    return serverError(error);
  }
}
