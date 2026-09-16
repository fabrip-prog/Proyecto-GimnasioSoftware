const BASE_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "kinefix.token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Private browsing can block storage; the session just won't survive a reload.
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "content-type": "application/json" };
  const token = auth ? getToken() : null;
  if (token) headers.authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. Revisá tu conexión.", 0);
  }

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(payload.error || "Ocurrió un error inesperado.", response.status);
  }

  return payload;
}

export const api = {
  listGyms: () => request("/auth/gyms", { auth: false }),

  login: (gymSlug, username, password) =>
    request("/auth/login", { method: "POST", auth: false, body: { gymSlug, username, password } }),

  registerMember: (gymSlug, name, username, password) =>
    request("/auth/register", {
      method: "POST",
      auth: false,
      body: { gymSlug, name, username, password },
    }),

  registerGym: (data) => request("/auth/gyms/register", { method: "POST", auth: false, body: data }),

  me: () => request("/auth/me"),

  updateGym: (updates) => request("/gym", { method: "PATCH", body: updates }),

  listUsers: () => request("/users"),
  createUser: (data) => request("/users", { method: "POST", body: data }),
  updateUser: (id, updates) => request(`/users/${id}`, { method: "PATCH", body: updates }),
  deleteUser: (id) => request(`/users/${id}`, { method: "DELETE" }),
  togglePro: (id) => request(`/users/${id}/pro/toggle`, { method: "POST" }),

  toggleMonthly: (id) => request(`/payments/monthly/toggle/${id}`, { method: "POST" }),
  recordPayment: (data) => request("/payments", { method: "POST", body: data }),
  paymentSummary: (month) =>
    request(`/payments/summary${month ? `?month=${encodeURIComponent(month)}` : ""}`),

  createSharedPlan: (dayCount, days = {}) =>
    request("/plans/shared", { method: "POST", body: { dayCount, days } }),
  deleteSharedPlan: (dayCount) => request(`/plans/shared/${dayCount}`, { method: "DELETE" }),
  saveSharedDay: (dayCount, dayNum, data) =>
    request(`/plans/shared/${dayCount}/days/${dayNum}`, { method: "PUT", body: data }),
  deleteSharedDay: (dayCount, dayNum) =>
    request(`/plans/shared/${dayCount}/days/${dayNum}`, { method: "DELETE" }),
  addSharedExercise: (dayCount, dayNum, exercise) =>
    request(`/plans/shared/${dayCount}/days/${dayNum}/exercises`, {
      method: "POST",
      body: exercise,
    }),
  updateSharedExercise: (dayCount, dayNum, exerciseId, updates) =>
    request(`/plans/shared/${dayCount}/days/${dayNum}/exercises/${exerciseId}`, {
      method: "PATCH",
      body: updates,
    }),
  deleteSharedExercise: (dayCount, dayNum, exerciseId) =>
    request(`/plans/shared/${dayCount}/days/${dayNum}/exercises/${exerciseId}`, {
      method: "DELETE",
    }),

  setCustomPlan: (userId, plan) =>
    request(`/plans/custom/${userId}`, { method: "PUT", body: { plan } }),
  clearCustomPlan: (userId) => request(`/plans/custom/${userId}`, { method: "DELETE" }),
  saveCustomDay: (userId, dayNum, data) =>
    request(`/plans/custom/${userId}/days/${dayNum}`, { method: "PUT", body: data }),
  deleteCustomDay: (userId, dayNum) =>
    request(`/plans/custom/${userId}/days/${dayNum}`, { method: "DELETE" }),
  addCustomExercise: (userId, dayNum, exercise) =>
    request(`/plans/custom/${userId}/days/${dayNum}/exercises`, {
      method: "POST",
      body: exercise,
    }),
  updateCustomExercise: (userId, dayNum, exerciseId, updates) =>
    request(`/plans/custom/${userId}/days/${dayNum}/exercises/${exerciseId}`, {
      method: "PATCH",
      body: updates,
    }),
  deleteCustomExercise: (userId, dayNum, exerciseId) =>
    request(`/plans/custom/${userId}/days/${dayNum}/exercises/${exerciseId}`, {
      method: "DELETE",
    }),

  logProgress: (data) => request("/progress", { method: "POST", body: data }),
  memberProgress: (userId) => request(`/progress/${userId}`),
};
