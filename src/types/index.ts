export type Priority = "high" | "mid" | "low";
export type TaskStatus = "not_started" | "in_progress" | "complete";
export type ProjectType = "project" | "subject";

export interface Project {
  id: string;
  userId: string;
  name: string;
  type: ProjectType;
  priority: Priority;
  color: string;
  createdAt: string; // ISO string
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  status: TaskStatus;
  checklist: ChecklistItem[];
  dueDate?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  hours: number;
  notes?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  hour: number; // 0–23
  title: string;
  projectId?: string;
  duration: number; // hours
  notify: boolean;
  notified: boolean;
  createdAt: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Analytics
export interface ProjectHours {
  projectId: string;
  projectName: string;
  color: string;
  hours: number;
}
