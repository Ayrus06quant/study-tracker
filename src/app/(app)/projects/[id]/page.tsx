"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToTasks, subscribeToProjects, addTask, updateTask, deleteTask, addSession } from "@/services/firestoreService";
import { Task, Project, TaskStatus, ChecklistItem } from "@/types";
import { Plus, Trash2, ChevronDown, ChevronUp, Clock, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { format } from "date-fns";
import Link from "next/link";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "not_started", label: "Not Started", color: "#6b7280" },
  { id: "in_progress", label: "In Progress", color: "#f59e0b" },
  { id: "complete", label: "Complete", color: "#22c55e" },
];

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionHours, setSessionHours] = useState("1");
  const [sessionDate, setSessionDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [sessionNotes, setSessionNotes] = useState("");

  useEffect(() => {
    if (!user) return;
    const unsubP = subscribeToProjects(user.uid, (projs) => {
      setProject(projs.find(p => p.id === projectId) ?? null);
    });
    const unsubT = subscribeToTasks(user.uid, projectId, (t) => {
      setTasks(t);
      setLoading(false);
    });
    return () => { unsubP(); unsubT(); };
  }, [user, projectId]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;
    addTask({ title: newTaskTitle.trim(), projectId, userId: user.uid, status: "not_started", checklist: [] }).catch(console.error);
    setNewTaskTitle("");
    toast.success("Task added");
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTask(taskId, { status }).catch(console.error);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId).catch(console.error);
    toast.success("Task deleted");
  };

  const handleChecklistToggle = (task: Task, itemId: string) => {
    const updated = task.checklist.map(c => c.id === itemId ? { ...c, done: !c.done } : c);
    updateTask(task.id, { checklist: updated }).catch(console.error);
  };

  const handleAddChecklistItem = (task: Task, text: string) => {
    if (!text.trim()) return;
    const newItem: ChecklistItem = { id: Date.now().toString(), text: text.trim(), done: false };
    const updated = [...task.checklist, newItem];
    updateTask(task.id, { checklist: updated }).catch(console.error);
  };

  const handleLogSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    addSession({ userId: user.uid, projectId, date: sessionDate, hours: parseFloat(sessionHours), notes: sessionNotes }).catch(console.error);
    toast.success("Session logged!");
    setShowSessionModal(false);
    setSessionHours("1"); setSessionDate(format(new Date(), "yyyy-MM-dd")); setSessionNotes("");
  };

  if (loading) return <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "80px" }}>Loading...</div>;
  if (!project) return <div style={{ textAlign: "center", marginTop: "80px" }}><p>Project not found.</p><Link href="/projects" className="btn btn-ghost">Back</Link></div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
        <Link href="/projects" style={{ color: "var(--text-muted)", display: "flex" }}><ArrowLeft size={20} /></Link>
        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `${project.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "18px" }}>📁</span>
        </div>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>{project.name}</h1>
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <span className={`badge badge-${project.priority}`}>{project.priority}</span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "capitalize" }}>{project.type}</span>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={() => setShowSessionModal(true)} style={{ marginLeft: "auto", gap: "8px" }}>
          <Clock size={15} /> Log Study Session
        </button>
      </div>

      {/* Add task form */}
      <form onSubmit={handleAddTask} style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <input className="input" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Add a new task..." style={{ flex: 1 }} />
        <button type="submit" className="btn btn-primary"><Plus size={16} /></button>
      </form>

      {/* Kanban */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.color }} />
                <span style={{ fontSize: "13px", fontWeight: "700", color: col.color }}>{col.label}</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "auto" }}>{colTasks.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    columns={COLUMNS}
                    expanded={expandedTask === task.id}
                    onToggleExpand={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTask}
                    onChecklistToggle={handleChecklistToggle}
                    onAddChecklistItem={handleAddChecklistItem}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div style={{ border: "1px dashed var(--border)", borderRadius: "12px", padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Session Modal */}
      {showSessionModal && (
        <div style={{ position: "fixed", inset: 0, background: "#00000080", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "24px" }} onClick={() => setShowSessionModal(false)}>
          <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "28px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 20px", fontWeight: "800" }}>Log Study Session</h3>
            <form onSubmit={handleLogSession} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Date</label>
                <input className="input" type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Hours spent</label>
                <input className="input" type="number" min="0.5" max="24" step="0.5" value={sessionHours} onChange={e => setSessionHours(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Notes (optional)</label>
                <textarea className="input" value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} placeholder="What did you work on?" rows={2} style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowSessionModal(false)} style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>Log Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, columns, expanded, onToggleExpand, onStatusChange, onDelete, onChecklistToggle, onAddChecklistItem }: {
  task: Task;
  columns: typeof COLUMNS;
  expanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (id: string, s: TaskStatus) => void;
  onDelete: (id: string) => void;
  onChecklistToggle: (task: Task, itemId: string) => void;
  onAddChecklistItem: (task: Task, text: string) => void;
}) {
  const [newItem, setNewItem] = useState("");
  const done = task.checklist.filter(c => c.done).length;

  return (
    <div className="card-sm" style={{ cursor: "default" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: "600" }}>{task.title}</p>
          {task.checklist.length > 0 && (
            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--text-muted)" }}>{done}/{task.checklist.length} done</p>
          )}
        </div>
        <button onClick={onToggleExpand} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px" }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <button onClick={() => onDelete(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px" }}>
          <Trash2 size={13} />
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
          {/* Status change */}
          <select className="input" value={task.status} onChange={e => onStatusChange(task.id, e.target.value as TaskStatus)} style={{ fontSize: "12px", padding: "6px 10px", marginBottom: "10px" }}>
            {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>

          {/* Checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
            {task.checklist.map(item => (
              <label key={item.id} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px" }}>
                <input type="checkbox" checked={item.done} onChange={() => onChecklistToggle(task, item.id)} style={{ accentColor: "var(--accent)" }} />
                <span style={{ textDecoration: item.done ? "line-through" : "none", color: item.done ? "var(--text-muted)" : "var(--text)" }}>{item.text}</span>
              </label>
            ))}
          </div>

          {/* Add checklist item */}
          <div style={{ display: "flex", gap: "6px" }}>
            <input className="input" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add checklist item..." style={{ fontSize: "12px", padding: "6px 10px" }}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onAddChecklistItem(task, newItem); setNewItem(""); } }} />
            <button className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: "12px" }}
              onClick={() => { onAddChecklistItem(task, newItem); setNewItem(""); }}>+</button>
          </div>
        </div>
      )}
    </div>
  );
}
