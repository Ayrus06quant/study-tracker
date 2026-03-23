"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToSessions, subscribeToProjects } from "@/services/firestoreService";
import { Project, Session, ProjectHours } from "@/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Clock, Star, Target } from "lucide-react";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";

type Range = "day" | "week" | "month";

const COLORS = ["#6366f1", "#a78bfa", "#f59e0b", "#22c55e", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

export default function DashboardPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [range, setRange] = useState<Range>("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubS = subscribeToSessions(user.uid, setSessions);
    const unsubP = subscribeToProjects(user.uid, (p) => {
      setProjects(p);
      setLoading(false);
    });
    return () => { unsubS(); unsubP(); };
  }, [user]);

  const getFilteredSessions = (): Session[] => {
    const now = new Date();
    let cutoff: Date;
    if (range === "day") cutoff = subDays(now, 1);
    else if (range === "week") cutoff = startOfWeek(now);
    else cutoff = startOfMonth(now);
    const cutoffStr = format(cutoff, "yyyy-MM-dd");
    return sessions.filter(s => s.date >= cutoffStr);
  };

  const filtered = getFilteredSessions();

  const projectHours: ProjectHours[] = projects.map((p, i) => ({
    projectId: p.id,
    projectName: p.name,
    color: p.color || COLORS[i % COLORS.length],
    hours: filtered.filter(s => s.projectId === p.id).reduce((acc, s) => acc + s.hours, 0),
  })).filter(p => p.hours > 0).sort((a, b) => b.hours - a.hours);

  const totalHours = filtered.reduce((acc, s) => acc + s.hours, 0);
  const topProject = projectHours[0];
  const sessionCount = filtered.length;

  if (loading) return <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "80px" }}>Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "800", margin: "0 0 4px" }}>
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
          <span className="gradient-text">{user?.displayName?.split(" ")[0] ?? "there"} 👋</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      {/* Range selector */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {(["day", "week", "month"] as Range[]).map(r => (
          <button key={r} onClick={() => setRange(r)} className="btn" style={{
            padding: "7px 18px", fontSize: "13px",
            background: range === r ? "var(--accent)" : "var(--bg-2)",
            color: range === r ? "#fff" : "var(--text-muted)",
            border: `1px solid ${range === r ? "var(--accent)" : "var(--border)"}`,
          }}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        <StatCard icon={<Clock size={20} />} label="Total Hours" value={`${totalHours.toFixed(1)}h`} color="#6366f1" />
        <StatCard icon={<Target size={20} />} label="Sessions" value={String(sessionCount)} color="#a78bfa" />
        <StatCard icon={<Star size={20} />} label="Top Subject" value={topProject?.projectName ?? "—"} color="#f59e0b" />
        <StatCard icon={<TrendingUp size={20} />} label="Projects" value={String(projects.length)} color="#22c55e" />
      </div>

      {/* Charts */}
      {projectHours.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Bar chart */}
          <div className="card">
            <h3 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 20px" }}>Hours by Project</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={projectHours} barSize={28}>
                <XAxis dataKey="projectName" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#16161d", border: "1px solid #2a2a38", borderRadius: "10px", color: "#e8eaf0" }} />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {projectHours.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="card">
            <h3 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 20px" }}>Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={projectHours} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="hours" nameKey="projectName" paddingAngle={3}>
                  {projectHours.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#16161d", border: "1px solid #2a2a38", borderRadius: "10px", color: "#e8eaf0" }} />
                <Legend formatter={(val) => <span style={{ color: "#e8eaf0", fontSize: "12px" }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "60px 24px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <h3 style={{ fontWeight: "700", margin: "0 0 8px" }}>No data yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>Log some study sessions to see your analytics here.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>{label}</p>
        <p style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>{value}</p>
      </div>
    </div>
  );
}
