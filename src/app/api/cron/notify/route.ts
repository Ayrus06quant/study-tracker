import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendReminderEmail } from "@/lib/resend";
import { config } from "@/config/unifiedConfig";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  // Validate cron secret (set in Vercel env)
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== config.cron.secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");
    const currentHour = now.getHours();

    // Query events that should fire right now
    const eventsRef = adminDb.collection("calendarEvents");
    const snap = await eventsRef
      .where("date", "==", today)
      .where("hour", "==", currentHour)
      .where("notify", "==", true)
      .where("notified", "==", false)
      .get();

    if (snap.empty) {
      return NextResponse.json({ sent: 0, message: "No events to notify" });
    }

    let sent = 0;
    const tasks: Promise<void>[] = [];

    for (const eventDoc of snap.docs) {
      const event = eventDoc.data();
      const userId = event.userId;

      // Get user email from Firebase Auth
      tasks.push(
        (async () => {
          try {
            const { adminAuth } = await import("@/lib/firebase-admin");
            const userRecord = await adminAuth.getUser(userId);
            if (!userRecord.email) return;

            await sendReminderEmail({
              to: userRecord.email,
              eventTitle: event.title,
              hour: event.hour,
              date: event.date,
            });

            // Mark as notified
            await eventDoc.ref.update({ notified: true });
            sent++;
          } catch (err) {
            console.error(`Failed to notify event ${eventDoc.id}:`, err);
          }
        })()
      );
    }

    await Promise.all(tasks);
    return NextResponse.json({ sent, message: `Sent ${sent} notification(s)` });
  } catch (err) {
    console.error("Cron error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
