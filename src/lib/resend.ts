import { Resend } from "resend";
import { config } from "@/config/unifiedConfig";

export const resend = new Resend(config.resend.apiKey);

export async function sendReminderEmail({
  to,
  eventTitle,
  hour,
  date,
}: {
  to: string;
  eventTitle: string;
  hour: number;
  date: string;
}) {
  const hourStr = `${hour.toString().padStart(2, "0")}:00`;
  await resend.emails.send({
    from: "StudyTracker <onboarding@resend.dev>",
    to,
    subject: `⏰ Reminder: ${eventTitle} at ${hourStr}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #6366f1;">⏰ Time to start!</h2>
        <p style="font-size: 18px; color: #1f2937;"><strong>${eventTitle}</strong></p>
        <p style="color: #6b7280;">Scheduled for <strong>${hourStr}</strong> on <strong>${date}</strong></p>
        <p style="color: #9ca3af; font-size: 12px;">This reminder was sent by your Study Tracker app.</p>
      </div>
    `,
  });
}
