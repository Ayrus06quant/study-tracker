"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToProjects, addProject, deleteProject } from "@/services/firestoreService";
import { Project, Priority, ProjectType } from "@/types";
import { Plus, Trash2, ArrowRight, FolderKanban, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { projectSchema } from "@/validators/schemas";

const COLORS = ["#6366f1", "#a78bfa", "#f59e0b", "#22c55e", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];
const PRIORITY_LABELS: Record<Priority, string> = { high: "High", mid: "Mid", low: "Low" };

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", type: "project" as ProjectType, priority: "mid" as Priority, color: COLORS[0] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToProjects(user.uid, (data) => {
      setProjects(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = projectSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    
    addProject(user!.uid, form).catch(() => toast.error("Failed to sync project"));
    toast.success("Project added!");
    setShowModal(false);
    setForm({ name: "", type: "project", priority: "mid", color: COLORS[0] });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this project?")) return;
    deleteProject(id).catch(() => toast.error("Failed to sync deletion"));
    toast.success("Deleted");
  };

  if (loading) return <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "80px" }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", margin: "0 0 4px" }}>Projects & Subjects</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>{projects.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add New
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 24px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗂️</div>
          <h3 style={{ fontWeight: "700", margin: "0 0 8px" }}>No projects yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "0 0 20px" }}>Add your first project or subject to get started.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Project</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {projects.map(p => (
            <div key={p.id} className="card" onClick={() => router.push(`/projects/${p.id}`)} style={{ cursor: "pointer", transition: "all 0.15s", position: "relative" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = p.color || "var(--accent)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${p.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {p.type === "subject" ? <BookOpen size={18} color={p.color} /> : <FolderKanban size={18} color={p.color} />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>{p.name}</h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)", textTransform: "capitalize" }}>{p.type}</p>
                  </div>
                </div>
                <button onClick={e => handleDelete(p.id, e)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}>
                  <Trash2 size={15} />
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className={`badge badge-${p.priority}`}>{PRIORITY_LABELS[p.priority]}</span>
                <ArrowRight size={16} color="var(--text-muted)" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "#00000080", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "24px" }} onClick={() => setShowModal(false)}>
          <div className="card" style={{ width: "100%", maxWidth: "440px", padding: "32px" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 24px" }}>Add Project / Subject</h2>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Name</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. VLSI Design, Research Project..." required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Type</label>
                  <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ProjectType }))}>
                    <option value="project">Project</option>
                    <option value="subject">Subject</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Priority</label>
                  <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                    <option value="high">🔴 High</option>
                    <option value="mid">🟡 Mid</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>Color</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: "28px", height: "28px", borderRadius: "8px", background: c, border: form.color === c ? "3px solid #fff" : "3px solid transparent", cursor: "pointer", transition: "all 0.1s" }} />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: "center" }}>{saving ? "Adding..." : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
