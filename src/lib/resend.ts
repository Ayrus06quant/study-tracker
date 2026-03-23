import { Resend } from "resend";
import { config } from "@/config/unifiedConfig";

export const resend = new Resend(config.resend.apiKey);

export async function sendDailySummaryEmail({
  to,
  date,
  events,
}: {
  to: string;
  date: string;
  events: Array<{ title: string; hour: number; duration: number }>;
}) {
  const eventsHtml = events
    .map(
      (e) =>
        `<li style="margin-bottom: 8px;"><strong>${e.hour.toString().padStart(2, "0")}:00</strong> — ${e.title} <em>(${e.duration}h)</em></li>`
    )
    .join("");

  await resend.emails.send({
    from: "StudyTracker <onboarding@resend.dev>",
    to,
    subject: `📅 Your Daily Schedule for ${date}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #6366f1;">Good Morning!</h2>
        <p style="font-size: 16px; color: #1f2937;">Here is what you have scheduled for today (${date}):</p>
        <ul style="color: #4b5563; font-size: 15px; padding-left: 20px;">
          ${eventsHtml}
        </ul>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">Sent automatically by StudyTracker.</p>
      </div>
    `,
  });
}
