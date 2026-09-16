import crypto from "node:crypto";
import { Router } from "express";
import { db } from "../db.js";
import { authenticate, requireOwner } from "../auth.js";
import { serializePlans, serializeUser } from "../serialize.js";

const router = Router();
router.use(authenticate);

const findPlan = db.prepare("SELECT data FROM plans WHERE gym_id = ? AND day_count = ?");
const savePlan = db.prepare(
  "INSERT INTO plans (gym_id, day_count, data) VALUES (?, ?, ?) ON CONFLICT (gym_id, day_count) DO UPDATE SET data = excluded.data"
);
const findUser = db.prepare("SELECT * FROM users WHERE id = ? AND gym_id = ?");

function exerciseId() {
  return crypto.randomBytes(8).toString("hex");
}

function cleanExercise(input, existing = {}) {
  return {
    id: existing.id ?? exerciseId(),
    name: String(input.name ?? existing.name ?? "").trim(),
    muscle: String(input.muscle ?? existing.muscle ?? "").trim(),
    sets: Number(input.sets ?? existing.sets ?? 3),
    reps: String(input.reps ?? existing.reps ?? "10"),
    rest: String(input.rest ?? existing.rest ?? "60s"),
    instructions: String(input.instructions ?? existing.instructions ?? ""),
    mediaUrl: String(input.mediaUrl ?? existing.mediaUrl ?? ""),
  };
}

function cleanDay(input, existing = {}) {
  return {
    title: String(input.title ?? existing.title ?? "Nuevo día").trim(),
    focus: String(input.focus ?? existing.focus ?? "").trim(),
    exercises: Array.isArray(existing.exercises) ? existing.exercises : [],
  };
}

router.get("/", (req, res) => {
  res.json({ plans: serializePlans(req.gymId) });
});

// ── Shared plans (owner) ────────────────────────────────────────────────────

router.use(["/shared", "/custom"], requireOwner);

router.post("/shared", (req, res) => {
  const dayCount = Number(req.body?.dayCount);
  if (!Number.isInteger(dayCount) || dayCount < 1 || dayCount > 7) {
    return res.status(400).json({ error: "La cantidad de días debe estar entre 1 y 7." });
  }
  if (findPlan.get(req.gymId, dayCount)) {
    return res.status(409).json({ error: `Ya existe un plan de ${dayCount} días.` });
  }

  savePlan.run(req.gymId, dayCount, JSON.stringify(req.body?.days ?? {}));
  res.status(201).json({ plans: serializePlans(req.gymId) });
});

router.delete("/shared/:dayCount", (req, res) => {
  const dayCount = Number(req.params.dayCount);

  db.transaction(() => {
    db.prepare("DELETE FROM plans WHERE gym_id = ? AND day_count = ?").run(req.gymId, dayCount);
    db.prepare(
      "UPDATE users SET plan_days = NULL, plan_label = 'Sin plan' WHERE gym_id = ? AND plan_days = ?"
    ).run(req.gymId, dayCount);
  })();

  res.json({ plans: serializePlans(req.gymId) });
});

/** Read-modify-write of one shared plan's JSON blob. */
function mutateSharedPlan(req, res, mutate) {
  const dayCount = Number(req.params.dayCount);
  const row = findPlan.get(req.gymId, dayCount);
  if (!row) {
    res.status(404).json({ error: "El plan no existe." });
    return;
  }

  const plan = JSON.parse(row.data);
  const result = mutate(plan);
  if (result?.error) {
    res.status(result.status ?? 400).json({ error: result.error });
    return;
  }

  savePlan.run(req.gymId, dayCount, JSON.stringify(plan));
  res.json({ plans: serializePlans(req.gymId) });
}

router.put("/shared/:dayCount/days/:dayNum", (req, res) => {
  mutateSharedPlan(req, res, (plan) => {
    const key = String(req.params.dayNum);
    plan[key] = { ...cleanDay(req.body ?? {}, plan[key]), exercises: plan[key]?.exercises ?? [] };
  });
});

router.delete("/shared/:dayCount/days/:dayNum", (req, res) => {
  mutateSharedPlan(req, res, (plan) => {
    delete plan[String(req.params.dayNum)];
  });
});

