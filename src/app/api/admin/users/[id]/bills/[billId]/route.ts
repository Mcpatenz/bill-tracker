import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getApiUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { apiError, forbidden, serverError, unauthorized } from "@/lib/api";

type Context = { params: Promise<{ id: string; billId: string }> };

export async function DELETE(_request: Request, context: Context) {
  try {
    const admin = await getApiUser();
    if (!admin) return unauthorized();
    if (!isAdminRole(admin.role)) return forbidden("Admin access required.");
    const { id, billId } = await context.params;
    const supabase = await createClient();
    const { data: bill, error: lookupError } = await supabase.from("bills").select("id").eq("id", billId).eq("user_id", id).maybeSingle();
    if (lookupError) throw lookupError;
    if (!bill) return apiError("Bill not found.", 404);
    const { error: notificationError } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", id).eq("bill_id", bill.id).is("read_at", null);
    if (notificationError) throw notificationError;
    const { error } = await supabase.from("bills").delete().eq("id", bill.id).eq("user_id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
