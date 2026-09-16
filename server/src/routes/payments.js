import { Router } from "express";
import { currentMonth, db, nowIso, today } from "../db.js";
import { authenticate, requireOwner } from "../auth.js";
import { serializeUser } from "../serialize.js";
import * as audit from "../audit.js";

const router = Router();
router.use(authenticate);

const findUser = db.prepare("SELECT * FROM users WHERE id = ? AND gym_id = ?");
const findGym = db.prepare("SELECT * FROM gyms WHERE id = ?");

const LABELS = { monthly: "Cuota Mensual", pro: "Suscripción Pro" };

// Money is only ever recorded by the gym, never self-declared by a member.
router.post("/", requireOwner, (req, res) => {
  const { userId, type, amount, method, note, date } = req.body ?? {};
  if (!LABELS[type]) {
    return res.status(400).json({ error: "Tipo de pago inválido." });
  }

  const user = findUser.get(Number(userId), req.gymId);
  if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

  const gym = findGym.get(req.gymId);
  const finalAmount = Number.isFinite(Number(amount))
    ? Number(amount)
    : type === "monthly"
      ? gym.monthly_price
      : gym.pro_price;

  const paidOn = /^\d{4}-\d{2}-\d{2}$/.test(String(date)) ? String(date) : today();

  db.transaction(() => {
    db.prepare(
      `INSERT INTO payments (gym_id, user_id, type, label, amount, date, month, method, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      req.gymId,
      user.id,
      type,
      LABELS[type],
      finalAmount,
      paidOn,
      paidOn.slice(0, 7),
      method?.trim() || "efectivo",
      note?.trim() || null,
      nowIso()
    );

    if (type === "pro") {
      db.prepare("UPDATE users SET pro_active = 1, pro_paid_date = ? WHERE id = ?").run(
        paidOn,
        user.id
      );
    }
  })();

  audit.record(req.user, `pago.${type}`, {
    target: user,
    detail: `${finalAmount} (${paidOn})`,
  });

  res.status(201).json({ user: serializeUser(findUser.get(user.id, req.gymId)) });
});

// One-click "está al día / no está al día" for the current month.
router.post("/monthly/toggle/:userId", requireOwner, (req, res) => {
  const user = findUser.get(Number(req.params.userId), req.gymId);
  if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

  const month = currentMonth();
  const existing = db
    .prepare("SELECT id FROM payments WHERE user_id = ? AND type = 'monthly' AND month = ?")
    .get(user.id, month);

  if (existing) {
    db.prepare("DELETE FROM payments WHERE user_id = ? AND type = 'monthly' AND month = ?").run(
      user.id,
      month
    );
  } else {
    const gym = findGym.get(req.gymId);
    db.prepare(
      `INSERT INTO payments (gym_id, user_id, type, label, amount, date, month, method, created_at)
       VALUES (?, ?, 'monthly', ?, ?, ?, ?, 'efectivo', ?)`
    ).run(req.gymId, user.id, LABELS.monthly, gym.monthly_price, today(), month, nowIso());
  }

  audit.record(req.user, existing ? "cuota.anulada" : "cuota.registrada", {
    target: user,
    detail: month,
  });

  res.json({ user: serializeUser(findUser.get(user.id, req.gymId)) });
});

router.delete("/:id", requireOwner, (req, res) => {
  const info = db
    .prepare("DELETE FROM payments WHERE id = ? AND gym_id = ?")
    .run(Number(req.params.id), req.gymId);
  if (info.changes === 0) return res.status(404).json({ error: "Pago no encontrado." });
  res.json({ ok: true });
});

router.get("/summary", requireOwner, (req, res) => {
  const month = req.query.month && /^\d{4}-\d{2}$/.test(req.query.month)
    ? req.query.month
    : currentMonth();

  const totals = db
    .prepare(
      `SELECT type, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
       FROM payments WHERE gym_id = ? AND month = ? GROUP BY type`
    )
    .all(req.gymId, month);

  const memberCount = db
    .prepare("SELECT COUNT(*) AS n FROM users WHERE gym_id = ? AND role = 'member'")
    .get(req.gymId).n;

  const paidCount = db
    .prepare(
      `SELECT COUNT(DISTINCT user_id) AS n FROM payments
       WHERE gym_id = ? AND month = ? AND type = 'monthly'`
    )
    .get(req.gymId, month).n;

  const byMonth = db
    .prepare(
      `SELECT month, COALESCE(SUM(amount), 0) AS total FROM payments
       WHERE gym_id = ? GROUP BY month ORDER BY month DESC LIMIT 12`
    )
    .all(req.gymId);

  res.json({
    month,
    memberCount,
    paidCount,
    unpaidCount: Math.max(memberCount - paidCount, 0),
    revenue: totals.reduce((sum, t) => sum + t.total, 0),
    byType: totals,
    byMonth,
  });
});

export default router;
