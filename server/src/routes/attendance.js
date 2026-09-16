import { Router } from "express";
import { db, nowIso, today } from "../db.js";
import { authenticate, requireOwner } from "../auth.js";

const router = Router();
router.use(authenticate);

const findMember = db.prepare(
  "SELECT * FROM users WHERE id = ? AND gym_id = ? AND active = 1"
);

/** Registra la entrada del socio al gimnasio. Una por día. */
router.post("/checkin/:userId", requireOwner, (req, res) => {
  const user = findMember.get(Number(req.params.userId), req.gymId);
  if (!user) return res.status(404).json({ error: "Socio no encontrado." });

  const date = today();
  const existing = db
    .prepare("SELECT id FROM attendance WHERE user_id = ? AND date = ?")
    .get(user.id, date);

  if (existing) {
    return res.status(409).json({ error: `${user.name} ya tiene la entrada registrada hoy.` });
  }

  db.prepare(
    "INSERT INTO attendance (gym_id, user_id, date, checked_in_at) VALUES (?, ?, ?, ?)"
  ).run(req.gymId, user.id, date, nowIso());

  res.status(201).json({ ok: true, date });
});

router.delete("/checkin/:userId", requireOwner, (req, res) => {
  const info = db
    .prepare("DELETE FROM attendance WHERE user_id = ? AND gym_id = ? AND date = ?")
    .run(Number(req.params.userId), req.gymId, today());

  if (info.changes === 0) return res.status(404).json({ error: "No había entrada registrada hoy." });
  res.json({ ok: true });
});

/** Quiénes vinieron hoy, más el conteo de los últimos 30 días. */
router.get("/hoy", requireOwner, (req, res) => {
  const date = today();

  const present = db
    .prepare(
      `SELECT a.user_id AS userId, u.name, u.username, u.avatar, a.checked_in_at AS checkedInAt
       FROM attendance a JOIN users u ON u.id = a.user_id
       WHERE a.gym_id = ? AND a.date = ? ORDER BY a.checked_in_at DESC`
    )
    .all(req.gymId, date);

  const last30 = db
    .prepare(
      `SELECT date, COUNT(*) AS total FROM attendance
       WHERE gym_id = ? AND date >= date(?, '-29 days')
       GROUP BY date ORDER BY date DESC`
    )
    .all(req.gymId, date);

  res.json({ date, present, last30 });
});

/** Historial de un socio: sus últimas visitas y cuántas lleva en el mes. */
router.get("/:userId", (req, res) => {
  const targetId = Number(req.params.userId);
  if (req.user.role !== "owner" && targetId !== req.user.id) {
    return res.status(403).json({ error: "No autorizado." });
  }

  const visits = db
    .prepare(
      "SELECT date, checked_in_at AS checkedInAt FROM attendance WHERE user_id = ? AND gym_id = ? ORDER BY date DESC LIMIT 90"
    )
    .all(targetId, req.gymId);

  const thisMonth = db
    .prepare(
      "SELECT COUNT(*) AS n FROM attendance WHERE user_id = ? AND gym_id = ? AND substr(date, 1, 7) = ?"
    )
    .get(targetId, req.gymId, today().slice(0, 7)).n;

  res.json({ visits, thisMonth });
});

export default router;
