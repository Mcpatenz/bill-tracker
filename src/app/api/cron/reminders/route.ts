import { NextResponse } from "next/server";
import { runReminderSweep } from "@/lib/reminders";
import { serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const header = request.headers.get("authorization");
      const bearer = header?.replace(/^Bearer\s+/i, "");
      const query = new URL(request.url).searchParams.get("secret");
      if (bearer !== secret && query !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const summary = await runReminderSweep();
    return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), ...summary });
  } catch (error) {
    return serverError(error);
  }
}
