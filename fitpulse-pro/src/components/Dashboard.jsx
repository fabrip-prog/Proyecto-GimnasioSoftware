import { useState, useMemo, useCallback } from "react";
import {
  LogOut,
  CalendarDays,
  User2,
  Award,
  Activity,
  Dumbbell,
  Sparkles,
  Crown,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import RoutineDetail from "./RoutineDetail";
import PaymentSection from "./PaymentSection";


function ProfileModal({ user, onClose, updateUser }) {
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState(user.password);
  const [goal, setGoal] = useState(user.goal || "Mantenerse en forma");

  const handleSave = () => {
    updateUser(user.id, { name, password, goal });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-6 relative">
        <h2 className="text-xl font-bold text-white mb-4">Mi Perfil</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nombre Completo</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Contraseña</label>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Objetivo Principal</label>
            <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm">
              <option value="Hipertrofia">Hipertrofia</option>
              <option value="Pérdida de peso">Pérdida de peso</option>
              <option value="Fuerza">Fuerza</option>
              <option value="Mantenerse en forma">Mantenerse en forma</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-300 hover:text-white bg-slate-800 rounded-lg">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg">Guardar</button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { currentUser: user, logout, plans, isMonthlyPaid, updateUser, availablePlanDays, logExerciseProgress } = useApp();
  const monthlyPaid = isMonthlyPaid(user.id);
  const proActive = user.proActive;
  const hasCustomPlan =
    user.customPlan && Object.keys(user.customPlan).length > 0;

  // Determine which plan to show
  // Pro users with a custom plan see their custom plan
  // Otherwise show the shared plan
  const activePlan =
    proActive && hasCustomPlan ? user.customPlan : plans[user.planDays];
  const isCustom = proActive && hasCustomPlan;

  const [selectedDay, setSelectedDay] = useState(null);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // If user has no valid plan
  const hasPlan = activePlan && Object.keys(activePlan).length > 0;
  const dayKeys = hasPlan
    ? Object.keys(activePlan)
        .map(Number)
        .sort((a, b) => a - b)
    : [];

  const currentDay = selectedDay ?? dayKeys[0];
  const dayData = hasPlan ? activePlan[currentDay] : null;

  const handleSaveProgress = useCallback((exerciseId, weight, reps) => {
    logExerciseProgress(user.id, currentDay.toString(), exerciseId, weight, reps);
    setCompletedExercises((prev) => new Set([...prev, exerciseId]));
  }, [user.id, currentDay, logExerciseProgress]);

  const toggleExercise = useCallback((exerciseId) => {
    setCompletedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  }, []);

  const totalExercisesAllDays = useMemo(
    () =>
      hasPlan
        ? dayKeys.reduce(
            (sum, k) => sum + (activePlan[k]?.exercises?.length || 0),
            0
          )
        : 0,
    [dayKeys, activePlan, hasPlan]
  );

  const completedInCurrentDay = useMemo(
    () =>
      dayData
        ? dayData.exercises.filter((ex) => completedExercises.has(ex.id)).length
        : 0,
    [dayData, completedExercises]
  );

  const overallProgress = useMemo(() => {
    if (totalExercisesAllDays === 0) return 0;
    return Math.round((completedExercises.size / totalExercisesAllDays) * 100);
  }, [completedExercises.size, totalExercisesAllDays]);

  const dayProgress = useMemo(() => {
    if (!dayData || dayData.exercises.length === 0) return 0;
    return Math.round(
      (completedInCurrentDay / dayData.exercises.length) * 100
    );
  }, [completedInCurrentDay, dayData]);

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
              {user.avatar}
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm leading-tight">
                ¡Hola, {user.name.split(" ")[0]}!
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-slate-400 text-xs flex items-center gap-1">
                  <Award className="w-3 h-3 text-emerald-400" />
                  Plan {user.plan}
                </p>
                {proActive && (
                  <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-violet-500/15 text-violet-400 rounded-full border border-violet-500/20 font-medium">
                    <Crown className="w-2.5 h-2.5" />
                    PRO
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">
                KineFix
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Coach info */}
        <div className="flex items-center gap-3 p-4 bg-slate-800/40 border border-slate-700/30 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
            AR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium flex items-center gap-1.5">
              <User2 className="w-3.5 h-3.5 text-violet-400" />
              Coach asignado: {user.coach}
            </p>
            <p className="text-xs text-slate-500">{user.coachTitle}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500">Planificación desde</p>
            <p className="text-sm text-slate-300 font-mono">{user.startDate}</p>
          </div>
        </div>

        {/* Payment section */}
        <PaymentSection />

        {/* Monthly not paid warning */}
        {!monthlyPaid && (
          <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-amber-300 font-medium text-sm">
                Cuota mensual pendiente
              </p>
              <p className="text-xs text-slate-400">
                Pagá tu cuota para acceder al gimnasio y a tu rutina de
                entrenamiento.
              </p>
            </div>
          </div>
        )}

        {/* Content gated behind monthly payment */}
        {monthlyPaid ? (
          <>
            {/* Pro custom plan notice */}
            {isCustom && (
              <div className="flex items-center gap-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <Crown className="w-4 h-4 text-violet-400 shrink-0" />
                <p className="text-xs text-violet-300">
                  Estás viendo tu <strong>plan personalizado Pro</strong>{" "}
                  diseñado exclusivamente por tu coach.
                </p>
              </div>
            )}

            {/* Pro upsell if not active and has custom plan waiting */}
            {!proActive && hasCustomPlan && (
              <div className="flex items-center gap-3 p-4 bg-violet-500/5 border border-violet-500/20 rounded-xl">
                <Lock className="w-5 h-5 text-violet-400 shrink-0" />
                <div>
                  <p className="text-violet-300 font-medium text-sm">
                    Tu coach te asignó un plan personalizado
                  </p>
                  <p className="text-xs text-slate-400">
                    Activá la suscripción Pro para desbloquearlo.
                  </p>
                </div>
              </div>
            )}

            {hasPlan ? (
              <>
                {/* Overall progress */}
                <div className="p-5 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/30 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      Progreso General de la Semana
                    </h3>
                    <span className="text-sm font-bold text-emerald-400">
                      {overallProgress}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {completedExercises.size} de {totalExercisesAllDays}{" "}
                    ejercicios completados en total
                  </p>
                </div>

                {/* Day selector */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4" />
                      Resumen Semanal
                    </h3>
                    {!isCustom && (
                      <button 
                        onClick={() => setIsEditingPlan(!isEditingPlan)}
                        className="text-xs font-medium px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20 transition-colors cursor-pointer"
                      >
                        {isEditingPlan ? "Cancelar" : "Cambiar plan"}
                      </button>
                    )}
                  </div>
                  
                  {isEditingPlan ? (
                    <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-6 text-center space-y-4 mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-1">Elegí tu nuevo plan</h3>
                        <p className="text-slate-400 text-xs max-w-sm mx-auto">
                          Seleccioná cuántos días querés entrenar a la semana.
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                        {availablePlanDays.sort((a, b) => a - b).map((d) => (
                          <button
                            key={d}
                            onClick={() => {
                              updateUser(user.id, { 
                                planDays: d, 
                                plan: `${d} días/semana` 
                              });
                              setIsEditingPlan(false);
                              setSelectedDay(null);
                            }}
                            className={`py-3 px-2 rounded-xl border transition-all text-center group cursor-pointer ${user.planDays === d ? 'bg-emerald-500/15 border-emerald-500/40' : 'bg-slate-800/80 border-slate-700/50 hover:border-emerald-500/50 hover:bg-emerald-500/10'}`}
                          >
                            <span className={`text-xl font-bold block ${user.planDays === d ? 'text-emerald-400' : 'text-slate-300 group-hover:text-emerald-400'}`}>{d}</span>
                            <span className={`text-[10px] ${user.planDays === d ? 'text-emerald-500/70' : 'text-slate-500 group-hover:text-emerald-500/70'}`}>días/sem</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {dayKeys.map((dayNum) => {
                        const isActive = dayNum === currentDay;
                        const dayExercises =
                          activePlan[dayNum]?.exercises || [];
                        const dayCompleted = dayExercises.filter((ex) =>
                          completedExercises.has(ex.id)
                        ).length;
                        const isDayDone =
                          dayCompleted === dayExercises.length &&
                          dayExercises.length > 0;

                        return (
                          <button
                            key={dayNum}
                            onClick={() => setSelectedDay(dayNum)}
                            className={`relative flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all duration-200 shrink-0 min-w-[90px] cursor-pointer ${
                              isActive
                                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                                : isDayDone
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500/70"
                                : "bg-slate-800/40 border-slate-700/30 text-slate-400 hover:border-slate-600/50 hover:text-slate-300"
                            }`}
                          >
                            <span className="text-xs font-medium uppercase tracking-wider">
                              Día {dayNum}
                            </span>
                            <span
                              className={`text-[10px] truncate max-w-[80px] ${
                                isActive
                                  ? "text-emerald-400/70"
                                  : "text-slate-500"
                              }`}
                            >
                              {activePlan[dayNum]?.title}
                            </span>
                            {isDayDone && (
                              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
                            )}
                            <div className="flex gap-0.5 mt-1">
                              {dayExercises.map((ex) => (
                                <div
                                  key={ex.id}
                                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                    completedExercises.has(ex.id)
                                      ? "bg-emerald-400"
                                      : "bg-slate-600"
                                  }`}
                                />
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Session progress bar */}
                {dayData && (
                  <>
                    <div className="p-4 bg-slate-800/30 border border-slate-700/20 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">
                          Sesión actual:{" "}
                          <span className="text-white font-semibold">
                            {dayData.title}
                          </span>
                        </span>
                        <span className="text-xs font-bold text-cyan-400">
                          {dayProgress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-700/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${dayProgress}%` }}
                        />
                      </div>
                    </div>

                    <RoutineDetail
                      dayData={dayData}
                      completedExercises={completedExercises}
                      onToggleExercise={toggleExercise}
                    />
                  </>
                )}
              </>
            ) : (
              <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-6 text-center space-y-6 mt-4">
                <Dumbbell className="w-12 h-12 text-slate-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Elegí tu plan de entrenamiento</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Seleccioná cuántos días a la semana querés entrenar para que te asignemos una rutina.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                  {availablePlanDays.sort((a, b) => a - b).map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        updateUser(user.id, { 
                          planDays: d, 
                          plan: `${d} días/semana` 
                        });
                      }}
                      className="py-4 px-2 rounded-xl bg-slate-800/80 border border-slate-700/50 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-center group cursor-pointer"
                    >
                      <span className="text-2xl font-bold text-slate-300 group-hover:text-emerald-400 block">{d}</span>
                      <span className="text-xs text-slate-500 group-hover:text-emerald-500/70">días/sem</span>
                    </button>
                  ))}
                </div>
                {proActive && (
                  <p className="text-xs text-violet-400 mt-4">
                    Tu coach preparará tu plan personalizado pronto. Mientras tanto, podés usar un plan base.
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 space-y-4">
            <Lock className="w-12 h-12 text-slate-600 mx-auto" />
            <h2 className="text-lg text-white font-semibold">
              Acceso restringido
            </h2>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Pagá tu cuota mensual para acceder a tu rutina de entrenamiento y
              todas las funcionalidades.
            </p>
          </div>
        )}
      </main>

      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} updateUser={updateUser} />}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-xs text-slate-600">
          © 2026 KineFix · Entrenamiento Inteligente
        </p>
      </footer>
    </div>
  );
}
