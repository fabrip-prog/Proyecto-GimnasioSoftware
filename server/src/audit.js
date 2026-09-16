import { db, nowIso } from "./db.js";

const insert = db.prepare(
  `INSERT INTO audit_log (gym_id, actor_id, actor_name, action, target_id, target_name, detail, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);

/**
 * Deja constancia de quién hizo qué. Se usa para las acciones con
 * consecuencias de plata o de datos: cobros, bajas y cambios de precio.
 */
export function record(actor, action, { target, detail } = {}) {
  insert.run(
    actor.gym_id,
    actor.id,
    actor.name,
    action,
    target?.id ?? null,
    target?.name ?? null,
    detail ?? null,
    nowIso()
  );
}

const selectRecent = db.prepare(
  `SELECT actor_name, action, target_name, detail, created_at
   FROM audit_log WHERE gym_id = ? ORDER BY id DESC LIMIT ?`
);

export function recent(gymId, limit = 50) {
  return selectRecent.all(gymId, limit);
}
