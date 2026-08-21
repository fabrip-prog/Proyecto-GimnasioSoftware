import { useState } from "react";
import {
  LogOut,
  Shield,
  Users,
  ClipboardList,
  Dumbbell,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Calendar,
  UserMinus,
  Search,
  Crown,
  CreditCard,
  CheckCircle2,
  XCircle,
  UserCog,
  ArrowLeft,
} from "lucide-react";
import { useApp } from "../context/AppContext";

// ── Shared ───────────────────────────────────────────────────────────────────

function TabButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
          : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function ExerciseForm({ form, setForm, onSubmit, onCancel, accentColor = "cyan" }) {
  const colors = {
    cyan: {
      bg: "bg-cyan-500/5",
      border: "border-cyan-500/20",
      text: "text-cyan-400",
      btn: "bg-cyan-500 hover:bg-cyan-600",
      ring: "focus:ring-cyan-500/40",
    },
    emerald: {
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      btn: "bg-emerald-500 hover:bg-emerald-600",
      ring: "focus:ring-emerald-500/40",
    },
  }[accentColor];

  return (
    <div className={`p-3 ${colors.bg} border ${colors.border} rounded-xl space-y-2`}>
      <p className={`text-xs font-medium ${colors.text}`}>Nuevo ejercicio</p>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nombre del ejercicio"
          className={`px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 ${colors.ring}`}
        />
        <input
          value={form.muscle}
          onChange={(e) => setForm({ ...form, muscle: e.target.value })}
          placeholder="Grupo muscular"
          className={`px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 ${colors.ring}`}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input
          type="number"
          value={form.sets}
          onChange={(e) => setForm({ ...form, sets: e.target.value })}
          placeholder="Series"
          className={`px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 ${colors.ring}`}
        />
        <input
          value={form.reps}
          onChange={(e) => setForm({ ...form, reps: e.target.value })}
          placeholder="Reps"
          className={`px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 ${colors.ring}`}
        />
        <input
          value={form.rest}
          onChange={(e) => setForm({ ...form, rest: e.target.value })}
          placeholder="Descanso"
          className={`px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 ${colors.ring}`}
        />
      </div>
      <textarea
        value={form.instructions}
        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
        placeholder="Instrucciones de ejecución"
        rows={2}
        className={`w-full px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 ${colors.ring} resize-none`}
      />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 text-slate-400 hover:text-white text-xs rounded-lg transition-colors">
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          disabled={!form.name.trim()}
          className={`flex items-center gap-1 px-3 py-1.5 ${colors.btn} text-white text-xs font-medium rounded-lg disabled:opacity-50 transition-colors`}
        >
          <Plus className="w-3 h-3" />
          Agregar
        </button>
      </div>
    </div>
  );
}

function EditExerciseForm({ form, setForm, onSave, onCancel }) {
  return (
    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre"
          className="px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
        <input value={form.muscle} onChange={(e) => setForm({ ...form, muscle: e.target.value })} placeholder="Músculo"
          className="px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input type="number" value={form.sets} onChange={(e) => setForm({ ...form, sets: Number(e.target.value) })} placeholder="Series"
          className="px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
        <input value={form.reps} onChange={(e) => setForm({ ...form, reps: e.target.value })} placeholder="Reps"
          className="px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
        <input value={form.rest} onChange={(e) => setForm({ ...form, rest: e.target.value })} placeholder="Descanso"
          className="px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
      </div>
      <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Instrucciones" rows={2}
        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40 resize-none" />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 text-slate-400 hover:text-white text-xs rounded-lg transition-colors">Cancelar</button>
        <button onClick={onSave} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors">
          <Save className="w-3 h-3" />Guardar
        </button>
      </div>
    </div>
  );
}

const emptyExForm = { name: "", muscle: "", sets: 3, reps: "10", rest: "60s", instructions: "" };

// ── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({ onSelectUser }) {
  const { users, deleteUser, adminToggleMonthly, adminTogglePro, getCurrentMonth } = useApp();
  const [search, setSearch] = useState("");
  const currentMonth = getCurrentMonth();

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          Usuarios Registrados ({users.length})
        </h3>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o usuario..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/40 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm">No se encontraron usuarios.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => {
            const monthlyOk = user.monthlyPaidMonth === currentMonth;
            return (
              <div
                key={user.id}
                className="p-4 bg-slate-800/40 border border-slate-700/30 rounded-xl hover:border-slate-600/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{user.name}</p>
                    <p className="text-slate-500 text-xs">
                      @{user.username} · {user.plan} · Desde {user.startDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Custom plan button */}
                    <button
                      onClick={() => onSelectUser(user)}
                      className="p-2 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
                      title="Gestionar plan personalizado"
                    >
                      <UserCog className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm(`¿Eliminar al usuario "${user.name}"?`)) deleteUser(user.id); }}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Eliminar usuario"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap gap-2 mt-3 ml-13">
                  <button
                    onClick={() => adminToggleMonthly(user.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      monthlyOk
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                    }`}
                    title="Click para alternar estado de cuota"
                  >
                    {monthlyOk ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    Cuota {monthlyOk ? "Pagada" : "Pendiente"}
                  </button>

                  <button
                    onClick={() => adminTogglePro(user.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      user.proActive
                        ? "bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20"
                        : "bg-slate-700/50 text-slate-500 border-slate-600/20 hover:bg-slate-700/80"
                    }`}
                    title="Click para alternar suscripción Pro"
                  >
                    <Crown className="w-3 h-3" />
                    Pro {user.proActive ? "Activa" : "Inactiva"}
                  </button>

                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                    user.customPlan && Object.keys(user.customPlan).length > 0
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-slate-700/30 text-slate-600 border-slate-700/20"
                  }`}>
                    <ClipboardList className="w-3 h-3" />
                    Plan personal: {user.customPlan && Object.keys(user.customPlan).length > 0
                      ? `${Object.keys(user.customPlan).length} días`
                      : "No asignado"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Custom Plan Editor (per user) ────────────────────────────────────────────

function CustomPlanEditor({ user, onBack }) {
  const {
    assignCustomPlan,
    removeCustomPlan,
    addExerciseToCustomPlan,
    updateExerciseInCustomPlan,
    deleteExerciseFromCustomPlan,
    addDayToCustomPlan,
    deleteDayFromCustomPlan,
    users,
  } = useApp();

  // Get fresh user data
  const freshUser = users.find((u) => u.id === user.id) || user;
  const customPlan = freshUser.customPlan;
  const hasCustomPlan = customPlan && Object.keys(customPlan).length >= 0;

  const [expandedDay, setExpandedDay] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addingDayTitle, setAddingDayTitle] = useState("");
  const [addingDayFocus, setAddingDayFocus] = useState("");
  const [showAddDay, setShowAddDay] = useState(false);
  const [addingExerciseTo, setAddingExerciseTo] = useState(null);
  const [newExForm, setNewExForm] = useState({ ...emptyExForm });

  function handleInitPlan() {
    assignCustomPlan(freshUser.id, {});
  }

  function handleRemovePlan() {
    if (confirm(`¿Eliminar el plan personalizado de ${freshUser.name}?`)) {
      removeCustomPlan(freshUser.id);
    }
  }

  function handleAddDay() {
    if (!addingDayTitle.trim()) return;
    const dayNums = customPlan ? Object.keys(customPlan).map(Number) : [];
    const nextDay = dayNums.length > 0 ? Math.max(...dayNums) + 1 : 1;
    addDayToCustomPlan(freshUser.id, nextDay, {
      title: addingDayTitle.trim(),
      focus: addingDayFocus.trim() || "General",
      exercises: [],
    });
    setAddingDayTitle("");
    setAddingDayFocus("");
    setShowAddDay(false);
  }

  function handleAddExercise(dayNum) {
    if (!newExForm.name.trim()) return;
    addExerciseToCustomPlan(freshUser.id, dayNum, {
      name: newExForm.name.trim(),
      muscle: newExForm.muscle.trim() || "General",
      sets: Number(newExForm.sets) || 3,
      reps: newExForm.reps || "10",
      rest: newExForm.rest || "60s",
      instructions: newExForm.instructions.trim() || "Sin instrucciones específicas.",
    });
    setAddingExerciseTo(null);
    setNewExForm({ ...emptyExForm });
  }

  function startEdit(dayNum, exercise) {
    setEditingExercise({ dayNum, id: exercise.id });
    setEditForm({ ...exercise });
  }

  function saveEdit() {
    if (!editingExercise) return;
    updateExerciseInCustomPlan(freshUser.id, editingExercise.dayNum, editingExercise.id, editForm);
    setEditingExercise(null);
    setEditForm({});
  }

  const dayKeys = customPlan
    ? Object.keys(customPlan).map(Number).sort((a, b) => a - b)
    : [];

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver a usuarios
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
            {freshUser.avatar}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-violet-400" />
              Plan Personalizado
            </h3>
            <p className="text-xs text-slate-500">{freshUser.name} · @{freshUser.username}</p>
          </div>
        </div>
        {customPlan !== null && (
          <button
            onClick={handleRemovePlan}
            className="flex items-center gap-1.5 px-3 py-2 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-medium transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar Plan
          </button>
        )}
      </div>

      {customPlan === null ? (
        <div className="text-center py-12 space-y-4">
          <ClipboardList className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-sm">
            Este usuario no tiene un plan personalizado asignado.
          </p>
          <button
            onClick={handleInitPlan}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-medium rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-4 h-4" />
            Crear Plan Personalizado
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {dayKeys.map((dayNum) => {
            const day = customPlan[dayNum];
            if (!day) return null;
            const isDayExpanded = expandedDay === dayNum;

            return (
              <div key={dayNum} className="bg-slate-900/40 border border-slate-700/20 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-3">
                  <button
                    onClick={() => setExpandedDay(isDayExpanded ? null : dayNum)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    {isDayExpanded ? <ChevronDown className="w-3.5 h-3.5 text-violet-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                    <span className="text-sm font-medium text-white">Día {dayNum}: {day.title}</span>
                    <span className="text-xs text-slate-500">— {day.focus} · {day.exercises.length} ej.</span>
                  </button>
                  <button
                    onClick={() => { if (confirm(`¿Eliminar Día ${dayNum}?`)) deleteDayFromCustomPlan(freshUser.id, dayNum); }}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isDayExpanded && (
                  <div className="border-t border-slate-700/20 p-3 space-y-2">
                    {day.exercises.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">No hay ejercicios en este día.</p>
                    )}
                    {day.exercises.map((ex) => {
                      const isEditing = editingExercise && editingExercise.dayNum === dayNum && editingExercise.id === ex.id;
                      if (isEditing) {
                        return <EditExerciseForm key={ex.id} form={editForm} setForm={setEditForm} onSave={saveEdit} onCancel={() => { setEditingExercise(null); setEditForm({}); }} />;
                      }
                      return (
                        <div key={ex.id} className="flex items-center gap-3 p-2.5 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-all">
                          <Dumbbell className="w-4 h-4 text-violet-500/50 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{ex.name}</p>
                            <p className="text-xs text-slate-500">{ex.muscle} · {ex.sets}×{ex.reps} · {ex.rest}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => startEdit(dayNum, ex)} className="p-1.5 text-slate-500 hover:text-cyan-400 rounded transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => { if (confirm(`¿Eliminar "${ex.name}"?`)) deleteExerciseFromCustomPlan(freshUser.id, dayNum, ex.id); }}
                              className="p-1.5 text-slate-500 hover:text-red-400 rounded transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      );
                    })}

                    {addingExerciseTo === dayNum ? (
                      <ExerciseForm
                        form={newExForm}
                        setForm={setNewExForm}
                        onSubmit={() => handleAddExercise(dayNum)}
                        onCancel={() => { setAddingExerciseTo(null); setNewExForm({ ...emptyExForm }); }}
                        accentColor="cyan"
                      />
                    ) : (
                      <button
                        onClick={() => setAddingExerciseTo(dayNum)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-slate-500 hover:text-cyan-400 border border-dashed border-slate-700/40 hover:border-cyan-500/30 rounded-lg transition-all mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Agregar ejercicio
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {showAddDay ? (
            <div className="p-3 bg-violet-500/5 border border-violet-500/20 rounded-xl space-y-2">
              <p className="text-xs font-medium text-violet-400">Nuevo día de entrenamiento</p>
              <div className="grid grid-cols-2 gap-2">
                <input value={addingDayTitle} onChange={(e) => setAddingDayTitle(e.target.value)} placeholder="Título (ej: Push)"
                  className="px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/40" />
                <input value={addingDayFocus} onChange={(e) => setAddingDayFocus(e.target.value)} placeholder="Enfoque (ej: Pecho/Tríceps)"
                  className="px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/40" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setShowAddDay(false); setAddingDayTitle(""); setAddingDayFocus(""); }}
                  className="px-3 py-1.5 text-slate-400 hover:text-white text-xs rounded-lg transition-colors">Cancelar</button>
                <button onClick={handleAddDay} disabled={!addingDayTitle.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-violet-500 text-white text-xs font-medium rounded-lg hover:bg-violet-600 disabled:opacity-50 transition-colors">
                  <Plus className="w-3 h-3" />Agregar Día
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddDay(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-slate-500 hover:text-violet-400 border border-dashed border-slate-700/40 hover:border-violet-500/30 rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar día al plan
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Plans Tab (shared plans) ─────────────────────────────────────────────────

function PlansTab() {
  const {
    plans, deletePlan, addExercise, updateExercise, deleteExercise,
    addDayToPlan, deleteDayFromPlan, createPlan,
  } = useApp();

  const planKeys = Object.keys(plans).map(Number).sort((a, b) => a - b);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [newPlanDays, setNewPlanDays] = useState("");
  const [addingDayToPlan, setAddingDayToPlan] = useState(null);
  const [newDayTitle, setNewDayTitle] = useState("");
  const [newDayFocus, setNewDayFocus] = useState("");
  const [addingExerciseTo, setAddingExerciseTo] = useState(null);
  const [newExForm, setNewExForm] = useState({ ...emptyExForm });

  function startEditExercise(planDays, dayNum, exercise) {
    setEditingExercise({ planDays, dayNum, id: exercise.id });
    setEditForm({ ...exercise });
  }

  function saveEditExercise() {
    if (!editingExercise) return;
    updateExercise(editingExercise.planDays, editingExercise.dayNum, editingExercise.id, editForm);
    setEditingExercise(null);
    setEditForm({});
  }

  function handleAddDay(planDays) {
    if (!newDayTitle.trim()) return;
    const dayNums = Object.keys(plans[planDays]).map(Number);
    const nextDay = dayNums.length > 0 ? Math.max(...dayNums) + 1 : 1;
    addDayToPlan(planDays, nextDay, { title: newDayTitle.trim(), focus: newDayFocus.trim() || "General", exercises: [] });
    setAddingDayToPlan(null);
    setNewDayTitle("");
    setNewDayFocus("");
  }

  function handleAddExercise() {
    if (!addingExerciseTo || !newExForm.name.trim()) return;
    addExercise(addingExerciseTo.planDays, addingExerciseTo.dayNum, {
      name: newExForm.name.trim(), muscle: newExForm.muscle.trim() || "General",
      sets: Number(newExForm.sets) || 3, reps: newExForm.reps || "10",
      rest: newExForm.rest || "60s", instructions: newExForm.instructions.trim() || "Sin instrucciones específicas.",
    });
    setAddingExerciseTo(null);
    setNewExForm({ ...emptyExForm });
  }

  function handleCreatePlan() {
    const days = parseInt(newPlanDays);
    if (isNaN(days) || days < 1 || days > 7) return;
    const result = createPlan(days, {});
    if (result.success) { setShowNewPlan(false); setNewPlanDays(""); setExpandedPlan(days); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-emerald-400" />
          Planes Compartidos ({planKeys.length})
        </h3>
        <button onClick={() => setShowNewPlan(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/25 transition-all">
          <Plus className="w-4 h-4" />Nuevo Plan
        </button>
      </div>

      {showNewPlan && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3">
          <p className="text-sm font-medium text-emerald-400">Crear nuevo plan</p>
          <div className="flex items-center gap-3">
            <input type="number" min="1" max="7" value={newPlanDays} onChange={(e) => setNewPlanDays(e.target.value)}
              placeholder="Nº de días (1-7)" className="flex-1 px-3 py-2 bg-slate-800/80 border border-slate-600/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
            <button onClick={handleCreatePlan} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">Crear</button>
            <button onClick={() => setShowNewPlan(false)} className="p-2 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {planKeys.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm">No hay planes creados aún.</div>
      ) : (
        <div className="space-y-3">
          {planKeys.map((planDays) => {
            const plan = plans[planDays];
            const dayNums = Object.keys(plan).map(Number).sort((a, b) => a - b);
            const isExpanded = expandedPlan === planDays;

            return (
              <div key={planDays} className="bg-slate-800/40 border border-slate-700/30 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <button onClick={() => setExpandedPlan(isExpanded ? null : planDays)} className="flex items-center gap-3 flex-1 text-left">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-emerald-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <div>
                      <span className="text-white font-semibold">Plan de {planDays} días/semana</span>
                      <span className="text-slate-500 text-xs ml-2">({dayNums.length} días configurados)</span>
                    </div>
                  </button>
                  <button onClick={() => { if (confirm(`¿Eliminar el plan de ${planDays} días?`)) deletePlan(planDays); }}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-700/30 px-4 pb-4 pt-3 space-y-3">
                    {dayNums.map((dayNum) => {
                      const day = plan[dayNum];
                      const isDayExpanded = expandedDay === `${planDays}-${dayNum}`;
                      return (
                        <div key={dayNum} className="bg-slate-900/40 border border-slate-700/20 rounded-xl overflow-hidden">
                          <div className="flex items-center justify-between p-3">
                            <button onClick={() => setExpandedDay(isDayExpanded ? null : `${planDays}-${dayNum}`)} className="flex items-center gap-2 flex-1 text-left">
                              {isDayExpanded ? <ChevronDown className="w-3.5 h-3.5 text-emerald-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                              <span className="text-sm font-medium text-white">Día {dayNum}: {day.title}</span>
                              <span className="text-xs text-slate-500">— {day.focus} · {day.exercises.length} ej.</span>
                            </button>
                            <button onClick={() => { if (confirm(`¿Eliminar Día ${dayNum}?`)) deleteDayFromPlan(planDays, dayNum); }}
                              className="p-1.5 text-slate-500 hover:text-red-400 rounded transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>

                          {isDayExpanded && (
                            <div className="border-t border-slate-700/20 p-3 space-y-2">
                              {day.exercises.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No hay ejercicios.</p>}
                              {day.exercises.map((ex) => {
                                const isEditing = editingExercise && editingExercise.planDays === planDays && editingExercise.dayNum === dayNum && editingExercise.id === ex.id;
                                if (isEditing) {
                                  return <EditExerciseForm key={ex.id} form={editForm} setForm={setEditForm} onSave={saveEditExercise} onCancel={() => { setEditingExercise(null); setEditForm({}); }} />;
                                }
                                return (
                                  <div key={ex.id} className="flex items-center gap-3 p-2.5 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-all">
                                    <Dumbbell className="w-4 h-4 text-emerald-500/50 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-white truncate">{ex.name}</p>
                                      <p className="text-xs text-slate-500">{ex.muscle} · {ex.sets}×{ex.reps} · {ex.rest}</p>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                      <button onClick={() => startEditExercise(planDays, dayNum, ex)} className="p-1.5 text-slate-500 hover:text-cyan-400 rounded transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => { if (confirm(`¿Eliminar "${ex.name}"?`)) deleteExercise(planDays, dayNum, ex.id); }}
                                        className="p-1.5 text-slate-500 hover:text-red-400 rounded transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                  </div>
                                );
                              })}

                              {addingExerciseTo && addingExerciseTo.planDays === planDays && addingExerciseTo.dayNum === dayNum ? (
                                <ExerciseForm form={newExForm} setForm={setNewExForm}
                                  onSubmit={handleAddExercise}
                                  onCancel={() => { setAddingExerciseTo(null); setNewExForm({ ...emptyExForm }); }} />
                              ) : (
                                <button onClick={() => setAddingExerciseTo({ planDays, dayNum })}
                                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-slate-500 hover:text-cyan-400 border border-dashed border-slate-700/40 hover:border-cyan-500/30 rounded-lg transition-all mt-1">
                                  <Plus className="w-3.5 h-3.5" />Agregar ejercicio
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {addingDayToPlan === planDays ? (
                      <div className="p-3 bg-violet-500/5 border border-violet-500/20 rounded-xl space-y-2">
                        <p className="text-xs font-medium text-violet-400">Nuevo día</p>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={newDayTitle} onChange={(e) => setNewDayTitle(e.target.value)} placeholder="Título"
                            className="px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/40" />
                          <input value={newDayFocus} onChange={(e) => setNewDayFocus(e.target.value)} placeholder="Enfoque"
                            className="px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/40" />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => { setAddingDayToPlan(null); setNewDayTitle(""); setNewDayFocus(""); }}
                            className="px-3 py-1.5 text-slate-400 hover:text-white text-xs rounded-lg transition-colors">Cancelar</button>
                          <button onClick={() => handleAddDay(planDays)} disabled={!newDayTitle.trim()}
                            className="flex items-center gap-1 px-3 py-1.5 bg-violet-500 text-white text-xs font-medium rounded-lg hover:bg-violet-600 disabled:opacity-50 transition-colors">
                            <Plus className="w-3 h-3" />Agregar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setAddingDayToPlan(planDays)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-slate-500 hover:text-violet-400 border border-dashed border-slate-700/40 hover:border-violet-500/30 rounded-xl transition-all">
                        <Plus className="w-3.5 h-3.5" />Agregar día
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Admin Panel ─────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { logout } = useApp();
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm leading-tight">Panel de Administración</h1>
              <p className="text-slate-400 text-xs">FitPulse Pro · Gestión</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-sm">
            <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {!selectedUser && (
          <div className="flex gap-2">
            <TabButton active={activeTab === "users"} icon={Users} label="Usuarios" onClick={() => setActiveTab("users")} />
            <TabButton active={activeTab === "plans"} icon={ClipboardList} label="Planes Compartidos" onClick={() => setActiveTab("plans")} />
          </div>
        )}

        <div className="bg-slate-900/50 border border-slate-700/30 rounded-2xl p-5">
          {selectedUser ? (
            <CustomPlanEditor user={selectedUser} onBack={() => setSelectedUser(null)} />
          ) : activeTab === "users" ? (
            <UsersTab onSelectUser={setSelectedUser} />
          ) : (
            <PlansTab />
          )}
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-8 text-center">
        <p className="text-xs text-slate-600">© 2026 FitPulse Pro · Panel Admin</p>
      </footer>
    </div>
  );
}
