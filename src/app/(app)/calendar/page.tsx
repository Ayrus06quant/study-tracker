"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToCalendarEvents, subscribeToProjects, addCalendarEvent, deleteCalendarEvent } from "@/services/firestoreService";
import { CalendarEvent, Project } from "@/types";
import { ChevronLeft, ChevronRight, Plus, Bell, BellOff, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { format, addDays, subDays } from "date-fns";

export default function CalendarPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedHour, setSelectedHour] = useState(9);
  const [form, setForm] = useState({ title: "", projectId: "", duration: 1, notify: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubE = subscribeToCalendarEvents(user.uid, selectedDate, (evts) => {
      setEvents(evts);
      setLoading(false);
    });
    const unsubP = subscribeToProjects(user.uid, setProjects);
    return () => { unsubE(); unsubP(); };
  }, [user, selectedDate]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title.trim()) return;
    
    const payload: any = {
      userId: user.uid,
      date: selectedDate,
      hour: selectedHour,
      title: form.title,
      duration: form.duration,
      notify: form.notify,
    };
    if (form.projectId) payload.projectId = form.projectId;

    addCalendarEvent(payload).catch(() => toast.error("Network error"));
    toast.success("Event added!");
    setShowModal(false);
    setForm({ title: "", projectId: "", duration: 1, notify: true });
  };

  const handleDelete = (id: string) => {
    deleteCalendarEvent(id).catch(() => toast.error("Network error"));
    toast.success("Deleted");
  };

  const openModal = (hour: number) => {
    setSelectedHour(hour);
    setShowModal(true);
  };

  const formatDate = (d: string) => format(new Date(d + "T00:00:00"), "EEEE, MMMM d, yyyy");
  const hourLabel = (h: number) => `${h.toString().padStart(2, "0")}:00`;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", margin: "0 0 4px" }}>Calendar</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>Schedule your day — 24 hour view</p>
        </div>
        {/* Date navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="btn btn-ghost" style={{ padding: "8px" }} onClick={() => setSelectedDate(format(subDays(new Date(selectedDate + "T00:00:00"), 1), "yyyy-MM-dd"))}>
            <ChevronLeft size={18} />
          </button>
          <div style={{ textAlign: "center" }}>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="input" style={{ width: "160px", textAlign: "center", fontSize: "13px" }} />
          </div>
          <button className="btn btn-ghost" style={{ padding: "8px" }} onClick={() => setSelectedDate(format(addDays(new Date(selectedDate + "T00:00:00"), 1), "yyyy-MM-dd"))}>
            <ChevronRight size={18} />
          </button>
          <button className="btn btn-ghost" onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))} style={{ fontSize: "13px" }}>Today</button>
        </div>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>{formatDate(selectedDate)}</p>

      {/* 24h Grid */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        {Array.from({ length: 24 }, (_, hour) => {
          const hourEvents = events.filter(e => e.hour === hour);
          const isCurrentHour = new Date().getHours() === hour && selectedDate === format(new Date(), "yyyy-MM-dd");

          return (
            <div key={hour} style={{
              display: "flex", minHeight: "52px", borderBottom: hour < 23 ? "1px solid var(--border)" : "none",
              background: isCurrentHour ? "rgba(99, 102, 241, 0.06)" : "transparent",
            }}>
              {/* Hour label */}
              <div style={{ width: "64px", flexShrink: 0, padding: "12px 12px 12px 16px", fontSize: "12px", color: isCurrentHour ? "var(--accent-light)" : "var(--text-muted)", fontWeight: isCurrentHour ? "700" : "400", borderRight: "1px solid var(--border)", display: "flex", alignItems: "flex-start", paddingTop: "14px" }}>
                {hourLabel(hour)}
              </div>

              {/* Events area */}
              <div style={{ flex: 1, padding: "8px 12px", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}
                onClick={() => hourEvents.length === 0 && openModal(hour)}>
                {hourEvents.map(evt => {
                  const proj = projects.find(p => p.id === evt.projectId);
                  return (
                    <div key={evt.id} style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      background: proj ? `${proj.color}22` : "var(--bg-3)",
                      border: `1px solid ${proj ? `${proj.color}44` : "var(--border)"}`,
                      borderRadius: "8px", padding: "6px 10px",
                    }}>
                      {evt.notify ? <Bell size={11} color="var(--accent-light)" /> : <BellOff size={11} color="var(--text-muted)" />}
                      <span style={{ fontSize: "12px", fontWeight: "600" }}>{evt.title}</span>
                      {proj && <span style={{ fontSize: "11px", color: proj.color }}>{proj.name}</span>}
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{evt.duration}h</span>
                      <button onClick={e => { e.stopPropagation(); handleDelete(evt.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0", display: "flex" }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  );
                })}

                {hourEvents.length === 0 && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", cursor: "pointer", opacity: 0.4 }}
                    onClick={() => openModal(hour)}>
                    <Plus size={13} color="var(--text-muted)" />
                  </div>
                )}

                {hourEvents.length > 0 && (
                  <button onClick={e => { e.stopPropagation(); openModal(hour); }} style={{ background: "none", border: "1px dashed var(--border)", borderRadius: "6px", cursor: "pointer", color: "var(--text-muted)", padding: "4px 8px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Plus size={11} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "#00000080", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "24px" }} onClick={() => setShowModal(false)}>
          <div className="card" style={{ width: "100%", maxWidth: "420px", padding: "28px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 4px", fontWeight: "800" }}>Add Event</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "0 0 20px" }}>{formatDate(selectedDate)} at {hourLabel(selectedHour)}</p>
            <form onSubmit={handleAddEvent} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Title</label>
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Study VLSI, Work on project..." required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Project (optional)</label>
                  <select className="input" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                    <option value="">None</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Duration (hrs)</label>
                  <input className="input" type="number" min="0.5" max="12" step="0.5" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: parseFloat(e.target.value) }))} />
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px" }}>
                <input type="checkbox" checked={form.notify} onChange={e => setForm(f => ({ ...f, notify: e.target.checked }))} style={{ accentColor: "var(--accent)", width: "16px", height: "16px" }} />
                <span>📧 Send email reminder when it&apos;s time</span>
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>Add Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
