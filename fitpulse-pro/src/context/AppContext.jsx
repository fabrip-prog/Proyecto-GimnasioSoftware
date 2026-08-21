import { createContext, useContext, useState, useCallback } from "react";
import { USERS as INITIAL_USERS, PLANS as INITIAL_PLANS } from "../data/users";

const AppContext = createContext(null);

const ADMIN_CREDENTIALS = { username: "admin", password: "admin123" };

const PRICING = {
  monthly: 15000,
  pro: 8000,
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getAvatarFromName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Add payment fields to initial users
const USERS_WITH_PAYMENTS = INITIAL_USERS.map((u) => ({
  ...u,
  monthlyPaidMonth: null,
  monthlyPaidDate: null,
  proActive: false,
  proPaidDate: null,
  customPlan: null,
  paymentHistory: [],
}));

export function AppProvider({ children }) {
  const [users, setUsers] = useState(USERS_WITH_PAYMENTS);
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Helper to sync currentUser when users array changes
  function syncCurrentUser(updatedUsers, userId) {
    const updated = updatedUsers.find((u) => u.id === userId);
    if (updated) setCurrentUser(updated);
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  const login = useCallback(
    (username, password) => {
      if (
        username === ADMIN_CREDENTIALS.username &&
        password === ADMIN_CREDENTIALS.password
      ) {
        setIsAdmin(true);
        setCurrentUser(null);
        return { success: true, admin: true };
      }
      const user = users.find(
        (u) => u.username === username && u.password === password
      );
      if (user) {
        setCurrentUser(user);
        setIsAdmin(false);
        return { success: true, admin: false, user };
      }
      return { success: false };
    },
    [users]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAdmin(false);
  }, []);

  const register = useCallback(
    (name, username, password, planDays) => {
      const exists = users.find((u) => u.username === username);
      if (exists) return { success: false, error: "El nombre de usuario ya existe." };

      const planLabel = `${planDays} días/semana`;

      const newUser = {
        id: Date.now(),
        username,
        password,
        name,
        avatar: getAvatarFromName(name),
        plan: planLabel,
        planDays,
        coach: "Alex Rossi",
        coachTitle: "Head Trainer",
        startDate: new Date().toISOString().split("T")[0],
        monthlyPaidMonth: null,
        monthlyPaidDate: null,
        proActive: false,
        proPaidDate: null,
        customPlan: null,
        paymentHistory: [],
      };
      setUsers((prev) => [...prev, newUser]);
      return { success: true, user: newUser };
    },
    [users]
  );

  // ── Payments ──────────────────────────────────────────────────────────────

  const payMonthly = useCallback(
    (userId) => {
      const now = new Date();
      const month = getCurrentMonth();
      const record = {
        id: generateId(),
        type: "monthly",
        label: "Cuota Mensual",
        amount: PRICING.monthly,
        date: now.toISOString().split("T")[0],
        month,
      };
      setUsers((prev) => {
        const updated = prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                monthlyPaidMonth: month,
                monthlyPaidDate: now.toISOString().split("T")[0],
                paymentHistory: [record, ...u.paymentHistory],
              }
            : u
        );
        syncCurrentUser(updated, userId);
        return updated;
      });
      return record;
    },
    []
  );

  const payPro = useCallback(
    (userId) => {
      const now = new Date();
      const record = {
        id: generateId(),
        type: "pro",
        label: "Suscripción Pro",
        amount: PRICING.pro,
        date: now.toISOString().split("T")[0],
        month: getCurrentMonth(),
      };
      setUsers((prev) => {
        const updated = prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                proActive: true,
                proPaidDate: now.toISOString().split("T")[0],
                paymentHistory: [record, ...u.paymentHistory],
              }
            : u
        );
        syncCurrentUser(updated, userId);
        return updated;
      });
      return record;
    },
    []
  );

  const isMonthlyPaid = useCallback(
    (userId) => {
      const user = userId
        ? users.find((u) => u.id === userId)
        : currentUser;
      if (!user) return false;
      return user.monthlyPaidMonth === getCurrentMonth();
    },
    [users, currentUser]
  );

  // ── Custom Plans (per user) ───────────────────────────────────────────────

  const assignCustomPlan = useCallback(
    (userId, customPlan) => {
      setUsers((prev) => {
        const updated = prev.map((u) =>
          u.id === userId ? { ...u, customPlan } : u
        );
        syncCurrentUser(updated, userId);
        return updated;
      });
    },
    []
  );

  const removeCustomPlan = useCallback(
    (userId) => {
      setUsers((prev) => {
        const updated = prev.map((u) =>
          u.id === userId ? { ...u, customPlan: null } : u
        );
        syncCurrentUser(updated, userId);
        return updated;
      });
    },
    []
  );

  const addExerciseToCustomPlan = useCallback(
    (userId, dayNum, exercise) => {
      const newEx = { ...exercise, id: generateId() };
      setUsers((prev) => {
        const updated = prev.map((u) => {
          if (u.id !== userId || !u.customPlan) return u;
          return {
            ...u,
            customPlan: {
              ...u.customPlan,
              [dayNum]: {
                ...u.customPlan[dayNum],
                exercises: [...(u.customPlan[dayNum]?.exercises || []), newEx],
              },
            },
          };
        });
        syncCurrentUser(updated, userId);
        return updated;
      });
      return newEx;
    },
    []
  );

  const updateExerciseInCustomPlan = useCallback(
    (userId, dayNum, exerciseId, updates) => {
      setUsers((prev) => {
        const updated = prev.map((u) => {
          if (u.id !== userId || !u.customPlan) return u;
          return {
            ...u,
            customPlan: {
              ...u.customPlan,
              [dayNum]: {
                ...u.customPlan[dayNum],
                exercises: u.customPlan[dayNum].exercises.map((ex) =>
                  ex.id === exerciseId ? { ...ex, ...updates } : ex
                ),
              },
            },
          };
        });
        syncCurrentUser(updated, userId);
        return updated;
      });
    },
    []
  );

  const deleteExerciseFromCustomPlan = useCallback(
    (userId, dayNum, exerciseId) => {
      setUsers((prev) => {
        const updated = prev.map((u) => {
          if (u.id !== userId || !u.customPlan) return u;
          return {
            ...u,
            customPlan: {
              ...u.customPlan,
              [dayNum]: {
                ...u.customPlan[dayNum],
                exercises: u.customPlan[dayNum].exercises.filter(
                  (ex) => ex.id !== exerciseId
                ),
              },
            },
          };
        });
        syncCurrentUser(updated, userId);
        return updated;
      });
    },
    []
  );

  const addDayToCustomPlan = useCallback(
    (userId, dayNum, dayData) => {
      setUsers((prev) => {
        const updated = prev.map((u) => {
          if (u.id !== userId || !u.customPlan) return u;
          return {
            ...u,
            customPlan: {
              ...u.customPlan,
              [dayNum]: dayData,
            },
          };
        });
        syncCurrentUser(updated, userId);
        return updated;
      });
    },
    []
  );

  const deleteDayFromCustomPlan = useCallback(
    (userId, dayNum) => {
      setUsers((prev) => {
        const updated = prev.map((u) => {
          if (u.id !== userId || !u.customPlan) return u;
          const cp = { ...u.customPlan };
          delete cp[dayNum];
          return { ...u, customPlan: cp };
        });
        syncCurrentUser(updated, userId);
        return updated;
      });
    },
    []
  );

  // ── User Management (Admin) ───────────────────────────────────────────────

  const deleteUser = useCallback((userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const updateUser = useCallback((userId, updates) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
  }, []);

  // Admin can toggle monthly payment for a user
  const adminToggleMonthly = useCallback((userId) => {
    const month = getCurrentMonth();
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        if (u.monthlyPaidMonth === month) {
          return { ...u, monthlyPaidMonth: null, monthlyPaidDate: null };
        }
        return {
          ...u,
          monthlyPaidMonth: month,
          monthlyPaidDate: new Date().toISOString().split("T")[0],
        };
      })
    );
  }, []);

  const adminTogglePro = useCallback((userId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        return {
          ...u,
          proActive: !u.proActive,
          proPaidDate: !u.proActive ? new Date().toISOString().split("T")[0] : null,
        };
      })
    );
  }, []);

  // ── Shared Plan Management (Admin) ────────────────────────────────────────

  const createPlan = useCallback(
    (dayCount, days) => {
      if (plans[dayCount])
        return { success: false, error: `Ya existe un plan de ${dayCount} días.` };
      setPlans((prev) => ({ ...prev, [dayCount]: days }));
      return { success: true };
    },
    [plans]
  );

  const updatePlanDay = useCallback((planDays, dayNum, dayData) => {
    setPlans((prev) => ({
      ...prev,
      [planDays]: { ...prev[planDays], [dayNum]: dayData },
    }));
  }, []);

  const deletePlan = useCallback((dayCount) => {
    setPlans((prev) => {
      const next = { ...prev };
      delete next[dayCount];
      return next;
    });
    setUsers((prev) =>
      prev.map((u) =>
        u.planDays === dayCount ? { ...u, planDays: null, plan: "Sin plan" } : u
      )
    );
  }, []);

  const addExercise = useCallback((planDays, dayNum, exercise) => {
    const newEx = { ...exercise, id: generateId() };
    setPlans((prev) => ({
      ...prev,
      [planDays]: {
        ...prev[planDays],
        [dayNum]: {
          ...prev[planDays][dayNum],
          exercises: [...prev[planDays][dayNum].exercises, newEx],
        },
      },
    }));
    return newEx;
  }, []);

  const updateExercise = useCallback((planDays, dayNum, exerciseId, updates) => {
    setPlans((prev) => ({
      ...prev,
      [planDays]: {
        ...prev[planDays],
        [dayNum]: {
          ...prev[planDays][dayNum],
          exercises: prev[planDays][dayNum].exercises.map((ex) =>
            ex.id === exerciseId ? { ...ex, ...updates } : ex
          ),
        },
      },
    }));
  }, []);

  const deleteExercise = useCallback((planDays, dayNum, exerciseId) => {
    setPlans((prev) => ({
      ...prev,
      [planDays]: {
        ...prev[planDays],
        [dayNum]: {
          ...prev[planDays][dayNum],
          exercises: prev[planDays][dayNum].exercises.filter(
            (ex) => ex.id !== exerciseId
          ),
        },
      },
    }));
  }, []);

  const addDayToPlan = useCallback((planDays, dayNum, dayData) => {
    setPlans((prev) => ({
      ...prev,
      [planDays]: { ...prev[planDays], [dayNum]: dayData },
    }));
  }, []);

  const deleteDayFromPlan = useCallback((planDays, dayNum) => {
    setPlans((prev) => {
      const updatedPlan = { ...prev[planDays] };
      delete updatedPlan[dayNum];
      return { ...prev, [planDays]: updatedPlan };
    });
  }, []);

  const value = {
    users,
    plans,
    currentUser,
    isAdmin,
    pricing: PRICING,
    login,
    logout,
    register,
    deleteUser,
    updateUser,
    createPlan,
    updatePlanDay,
    deletePlan,
    addExercise,
    updateExercise,
    deleteExercise,
    addDayToPlan,
    deleteDayFromPlan,
    payMonthly,
    payPro,
    isMonthlyPaid,
    assignCustomPlan,
    removeCustomPlan,
    addExerciseToCustomPlan,
    updateExerciseInCustomPlan,
    deleteExerciseFromCustomPlan,
    addDayToCustomPlan,
    deleteDayFromCustomPlan,
    adminToggleMonthly,
    adminTogglePro,
    getCurrentMonth,
    availablePlanDays: Object.keys(plans).map(Number),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
