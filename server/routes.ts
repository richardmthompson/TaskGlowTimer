import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { ZodError } from "zod";
import {
  insertGoalSchema,
  insertTaskSchema,
  queueOrderSchema,
  sessionPatchSchema,
  setCurrentGoalSchema,
} from "@shared/schema";
import { storage } from "./storage";

function handleError(res: Response, err: unknown) {
  if (err instanceof ZodError) {
    res.status(400).json({ message: err.errors[0].message });
    return;
  }
  const message = err instanceof Error ? err.message : "Internal Server Error";
  res.status(500).json({ message });
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/state", async (req: Request, res: Response) => {
    try {
      const sinceRaw = req.query.since;
      const since =
        typeof sinceRaw === "string" && sinceRaw !== "" ? Number(sinceRaw) : 0;
      const state = await storage.getState(Number.isFinite(since) ? since : 0);
      res.json(state);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.post("/api/goals", async (req: Request, res: Response) => {
    try {
      const goal = insertGoalSchema.parse(req.body);
      const created = await storage.createGoal(goal);
      res.status(201).json(created);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.put("/api/goals/current", async (req: Request, res: Response) => {
    try {
      const { goalId } = setCurrentGoalSchema.parse(req.body);
      await storage.setCurrentGoal(goalId);
      res.json({ goalId });
    } catch (err) {
      handleError(res, err);
    }
  });

  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const task = insertTaskSchema.parse(req.body);
      const created = await storage.createTask(task);
      res.status(201).json(created);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteTask(req.params.id);
      if (!deleted) {
        res.status(404).json({ message: "Task not found" });
        return;
      }
      res.status(204).end();
    } catch (err) {
      handleError(res, err);
    }
  });

  app.put("/api/queue/order", async (req: Request, res: Response) => {
    try {
      const { ids } = queueOrderSchema.parse(req.body);
      await storage.reorderQueue(ids);
      res.status(204).end();
    } catch (err) {
      handleError(res, err);
    }
  });

  app.patch("/api/session", async (req: Request, res: Response) => {
    try {
      const patch = sessionPatchSchema.parse(req.body);
      const updated = await storage.updateSession(patch);
      res.json(updated);
    } catch (err) {
      handleError(res, err);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
