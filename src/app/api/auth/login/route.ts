import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation";
import { apiError, serverError, validationError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email.trim().toLowerCase(),
      password: parsed.data.password,
    });

    if (error?.code === "email_not_confirmed") {
      return apiError("Check your inbox and confirm your email before signing in.", 403);
    }
    if (error?.status === 429) {
      return apiError("Too many sign-in attempts. Please wait a moment and try again.", 429);
    }
    if (error) return apiError("Incorrect email or password.", 401);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