router.post("/shared/:dayCount/days/:dayNum/exercises", (req, res) => {
  mutateSharedPlan(req, res, (plan) => {
    const key = String(req.params.dayNum);
    if (!plan[key]) return { error: "El día no existe.", status: 404 };
    plan[key].exercises = [...(plan[key].exercises ?? []), cleanExercise(req.body ?? {})];
  });
});

router.patch("/shared/:dayCount/days/:dayNum/exercises/:exerciseId", (req, res) => {
  mutateSharedPlan(req, res, (plan) => {
    const key = String(req.params.dayNum);
    if (!plan[key]) return { error: "El día no existe.", status: 404 };
    plan[key].exercises = (plan[key].exercises ?? []).map((ex) =>
      ex.id === req.params.exerciseId ? cleanExercise(req.body ?? {}, ex) : ex
    );
  });
});

router.delete("/shared/:dayCount/days/:dayNum/exercises/:exerciseId", (req, res) => {
  mutateSharedPlan(req, res, (plan) => {
    const key = String(req.params.dayNum);
    if (!plan[key]) return { error: "El día no existe.", status: 404 };
    plan[key].exercises = (plan[key].exercises ?? []).filter(
      (ex) => ex.id !== req.params.exerciseId
    );
  });
});

// ── Per-member custom plans (owner) ─────────────────────────────────────────

/** Read-modify-write of one member's custom plan JSON. */
function mutateCustomPlan(req, res, mutate, { requirePlan = true } = {}) {
  const user = findUser.get(Number(req.params.userId), req.gymId);
  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado." });
    return;
  }

  const plan = user.custom_plan ? JSON.parse(user.custom_plan) : null;
  if (requirePlan && !plan) {
    res.status(400).json({ error: "El usuario no tiene un plan personalizado." });
    return;
  }

  const next = mutate(plan ?? {});
  if (next?.error) {
    res.status(next.status ?? 400).json({ error: next.error });
    return;
  }

  db.prepare("UPDATE users SET custom_plan = ? WHERE id = ? AND gym_id = ?").run(
    next === null ? null : JSON.stringify(next.plan ?? plan ?? {}),
    user.id,
    req.gymId
  );

  res.json({ user: serializeUser(findUser.get(user.id, req.gymId)) });
}

router.put("/custom/:userId", (req, res) => {
  mutateCustomPlan(req, res, () => ({ plan: req.body?.plan ?? {} }), { requirePlan: false });
});

router.delete("/custom/:userId", (req, res) => {
  mutateCustomPlan(req, res, () => null, { requirePlan: false });
});

router.put("/custom/:userId/days/:dayNum", (req, res) => {
  mutateCustomPlan(req, res, (plan) => {
    const key = String(req.params.dayNum);
    plan[key] = { ...cleanDay(req.body ?? {}, plan[key]), exercises: plan[key]?.exercises ?? [] };
    return { plan };
  });
});

router.delete("/custom/:userId/days/:dayNum", (req, res) => {
  mutateCustomPlan(req, res, (plan) => {
    delete plan[String(req.params.dayNum)];
    return { plan };
  });
});

router.post("/custom/:userId/days/:dayNum/exercises", (req, res) => {
  mutateCustomPlan(req, res, (plan) => {
    const key = String(req.params.dayNum);
    if (!plan[key]) return { error: "El día no existe.", status: 404 };
    plan[key].exercises = [...(plan[key].exercises ?? []), cleanExercise(req.body ?? {})];
    return { plan };
  });
});

router.patch("/custom/:userId/days/:dayNum/exercises/:exerciseId", (req, res) => {
  mutateCustomPlan(req, res, (plan) => {
    const key = String(req.params.dayNum);
    if (!plan[key]) return { error: "El día no existe.", status: 404 };
    plan[key].exercises = (plan[key].exercises ?? []).map((ex) =>
      ex.id === req.params.exerciseId ? cleanExercise(req.body ?? {}, ex) : ex
    );
    return { plan };
  });
});

router.delete("/custom/:userId/days/:dayNum/exercises/:exerciseId", (req, res) => {
  mutateCustomPlan(req, res, (plan) => {
    const key = String(req.params.dayNum);
    if (!plan[key]) return { error: "El día no existe.", status: 404 };
    plan[key].exercises = (plan[key].exercises ?? []).filter(
      (ex) => ex.id !== req.params.exerciseId
    );
    return { plan };
  });
});

export default router;
