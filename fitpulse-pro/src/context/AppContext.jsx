import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ApiError, api, getToken, setToken } from "../api/client";
import { useToast } from "../components/Toasts";

const AppContext = createContext(null);

/** Respaldo local, sólo hasta que el servidor informa su propio calendario. */
function localMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function AppProvider({ children }) {
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [gym, setGym] = useState(null);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState({});
  const [booting, setBooting] = useState(Boolean(getToken()));
  // El mes de facturación lo fija el servidor, para que una máquina con otra
  // zona horaria no muestre el estado de cuota equivocado en el cambio de mes.
  const [calendar, setCalendar] = useState({ month: localMonth(), today: localToday() });

  const clearSession = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    setGym(null);
    setUsers([]);
    setPlans({});
  }, []);

  const applySession = useCallback((session) => {
    setToken(session.token);
    setCurrentUser(session.user);
    setGym(session.gym);
  }, []);

  const loadWorkspace = useCallback(async () => {
    const data = await api.me();
    setCurrentUser(data.user);
    setGym(data.gym);
    setPlans(data.plans);
    setUsers(data.users);
    if (data.currentMonth) setCalendar({ month: data.currentMonth, today: data.today });
  }, []);

  // Restore a previous session on reload.
  useEffect(() => {
    if (!getToken()) return;
    loadWorkspace()
      .catch(() => clearSession())
      .finally(() => setBooting(false));
  }, [loadWorkspace, clearSession]);

  /**
   * Ejecuta una operación contra la API y convierte los fallos en
   * {success, error}, de modo que ningún componente tenga que atrapar
   * excepciones. Salvo que se pida `silent` (cuando la pantalla ya muestra el
   * error al lado del formulario), el fallo se avisa con un cartel: antes estas
   * llamadas fallaban sin que nadie se enterara.
   */
  const run = useCallback(
    async (operation, { silent = false } = {}) => {
      try {
        return { success: true, data: await operation() };
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) clearSession();
        if (!silent) toast.error(err.message);
        return { success: false, error: err.message };
      }
    },
    [clearSession, toast]
  );

  /** Keeps the member list and the signed-in user in step after a mutation. */
  const mergeUser = useCallback((updated) => {
    if (!updated) return;
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setCurrentUser((prev) => (prev && prev.id === updated.id ? updated : prev));
  }, []);

  // ── Sesión ────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (gymSlug, username, password) => {
      const result = await run(() => api.login(gymSlug, username, password), { silent: true });
      if (!result.success) return result;

      applySession(result.data);
      await loadWorkspace().catch(() => {});
      return { success: true, admin: result.data.user.role === "owner", user: result.data.user };
    },
    [run, applySession, loadWorkspace]
  );

  const register = useCallback(
    async (gymSlug, name, username, password) => {
      const result = await run(() => api.registerMember(gymSlug, name, username, password), {
        silent: true,
      });
      if (!result.success) return result;

      applySession(result.data);
      await loadWorkspace().catch(() => {});
      return { success: true, user: result.data.user };
    },
    [run, applySession, loadWorkspace]
  );

  const registerGym = useCallback(
    async (data) => {
      const result = await run(() => api.registerGym(data), { silent: true });
      if (!result.success) return result;

      applySession(result.data);
      await loadWorkspace().catch(() => {});
      return { success: true, gym: result.data.gym };
    },
    [run, applySession, loadWorkspace]
  );

  const logout = useCallback(() => clearSession(), [clearSession]);

  // ── Socios ────────────────────────────────────────────────────────────────

  const createUser = useCallback(
    async (data) => {
      const result = await run(() => api.createUser(data), { silent: true });
      if (result.success) setUsers((prev) => [...prev, result.data.user]);
      return result;
    },
    [run]
  );

  const updateUser = useCallback(
    async (userId, updates) => {
      const result = await run(() => api.updateUser(userId, updates), { silent: true });
      if (result.success) mergeUser(result.data.user);
      return result;
    },
    [run, mergeUser]
  );

  const deleteUser = useCallback(
    async (userId) => {
      const result = await run(() => api.deleteUser(userId));
      if (result.success) setUsers((prev) => prev.filter((u) => u.id !== userId));
      return result;
    },
    [run]
  );

  // ── Cobranzas ─────────────────────────────────────────────────────────────

  const adminToggleMonthly = useCallback(
    async (userId) => {
      const result = await run(() => api.toggleMonthly(userId));
      if (result.success) mergeUser(result.data.user);
      return result;
    },
    [run, mergeUser]
  );

  const adminTogglePro = useCallback(
    async (userId) => {
      const result = await run(() => api.togglePro(userId));
      if (result.success) mergeUser(result.data.user);
      return result;
    },
    [run, mergeUser]
  );

  const recordPayment = useCallback(
    async (data) => {
      const result = await run(() => api.recordPayment(data));
      if (result.success) mergeUser(result.data.user);
      return result;
    },
    [run, mergeUser]
  );

  const isMonthlyPaid = useCallback(
    (userId) => {
      const user =
        userId == null || userId === currentUser?.id
          ? currentUser
          : users.find((u) => u.id === userId);
      return user?.monthlyPaidMonth === calendar.month;
    },
    [users, currentUser, calendar.month]
  );

  // ── Planes compartidos ────────────────────────────────────────────────────

  const withPlans = useCallback(
    async (operation) => {
      const result = await run(operation);
      if (result.success) setPlans(result.data.plans);
      return result;
    },
    [run]
  );

  const createPlan = useCallback(
    (dayCount, days = {}) => withPlans(() => api.createSharedPlan(dayCount, days)),
    [withPlans]
  );

  const deletePlan = useCallback(
    (dayCount) => withPlans(() => api.deleteSharedPlan(dayCount)),
    [withPlans]
  );

  const addDayToPlan = useCallback(
    (planDays, dayNum, dayData) => withPlans(() => api.saveSharedDay(planDays, dayNum, dayData)),
    [withPlans]
  );

  const deleteDayFromPlan = useCallback(
    (planDays, dayNum) => withPlans(() => api.deleteSharedDay(planDays, dayNum)),
    [withPlans]
  );

  const addExercise = useCallback(
    (planDays, dayNum, exercise) =>
      withPlans(() => api.addSharedExercise(planDays, dayNum, exercise)),
    [withPlans]
  );

  const updateExercise = useCallback(
    (planDays, dayNum, exerciseId, updates) =>
      withPlans(() => api.updateSharedExercise(planDays, dayNum, exerciseId, updates)),
    [withPlans]
  );

  const deleteExercise = useCallback(
    (planDays, dayNum, exerciseId) =>
      withPlans(() => api.deleteSharedExercise(planDays, dayNum, exerciseId)),
    [withPlans]
  );

  // ── Planes personalizados ─────────────────────────────────────────────────

  const withUser = useCallback(
    async (operation) => {
      const result = await run(operation);
      if (result.success) mergeUser(result.data.user);
      return result;
    },
    [run, mergeUser]
  );

  const assignCustomPlan = useCallback(
    (userId, customPlan = {}) => withUser(() => api.setCustomPlan(userId, customPlan)),
    [withUser]
  );

  const removeCustomPlan = useCallback(
    (userId) => withUser(() => api.clearCustomPlan(userId)),
    [withUser]
  );

  const addDayToCustomPlan = useCallback(
    (userId, dayNum, dayData) => withUser(() => api.saveCustomDay(userId, dayNum, dayData)),
    [withUser]
  );

  const deleteDayFromCustomPlan = useCallback(
    (userId, dayNum) => withUser(() => api.deleteCustomDay(userId, dayNum)),
    [withUser]
  );

  const addExerciseToCustomPlan = useCallback(
    (userId, dayNum, exercise) => withUser(() => api.addCustomExercise(userId, dayNum, exercise)),
    [withUser]
  );

  const updateExerciseInCustomPlan = useCallback(
    (userId, dayNum, exerciseId, updates) =>
      withUser(() => api.updateCustomExercise(userId, dayNum, exerciseId, updates)),
    [withUser]
  );

  const deleteExerciseFromCustomPlan = useCallback(
    (userId, dayNum, exerciseId) =>
      withUser(() => api.deleteCustomExercise(userId, dayNum, exerciseId)),
    [withUser]
  );

  // ── Progreso ──────────────────────────────────────────────────────────────

  const logExerciseProgress = useCallback(
    (userId, exerciseId, weight, reps, extra = {}) =>
      withUser(() =>
        api.logProgress({
          userId,
          exerciseId,
          weight,
          reps,
          date: extra.date ?? calendar.today,
          dayNumber: extra.dayNumber,
          exerciseName: extra.exerciseName,
        })
      ),
    [withUser, calendar.today]
  );

  // ── Configuración del gimnasio ────────────────────────────────────────────

  const updateGym = useCallback(
    async (updates) => {
      const result = await run(() => api.updateGym(updates));
      if (result.success) setGym(result.data.gym);
      return result;
    },
    [run]
  );

  const value = {
    booting,
    currentUser,
    gym,
    isAdmin: currentUser?.role === "owner",
    users,
    plans,
    pricing: gym?.pricing ?? { monthly: 0, pro: 0 },
    availablePlanDays: Object.keys(plans).map(Number),

    login,
    logout,
    register,
    registerGym,

    createUser,
    updateUser,
    deleteUser,

    adminToggleMonthly,
    adminTogglePro,
    recordPayment,
    isMonthlyPaid,

    createPlan,
    deletePlan,
    addDayToPlan,
    deleteDayFromPlan,
    addExercise,
    updateExercise,
    deleteExercise,

    assignCustomPlan,
    removeCustomPlan,
    addDayToCustomPlan,
    deleteDayFromCustomPlan,
    addExerciseToCustomPlan,
    updateExerciseInCustomPlan,
    deleteExerciseFromCustomPlan,

    logExerciseProgress,
    updateGym,
    reload: loadWorkspace,
    calendar,
    getCurrentMonth: () => calendar.month,
    today: calendar.today,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
