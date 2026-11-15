import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validation";
import { apiError, serverError, validationError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const supabase = await createClient();
    const origin = new URL(request.url).origin;
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email.trim().toLowerCase(),
      password: parsed.data.password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${origin}/auth/callback`,
        data: { name: parsed.data.name.trim() },
      },
    });

    if (error?.status === 429) {
      return apiError("Too many sign-up attempts. Please wait a moment and try again.", 429);
    }
    if (error) return apiError("Unable to create your account. Please try again.", 400);

    return NextResponse.json({
      ok: true,
      confirmationRequired: !data.session,
    });
  } catch (error) {
    return serverError(error);
  }
}
