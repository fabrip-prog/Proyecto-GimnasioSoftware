import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

// The db module resolves its file location at import time, so the temp
// directory has to be in place before anything else is loaded.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kinefix-test-"));
process.env.DATA_DIR = tmpDir;
process.env.JWT_SECRET = "test-secret-not-used-in-production";

const { createApp } = await import("../src/app.js");
const { db } = await import("../src/db.js");

let server;
let baseUrl;

function api(pathname, { token, method = "GET", body } = {}) {
  return fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function json(res) {
  return { status: res.status, body: await res.json() };
}

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server?.close();
  // Windows keeps the database file locked until the connection is closed.
  db.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("onboarding de gimnasios", () => {
  it("registra un gimnasio con su administrador y planes por defecto", async () => {
    const { status, body } = await json(
      await api("/api/auth/gyms/register", {
        method: "POST",
        body: {
          gymName: "Olimpo Fitness",
          ownerName: "Ana Gómez",
          username: "ana",
          password: "unaClaveSegura1",
          monthlyPrice: 20000,
        },
      })
    );

    assert.equal(status, 201);
    assert.equal(body.gym.slug, "olimpo-fitness");
    assert.equal(body.gym.pricing.monthly, 20000);
    assert.equal(body.user.role, "owner");
    assert.ok(body.token);

    const me = await json(await api("/api/auth/me", { token: body.token }));
    assert.deepEqual(Object.keys(me.body.plans).sort(), ["2", "3", "5"]);
  });

  it("rechaza contraseñas de administrador demasiado cortas", async () => {
    const { status } = await json(
      await api("/api/auth/gyms/register", {
        method: "POST",
        body: { gymName: "X", ownerName: "Y", username: "z", password: "corta" },
      })
    );
    assert.equal(status, 400);
  });

  it("evita colisiones de slug entre gimnasios homónimos", async () => {
    const { body } = await json(
      await api("/api/auth/gyms/register", {
        method: "POST",
        body: {
          gymName: "Olimpo Fitness",
          ownerName: "Beto",
          username: "beto",
          password: "otraClaveSegura1",
        },
      })
    );
    assert.equal(body.gym.slug, "olimpo-fitness-2");
  });
});

describe("autenticación", () => {
  let token;

  before(async () => {
    const { body } = await json(
      await api("/api/auth/login", {
        method: "POST",
        body: { gymSlug: "olimpo-fitness", username: "ana", password: "unaClaveSegura1" },
      })
    );
    token = body.token;
  });

  it("permite iniciar sesión con credenciales válidas", () => {
    assert.ok(token);
  });

  it("rechaza contraseñas incorrectas", async () => {
    const { status } = await json(
      await api("/api/auth/login", {
        method: "POST",
        body: { gymSlug: "olimpo-fitness", username: "ana", password: "incorrecta" },
      })
    );
    assert.equal(status, 401);
  });

  it("nunca devuelve el hash de la contraseña", async () => {
    const { body } = await json(await api("/api/auth/me", { token }));
    assert.equal(body.user.password_hash, undefined);
    assert.equal(body.user.password, undefined);
  });

  it("rechaza peticiones sin token", async () => {
    const { status } = await json(await api("/api/users"));
    assert.equal(status, 401);
  });

  it("rechaza tokens manipulados", async () => {
    const { status } = await json(await api("/api/auth/me", { token: `${token}x` }));
    assert.equal(status, 401);
  });
});

describe("aislamiento entre gimnasios", () => {
  const gyms = {};

  before(async () => {
    for (const [key, name] of [["a", "Gimnasio Norte"], ["b", "Gimnasio Sur"]]) {
      const { body } = await json(
        await api("/api/auth/gyms/register", {
          method: "POST",
          body: {
            gymName: name,
            ownerName: `Dueño ${key}`,
            username: `duenio${key}`,
            password: "claveDeAdmin123",
          },
        })
      );
      gyms[key] = { token: body.token, slug: body.gym.slug };
    }

    const { body } = await json(
      await api("/api/users", {
        token: gyms.a.token,
        method: "POST",
        body: { name: "Socio Norte", username: "socio", password: "socio123", planDays: 3 },
      })
    );
    gyms.a.memberId = body.user.id;
  });

  it("permite el mismo nombre de usuario en gimnasios distintos", async () => {
    const { status } = await json(
      await api("/api/users", {
        token: gyms.b.token,
        method: "POST",
        body: { name: "Socio Sur", username: "socio", password: "socio123" },
      })
    );
    assert.equal(status, 201);
  });

  it("no expone los socios de un gimnasio a otro", async () => {
    const { body } = await json(await api("/api/users", { token: gyms.b.token }));
    assert.equal(body.users.length, 1);
    assert.equal(body.users[0].name, "Socio Sur");
  });

  it("impide modificar un socio de otro gimnasio", async () => {
    const { status } = await json(
      await api(`/api/users/${gyms.a.memberId}`, {
        token: gyms.b.token,
        method: "PATCH",
        body: { name: "Hackeado" },
      })
    );
    assert.equal(status, 404);
  });

  it("impide eliminar un socio de otro gimnasio", async () => {
    const { status } = await json(
      await api(`/api/users/${gyms.a.memberId}`, { token: gyms.b.token, method: "DELETE" })
    );
    assert.equal(status, 404);
  });

  it("impide registrar un pago a un socio de otro gimnasio", async () => {
    const { status } = await json(
      await api("/api/payments", {
        token: gyms.b.token,
        method: "POST",
        body: { userId: gyms.a.memberId, type: "monthly" },
      })
    );
    assert.equal(status, 404);
  });
});

describe("permisos de socio", () => {
  let ownerToken;
  let memberToken;
  let memberId;
  let otherMemberId;

  before(async () => {
    const owner = await json(
      await api("/api/auth/gyms/register", {
        method: "POST",
        body: {
          gymName: "Club Atlético",
          ownerName: "Carla",
          username: "carla",
          password: "claveDeAdmin123",
        },
      })
    );
    ownerToken = owner.body.token;

    const member = await json(
      await api("/api/auth/register", {
        method: "POST",
        body: {
          gymSlug: "club-atletico",
          name: "Juan Pérez",
          username: "juan",
          password: "juan123456",
        },
      })
    );
    memberToken = member.body.token;
    memberId = member.body.user.id;

    const other = await json(
      await api("/api/users", {
        token: ownerToken,
        method: "POST",
        body: { name: "Otra Socia", username: "otra", password: "otra123456" },
      })
    );
    otherMemberId = other.body.user.id;
  });

  it("no deja a un socio listar el padrón", async () => {
    const { status } = await json(await api("/api/users", { token: memberToken }));
    assert.equal(status, 403);
  });

  it("no deja a un socio registrarse pagos a sí mismo", async () => {
    const { status } = await json(
      await api("/api/payments", {
        token: memberToken,
        method: "POST",
        body: { userId: memberId, type: "monthly" },
      })
    );
    assert.equal(status, 403);
  });

  it("no deja a un socio editar a otro socio", async () => {
    const { status } = await json(
      await api(`/api/users/${otherMemberId}`, {
        token: memberToken,
        method: "PATCH",
        body: { name: "Hackeada" },
      })
    );
    assert.equal(status, 403);
  });

  it("no deja a un socio crear planes compartidos", async () => {
    const { status } = await json(
      await api("/api/plans/shared", { token: memberToken, method: "POST", body: { dayCount: 4 } })
    );
    assert.equal(status, 403);
  });

  it("no deja a un socio asignarse un plan personalizado", async () => {
    const { status } = await json(
      await api(`/api/plans/custom/${memberId}`, {
        token: memberToken,
        method: "PUT",
        body: { plan: { 1: { title: "Mío", focus: "", exercises: [] } } },
      })
    );
    assert.equal(status, 403);
  });

  it("no deja a un socio ver el progreso de otro", async () => {
    const { status } = await json(
      await api(`/api/progress/${otherMemberId}`, { token: memberToken })
    );
    assert.equal(status, 403);
  });

  it("no deja a un socio leer el resumen de cobranzas", async () => {
    const { status } = await json(await api("/api/payments/summary", { token: memberToken }));
    assert.equal(status, 403);
  });

  it("no deja a un socio cambiar la configuración del gimnasio", async () => {
    const { status } = await json(
      await api("/api/gym", { token: memberToken, method: "PATCH", body: { monthlyPrice: 1 } })
    );
    assert.equal(status, 403);
  });

  it("deja a un socio actualizar su propio perfil y plan", async () => {
    const { status, body } = await json(
      await api(`/api/users/${memberId}`, {
        token: memberToken,
        method: "PATCH",
        body: { planDays: 3, goal: "Ganar masa muscular" },
      })
    );
    assert.equal(status, 200);
    assert.equal(body.user.planDays, 3);
    assert.equal(body.user.plan, "3 días/semana");
    assert.equal(body.user.goal, "Ganar masa muscular");
  });

  it("deja a un socio cambiar su contraseña y volver a entrar con ella", async () => {
    await json(
      await api(`/api/users/${memberId}`, {
        token: memberToken,
        method: "PATCH",
        body: { password: "nuevaClave123" },
      })
    );

    const { status } = await json(
      await api("/api/auth/login", {
        method: "POST",
        body: { gymSlug: "club-atletico", username: "juan", password: "nuevaClave123" },
      })
    );
    assert.equal(status, 200);
  });

  it("no deja a un socio registrar progreso de otro", async () => {
    const { status } = await json(
      await api("/api/progress", {
        token: memberToken,
        method: "POST",
        body: { userId: otherMemberId, exerciseId: "x1", weight: "50", reps: "10" },
      })
    );
    assert.equal(status, 403);
  });
});

describe("cuotas y cobranzas", () => {
  let ownerToken;
  let memberId;

  before(async () => {
    const owner = await json(
      await api("/api/auth/gyms/register", {
        method: "POST",
        body: {
          gymName: "Iron House",
          ownerName: "Marco",
          username: "marco",
          password: "claveDeAdmin123",
          monthlyPrice: 18000,
        },
      })
    );
    ownerToken = owner.body.token;

    const member = await json(
      await api("/api/users", {
        token: ownerToken,
        method: "POST",
        body: { name: "Sofía Díaz", username: "sofia", password: "sofia12345", planDays: 2 },
      })
    );
    memberId = member.body.user.id;
  });

  it("marca la cuota del mes y la refleja en el socio", async () => {
    const { body } = await json(
      await api(`/api/payments/monthly/toggle/${memberId}`, { token: ownerToken, method: "POST" })
    );
    const month = new Date().toISOString().slice(0, 7);
    assert.equal(body.user.monthlyPaidMonth, month);
    assert.equal(body.user.paymentHistory.length, 1);
    assert.equal(body.user.paymentHistory[0].amount, 18000);
  });

  it("desmarca la cuota y borra el registro del mes", async () => {
    const { body } = await json(
      await api(`/api/payments/monthly/toggle/${memberId}`, { token: ownerToken, method: "POST" })
    );
    assert.equal(body.user.monthlyPaidMonth, null);
    assert.equal(body.user.paymentHistory.length, 0);
  });

  it("activa Pro al registrar el pago correspondiente", async () => {
    const { body } = await json(
      await api("/api/payments", {
        token: ownerToken,
        method: "POST",
        body: { userId: memberId, type: "pro" },
      })
    );
    assert.equal(body.user.proActive, true);
  });

  it("resume la recaudación del mes para el panel del dueño", async () => {
    await json(
      await api(`/api/payments/monthly/toggle/${memberId}`, { token: ownerToken, method: "POST" })
    );

    const { body } = await json(await api("/api/payments/summary", { token: ownerToken }));
    assert.equal(body.memberCount, 1);
    assert.equal(body.paidCount, 1);
    assert.equal(body.unpaidCount, 0);
    assert.equal(body.revenue, 18000 + 8000);
  });

  it("rechaza tipos de pago desconocidos", async () => {
    const { status } = await json(
      await api("/api/payments", {
        token: ownerToken,
        method: "POST",
        body: { userId: memberId, type: "regalo" },
      })
    );
    assert.equal(status, 400);
  });
});

describe("planes de entrenamiento", () => {
  let ownerToken;
  let memberId;

  before(async () => {
    const owner = await json(
      await api("/api/auth/gyms/register", {
        method: "POST",
        body: {
          gymName: "Powerzone",
          ownerName: "Nadia",
          username: "nadia",
          password: "claveDeAdmin123",
        },
      })
    );
    ownerToken = owner.body.token;

    const member = await json(
      await api("/api/users", {
        token: ownerToken,
        method: "POST",
        body: { name: "Leo Ruiz", username: "leo", password: "leo1234567", planDays: 2 },
      })
    );
    memberId = member.body.user.id;
  });

  it("crea un plan compartido nuevo", async () => {
    const { status, body } = await json(
      await api("/api/plans/shared", { token: ownerToken, method: "POST", body: { dayCount: 4 } })
    );
    assert.equal(status, 201);
    assert.ok(body.plans["4"]);
  });

  it("no permite duplicar un plan existente", async () => {
    const { status } = await json(
      await api("/api/plans/shared", { token: ownerToken, method: "POST", body: { dayCount: 4 } })
    );
    assert.equal(status, 409);
  });

  it("agrega, edita y elimina ejercicios de un plan compartido", async () => {
    await json(
      await api("/api/plans/shared/4/days/1", {
        token: ownerToken,
        method: "PUT",
        body: { title: "Empuje", focus: "Pecho y hombro" },
      })
    );

    const added = await json(
      await api("/api/plans/shared/4/days/1/exercises", {
        token: ownerToken,
        method: "POST",
        body: { name: "Press plano", muscle: "Pecho", sets: 4, reps: "8" },
      })
    );
    const exercise = added.body.plans["4"]["1"].exercises[0];
    assert.equal(exercise.name, "Press plano");

    const edited = await json(
      await api(`/api/plans/shared/4/days/1/exercises/${exercise.id}`, {
        token: ownerToken,
        method: "PATCH",
        body: { sets: 5 },
      })
    );
    assert.equal(edited.body.plans["4"]["1"].exercises[0].sets, 5);
    assert.equal(edited.body.plans["4"]["1"].exercises[0].name, "Press plano");

    const removed = await json(
      await api(`/api/plans/shared/4/days/1/exercises/${exercise.id}`, {
        token: ownerToken,
        method: "DELETE",
      })
    );
    assert.equal(removed.body.plans["4"]["1"].exercises.length, 0);
  });

  it("al borrar un plan deja sin plan a quienes lo tenían", async () => {
    const { body } = await json(
      await api("/api/plans/shared/2", { token: ownerToken, method: "DELETE" })
    );
    assert.equal(body.plans["2"], undefined);

    const users = await json(await api("/api/users", { token: ownerToken }));
    const leo = users.body.users.find((u) => u.id === memberId);
    assert.equal(leo.planDays, null);
    assert.equal(leo.plan, "Sin plan");
  });

  it("asigna y edita un plan personalizado por socio", async () => {
    await json(
      await api(`/api/plans/custom/${memberId}`, {
        token: ownerToken,
        method: "PUT",
        body: { plan: {} },
      })
    );

    await json(
      await api(`/api/plans/custom/${memberId}/days/1`, {
        token: ownerToken,
        method: "PUT",
        body: { title: "Rehabilitación", focus: "Hombro" },
      })
    );

    const { body } = await json(
      await api(`/api/plans/custom/${memberId}/days/1/exercises`, {
        token: ownerToken,
        method: "POST",
        body: { name: "Rotación externa", muscle: "Manguito rotador" },
      })
    );

    assert.equal(body.user.customPlan["1"].title, "Rehabilitación");
    assert.equal(body.user.customPlan["1"].exercises[0].name, "Rotación externa");

    const cleared = await json(
      await api(`/api/plans/custom/${memberId}`, { token: ownerToken, method: "DELETE" })
    );
    assert.equal(cleared.body.user.customPlan, null);
  });
});

describe("registro de progreso", () => {
  let ownerToken;
  let memberToken;
  let memberId;

  before(async () => {
    const owner = await json(
      await api("/api/auth/gyms/register", {
        method: "POST",
        body: {
          gymName: "Studio Fit",
          ownerName: "Pablo",
          username: "pablo",
          password: "claveDeAdmin123",
        },
      })
    );
    ownerToken = owner.body.token;

    const member = await json(
      await api("/api/auth/register", {
        method: "POST",
        body: {
          gymSlug: "studio-fit",
          name: "Rita Blanco",
          username: "rita",
          password: "rita123456",
        },
      })
    );
    memberToken = member.body.token;
    memberId = member.body.user.id;
  });

  it("guarda una serie y la devuelve agrupada por fecha", async () => {
    const { status, body } = await json(
      await api("/api/progress", {
        token: memberToken,
        method: "POST",
        body: {
          exerciseId: "2d1e1",
          exerciseName: "Sentadilla con Barra",
          weight: "80",
          reps: "8",
          dayNumber: 1,
          date: "2026-09-10",
        },
      })
    );

    assert.equal(status, 201);
    assert.deepEqual(body.user.progress["2026-09-10"]["2d1e1"], {
      weight: "80",
      reps: "8",
      name: "Sentadilla con Barra",
    });
  });

  it("sobrescribe la misma serie del mismo día en vez de duplicarla", async () => {
    const { body } = await json(
      await api("/api/progress", {
        token: memberToken,
        method: "POST",
        body: {
          exerciseId: "2d1e1",
          exerciseName: "Sentadilla con Barra",
          weight: "85",
          reps: "6",
          date: "2026-09-10",
        },
      })
    );

    assert.equal(Object.keys(body.user.progress["2026-09-10"]).length, 1);
    assert.equal(body.user.progress["2026-09-10"]["2d1e1"].weight, "85");
  });

  it("conserva el historial de días anteriores", async () => {
    const { body } = await json(
      await api("/api/progress", {
        token: memberToken,
        method: "POST",
        body: { exerciseId: "2d1e1", weight: "90", reps: "5", date: "2026-09-17" },
      })
    );

    assert.equal(body.user.progress["2026-09-10"]["2d1e1"].weight, "85");
    assert.equal(body.user.progress["2026-09-17"]["2d1e1"].weight, "90");
  });

  it("deja al dueño consultar el progreso de un socio", async () => {
    const { status, body } = await json(
      await api(`/api/progress/${memberId}`, { token: ownerToken })
    );
    assert.equal(status, 200);
    assert.equal(body.entries.length, 2);
  });
});

describe("configuración del gimnasio", () => {
  let ownerToken;

  before(async () => {
    const owner = await json(
      await api("/api/auth/gyms/register", {
        method: "POST",
        body: {
          gymName: "Vital Center",
          ownerName: "Inés",
          username: "ines",
          password: "claveDeAdmin123",
        },
      })
    );
    ownerToken = owner.body.token;
  });

  it("actualiza precios y datos de contacto", async () => {
    const { body } = await json(
      await api("/api/gym", {
        token: ownerToken,
        method: "PATCH",
        body: { monthlyPrice: 25000, proPrice: 12000, whatsapp: "3410000000" },
      })
    );

    assert.equal(body.gym.pricing.monthly, 25000);
    assert.equal(body.gym.pricing.pro, 12000);
    assert.equal(body.gym.whatsapp, "3410000000");
  });

  it("rechaza precios inválidos", async () => {
    const { status } = await json(
      await api("/api/gym", { token: ownerToken, method: "PATCH", body: { monthlyPrice: -5 } })
    );
    assert.equal(status, 400);
  });
});
