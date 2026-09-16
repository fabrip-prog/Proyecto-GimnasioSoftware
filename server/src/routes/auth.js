import { Router } from "express";
import { db, nowIso, today } from "../db.js";
import {
  authenticate,
  clearLoginAttempts,
  hashPassword,
  loginThrottle,
  recordFailedLogin,
  signToken,
  verifyPassword,
} from "../auth.js";
import { serializeGym, serializePlans, serializeUser } from "../serialize.js";
import { DEFAULT_PLANS } from "../seedData.js";

const router = Router();

const findGymBySlug = db.prepare("SELECT * FROM gyms WHERE slug = ?");
const findUser = db.prepare("SELECT * FROM users WHERE gym_id = ? AND username = ?");
const listGyms = db.prepare("SELECT slug, name FROM gyms ORDER BY name");

function initials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

// Public: lets the login screen offer the gyms this deployment serves.
router.get("/gyms", (_req, res) => {
  res.json({ gyms: listGyms.all() });
});

router.post("/login", (req, res) => {
  const { gymSlug, username, password } = req.body ?? {};
  if (!gymSlug || !username || !password) {
    return res.status(400).json({ error: "Gimnasio, usuario y contraseña son obligatorios." });
  }

  const throttleKey = `${req.ip}:${gymSlug}:${username}`;
  const throttled = loginThrottle(throttleKey);
  if (throttled.blocked) {
    return res.status(429).json({
      error: `Demasiados intentos fallidos. Probá de nuevo en ${throttled.retryInMinutes} minutos.`,
    });
  }

  const gym = findGymBySlug.get(String(gymSlug));
  const user = gym ? findUser.get(gym.id, String(username).toLowerCase()) : null;

  if (!user || !verifyPassword(String(password), user.password_hash)) {
    recordFailedLogin(throttleKey);
    return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
  }

  clearLoginAttempts(throttleKey);
  res.json({
    token: signToken(user),
    user: serializeUser(user),
    gym: serializeGym(gym),
  });
});

// Self-signup for a member of an existing gym.
router.post("/register", (req, res) => {
  const { gymSlug, name, username, password } = req.body ?? {};
  if (!gymSlug || !name?.trim() || !username?.trim() || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
  }

  const gym = findGymBySlug.get(String(gymSlug));
  if (!gym) return res.status(404).json({ error: "El gimnasio no existe." });

  const cleanUsername = String(username).toLowerCase().replace(/\s/g, "");
  if (findUser.get(gym.id, cleanUsername)) {
    return res.status(409).json({ error: "El nombre de usuario ya existe." });
  }

  const info = db
    .prepare(
      `INSERT INTO users (gym_id, username, password_hash, name, role, avatar, plan_label, start_date, created_at)
       VALUES (?, ?, ?, ?, 'member', ?, 'Sin plan', ?, ?)`
    )
    .run(
      gym.id,
      cleanUsername,
      hashPassword(String(password)),
      name.trim(),
      initials(name),
      today(),
      nowIso()
    );

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({
    token: signToken(user),
    user: serializeUser(user),
    gym: serializeGym(gym),
  });
});

// Self-serve onboarding: a new gym signs up and gets its own isolated tenant.
router.post("/gyms/register", (req, res) => {
  const { gymName, ownerName, username, password, whatsapp, monthlyPrice, proPrice } =
    req.body ?? {};

  if (!gymName?.trim() || !ownerName?.trim() || !username?.trim() || !password) {
    return res
      .status(400)
      .json({ error: "Nombre del gimnasio, responsable, usuario y contraseña son obligatorios." });
  }
  if (String(password).length < 8) {
    return res
      .status(400)
      .json({ error: "La contraseña de administrador debe tener al menos 8 caracteres." });
  }

  const baseSlug = slugify(gymName) || "gimnasio";
  let slug = baseSlug;
  let suffix = 2;
  while (findGymBySlug.get(slug)) slug = `${baseSlug}-${suffix++}`;

  const create = db.transaction(() => {
    const gymInfo = db
      .prepare(
        `INSERT INTO gyms (slug, name, whatsapp, monthly_price, pro_price, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        slug,
        gymName.trim(),
        whatsapp?.trim() || null,
        Number.isFinite(Number(monthlyPrice)) ? Number(monthlyPrice) : 15000,
        Number.isFinite(Number(proPrice)) ? Number(proPrice) : 8000,
        nowIso()
      );

    const gymId = Number(gymInfo.lastInsertRowid);

    const insertPlan = db.prepare(
      "INSERT INTO plans (gym_id, day_count, data) VALUES (?, ?, ?)"
    );
    for (const [dayCount, plan] of Object.entries(DEFAULT_PLANS)) {
      insertPlan.run(gymId, Number(dayCount), JSON.stringify(plan));
    }

    const ownerInfo = db
      .prepare(
        `INSERT INTO users (gym_id, username, password_hash, name, role, avatar, plan_label, start_date, created_at)
         VALUES (?, ?, ?, ?, 'owner', ?, 'Administrador', ?, ?)`
      )
      .run(
        gymId,
        String(username).toLowerCase().replace(/\s/g, ""),
        hashPassword(String(password)),
        ownerName.trim(),
        initials(ownerName),
        today(),
        nowIso()
      );

    return {
      gym: db.prepare("SELECT * FROM gyms WHERE id = ?").get(gymId),
      owner: db.prepare("SELECT * FROM users WHERE id = ?").get(ownerInfo.lastInsertRowid),
    };
  });

  const { gym, owner } = create();

  res.status(201).json({
    token: signToken(owner),
    user: serializeUser(owner),
    gym: serializeGym(gym),
  });
});

// Session bootstrap: everything the app needs for the signed-in principal.
router.get("/me", authenticate, (req, res) => {
  const gym = db.prepare("SELECT * FROM gyms WHERE id = ?").get(req.gymId);
  const isOwner = req.user.role === "owner";

  res.json({
    user: serializeUser(req.user),
    gym: serializeGym(gym),
    plans: serializePlans(req.gymId),
    // The roster skips per-member history: it would grow without bound and the
    // panel only needs it when opening one member's progress.
    users: isOwner
      ? db
          .prepare("SELECT * FROM users WHERE gym_id = ? AND role = 'member' ORDER BY name")
          .all(req.gymId)
          .map((u) => serializeUser(u, { includeHistory: false }))
      : [],
  });
});

export default router;
