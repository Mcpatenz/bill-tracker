import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getApiUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { apiError, forbidden, serverError, unauthorized, validationError } from "@/lib/api";
import { adminProfileSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  try {
    const admin = await getApiUser();
    if (!admin) return unauthorized();
    if (!isAdminRole(admin.role)) return forbidden("Admin access required.");

    const { id } = await context.params;
    const parsed = adminProfileSchema.safeParse(await request.json());
    if (!parsed.success) return validationError(parsed.error);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        name: parsed.data.name,
        avatar: parsed.data.avatar || null,
        notify_email: parsed.data.notifyEmail || null,
        currency: parsed.data.currency,
        lead_days: parsed.data.leadDays,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return apiError("User not found.", 404);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const admin = await getApiUser();
    if (!admin) return unauthorized();
    if (!isAdminRole(admin.role)) return forbidden("Admin access required.");
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: target, error: targetError } = await supabase.from("profiles").select("id, is_admin").eq("id", id).maybeSingle();
    if (targetError) throw targetError;
    if (!target) return apiError("User not found.", 404);
    if (target.id === admin.id) return apiError("You cannot delete your own account.", 400);
    if (target.is_admin) {
      const { count, error } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_admin", true);
      if (error) throw error;
      if ((count ?? 0) <= 1) return apiError("At least one admin account is required.", 400);
    }
    const { error } = await supabase.rpc("admin_delete_user", { target_user_id: target.id });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
