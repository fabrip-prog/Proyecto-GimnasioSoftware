import { Router } from "express";
import { db, nowIso, today } from "../db.js";
import { authenticate } from "../auth.js";
import { serializeUser } from "../serialize.js";

const router = Router();
router.use(authenticate);

const findUser = db.prepare("SELECT * FROM users WHERE id = ? AND gym_id = ?");

router.post("/", (req, res) => {
  const { userId, exerciseId, exerciseName, weight, reps, dayNumber, date } = req.body ?? {};

  const targetId = userId === undefined ? req.user.id : Number(userId);
  if (req.user.role !== "owner" && targetId !== req.user.id) {
    return res.status(403).json({ error: "Solo podés registrar tu propio progreso." });
  }

  const user = findUser.get(targetId, req.gymId);
  if (!user) return res.status(404).json({ error: "Usuario no encontrado." });
  if (!exerciseId) return res.status(400).json({ error: "Falta el ejercicio." });

  const loggedOn = /^\d{4}-\d{2}-\d{2}$/.test(String(date)) ? String(date) : today();

  db.prepare(
    `INSERT INTO progress (gym_id, user_id, date, day_number, exercise_id, exercise_name, weight, reps, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (user_id, date, exercise_id) DO UPDATE SET
       weight = excluded.weight,
       reps = excluded.reps,
       exercise_name = excluded.exercise_name,
       day_number = excluded.day_number,
       updated_at = excluded.updated_at`
  ).run(
    req.gymId,
    user.id,
    loggedOn,
    Number.isFinite(Number(dayNumber)) ? Number(dayNumber) : null,
    String(exerciseId),
    exerciseName ? String(exerciseName) : null,
    weight == null ? null : String(weight),
    reps == null ? null : String(reps),
    nowIso()
  );

  res.status(201).json({ user: serializeUser(findUser.get(user.id, req.gymId)) });
});

router.get("/:userId", (req, res) => {
  const targetId = Number(req.params.userId);
  if (req.user.role !== "owner" && targetId !== req.user.id) {
    return res.status(403).json({ error: "No autorizado." });
  }

  const rows = db
    .prepare(
      `SELECT date, day_number, exercise_id, exercise_name, weight, reps FROM progress
       WHERE user_id = ? AND gym_id = ? ORDER BY date DESC`
    )
    .all(targetId, req.gymId);

  res.json({ entries: rows });
});

export default router;
