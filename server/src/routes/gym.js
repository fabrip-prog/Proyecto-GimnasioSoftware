import { Router } from "express";
import { db } from "../db.js";
import { authenticate, requireOwner } from "../auth.js";
import { serializeGym } from "../serialize.js";
import * as audit from "../audit.js";

const router = Router();
router.use(authenticate);

router.patch("/", requireOwner, (req, res) => {
  const { name, whatsapp, currency } = req.body ?? {};

  const updates = [];
  const values = [];

  if (name?.trim()) {
    updates.push("name = ?");
    values.push(name.trim());
  }
  if (whatsapp !== undefined) {
    updates.push("whatsapp = ?");
    values.push(whatsapp?.trim() || null);
  }
  if (currency?.trim()) {
    updates.push("currency = ?");
    values.push(currency.trim());
  }
  for (const [key, column] of [["monthlyPrice", "monthly_price"], ["proPrice", "pro_price"]]) {
    if (req.body?.[key] !== undefined) {
      const amount = Number(req.body[key]);
      if (!Number.isFinite(amount) || amount < 0) {
        return res.status(400).json({ error: "Los precios deben ser números positivos." });
      }
      updates.push(`${column} = ?`);
      values.push(Math.round(amount));
    }
  }

  if (updates.length > 0) {
    values.push(req.gymId);
    db.prepare(`UPDATE gyms SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    audit.record(req.user, "gimnasio.configuracion", { detail: updates.join(", ") });
  }

  res.json({ gym: serializeGym(db.prepare("SELECT * FROM gyms WHERE id = ?").get(req.gymId)) });
});

export default router;
