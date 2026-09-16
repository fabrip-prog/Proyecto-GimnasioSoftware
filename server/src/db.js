import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), "data");

fs.mkdirSync(DATA_DIR, { recursive: true });

export const DB_PATH = path.join(DATA_DIR, "kinefix.db");

const connection = new DatabaseSync(DB_PATH);

/**
 * SQLite ships inside Node itself, so the server needs no native build step on
 * any machine it gets installed on. This wrapper adds the two conveniences the
 * rest of the code relies on — `pragma()` and `transaction()` — and normalises
 * inserted row ids to plain numbers.
 */
export const db = {
  exec: (sql) => connection.exec(sql),

  close: () => connection.close(),

  pragma: (statement) => connection.exec(`PRAGMA ${statement};`),

  prepare(sql) {
    const statement = connection.prepare(sql);
    return {
      get: (...params) => statement.get(...params),
      all: (...params) => statement.all(...params),
      run: (...params) => {
        const result = statement.run(...params);
        return {
          changes: Number(result.changes),
          lastInsertRowid: Number(result.lastInsertRowid),
        };
      },
    };
  },

  /** Mirrors better-sqlite3's API: returns a function that runs atomically. */
  transaction(fn) {
    return (...args) => {
      connection.exec("BEGIN");
      try {
        const result = fn(...args);
        connection.exec("COMMIT");
        return result;
      } catch (err) {
        connection.exec("ROLLBACK");
        throw err;
      }
    };
  },
};

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
  CREATE TABLE IF NOT EXISTS attendance (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    gym_id       INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date         TEXT    NOT NULL,
    checked_in_at TEXT   NOT NULL,
    UNIQUE (user_id, date)
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    gym_id     INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    actor_id   INTEGER,
    actor_name TEXT    NOT NULL,
    action     TEXT    NOT NULL,
    target_id  INTEGER,
    target_name TEXT,
    detail     TEXT,
    created_at TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS password_requests (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    gym_id      INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status      TEXT    NOT NULL DEFAULT 'pendiente',
    created_at  TEXT    NOT NULL,
    resolved_at TEXT,
    UNIQUE (user_id, status)
  );

  CREATE INDEX IF NOT EXISTS idx_attendance_gym ON attendance (gym_id, date);
  CREATE INDEX IF NOT EXISTS idx_audit_gym      ON audit_log (gym_id, created_at);
`);


/**
 * Agrega columnas a bases creadas por versiones anteriores. SQLite no tiene
 * `ADD COLUMN IF NOT EXISTS`, así que primero se consulta el esquema.
 */
function addColumnIfMissing(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (columns.some((c) => c.name === column)) return;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

// Baja lógica: dar de baja a un socio no puede borrar su historial de pagos.
addColumnIfMissing('users', 'active', 'INTEGER NOT NULL DEFAULT 1');
addColumnIfMissing('users', 'deactivated_at', 'TEXT');

// Teléfono del socio, para los recordatorios de cuota por WhatsApp.
addColumnIfMissing('users', 'whatsapp', 'TEXT');

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
