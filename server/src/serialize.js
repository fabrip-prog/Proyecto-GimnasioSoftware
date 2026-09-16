import { db } from "./db.js";

const selectPayments = db.prepare(
  "SELECT id, type, label, amount, date, month, method, note FROM payments WHERE user_id = ? ORDER BY date DESC, id DESC"
);

const selectProgress = db.prepare(
  "SELECT date, exercise_id, exercise_name, weight, reps FROM progress WHERE user_id = ? ORDER BY date DESC"
);

const selectLastMonthly = db.prepare(
  "SELECT month, date FROM payments WHERE user_id = ? AND type = 'monthly' ORDER BY month DESC, id DESC LIMIT 1"
);

/**
 * Shapes a user row into the object the React app consumes. Password hashes
 * never leave this function.
 */
export function serializeUser(row, { includeHistory = true } = {}) {
  const lastMonthly = selectLastMonthly.get(row.id);

  const user = {
    id: row.id,
    gymId: row.gym_id,
    username: row.username,
    name: row.name,
    role: row.role,
    active: row.active === undefined ? true : Boolean(row.active),
    deactivatedAt: row.deactivated_at ?? null,
    avatar: row.avatar,
    goal: row.goal,
    whatsapp: row.whatsapp ?? null,
    plan: row.plan_label,
    planDays: row.plan_days,
    coach: row.coach,
    coachTitle: row.coach_title,
    startDate: row.start_date,
    proActive: Boolean(row.pro_active),
    proPaidDate: row.pro_paid_date,
    customPlan: row.custom_plan ? JSON.parse(row.custom_plan) : null,
    monthlyPaidMonth: lastMonthly?.month ?? null,
    monthlyPaidDate: lastMonthly?.date ?? null,
    paymentHistory: [],
    progress: {},
  };

  if (includeHistory) {
    user.paymentHistory = selectPayments.all(row.id);
    user.progress = groupProgress(selectProgress.all(row.id));
  }

  return user;
}

function groupProgress(rows) {
  const grouped = {};
  for (const r of rows) {
    if (!grouped[r.date]) grouped[r.date] = {};
    grouped[r.date][r.exercise_id] = {
      weight: r.weight,
      reps: r.reps,
      name: r.exercise_name,
    };
  }
  return grouped;
}

const selectPlans = db.prepare(
  "SELECT day_count, data FROM plans WHERE gym_id = ? ORDER BY day_count"
);

export function serializePlans(gymId) {
  const plans = {};
  for (const row of selectPlans.all(gymId)) {
    plans[row.day_count] = JSON.parse(row.data);
  }
  return plans;
}

export function serializeGym(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    whatsapp: row.whatsapp,
    currency: row.currency,
    pricing: { monthly: row.monthly_price, pro: row.pro_price },
  };
}
