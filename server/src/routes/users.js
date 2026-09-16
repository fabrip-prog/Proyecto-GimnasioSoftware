import { Router } from "express";
import { db, nowIso, today } from "../db.js";
import { authenticate, hashPassword, requireOwner } from "../auth.js";
import { serializeUser } from "../serialize.js";

const router = Router();
router.use(authenticate);

const findInGym = db.prepare("SELECT * FROM users WHERE id = ? AND gym_id = ?");

function initials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Members may only ever touch their own record; owners any member of their gym. */
function loadTarget(req, res) {
  const targetId = Number(req.params.id);
  if (req.user.role !== "owner" && targetId !== req.user.id) {
    res.status(403).json({ error: "Solo podés modificar tu propia cuenta." });
    return null;
  }
  const target = findInGym.get(targetId, req.gymId);
  if (!target) {
    res.status(404).json({ error: "Usuario no encontrado." });
    return null;
  }
  return target;
}

router.get("/", requireOwner, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM users WHERE gym_id = ? AND role = 'member' ORDER BY name")
    .all(req.gymId);
  res.json({ users: rows.map((u) => serializeUser(u, { includeHistory: false })) });
});

router.post("/", requireOwner, (req, res) => {
  const { name, username, password, planDays, coach, coachTitle } = req.body ?? {};
  if (!name?.trim() || !username?.trim() || !password) {
    return res.status(400).json({ error: "Nombre, usuario y contraseña son obligatorios." });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
  }

  const cleanUsername = String(username).toLowerCase().replace(/\s/g, "");
  const exists = db
    .prepare("SELECT 1 FROM users WHERE gym_id = ? AND username = ?")
    .get(req.gymId, cleanUsername);
  if (exists) return res.status(409).json({ error: "El nombre de usuario ya existe." });

  const days = Number.isFinite(Number(planDays)) && planDays !== null ? Number(planDays) : null;
  const info = db
    .prepare(
      `INSERT INTO users (gym_id, username, password_hash, name, role, avatar, plan_label, plan_days,
                          coach, coach_title, start_date, created_at)
       VALUES (?, ?, ?, ?, 'member', ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.gymId,
      cleanUsername,
      hashPassword(String(password)),
      name.trim(),
      initials(name),
      days ? `${days} días/semana` : "Sin plan",
      days,
      coach?.trim() || null,
      coachTitle?.trim() || null,
      today(),
      nowIso()
    );

  const created = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ user: serializeUser(created) });
});

const EDITABLE = {
  name: (v) => ["name", String(v).trim()],
  goal: (v) => ["goal", v == null ? null : String(v)],
  coach: (v) => ["coach", v == null ? null : String(v)],
  coachTitle: (v) => ["coach_title", v == null ? null : String(v)],
  plan: (v) => ["plan_label", String(v)],
  planDays: (v) => ["plan_days", v == null ? null : Number(v)],
};

router.patch("/:id", (req, res) => {
  const target = loadTarget(req, res);
  if (!target) return;

  const updates = [];
  const values = [];

  for (const [key, mapper] of Object.entries(EDITABLE)) {
    if (req.body?.[key] !== undefined) {
      const [column, value] = mapper(req.body[key]);
      updates.push(`${column} = ?`);
      values.push(value);
    }
  }

  if (req.body?.password) {
    if (String(req.body.password).length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
    }
    updates.push("password_hash = ?");
    values.push(hashPassword(String(req.body.password)));
  }

  // Keep the display label in step with the day count when only one is sent.
  if (req.body?.planDays !== undefined && req.body?.plan === undefined) {
    const days = req.body.planDays;
    updates.push("plan_label = ?");
    values.push(days ? `${Number(days)} días/semana` : "Sin plan");
  }

  if (req.body?.name !== undefined) {
    updates.push("avatar = ?");
    values.push(initials(String(req.body.name)));
  }

  if (updates.length === 0) return res.json({ user: serializeUser(target) });

  values.push(target.id, req.gymId);
  db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ? AND gym_id = ?`).run(...values);

  const updated = findInGym.get(target.id, req.gymId);
  res.json({ user: serializeUser(updated) });
});

router.delete("/:id", requireOwner, (req, res) => {
  const target = findInGym.get(Number(req.params.id), req.gymId);
  if (!target) return res.status(404).json({ error: "Usuario no encontrado." });
  if (target.role === "owner") {
    return res.status(400).json({ error: "No se puede eliminar la cuenta de administrador." });
  }

  db.prepare("DELETE FROM users WHERE id = ? AND gym_id = ?").run(target.id, req.gymId);
  res.json({ ok: true });
});

// Owner grants or revokes the Pro add-on without taking a payment.
router.post("/:id/pro/toggle", requireOwner, (req, res) => {
  const target = findInGym.get(Number(req.params.id), req.gymId);
  if (!target) return res.status(404).json({ error: "Usuario no encontrado." });

  const next = target.pro_active ? 0 : 1;
  db.prepare("UPDATE users SET pro_active = ?, pro_paid_date = ? WHERE id = ? AND gym_id = ?").run(
    next,
    next ? today() : null,
    target.id,
    req.gymId
  );

  res.json({ user: serializeUser(findInGym.get(target.id, req.gymId)) });
});

export default router;
