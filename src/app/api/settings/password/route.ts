import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getApiUser } from "@/lib/auth";
import { passwordSchema } from "@/lib/validation";
import { apiError, serverError, unauthorized, validationError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();
    const body = await request.json().catch(() => null);
    const parsed = passwordSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);
    const supabase = await createClient();
    const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: parsed.data.currentPassword });
    if (verifyError) return apiError("Your current password is incorrect.", 401);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
