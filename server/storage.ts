import { asc, eq, sql } from "drizzle-orm";
import {
  goals,
  session,
  tasks,
  type Goal,
  type InsertGoal,
  type InsertTask,
  type Session,
  type SessionPatch,
  type Task,
} from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  getState(
    completedSince: number,
  ): Promise<{ session: Session; goals: Goal[]; tasks: Task[] }>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  setCurrentGoal(goalId: string | null): Promise<void>;
  createTask(task: InsertTask): Promise<Task>;
  deleteTask(id: string): Promise<boolean>;
  reorderQueue(ids: string[]): Promise<void>;
  updateSession(patch: SessionPatch): Promise<Session>;
}

export class SqliteStorage implements IStorage {
  constructor(private readonly database: typeof db) {}

  async getState(
    completedSince: number,
  ): Promise<{ session: Session; goals: Goal[]; tasks: Task[] }> {
    const [sessionRow] = await this.database
      .select()
      .from(session)
      .where(eq(session.id, 1));

    const allGoals = await this.database
      .select()
      .from(goals)
      .orderBy(asc(goals.createdAt));

    const queued = await this.database
      .select()
      .from(tasks)
      .where(eq(tasks.status, "queued"))
      .orderBy(asc(tasks.sortOrder));

    const completed = await this.database
      .select()
      .from(tasks)
      .where(
        sql`${tasks.status} = 'completed' AND ${tasks.completedAt} >= ${completedSince}`,
      )
      .orderBy(asc(tasks.completedAt));

    return {
      session: sessionRow,
      goals: allGoals,
      tasks: [...queued, ...completed],
    };
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [row] = await this.database.insert(goals).values(goal).returning();
    return row;
  }

  async setCurrentGoal(goalId: string | null): Promise<void> {
    // UPDATE goals SET is_current = (id = ?); null clears all.
    await this.database
      .update(goals)
      .set({
        isCurrent:
          goalId === null ? sql`0` : sql`(${goals.id} = ${goalId})`,
      });
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [row] = await this.database.insert(tasks).values(task).returning();
    return row;
  }

  async deleteTask(id: string): Promise<boolean> {
    const deleted = await this.database
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning({ id: tasks.id });
    return deleted.length > 0;
  }

  async reorderQueue(ids: string[]): Promise<void> {
    // Transaction: sort_order = index; unknown ids are simply no-ops.
    // better-sqlite3 transactions are synchronous, so use the sync .run() API.
    this.database.transaction((tx) => {
      ids.forEach((id, index) => {
        tx.update(tasks).set({ sortOrder: index }).where(eq(tasks.id, id)).run();
      });
    });
  }

  async updateSession(patch: SessionPatch): Promise<Session> {
    if (Object.keys(patch).length > 0) {
      await this.database.update(session).set(patch).where(eq(session.id, 1));
    }
    const [row] = await this.database
      .select()
      .from(session)
      .where(eq(session.id, 1));
    return row;
  }
}

export const storage = new SqliteStorage(db);
