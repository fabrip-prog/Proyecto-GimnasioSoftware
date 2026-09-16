import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), "data");

fs.mkdirSync(DATA_DIR, { recursive: true });

export const DB_PATH = path.join(DATA_DIR, "kinefix.db");

export const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS gyms (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    slug          TEXT    NOT NULL UNIQUE,
    name          TEXT    NOT NULL,
    whatsapp      TEXT,
    currency      TEXT    NOT NULL DEFAULT 'ARS',
    monthly_price INTEGER NOT NULL DEFAULT 15000,
    pro_price     INTEGER NOT NULL DEFAULT 8000,
    created_at    TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    gym_id        INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    username      TEXT    NOT NULL,
    password_hash TEXT    NOT NULL,
    name          TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'member',
    avatar        TEXT,
    goal          TEXT,
    plan_label    TEXT    NOT NULL DEFAULT 'Sin plan',
    plan_days     INTEGER,
    coach         TEXT,
    coach_title   TEXT,
    start_date    TEXT,
    pro_active    INTEGER NOT NULL DEFAULT 0,
    pro_paid_date TEXT,
    custom_plan   TEXT,
    created_at    TEXT    NOT NULL,
    UNIQUE (gym_id, username)
  );

  CREATE TABLE IF NOT EXISTS plans (
    gym_id    INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    day_count INTEGER NOT NULL,
    data      TEXT    NOT NULL,
    PRIMARY KEY (gym_id, day_count)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    gym_id     INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       TEXT    NOT NULL,
    label      TEXT    NOT NULL,
    amount     INTEGER NOT NULL,
    date       TEXT    NOT NULL,
    month      TEXT    NOT NULL,
    method     TEXT    NOT NULL DEFAULT 'manual',
    note       TEXT,
    created_at TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS progress (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    gym_id        INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date          TEXT    NOT NULL,
    day_number    INTEGER,
    exercise_id   TEXT    NOT NULL,
    exercise_name TEXT,
    weight        TEXT,
    reps          TEXT,
    updated_at    TEXT    NOT NULL,
    UNIQUE (user_id, date, exercise_id)
  );

  CREATE INDEX IF NOT EXISTS idx_users_gym     ON users (gym_id);
  CREATE INDEX IF NOT EXISTS idx_payments_user ON payments (user_id);
  CREATE INDEX IF NOT EXISTS idx_payments_gym  ON payments (gym_id, month);
  CREATE INDEX IF NOT EXISTS idx_progress_user ON progress (user_id, date);
`);

// Billing periods follow the gym's wall clock, not UTC, so a payment taken at
// 9pm in Buenos Aires is not filed against the next day/month.
const TIMEZONE = process.env.TZ_NAME || "America/Argentina/Buenos_Aires";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function nowIso() {
  return new Date().toISOString();
}

export function today() {
  return dateFormatter.format(new Date());
}

export function currentMonth() {
  return today().slice(0, 7);
}
