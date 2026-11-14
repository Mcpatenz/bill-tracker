import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { ADMIN_ROLE, USER_ROLE, isBootstrapAdmin } from "@/lib/roles";
import { apiError, serverError, validationError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) return validationError(parsed.error);

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError("An account with this email already exists.", 409);
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email,
        passwordHash,
        role: isBootstrapAdmin(email) ? ADMIN_ROLE : USER_ROLE,
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to Mcpatenz Bill Tracker",
        body: "Your calm, clear bill tracker is ready. Add your first bill and let reminders handle the rest.",
        channel: "IN_APP",
      },
    });

    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
