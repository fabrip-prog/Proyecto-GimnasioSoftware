import { Router } from "express";
import { currentMonth, db, nowIso, today } from "../db.js";
import { authenticate, hashPassword, requireOwner } from "../auth.js";
import { serializeUser } from "../serialize.js";
import * as audit from "../audit.js";

const router = Router();
router.use(authenticate, requireOwner);

// ── Pedidos de restablecimiento de contraseña ───────────────────────────────

router.get("/password-requests", (req, res) => {
  const requests = db
    .prepare(
      `SELECT r.id, r.created_at AS createdAt, u.id AS userId, u.name, u.username
       FROM password_requests r JOIN users u ON u.id = r.user_id
       WHERE r.gym_id = ? AND r.status = 'pendiente'
       ORDER BY r.created_at`
    )
    .all(req.gymId);

  res.json({ requests });
});

/** Genera una clave temporal legible para dictarla o mandarla por WhatsApp. */
function temporaryPassword() {
  const words = ["gimnasio", "pesas", "fuerza", "salto", "ritmo", "energia", "impulso"];
  const word = words[Math.floor(Math.random() * words.length)];
  return `${word}${Math.floor(1000 + Math.random() * 9000)}`;
}

router.post("/password-requests/:id/resolver", (req, res) => {
  const request = db
    .prepare("SELECT * FROM password_requests WHERE id = ? AND gym_id = ? AND status = 'pendiente'")
    .get(Number(req.params.id), req.gymId);

  if (!request) return res.status(404).json({ error: "El pedido no existe o ya fue resuelto." });

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(request.user_id);
  const password = temporaryPassword();

  db.transaction(() => {
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
      hashPassword(password),
      user.id
    );
    db.prepare(
      "UPDATE password_requests SET status = 'resuelto', resolved_at = ? WHERE id = ?"
    ).run(nowIso(), request.id);
  })();

  audit.record(req.user, "contrasena.restablecida", { target: user });

  res.json({
    password,
    user: serializeUser(user, { includeHistory: false }),
    message: "Pasale esta contraseña al socio. Puede cambiarla desde su perfil.",
  });
});

router.delete("/password-requests/:id", (req, res) => {
  const info = db
    .prepare("DELETE FROM password_requests WHERE id = ? AND gym_id = ?")
    .run(Number(req.params.id), req.gymId);
  if (info.changes === 0) return res.status(404).json({ error: "El pedido no existe." });
  res.json({ ok: true });
});

// ── Recordatorios de cuota ──────────────────────────────────────────────────

/**
 * Socios con la cuota del mes impaga, con el texto de WhatsApp ya armado para
 * que el dueño sólo tenga que apretar enviar.
 */
router.get("/recordatorios", (req, res) => {
  const gym = db.prepare("SELECT * FROM gyms WHERE id = ?").get(req.gymId);
  const month = currentMonth();

  const pending = db
    .prepare(
      `SELECT u.id, u.name, u.username, u.avatar, u.whatsapp
       FROM users u
       WHERE u.gym_id = ? AND u.role = 'member' AND u.active = 1
         AND NOT EXISTS (
           SELECT 1 FROM payments p
           WHERE p.user_id = u.id AND p.type = 'monthly' AND p.month = ?
         )
       ORDER BY u.name`
    )
    .all(req.gymId, month);

  const amount = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: gym.currency || "ARS",
    maximumFractionDigits: 0,
  }).format(gym.monthly_price);

  const monthName = new Date(`${month}-02`).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  res.json({
    month,
    gymWhatsapp: gym.whatsapp,
    members: pending.map((m) => ({
      ...m,
      message: `Hola ${m.name.split(" ")[0]}! Te escribimos de ${gym.name}. Te recordamos que la cuota de ${monthName} (${amount}) está pendiente. ¡Gracias!`,
    })),
  });
});

// ── Exportación para el contador ────────────────────────────────────────────

function toCsv(rows, columns) {
  const escape = (value) => {
    const text = value == null ? "" : String(value);
    return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const header = columns.map((c) => escape(c.label)).join(";");
  const body = rows.map((row) => columns.map((c) => escape(row[c.key])).join(";"));
  // BOM para que Excel en español abra los acentos correctamente.
  return `﻿${[header, ...body].join("\r\n")}\r\n`;
}

function sendCsv(res, filename, csv) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
}

router.get("/export/socios.csv", (req, res) => {
  const rows = db
    .prepare(
      `SELECT u.name, u.username, u.plan_label, u.coach, u.start_date,
              CASE u.active WHEN 1 THEN 'Activo' ELSE 'Baja' END AS estado,
              CASE u.pro_active WHEN 1 THEN 'Si' ELSE 'No' END AS pro,
              (SELECT MAX(month) FROM payments p WHERE p.user_id = u.id AND p.type = 'monthly') AS ultimaCuota
       FROM users u WHERE u.gym_id = ? AND u.role = 'member' ORDER BY u.name`
    )
    .all(req.gymId);

  sendCsv(
    res,
    `socios-${today()}.csv`,
    toCsv(rows, [
      { key: "name", label: "Nombre" },
      { key: "username", label: "Usuario" },
      { key: "plan_label", label: "Plan" },
      { key: "coach", label: "Coach" },
      { key: "start_date", label: "Alta" },
      { key: "estado", label: "Estado" },
      { key: "pro", label: "Pro" },
      { key: "ultimaCuota", label: "Ultima cuota paga" },
    ])
  );
});

router.get("/export/pagos.csv", (req, res) => {
  const rows = db
    .prepare(
      `SELECT p.date, p.month, u.name, u.username, p.label, p.amount, p.method, p.note
       FROM payments p JOIN users u ON u.id = p.user_id
       WHERE p.gym_id = ? ORDER BY p.date DESC, p.id DESC`
    )
    .all(req.gymId);

  sendCsv(
    res,
    `pagos-${today()}.csv`,
    toCsv(rows, [
      { key: "date", label: "Fecha" },
      { key: "month", label: "Periodo" },
      { key: "name", label: "Socio" },
      { key: "username", label: "Usuario" },
      { key: "label", label: "Concepto" },
      { key: "amount", label: "Importe" },
      { key: "method", label: "Medio" },
      { key: "note", label: "Nota" },
    ])
  );
});

// ── Registro de auditoría ───────────────────────────────────────────────────

router.get("/auditoria", (req, res) => {
  res.json({ entries: audit.recent(req.gymId, 100) });
});

export default router;
