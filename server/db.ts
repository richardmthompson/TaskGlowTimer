import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";
import * as schema from "@shared/schema";

const dbPath =
  process.env.DB_PATH ?? path.join(process.cwd(), "data", "taskglow.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);

// NOTE: idempotent runtime DDL, kept in sync with shared/schema.ts by hand.
// We deliberately do not use drizzle-kit migrations at runtime.
sqlite.exec(`
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  color TEXT NOT NULL,
  is_current INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  goal_id TEXT,
  started_at INTEGER,
  completed_at INTEGER,
  medals INTEGER NOT NULL DEFAULT 0,
  diamonds INTEGER NOT NULL DEFAULT 0,
  reward_minutes INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS session (
  id INTEGER PRIMARY KEY,
  current_task_title TEXT NOT NULL DEFAULT '',
  is_running INTEGER NOT NULL DEFAULT 0,
  elapsed_seconds INTEGER NOT NULL DEFAULT 0,
  running_since INTEGER,
  task_started_at INTEGER,
  last_reward_at INTEGER NOT NULL DEFAULT 0,
  reward_stack TEXT NOT NULL DEFAULT '[]'
);

INSERT OR IGNORE INTO session (id) VALUES (1);
`);

export const db = drizzle(sqlite, { schema });
