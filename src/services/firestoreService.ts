import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc,
  query, where, orderBy, onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Project, Task, Session, CalendarEvent } from "@/types";

// ─── Projects ───────────────────────────────────────────────────────────────

export async function getProjects(userId: string): Promise<Project[]> {
  const q = query(collection(db, "projects"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
}

export function subscribeToProjects(userId: string, callback: (data: Project[]) => void) {
  const q = query(collection(db, "projects"), where("userId", "==", userId));
  return onSnapshot(q, snap => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
    callback(data.sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
  });
}

export async function addProject(userId: string, data: Omit<Project, "id" | "userId" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "projects"), { ...data, userId, createdAt: new Date().toISOString() });
  return ref.id;
}

export async function deleteProject(projectId: string) {
  await deleteDoc(doc(db, "projects", projectId));
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export async function getTasks(userId: string, projectId?: string): Promise<Task[]> {
  const constraints = [where("userId", "==", userId)];
  if (projectId) constraints.push(where("projectId", "==", projectId) as never);
  const q = query(collection(db, "tasks"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Task)).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
}

export function subscribeToTasks(userId: string, projectId: string | undefined, callback: (data: Task[]) => void) {
  const constraints = [where("userId", "==", userId)];
  if (projectId) constraints.push(where("projectId", "==", projectId) as never);
  const q = query(collection(db, "tasks"), ...constraints);
  return onSnapshot(q, snap => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Task));
    callback(data.sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
  });
}

export async function addTask(data: Omit<Task, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "tasks"), { ...data, createdAt: new Date().toISOString() });
  return ref.id;
}

export async function updateTask(taskId: string, data: Partial<Task>) {
  await updateDoc(doc(db, "tasks", taskId), data as Record<string, unknown>);
}

export async function deleteTask(taskId: string) {
  await deleteDoc(doc(db, "tasks", taskId));
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function getSessions(userId: string): Promise<Session[]> {
  const q = query(collection(db, "sessions"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Session)).sort((a,b) => b.date.localeCompare(a.date));
}

export function subscribeToSessions(userId: string, callback: (data: Session[]) => void) {
  const q = query(collection(db, "sessions"), where("userId", "==", userId));
  return onSnapshot(q, snap => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Session));
    callback(data.sort((a,b) => b.date.localeCompare(a.date)));
  });
}

export async function addSession(data: Omit<Session, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "sessions"), { ...data, createdAt: new Date().toISOString() });
  return ref.id;
}

// ─── Calendar Events ─────────────────────────────────────────────────────────

export async function getCalendarEvents(userId: string, date?: string): Promise<CalendarEvent[]> {
  const constraints = [where("userId", "==", userId)];
  if (date) constraints.push(where("date", "==", date) as never);
  const q = query(collection(db, "calendarEvents"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEvent)).sort((a,b) => a.hour - b.hour);
}

export function subscribeToCalendarEvents(userId: string, date: string | undefined, callback: (data: CalendarEvent[]) => void) {
  const constraints = [where("userId", "==", userId)];
  if (date) constraints.push(where("date", "==", date) as never);
  const q = query(collection(db, "calendarEvents"), ...constraints);
  return onSnapshot(q, snap => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEvent));
    callback(data.sort((a,b) => a.hour - b.hour));
  });
}

export async function addCalendarEvent(data: Omit<CalendarEvent, "id" | "createdAt" | "notified">): Promise<string> {
  const ref = await addDoc(collection(db, "calendarEvents"), { ...data, notified: false, createdAt: new Date().toISOString() });
  return ref.id;
}

export async function updateCalendarEvent(eventId: string, data: Partial<CalendarEvent>) {
  await updateDoc(doc(db, "calendarEvents", eventId), data as Record<string, unknown>);
}

export async function deleteCalendarEvent(eventId: string) {
  await deleteDoc(doc(db, "calendarEvents", eventId));
}
