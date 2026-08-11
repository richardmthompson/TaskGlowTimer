import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// NOTE: runtime DDL in server/db.ts must be kept in sync with these tables by hand.

export interface StoredReward {
  id: string;
  type: "medal" | "diamond";
  minutes: number;
  createdAt: number; // epoch ms
}

export const storedRewardSchema = z.object({
  id: z.string(),
  type: z.enum(["medal", "diamond"]),
  minutes: z.number(),
  createdAt: z.number(),
});

export const goals = sqliteTable("goals", {
  id: text("id").primaryKey(), // client-generated (Date.now().toString())
  title: text("title").notNull(),
  color: text("color").notNull(),
  isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(), // client-generated
  title: text("title").notNull(),
  status: text("status", { enum: ["queued", "completed"] }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0), // queue position; ignored for completed
  goalId: text("goal_id"), // nullable, FK-by-convention
  startedAt: integer("started_at", { mode: "timestamp_ms" }),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  medals: integer("medals").notNull().default(0),
  diamonds: integer("diamonds").notNull().default(0),
  rewardMinutes: integer("reward_minutes").notNull().default(0),
});

export const session = sqliteTable("session", {
  id: integer("id").primaryKey(), // singleton row, always 1
  currentTaskTitle: text("current_task_title").notNull().default(""),
  isRunning: integer("is_running", { mode: "boolean" }).notNull().default(false),
  elapsedSeconds: integer("elapsed_seconds").notNull().default(0), // folded elapsed at last pause
  runningSince: integer("running_since", { mode: "timestamp_ms" }), // set on start, null on pause/done
  taskStartedAt: integer("task_started_at", { mode: "timestamp_ms" }),
  lastRewardAt: integer("last_reward_at").notNull().default(0),
  rewardStack: text("reward_stack", { mode: "json" })
    .$type<StoredReward[]>()
    .notNull()
    .default([]),
});

// Timestamps arrive from the client as epoch ms; coerce to Date for drizzle's timestamp_ms mode.
const epochMsToDate = z.coerce.date();

export const insertGoalSchema = createInsertSchema(goals).omit({
  createdAt: true,
  isCurrent: true,
});

export const insertTaskSchema = createInsertSchema(tasks, {
  startedAt: epochMsToDate.nullable().optional(),
  completedAt: epochMsToDate.nullable().optional(),
});

export const sessionPatchSchema = createInsertSchema(session, {
  runningSince: epochMsToDate.nullable().optional(),
  taskStartedAt: epochMsToDate.nullable().optional(),
  rewardStack: z.array(storedRewardSchema),
})
  .omit({ id: true })
  .partial();

export const setCurrentGoalSchema = z.object({
  goalId: z.string().nullable(),
});

export const queueOrderSchema = z.object({
  ids: z.array(z.string()),
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Session = typeof session.$inferSelect;
export type SessionPatch = z.infer<typeof sessionPatchSchema>;
export type SetCurrentGoal = z.infer<typeof setCurrentGoalSchema>;
export type QueueOrder = z.infer<typeof queueOrderSchema>;
