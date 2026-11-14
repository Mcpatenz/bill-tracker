import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { ADMIN_ROLE, isBootstrapAdmin } from "@/lib/roles";
import { apiError, serverError, validationError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) return validationError(parsed.error);

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    if (!user) {
      return apiError("Incorrect email or password.", 401);
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return apiError("Incorrect email or password.", 401);
    }

    if (isBootstrapAdmin(user.email) && user.role !== ADMIN_ROLE) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: ADMIN_ROLE },
      });
    }

    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
