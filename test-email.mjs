import { Resend } from 'resend';

// Initialize with your onboarding API key
const resend = new Resend('re_PKFSYaC7_F1h3n3N6cShUMLR2VE7LdMVm');

async function testEmail() {
  console.log("🚀 Sending test email to sgs.surya.20jan.9@gmail.com...");
  try {
    const data = await resend.emails.send({
      from: "StudyTracker <onboarding@resend.dev>",
      to: "sgs.surya.20jan.9@gmail.com", // This must be your verified email on free tier
      subject: "🎯 Success! StudyTracker Emails work!",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
          <h2 style="color: #6366f1;">Email System Works!</h2>
          <p style="font-size: 16px; color: #1f2937;">This is a manual test email sent directly from your Node script.</p>
          <p style="color: #6b7280;">When you deploy this app to Vercel, the <strong>Cron Job</strong> will run this exact code automatically at the top of every hour to check your calendar.</p>
          <br />
          <p style="color: #9ca3af; font-size: 12px;">Automated via Resend API</p>
        </div>
      `,
    });
    
    console.log("✅ Success! Email sent.");
    console.log("Resend ID:", data.data?.id || "N/A");
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
}

testEmail();
