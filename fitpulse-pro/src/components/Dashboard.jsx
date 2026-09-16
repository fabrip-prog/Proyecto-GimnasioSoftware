import { useState, useMemo, useCallback } from "react";
import {
  LogOut,
  CalendarDays,
  Award,
  Activity,
  Dumbbell,
  Crown,
  Lock,
  AlertTriangle,
  Check,
  UserRound,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import RoutineDetail from "./RoutineDetail";
import PaymentSection from "./PaymentSection";

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function ProgressBar({ percent, tone = "brand" }) {
  const fill = tone === "ok" ? "bg-ok" : "bg-brand";
  return (
    <div className="w-full h-2 bg-sunken rounded-full overflow-hidden">
      <div
        className={`h-full ${fill} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function ProfileModal({ user, onClose, updateUser }) {
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState("");
  const [goal, setGoal] = useState(user.goal || "Mantenerse en forma");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (password && password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setSaving(true);
    const result = await updateUser(user.id, {
      name,
      goal,
      ...(password ? { password } : {}),
    });
    setSaving(false);

    if (result.success) onClose();
    else setError(result.error);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="section-title mb-5">Mi perfil</h2>

        <div className="space-y-4">
          <div>
            <label className="label">Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Objetivo principal</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value)} className="input">
              <option value="Hipertrofia">Hipertrofia</option>
              <option value="Pérdida de peso">Pérdida de peso</option>
              <option value="Fuerza">Fuerza</option>
              <option value="Mantenerse en forma">Mantenerse en forma</option>
            </select>
          </div>

          <div>
            <label className="label">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Dejala vacía para no cambiarla"
              className="input"
            />
          </div>
        </div>

        {error && <p className="alert-danger mt-4">{error}</p>}

        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanPicker({ availablePlanDays, currentDays, onPick }) {
  return (
    <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
      {availablePlanDays
        .sort((a, b) => a - b)
        .map((d) => {
          const active = currentDays === d;
          return (
            <button
              key={d}
              onClick={() => onPick(d)}
              className={`py-4 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                active
                  ? "bg-brand-soft border-brand text-brand"
                  : "bg-surface border-line-strong text-ink hover:bg-sunken"
              }`}
            >
              <span className="text-2xl font-semibold block">{d}</span>
              <span className="text-xs text-ink-muted">días/sem</span>
            </button>
          );
        })}
    </div>
  );
}

export default function Dashboard() {
  const {
    currentUser: user,
    logout,
    plans,
    isMonthlyPaid,
    updateUser,
    availablePlanDays,
    logExerciseProgress,
    gym,
  } = useApp();

  const monthlyPaid = isMonthlyPaid(user.id);
  const proActive = user.proActive;
  const hasCustomPlan = user.customPlan && Object.keys(user.customPlan).length > 0;

  // Los socios Pro con plan a medida ven ese; el resto, el plan compartido.
  const activePlan = proActive && hasCustomPlan ? user.customPlan : plans[user.planDays];
  const isCustom = proActive && hasCustomPlan;

  const todayKey = todayIso();
  const loggedToday = useMemo(() => user.progress?.[todayKey] ?? {}, [user.progress, todayKey]);

  const [selectedDay, setSelectedDay] = useState(null);
  // Las series ya registradas hoy arrancan tildadas, así una recarga no pierde la sesión.
  const [completedExercises, setCompletedExercises] = useState(
    () => new Set(Object.keys(loggedToday))
  );
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const hasPlan = activePlan && Object.keys(activePlan).length > 0;
  const dayKeys = hasPlan
    ? Object.keys(activePlan)
        .map(Number)
        .sort((a, b) => a - b)
    : [];

  const currentDay = selectedDay ?? dayKeys[0];
  const dayData = hasPlan ? activePlan[currentDay] : null;

  const handleSaveProgress = useCallback(
    (exerciseId, weight, reps) => {
      const exercise = dayData?.exercises.find((ex) => ex.id === exerciseId);
      logExerciseProgress(user.id, exerciseId, weight, reps, {
        date: todayKey,
        dayNumber: currentDay,
        exerciseName: exercise?.name,
      });
      setCompletedExercises((prev) => new Set([...prev, exerciseId]));
    },
    [user.id, currentDay, dayData, todayKey, logExerciseProgress]
  );

  const toggleExercise = useCallback((exerciseId) => {
    setCompletedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
  }, []);

  const totalExercisesAllDays = useMemo(
    () =>
      hasPlan
        ? dayKeys.reduce((sum, k) => sum + (activePlan[k]?.exercises?.length || 0), 0)
        : 0,
    [dayKeys, activePlan, hasPlan]
  );

  const completedInCurrentDay = useMemo(
    () => (dayData ? dayData.exercises.filter((ex) => completedExercises.has(ex.id)).length : 0),
    [dayData, completedExercises]
  );

  const overallProgress = useMemo(() => {
    if (totalExercisesAllDays === 0) return 0;
    return Math.round((completedExercises.size / totalExercisesAllDays) * 100);
  }, [completedExercises.size, totalExercisesAllDays]);

  const dayCompletionPercent = useMemo(() => {
    if (!dayData || dayData.exercises.length === 0) return 0;
    return Math.round((completedInCurrentDay / dayData.exercises.length) * 100);
  }, [completedInCurrentDay, dayData]);

  function pickPlan(days) {
    updateUser(user.id, { planDays: days, plan: `${days} días/semana` });
    setIsEditingPlan(false);
    setSelectedDay(null);
  }

  return (
    <div className="min-h-screen">
      <header className="app-header">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="avatar w-10 h-10 text-sm">{user.avatar}</div>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm text-ink truncate">
                Hola, {user.name.split(" ")[0]}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-ink-soft text-xs flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {user.plan}
                </p>
                {proActive && (
                  <span className="chip-pro text-[10px] px-1.5 py-0">
                    <Crown className="w-2.5 h-2.5" />
                    PRO
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setShowProfile(true)} className="btn-ghost btn-sm">
              <UserRound className="w-4 h-4" />
              <span className="hidden sm:inline">Mi perfil</span>
            </button>
            <button onClick={logout} className="btn-ghost btn-sm">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Coach */}
        <div className="card p-4 flex items-center gap-3">
          <div className="avatar w-10 h-10 text-xs bg-sunken text-ink-soft">
            {user.coach
              ? user.coach
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "—"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink font-medium truncate">
              {user.coach ? `Coach: ${user.coach}` : "Sin coach asignado"}
            </p>
            <p className="text-xs text-ink-muted">{user.coachTitle || gym?.name}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-ink-muted">Socio desde</p>
            <p className="text-sm text-ink-soft">{user.startDate}</p>
          </div>
        </div>

        <PaymentSection />

        {!monthlyPaid && (
          <div className="alert-warn">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-medium">Cuota mensual pendiente</p>
              <p className="text-xs mt-0.5 opacity-90">
                Regularizá tu cuota para acceder a tu rutina de entrenamiento.
              </p>
            </div>
          </div>
        )}

        {monthlyPaid ? (
          <>
            {isCustom && (
              <div className="card p-3 flex items-center gap-2.5 bg-pro-soft border-pro-line">
                <Crown className="w-4 h-4 text-pro shrink-0" />
                <p className="text-xs text-pro">
                  Estás viendo tu <strong>plan personalizado Pro</strong>, diseñado por tu coach.
                </p>
              </div>
            )}

            {!proActive && hasCustomPlan && (
              <div className="card p-4 flex items-center gap-3 bg-pro-soft border-pro-line">
                <Lock className="w-5 h-5 text-pro shrink-0" />
                <div>
                  <p className="text-pro font-medium text-sm">
                    Tu coach te asignó un plan personalizado
                  </p>
                  <p className="text-xs text-pro/80 mt-0.5">
                    Activá la suscripción Pro para desbloquearlo.
                  </p>
                </div>
              </div>
            )}

            {hasPlan ? (
              <>
                {/* Progreso semanal */}
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-ink-soft flex items-center gap-1.5">
                      <Activity className="w-4 h-4" />
                      Progreso de la semana
                    </h3>
                    <span className="text-sm font-semibold text-ink">{overallProgress}%</span>
                  </div>
                  <ProgressBar percent={overallProgress} tone="ok" />
                  <p className="text-xs text-ink-muted mt-2">
                    {completedExercises.size} de {totalExercisesAllDays} ejercicios completados
                  </p>
                </div>

                {/* Selector de día */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-ink-soft flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4" />
                      Resumen semanal
                    </h3>
                    {!isCustom && (
                      <button
                        onClick={() => setIsEditingPlan(!isEditingPlan)}
                        className="btn-ghost btn-sm"
                      >
                        {isEditingPlan ? "Cancelar" : "Cambiar plan"}
                      </button>
                    )}
                  </div>

                  {isEditingPlan ? (
                    <div className="card p-6 text-center space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-ink mb-1">Elegí tu nuevo plan</h3>
                        <p className="text-ink-soft text-xs">
                          Seleccioná cuántos días querés entrenar por semana.
                        </p>
                      </div>
                      <PlanPicker
                        availablePlanDays={availablePlanDays}
                        currentDays={user.planDays}
                        onPick={pickPlan}
                      />
                    </div>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {dayKeys.map((dayNum) => {
                        const isActive = dayNum === currentDay;
                        const dayExercises = activePlan[dayNum]?.exercises || [];
                        const dayCompleted = dayExercises.filter((ex) =>
                          completedExercises.has(ex.id)
                        ).length;
                        const isDayDone =
                          dayCompleted === dayExercises.length && dayExercises.length > 0;

                        return (
                          <button
                            key={dayNum}
                            onClick={() => setSelectedDay(dayNum)}
                            className={`relative flex flex-col items-start gap-1 px-4 py-3 rounded-lg border transition-colors shrink-0 min-w-[120px] text-left cursor-pointer ${
                              isActive
                                ? "bg-brand-soft border-brand"
                                : "bg-surface border-line hover:border-line-strong"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span
                                className={`text-xs font-semibold uppercase tracking-wide ${
                                  isActive ? "text-brand" : "text-ink"
                                }`}
                              >
                                Día {dayNum}
                              </span>
                              {isDayDone && <Check className="w-3.5 h-3.5 text-ok" />}
                            </span>
                            <span className="text-xs text-ink-muted truncate max-w-[110px]">
                              {activePlan[dayNum]?.title}
                            </span>
                            <span className="text-[11px] text-ink-muted">
                              {dayCompleted}/{dayExercises.length} ejercicios
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {dayData && (
                  <>
                    <div className="card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-ink-soft">
                          Sesión actual:{" "}
                          <span className="text-ink font-semibold">{dayData.title}</span>
                        </span>
                        <span className="text-xs font-semibold text-ink">
                          {dayCompletionPercent}%
                        </span>
                      </div>
                      <ProgressBar percent={dayCompletionPercent} />
                    </div>

                    <RoutineDetail
                      dayData={dayData}
                      completedExercises={completedExercises}
                      onToggleExercise={toggleExercise}
                      onSaveProgress={handleSaveProgress}
                      dayProgress={loggedToday}
                    />
                  </>
                )}
              </>
            ) : (
              <div className="card p-8 text-center space-y-5">
                <Dumbbell className="w-10 h-10 text-ink-muted mx-auto" />
                <div>
                  <h3 className="text-base font-semibold text-ink mb-1.5">
                    Elegí tu plan de entrenamiento
                  </h3>
                  <p className="text-ink-soft text-sm max-w-md mx-auto">
                    Seleccioná cuántos días a la semana querés entrenar y te asignamos la rutina.
                  </p>
                </div>
                <PlanPicker
                  availablePlanDays={availablePlanDays}
                  currentDays={user.planDays}
                  onPick={pickPlan}
                />
                {proActive && (
                  <p className="text-xs text-pro">
                    Tu coach va a preparar tu plan personalizado. Mientras tanto podés usar un plan
                    base.
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="card p-12 text-center space-y-3">
            <Lock className="w-10 h-10 text-ink-muted mx-auto" />
            <h2 className="text-base text-ink font-semibold">Acceso restringido</h2>
            <p className="text-ink-soft text-sm max-w-xs mx-auto">
              Regularizá tu cuota mensual para acceder a tu rutina de entrenamiento.
            </p>
          </div>
        )}
      </main>

      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          updateUser={updateUser}
        />
      )}

      <footer className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-xs text-ink-muted">© 2026 {gym?.name ?? "KineFix"}</p>
      </footer>
    </div>
  );
}
