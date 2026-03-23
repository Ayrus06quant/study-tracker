import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { sendDailySummaryEmail } from "@/lib/resend";
import { config } from "@/config/unifiedConfig";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== config.cron.secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    // In Vercel UTC this is 2am, which is 7:30am IST on the same day
    const today = format(now, "yyyy-MM-dd");

    const eventsRef = adminDb.collection("calendarEvents");
    const snap = await eventsRef
      .where("date", "==", today)
      .where("notify", "==", true)
      .where("notified", "==", false)
      .get();

    if (snap.empty) {
      return NextResponse.json({ sent: 0, message: "No events to notify" });
    }

    const eventsByUser = new Map<string, any[]>();
    snap.docs.forEach(doc => {
      const e = doc.data();
      if (!eventsByUser.has(e.userId)) eventsByUser.set(e.userId, []);
      eventsByUser.get(e.userId)!.push({ id: doc.id, ...e });
    });

    let sent = 0;
    const tasks: Promise<void>[] = [];

    for (const [userId, curEvents] of eventsByUser.entries()) {
      tasks.push(
        (async () => {
          try {
            const userRecord = await adminAuth.getUser(userId);
            if (!userRecord.email) return;

            curEvents.sort((a: any, b: any) => a.hour - b.hour);

            await sendDailySummaryEmail({
              to: userRecord.email,
              date: today,
              events: curEvents,
            });

            const batch = adminDb.batch();
            for (const e of curEvents) {
              const ref = adminDb.collection("calendarEvents").doc(e.id);
              batch.update(ref, { notified: true });
            }
            await batch.commit();
            sent++;
          } catch (err) {
            console.error(`Failed to notify user ${userId}:`, err);
          }
        })()
      );
    }

    await Promise.all(tasks);
    return NextResponse.json({ sent, message: `Sent ${sent} daily summary email(s)` });
  } catch (err) {
    console.error("Cron error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

