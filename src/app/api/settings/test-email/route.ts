import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { sendTestEmail } from "@/lib/mail";
import { apiError, serverError, unauthorized } from "@/lib/api";

export async function POST() {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();

    const result = await sendTestEmail(user);
    const to = user.notifyEmail || user.email;

    if (!result.delivered) {
      const notConfigured =
        result.reason === "SMTP not configured" || result.reason === "RESEND_API_KEY not configured";
      return NextResponse.json(
        {
          delivered: false,
          notConfigured,
          reason: result.reason,
          to,
          message: notConfigured
            ? "Email delivery is not configured on this server. Add SMTP credentials to .env to send live reminders."
            : `Could not send the test email (${result.reason}). Check your SMTP or Resend credentials and try again.`,
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ delivered: true, to });
  } catch (error) {
    return serverError(error);
  }
}

export async function GET() {
  return apiError("Use POST to send a test email.", 405);
}
