import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kinefix-feat-"));
process.env.DATA_DIR = tmpDir;
process.env.JWT_SECRET = "test-secret-not-used-in-production";
process.env.BACKUP_DISABLED = "1";

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

async function newGym(name, username) {
  const { body } = await json(
    await api("/api/auth/gyms/register", {
      method: "POST",
      body: { gymName: name, ownerName: "Dueño", username, password: "claveDeAdmin123" },
    })
  );
  return { token: body.token, slug: body.gym.slug };
}

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server?.close();
  db.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("baja lógica de socios", () => {
  let token;
  let slug;
  let conPagosId;
  let sinPagosId;

  before(async () => {
    ({ token, slug } = await newGym("Bajas Gym", "rita"));

    const conPagos = await json(
      await api("/api/users", {
        token,
        method: "POST",
        body: { name: "Con Pagos", username: "conpagos", password: "clave123456" },
      })
    );
    conPagosId = conPagos.body.user.id;

    const sinPagos = await json(
      await api("/api/users", {
        token,
        method: "POST",
        body: { name: "Sin Pagos", username: "sinpagos", password: "clave123456" },
      })
    );
    sinPagosId = sinPagos.body.user.id;

    await json(
      await api(`/api/payments/monthly/toggle/${conPagosId}`, { token, method: "POST" })
    );
  });

  it("la baja conserva la recaudación del mes", async () => {
    const antes = await json(await api("/api/payments/summary", { token }));

    const baja = await json(await api(`/api/users/${conPagosId}`, { token, method: "DELETE" }));
    assert.equal(baja.body.user.active, false);

    const despues = await json(await api("/api/payments/summary", { token }));
    assert.equal(despues.body.revenue, antes.body.revenue);
  });

  it("el socio dado de baja sale del padrón activo", async () => {
    const { body } = await json(await api("/api/users", { token }));
    assert.equal(
      body.users.some((u) => u.id === conPagosId),
      false
    );
  });

  it("se lo puede listar pidiendo las bajas", async () => {
    const { body } = await json(await api("/api/users?incluirBajas=1", { token }));
    const baja = body.users.find((u) => u.id === conPagosId);
    assert.equal(baja.active, false);
    assert.ok(baja.deactivatedAt);
  });

  it("el socio dado de baja no puede iniciar sesión", async () => {
    const { status } = await json(
      await api("/api/auth/login", {
        method: "POST",
        body: { gymSlug: slug, username: "conpagos", password: "clave123456" },
      })
    );
    assert.equal(status, 403);
  });

  it("al reactivarlo vuelve a entrar", async () => {
    const reactivado = await json(
      await api(`/api/users/${conPagosId}/reactivar`, { token, method: "POST" })
    );
    assert.equal(reactivado.body.user.active, true);

    const login = await json(
      await api("/api/auth/login", {
        method: "POST",
        body: { gymSlug: slug, username: "conpagos", password: "clave123456" },
      })
    );
    assert.equal(login.status, 200);
  });

  it("no deja borrar definitivamente a un socio con pagos", async () => {
    const { status } = await json(
      await api(`/api/users/${conPagosId}/definitivo`, { token, method: "DELETE" })
    );
    assert.equal(status, 409);
  });

  it("permite borrar definitivamente a un socio sin pagos", async () => {
    const { status } = await json(
      await api(`/api/users/${sinPagosId}/definitivo`, { token, method: "DELETE" })
    );
    assert.equal(status, 200);
  });
});

describe("asistencia", () => {
  let token;
  let slug;
  let memberToken;
  let memberId;

  before(async () => {
    ({ token, slug } = await newGym("Asistencia Gym", "tomas"));

    const member = await json(
      await api("/api/auth/register", {
        method: "POST",
        body: { gymSlug: slug, name: "Vera Luna", username: "vera", password: "vera123456" },
      })
    );
    memberToken = member.body.token;
    memberId = member.body.user.id;
  });

  it("registra la entrada del socio", async () => {
    const { status } = await json(
      await api(`/api/asistencia/checkin/${memberId}`, { token, method: "POST" })
    );
    assert.equal(status, 201);
  });

  it("no permite registrar dos veces el mismo día", async () => {
    const { status } = await json(
      await api(`/api/asistencia/checkin/${memberId}`, { token, method: "POST" })
    );
    assert.equal(status, 409);
  });

  it("lista los presentes de hoy", async () => {
    const { body } = await json(await api("/api/asistencia/hoy", { token }));
    assert.equal(body.present.length, 1);
    assert.equal(body.present[0].name, "Vera Luna");
  });

  it("el socio consulta su propio historial", async () => {
    const { status, body } = await json(
      await api(`/api/asistencia/${memberId}`, { token: memberToken })
    );
    assert.equal(status, 200);
    assert.equal(body.thisMonth, 1);
  });

  it("un socio no puede registrar asistencia", async () => {
    const { status } = await json(
      await api(`/api/asistencia/checkin/${memberId}`, { token: memberToken, method: "POST" })
    );
    assert.equal(status, 403);
  });

  it("permite deshacer la entrada del día", async () => {
    const { status } = await json(
      await api(`/api/asistencia/checkin/${memberId}`, { token, method: "DELETE" })
    );
    assert.equal(status, 200);
  });
});

