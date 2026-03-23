"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { User, Bell } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const [emailNotifs, setEmailNotifs] = useState(true);

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "800", margin: "0 0 4px" }}>Settings</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>Manage your account and preferences</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "600px" }}>
        {/* Profile */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <User size={18} color="var(--accent-light)" />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>Profile</h3>
          </div>
          <div style={{ display: "flex", flex: "column", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Display Name</label>
              <input className="input" defaultValue={user?.displayName ?? ""} disabled style={{ opacity: 0.6 }} />
            </div>
            <div style={{ marginTop: "12px" }}>
              <label style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Email</label>
              <input className="input" defaultValue={user?.email ?? ""} disabled style={{ opacity: 0.6 }} />
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "12px 0 0" }}>To update your profile, sign out and sign in with an updated Google account.</p>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <Bell size={18} color="var(--accent-light)" />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>Notifications</h3>
          </div>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
            <div>
              <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>Email reminders</p>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>Get an email when a scheduled calendar event starts</p>
            </div>
            <div onClick={() => { setEmailNotifs(!emailNotifs); toast.success(emailNotifs ? "Notifications disabled" : "Notifications enabled"); }}
              style={{ width: "44px", height: "24px", borderRadius: "99px", background: emailNotifs ? "var(--accent)" : "var(--border)", position: "relative", transition: "background 0.2s", cursor: "pointer", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: "3px", left: emailNotifs ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
            </div>
          </label>

          <div style={{ marginTop: "16px", padding: "12px 16px", background: "var(--bg-3)", borderRadius: "10px", border: "1px solid var(--border)" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
              📧 Reminders are sent to: <strong style={{ color: "var(--text)" }}>{user?.email}</strong>
            </p>
            <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
              Emails are sent automatically by the server every hour for events marked with the bell icon in your calendar.
            </p>
          </div>
        </div>

        {/* About */}
        <div className="card" style={{ opacity: 0.7 }}>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
            <strong>StudyTracker</strong> v1.0.0 · Built with Next.js 15, Firebase, Resend &amp; Recharts
          </p>
        </div>
      </div>
    </div>
  );
}
