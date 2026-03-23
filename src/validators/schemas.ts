import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["project", "subject"]),
  priority: z.enum(["high", "mid", "low"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  projectId: z.string().min(1),
  status: z.enum(["not_started", "in_progress", "complete"]).default("not_started"),
  dueDate: z.string().optional(),
});

export const sessionSchema = z.object({
  projectId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  hours: z.number().min(0.5).max(24),
  notes: z.string().max(500).optional(),
});

export const calendarEventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  hour: z.number().int().min(0).max(23),
  title: z.string().min(1).max(200),
  projectId: z.string().optional(),
  duration: z.number().min(0.5).max(24).default(1),
  notify: z.boolean().default(false),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type SessionInput = z.infer<typeof sessionSchema>;
export type CalendarEventInput = z.infer<typeof calendarEventSchema>;