describe("restablecimiento de contraseña", () => {
  let token;
  let slug;

  before(async () => {
    ({ token, slug } = await newGym("Claves Gym", "bruno"));

    await json(
      await api("/api/users", {
        token,
        method: "POST",
        body: { name: "Olvidadiza Paz", username: "paz", password: "paz1234567" },
      })
    );
  });

  it("acepta el pedido del socio", async () => {
    const { status, body } = await json(
      await api("/api/auth/password-request", {
        method: "POST",
        body: { gymSlug: slug, username: "paz" },
      })
    );
    assert.equal(status, 200);
    assert.equal(body.ok, true);
  });

  it("responde igual para un usuario inexistente, sin filtrar información", async () => {
    const { status, body } = await json(
      await api("/api/auth/password-request", {
        method: "POST",
        body: { gymSlug: slug, username: "noexiste" },
      })
    );
    assert.equal(status, 200);
    assert.equal(body.ok, true);
  });

  it("el dueño ve un único pedido pendiente aunque se pida dos veces", async () => {
    await json(
      await api("/api/auth/password-request", {
        method: "POST",
        body: { gymSlug: slug, username: "paz" },
      })
    );

    const { body } = await json(await api("/api/admin/password-requests", { token }));
    assert.equal(body.requests.length, 1);
    assert.equal(body.requests[0].username, "paz");
  });

  it("al resolverlo entrega una clave temporal que funciona", async () => {
    const list = await json(await api("/api/admin/password-requests", { token }));
    const requestId = list.body.requests[0].id;

    const { body } = await json(
      await api(`/api/admin/password-requests/${requestId}/resolver`, { token, method: "POST" })
    );
    assert.ok(body.password.length >= 8);

    const login = await json(
      await api("/api/auth/login", {
        method: "POST",
        body: { gymSlug: slug, username: "paz", password: body.password },
      })
    );
    assert.equal(login.status, 200);

    const after = await json(await api("/api/admin/password-requests", { token }));
    assert.equal(after.body.requests.length, 0);
  });

  it("la contraseña anterior deja de servir", async () => {
    const { status } = await json(
      await api("/api/auth/login", {
        method: "POST",
        body: { gymSlug: slug, username: "paz", password: "paz1234567" },
      })
    );
    assert.equal(status, 401);
  });
});

describe("recordatorios, exportación y auditoría", () => {
  let token;

  before(async () => {
    const { body } = await json(
      await api("/api/auth/gyms/register", {
        method: "POST",
        body: {
          gymName: "Reportes Gym",
          ownerName: "Ceci",
          username: "ceci",
          password: "claveDeAdmin123",
          whatsapp: "3410000000",
          monthlyPrice: 20000,
        },
      })
    );
    token = body.token;

    await json(
      await api("/api/users", {
        token,
        method: "POST",
        body: {
          name: "Deudor Uno",
          username: "deudor",
          password: "clave123456",
          whatsapp: "3419999999",
        },
      })
    );
  });

  it("arma el recordatorio de cuota con el texto listo para enviar", async () => {
    const { body } = await json(await api("/api/admin/recordatorios", { token }));
    assert.equal(body.members.length, 1);
    assert.equal(body.members[0].whatsapp, "3419999999");
    assert.match(body.members[0].message, /Deudor/);
    assert.match(body.members[0].message, /Reportes Gym/);
  });

  it("deja de recordarle a quien ya pagó", async () => {
    const lista = await json(await api("/api/admin/recordatorios", { token }));
    const id = lista.body.members[0].id;

    await json(await api(`/api/payments/monthly/toggle/${id}`, { token, method: "POST" }));

    const { body } = await json(await api("/api/admin/recordatorios", { token }));
    assert.equal(body.members.length, 0);
  });

  it("exporta los socios a CSV", async () => {
    const res = await fetch(`${baseUrl}/api/admin/export/socios.csv`, {
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type"), /text\/csv/);

    const text = await res.text();
    assert.match(text, /Nombre;Usuario/);
    assert.match(text, /Deudor Uno/);
  });

  it("exporta los pagos a CSV", async () => {
    const res = await fetch(`${baseUrl}/api/admin/export/pagos.csv`, {
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    assert.match(await res.text(), /Fecha;Periodo;Socio/);
  });

  it("registra en auditoría quién dio el alta y quién cobró", async () => {
    const { body } = await json(await api("/api/admin/auditoria", { token }));

    const alta = body.entries.find((e) => e.action === "socio.alta");
    assert.ok(alta, "falta el asiento de alta");
    assert.equal(alta.actor_name, "Ceci");
    assert.equal(alta.target_name, "Deudor Uno");

    assert.ok(
      body.entries.some((e) => e.action === "cuota.registrada"),
      "falta el asiento del cobro"
    );
  });

  it("un socio no puede leer la auditoría ni exportar", async () => {
    const member = await json(
      await api("/api/auth/register", {
        method: "POST",
        body: {
          gymSlug: "reportes-gym",
          name: "Curioso",
          username: "curioso",
          password: "clave123456",
        },
      })
    );

    const auditoria = await json(
      await api("/api/admin/auditoria", { token: member.body.token })
    );
    assert.equal(auditoria.status, 403);

    const exportRes = await fetch(`${baseUrl}/api/admin/export/pagos.csv`, {
      headers: { authorization: `Bearer ${member.body.token}` },
    });
    assert.equal(exportRes.status, 403);
  });
});

describe("mes de facturación", () => {
  it("el servidor informa el mes y la fecha vigentes", async () => {
    const { token } = await newGym("Fechas Gym", "nico");
    const { body } = await json(await api("/api/auth/me", { token }));

    assert.match(body.currentMonth, /^\d{4}-\d{2}$/);
    assert.match(body.today, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(body.today.slice(0, 7), body.currentMonth);
  });
});
