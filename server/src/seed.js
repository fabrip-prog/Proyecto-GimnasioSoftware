import "dotenv/config";
import { db, nowIso, today } from "./db.js";
import { hashPassword } from "./auth.js";
import { DEFAULT_PLANS, DEMO_MEMBERS } from "./seedData.js";

const DEMO_SLUG = "demo";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo1234";
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || "admin1234";

function initials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const existing = db.prepare("SELECT id FROM gyms WHERE slug = ?").get(DEMO_SLUG);
if (existing) {
  console.log(`El gimnasio de demostración "${DEMO_SLUG}" ya existe (id ${existing.id}). Nada que hacer.`);
  process.exit(0);
}

db.transaction(() => {
  const gymId = Number(
    db
      .prepare(
        `INSERT INTO gyms (slug, name, whatsapp, monthly_price, pro_price, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(DEMO_SLUG, "Gimnasio Demo", "3329534029", 15000, 8000, nowIso()).lastInsertRowid
  );

  const insertPlan = db.prepare("INSERT INTO plans (gym_id, day_count, data) VALUES (?, ?, ?)");
  for (const [dayCount, plan] of Object.entries(DEFAULT_PLANS)) {
    insertPlan.run(gymId, Number(dayCount), JSON.stringify(plan));
  }

  const insertUser = db.prepare(
    `INSERT INTO users (gym_id, username, password_hash, name, role, avatar, plan_label, plan_days,
                        coach, coach_title, start_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  insertUser.run(
    gymId,
    "admin",
    hashPassword(ADMIN_PASSWORD),
    "Alex Rossi",
    "owner",
    "AR",
    "Administrador",
    null,
    null,
    null,
    today(),
    nowIso()
  );

  for (const member of DEMO_MEMBERS) {
    insertUser.run(
      gymId,
      member.username,
      hashPassword(DEMO_PASSWORD),
      member.name,
      "member",
      member.avatar || initials(member.name),
      member.plan,
      member.planDays,
      member.coach,
      member.coachTitle,
      member.startDate,
      nowIso()
    );
  }

  console.log(`Gimnasio de demostración creado (id ${gymId}).`);
})();

console.log(`
  Cuentas de demostración — gimnasio "${DEMO_SLUG}":
    admin       / ${ADMIN_PASSWORD}   (administrador)
    user2dias   / ${DEMO_PASSWORD}
    user3dias   / ${DEMO_PASSWORD}
    user5dias   / ${DEMO_PASSWORD}
`);
