import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapBill } from "@/lib/supabase/records";
import { getApiUser } from "@/lib/auth";
import { billSchema } from "@/lib/validation";
import { apiError, serverError, unauthorized, validationError } from "@/lib/api";
import { parseDueDate } from "@/lib/dates";

export async function GET() {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();
    const supabase = await createClient();
    const { data, error } = await supabase.from("bills").select("*").eq("user_id", user.id).order("due_date", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ bills: (data ?? []).map(mapBill) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();
    const body = await request.json().catch(() => null);
    const parsed = billSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);
    const supabase = await createClient();
    const { data, error } = await supabase.from("bills").insert({
      user_id: user.id,
      name: parsed.data.name,
      amount: parsed.data.amount,
      category: parsed.data.category,
      due_date: parseDueDate(parsed.data.dueDate).toISOString(),
      recurrence: parsed.data.recurrence,
      notes: parsed.data.notes?.trim() || null,
      reminder_days_before: parsed.data.reminderDaysBefore,
    }).select("*").single();
    if (error) throw error;
    return NextResponse.json({ bill: mapBill(data) }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE() {
  const user = await getApiUser();
  if (!user) return unauthorized();
  return apiError("Choose a bill to delete.", 400);
}
