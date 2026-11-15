import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getApiUser } from "@/lib/auth";
import { settingsSchema } from "@/lib/validation";
import { serverError, unauthorized, validationError } from "@/lib/api";

export async function PATCH(request: Request) {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();
    const body = await request.json().catch(() => null);
    if (body && typeof body === "object" && "notifyEmail" in body && !body.notifyEmail) body.notifyEmail = null;
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);
    const supabase = await createClient();
    const { data, error } = await supabase.from("profiles").update({
      name: parsed.data.name,
      ...(parsed.data.avatar !== undefined ? { avatar: parsed.data.avatar || null } : {}),
      notify_email: parsed.data.notifyEmail ?? null,
      currency: parsed.data.currency,
      lead_days: parsed.data.leadDays,
    }).eq("id", user.id).select("id, name, email, avatar, notify_email, currency, lead_days").maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Profile update was not applied.");
    return NextResponse.json({ user: {
      id: data.id, name: data.name, email: user.email, avatar: data.avatar,
      notifyEmail: data.notify_email, currency: data.currency, leadDays: data.lead_days,
    } });
  } catch (error) {
    return serverError(error);
  }
}
