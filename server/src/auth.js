import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import jwt from "jsonwebtoken";
import { db } from "./db.js";

const SCRYPT_KEYLEN = 64;
const TOKEN_TTL = process.env.TOKEN_TTL || "30d";

export const JWT_SECRET = resolveSecret();

function resolveSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET no está definido. Definilo en el entorno antes de iniciar el servidor en producción."
    );
  }

  // Dev convenience: persist a generated secret so restarts don't log everyone out.
  const secretFile = path.resolve(process.cwd(), "data", ".jwt-secret");
  if (fs.existsSync(secretFile)) return fs.readFileSync(secretFile, "utf8").trim();

  const generated = crypto.randomBytes(48).toString("hex");
  fs.mkdirSync(path.dirname(secretFile), { recursive: true });
  fs.writeFileSync(secretFile, generated, { mode: 0o600 });
  return generated;
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password, stored) {
  const [scheme, salt, expected] = String(stored).split("$");
  if (scheme !== "scrypt" || !salt || !expected) return false;

  const actual = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  const a = Buffer.from(actual, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, gym: user.gym_id, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

const selectUserById = db.prepare(
  "SELECT * FROM users WHERE id = ? AND gym_id = ?"
);

export function authenticate(req, res, next) {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No autenticado." });

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Sesión expirada. Volvé a iniciar sesión." });
  }

  const user = selectUserById.get(payload.sub, payload.gym);
  if (!user) return res.status(401).json({ error: "La cuenta ya no existe." });

  req.user = user;
  req.gymId = user.gym_id;
  next();
}

export function requireOwner(req, res, next) {
  if (req.user.role !== "owner") {
    return res.status(403).json({ error: "Requiere permisos de administrador." });
  }
  next();
}

// Brute-force guard. In-memory is enough for a single-process deployment;
// move to the DB or Redis if the API is ever run in a cluster.
const attempts = new Map();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

export function loginThrottle(key) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (entry && now - entry.first > WINDOW_MS) {
    attempts.delete(key);
    return { blocked: false };
  }
  if (entry && entry.count >= MAX_ATTEMPTS) {
    return { blocked: true, retryInMinutes: Math.ceil((WINDOW_MS - (now - entry.first)) / 60000) };
  }
  return { blocked: false };
}

export function recordFailedLogin(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
  } else {
    entry.count += 1;
  }
}

export function clearLoginAttempts(key) {
  attempts.delete(key);
}
