import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Crown,
  Dumbbell,
  Edit3,
  LogOut,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  TrendingUp,
  UserCog,
  UserMinus,
  UserPlus,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";

const money = (amount, currency = "ARS") =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const emptyExForm = {
  name: "",
  muscle: "",
  sets: 3,
  reps: "10",
  rest: "60s",
  instructions: "",
  mediaUrl: "",
};

// ── Piezas compartidas ───────────────────────────────────────────────────────

function TabButton({ active, icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className={`tab ${active ? "tab-active" : ""}`}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

/** Formulario de ejercicio, usado tanto para alta como para edición. */
function ExerciseEditor({ form, setForm, onSubmit, onCancel, submitLabel = "Agregar" }) {
  const small = "input py-2 text-sm";
  return (
    <div className="bg-sunken border border-line rounded-lg p-3 space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nombre del ejercicio"
          className={small}
        />
        <input
          value={form.muscle}
          onChange={(e) => setForm({ ...form, muscle: e.target.value })}
          placeholder="Grupo muscular"
          className={small}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input
          type="number"
          value={form.sets}
          onChange={(e) => setForm({ ...form, sets: Number(e.target.value) })}
          placeholder="Series"
          className={small}
        />
        <input
          value={form.reps}
          onChange={(e) => setForm({ ...form, reps: e.target.value })}
          placeholder="Reps"
          className={small}
        />
        <input
          value={form.rest}
          onChange={(e) => setForm({ ...form, rest: e.target.value })}
          placeholder="Descanso"
          className={small}
        />
      </div>
      <textarea
        value={form.instructions}
        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
        placeholder="Instrucciones de ejecución"
        rows={2}
        className={`${small} resize-none`}
      />
      <input
        value={form.mediaUrl || ""}
        onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
        placeholder="URL de foto, video o GIF (opcional)"
        className={small}
      />
      <div className="flex gap-2 justify-end pt-1">
        <button onClick={onCancel} className="btn-ghost btn-sm">
          Cancelar
        </button>
        <button onClick={onSubmit} disabled={!form.name?.trim()} className="btn-primary btn-sm">
          <Save className="w-3.5 h-3.5" />
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

function ExerciseRow({ exercise, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sunken transition-colors">
      <Dumbbell className="w-4 h-4 text-ink-muted shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink truncate">{exercise.name}</p>
        <p className="text-xs text-ink-muted">
          {exercise.muscle} · {exercise.sets}×{exercise.reps} · {exercise.rest}
        </p>
      </div>
      <div className="flex gap-0.5 shrink-0">
        <button onClick={onEdit} className="btn-icon" title="Editar ejercicio">
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="btn-icon-danger" title="Eliminar ejercicio">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function DayForm({ title, focus, setTitle, setFocus, onSubmit, onCancel }) {
  return (
    <div className="bg-sunken border border-line rounded-lg p-3 space-y-2">
      <p className="text-xs font-medium text-ink-soft">Nuevo día de entrenamiento</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título (ej: Empuje)"
          className="input py-2 text-sm"
        />
        <input
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder="Enfoque (ej: Pecho y tríceps)"
          className="input py-2 text-sm"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="btn-ghost btn-sm">
          Cancelar
        </button>
        <button onClick={onSubmit} disabled={!title.trim()} className="btn-primary btn-sm">
          <Plus className="w-3.5 h-3.5" />
          Agregar día
        </button>
      </div>
    </div>
  );
}

function DashedButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-ink-soft border border-dashed border-line-strong rounded-lg hover:text-brand hover:border-brand hover:bg-brand-soft transition-colors cursor-pointer"
    >
      <Plus className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

/** Acordeón de un día, compartido por el plan personalizado y los compartidos. */
function DayAccordion({ dayNum, day, expanded, onToggle, onDelete, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-3 gap-2">
        <button onClick={onToggle} className="flex items-center gap-2 flex-1 text-left min-w-0 cursor-pointer">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-ink-soft shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" />
          )}
          <span className="text-sm font-medium text-ink truncate">
            Día {dayNum}: {day.title}
          </span>
          <span className="text-xs text-ink-muted hidden sm:inline shrink-0">
            {day.focus} · {day.exercises.length} ej.
          </span>
        </button>
        <button onClick={onDelete} className="btn-icon-danger shrink-0" title="Eliminar día">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {expanded && <div className="border-t border-line p-3 space-y-1.5">{children}</div>}
    </div>
  );
}

// ── Progreso de un socio ─────────────────────────────────────────────────────

function UserProgressView({ user, onBack }) {
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .memberProgress(user.id)
      .then(({ entries }) => {
        if (cancelled) return;
        const grouped = {};
        for (const entry of entries) {
          (grouped[entry.date] ??= []).push(entry);
        }
        setSessions(grouped);
      })
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const dates = Object.keys(sessions ?? {}).sort((a, b) => b.localeCompare(a));

  const formatDate = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn-icon" title="Volver">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="section-title">Progreso de {user.name}</h2>
          {sessions && <p className="text-xs text-ink-muted mt-0.5">{dates.length} sesiones registradas</p>}
        </div>
      </div>

      {error && (
        <p className="alert-danger">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}

      {sessions === null ? (
        <div className="empty-state">Cargando progreso…</div>
      ) : dates.length === 0 ? (
        <div className="empty-state">Este socio todavía no registró progresos.</div>
      ) : (
        <div className="space-y-3">
          {dates.map((date) => (
            <div key={date} className="card p-4">
              <h4 className="text-sm font-semibold text-ink mb-2 capitalize">{formatDate(date)}</h4>
              <div className="divide-y divide-line">
                {sessions[date].map((entry) => (
                  <div
                    key={entry.exercise_id}
                    className="flex justify-between items-center gap-3 text-sm py-2"
                  >
                    <span className="text-ink-soft truncate">
                      {entry.exercise_name || entry.exercise_id}
                    </span>
                    <span className="font-medium text-ink shrink-0">
                      {entry.weight} kg × {entry.reps} reps
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Alta de socio ────────────────────────────────────────────────────────────

const emptyMemberForm = { name: "", username: "", password: "", planDays: "", coach: "" };

function NewMemberModal({ onClose }) {
  const { createUser, availablePlanDays } = useApp();
  const [form, setForm] = useState({ ...emptyMemberForm });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const result = await createUser({
      ...form,
      planDays: form.planDays === "" ? null : Number(form.planDays),
    });
    setSaving(false);

    if (result.success) onClose();
    else setError(result.error);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="modal-panel max-w-md space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-brand" />
            Nuevo socio
          </h2>
          <button type="button" onClick={onClose} className="btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="label">Nombre completo</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej: Juan Pérez"
            className="input"
          />
        </div>

        <div>
          <label className="label">Usuario</label>
          <input
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") })
            }
            placeholder="Ej: juanperez"
            className="input"
          />
        </div>

        <div>
          <label className="label">Contraseña provisoria</label>
          <input
            type="text"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Mínimo 6 caracteres"
            className="input"
          />
          <p className="hint">El socio puede cambiarla después desde su perfil.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Plan</label>
            <select
              value={form.planDays}
              onChange={(e) => setForm({ ...form, planDays: e.target.value })}
              className="input"
            >
              <option value="">Sin plan</option>
              {availablePlanDays
                .sort((a, b) => a - b)
                .map((d) => (
                  <option key={d} value={d}>
                    {d} días/semana
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="label">Coach</label>
            <input
              value={form.coach}
              onChange={(e) => setForm({ ...form, coach: e.target.value })}
              placeholder="Opcional"
              className="input"
            />
          </div>
        </div>

        {error && (
          <p className="alert-danger">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </p>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Creando…" : "Crear socio"}
        </button>
      </form>
    </div>
  );
}

// ── Edición de socio ─────────────────────────────────────────────────────────

function EditMemberModal({ user, onClose }) {
  const { updateUser, availablePlanDays } = useApp();
  const [form, setForm] = useState({
    name: user.name,
    planDays: user.planDays == null ? "" : String(user.planDays),
    coach: user.coach ?? "",
    password: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password && form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setSaving(true);
    const result = await updateUser(user.id, {
      name: form.name,
      planDays: form.planDays === "" ? null : Number(form.planDays),
      coach: form.coach,
      ...(form.password ? { password: form.password } : {}),
    });
    setSaving(false);

    if (result.success) onClose();
    else setError(result.error);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="modal-panel max-w-md space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-brand" />
            Editar socio
          </h2>
          <button type="button" onClick={onClose} className="btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-ink-muted -mt-2">@{user.username}</p>

        <div>
          <label className="label">Nombre completo</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Plan</label>
            <select
              value={form.planDays}
              onChange={(e) => setForm({ ...form, planDays: e.target.value })}
              className="input"
            >
              <option value="">Sin plan</option>
              {availablePlanDays
                .sort((a, b) => a - b)
                .map((d) => (
                  <option key={d} value={d}>
                    {d} días/semana
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="label">Coach</label>
            <input
              value={form.coach}
              onChange={(e) => setForm({ ...form, coach: e.target.value })}
              placeholder="Opcional"
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">Restablecer contraseña</label>
          <input
            type="text"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Dejala vacía para no cambiarla"
            className="input"
          />
        </div>

        {error && (
          <p className="alert-danger">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </p>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

// ── Pestaña: socios ──────────────────────────────────────────────────────────

function UsersTab({ onSelectUser, onSelectProgress }) {
  const { users, deleteUser, adminToggleMonthly, adminTogglePro, getCurrentMonth } = useApp();
  const [search, setSearch] = useState("");
  const [showNewMember, setShowNewMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const currentMonth = getCurrentMonth();

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="section-title flex items-center gap-2">
          <Users className="w-5 h-5 text-ink-soft" />
          Socios ({users.length})
        </h3>
        <button onClick={() => setShowNewMember(true)} className="btn-primary btn-sm">
          <UserPlus className="w-4 h-4" />
          Nuevo socio
        </button>
      </div>

      {showNewMember && <NewMemberModal onClose={() => setShowNewMember(false)} />}
      {editingMember && (
        <EditMemberModal user={editingMember} onClose={() => setEditingMember(null)} />
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o usuario…"
          className="input pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {users.length === 0 ? "Todavía no hay socios cargados." : "No se encontraron socios."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => {
            const monthlyOk = user.monthlyPaidMonth === currentMonth;
            const customDays = user.customPlan ? Object.keys(user.customPlan).length : 0;

            return (
              <div key={user.id} className="card-interactive p-4">
                <div className="flex items-center gap-3">
                  <div className="avatar w-10 h-10 text-sm">{user.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink font-medium text-sm truncate">{user.name}</p>
                    <p className="text-ink-muted text-xs truncate">
                      @{user.username} · {user.plan} · desde {user.startDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => setEditingMember(user)}
                      className="btn-icon"
                      title="Editar socio / restablecer contraseña"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectUser(user)}
                      className="btn-icon"
                      title="Gestionar plan personalizado"
                    >
                      <UserCog className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectProgress(user)}
                      className="btn-icon"
                      title="Ver progreso"
                    >
                      <ClipboardList className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar al socio "${user.name}"?`)) deleteUser(user.id);
                      }}
                      className="btn-icon-danger"
                      title="Eliminar socio"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => adminToggleMonthly(user.id)}
                    className={`${monthlyOk ? "chip-ok" : "chip-danger"} chip-button`}
                    title="Cambiar estado de la cuota"
                  >
                    {monthlyOk ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    Cuota {monthlyOk ? "pagada" : "pendiente"}
                  </button>

                  <button
                    onClick={() => adminTogglePro(user.id)}
                    className={`${user.proActive ? "chip-pro" : "chip-neutral"} chip-button`}
                    title="Activar o desactivar Pro"
                  >
                    <Crown className="w-3 h-3" />
                    Pro {user.proActive ? "activa" : "inactiva"}
                  </button>

                  <span className="chip-neutral">
                    <ClipboardList className="w-3 h-3" />
                    {customDays > 0 ? `Plan personal: ${customDays} días` : "Sin plan personal"}
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

// ── Plan personalizado de un socio ───────────────────────────────────────────

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

  const freshUser = users.find((u) => u.id === user.id) || user;
  const customPlan = freshUser.customPlan;

  const [expandedDay, setExpandedDay] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [dayTitle, setDayTitle] = useState("");
  const [dayFocus, setDayFocus] = useState("");
  const [showAddDay, setShowAddDay] = useState(false);
  const [addingExerciseTo, setAddingExerciseTo] = useState(null);
  const [newExForm, setNewExForm] = useState({ ...emptyExForm });

  function handleAddDay() {
    if (!dayTitle.trim()) return;
    const dayNums = customPlan ? Object.keys(customPlan).map(Number) : [];
    const nextDay = dayNums.length > 0 ? Math.max(...dayNums) + 1 : 1;
    addDayToCustomPlan(freshUser.id, nextDay, {
      title: dayTitle.trim(),
      focus: dayFocus.trim() || "General",
      exercises: [],
    });
    setDayTitle("");
    setDayFocus("");
    setShowAddDay(false);
  }

  function handleAddExercise(dayNum) {
    if (!newExForm.name.trim()) return;
    addExerciseToCustomPlan(freshUser.id, dayNum, {
      ...newExForm,
      name: newExForm.name.trim(),
      muscle: newExForm.muscle.trim() || "General",
      sets: Number(newExForm.sets) || 3,
      instructions: newExForm.instructions.trim() || "Sin instrucciones específicas.",
    });
    setAddingExerciseTo(null);
    setNewExForm({ ...emptyExForm });
  }

  function saveEdit() {
    if (!editingExercise) return;
    updateExerciseInCustomPlan(freshUser.id, editingExercise.dayNum, editingExercise.id, editForm);
    setEditingExercise(null);
    setEditForm({});
  }

  const dayKeys = customPlan
    ? Object.keys(customPlan)
        .map(Number)
        .sort((a, b) => a - b)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="btn-icon shrink-0" title="Volver a socios">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="avatar w-10 h-10 text-sm">{freshUser.avatar}</div>
          <div className="min-w-0">
            <h3 className="section-title flex items-center gap-2">
              <Crown className="w-4 h-4 text-pro" />
              Plan personalizado
            </h3>
            <p className="text-xs text-ink-muted truncate">
              {freshUser.name} · @{freshUser.username}
            </p>
          </div>
        </div>
        {customPlan !== null && (
          <button
            onClick={() => {
              if (confirm(`¿Eliminar el plan personalizado de ${freshUser.name}?`)) {
                removeCustomPlan(freshUser.id);
              }
            }}
            className="btn-secondary btn-sm text-danger border-danger-line hover:bg-danger-soft shrink-0"
          >
            Eliminar plan
          </button>
        )}
      </div>

      {!freshUser.proActive && (
        <div className="alert-warn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Este socio no tiene la suscripción Pro activa, así que todavía no puede ver su plan
            personalizado.
          </span>
        </div>
      )}

      {customPlan === null ? (
        <div className="card p-10 text-center space-y-4">
          <ClipboardList className="w-10 h-10 text-ink-muted mx-auto" />
          <p className="text-ink-soft text-sm">Este socio no tiene un plan personalizado.</p>
          <button onClick={() => assignCustomPlan(freshUser.id, {})} className="btn-primary">
            <Plus className="w-4 h-4" />
            Crear plan personalizado
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {dayKeys.map((dayNum) => {
            const day = customPlan[dayNum];
            if (!day) return null;

            return (
              <DayAccordion
                key={dayNum}
                dayNum={dayNum}
                day={day}
                expanded={expandedDay === dayNum}
                onToggle={() => setExpandedDay(expandedDay === dayNum ? null : dayNum)}
                onDelete={() => {
                  if (confirm(`¿Eliminar el día ${dayNum}?`))
                    deleteDayFromCustomPlan(freshUser.id, dayNum);
                }}
              >
                {day.exercises.length === 0 && (
                  <p className="text-xs text-ink-muted text-center py-3">
                    No hay ejercicios en este día.
                  </p>
                )}

                {day.exercises.map((ex) =>
                  editingExercise?.dayNum === dayNum && editingExercise?.id === ex.id ? (
                    <ExerciseEditor
                      key={ex.id}
                      form={editForm}
                      setForm={setEditForm}
                      onSubmit={saveEdit}
                      onCancel={() => {
                        setEditingExercise(null);
                        setEditForm({});
                      }}
                      submitLabel="Guardar"
                    />
                  ) : (
                    <ExerciseRow
                      key={ex.id}
                      exercise={ex}
                      onEdit={() => {
                        setEditingExercise({ dayNum, id: ex.id });
                        setEditForm({ ...ex });
                      }}
                      onDelete={() => {
                        if (confirm(`¿Eliminar "${ex.name}"?`))
                          deleteExerciseFromCustomPlan(freshUser.id, dayNum, ex.id);
                      }}
                    />
                  )
                )}

                {addingExerciseTo === dayNum ? (
                  <ExerciseEditor
                    form={newExForm}
                    setForm={setNewExForm}
                    onSubmit={() => handleAddExercise(dayNum)}
                    onCancel={() => {
                      setAddingExerciseTo(null);
                      setNewExForm({ ...emptyExForm });
                    }}
                  />
                ) : (
                  <DashedButton
                    onClick={() => setAddingExerciseTo(dayNum)}
                    label="Agregar ejercicio"
                  />
                )}
              </DayAccordion>
            );
          })}

          {showAddDay ? (
            <DayForm
              title={dayTitle}
              focus={dayFocus}
              setTitle={setDayTitle}
              setFocus={setDayFocus}
              onSubmit={handleAddDay}
              onCancel={() => {
                setShowAddDay(false);
                setDayTitle("");
                setDayFocus("");
              }}
            />
          ) : (
            <DashedButton onClick={() => setShowAddDay(true)} label="Agregar día al plan" />
          )}
        </div>
      )}
    </div>
  );
}

// ── Pestaña: planes compartidos ──────────────────────────────────────────────

function PlansTab() {
  const {
    plans,
    deletePlan,
    addExercise,
    updateExercise,
    deleteExercise,
    addDayToPlan,
    deleteDayFromPlan,
    createPlan,
  } = useApp();

  const planKeys = Object.keys(plans)
    .map(Number)
    .sort((a, b) => a - b);

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
  const [planError, setPlanError] = useState("");

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
    addDayToPlan(planDays, nextDay, {
      title: newDayTitle.trim(),
      focus: newDayFocus.trim() || "General",
      exercises: [],
    });
    setAddingDayToPlan(null);
    setNewDayTitle("");
    setNewDayFocus("");
  }

  function handleAddExercise() {
    if (!addingExerciseTo || !newExForm.name.trim()) return;
    addExercise(addingExerciseTo.planDays, addingExerciseTo.dayNum, {
      ...newExForm,
      name: newExForm.name.trim(),
      muscle: newExForm.muscle.trim() || "General",
      sets: Number(newExForm.sets) || 3,
      instructions: newExForm.instructions.trim() || "Sin instrucciones específicas.",
    });
    setAddingExerciseTo(null);
    setNewExForm({ ...emptyExForm });
  }

  async function handleCreatePlan() {
    const days = parseInt(newPlanDays);
    if (isNaN(days) || days < 1 || days > 7) {
      setPlanError("La cantidad de días debe estar entre 1 y 7.");
      return;
    }
    const result = await createPlan(days, {});
    if (result.success) {
      setShowNewPlan(false);
      setNewPlanDays("");
      setExpandedPlan(days);
      setPlanError("");
    } else {
      setPlanError(result.error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="section-title flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-ink-soft" />
          Planes compartidos ({planKeys.length})
        </h3>
        <button onClick={() => setShowNewPlan(true)} className="btn-primary btn-sm">
          <Plus className="w-4 h-4" />
          Nuevo plan
        </button>
      </div>

      {showNewPlan && (
        <div className="card p-4 space-y-3">
          <p className="text-sm font-medium text-ink">Crear nuevo plan</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="7"
              value={newPlanDays}
              onChange={(e) => setNewPlanDays(e.target.value)}
              placeholder="Cantidad de días (1 a 7)"
              className="input flex-1"
            />
            <button onClick={handleCreatePlan} className="btn-primary">
              Crear
            </button>
            <button
              onClick={() => {
                setShowNewPlan(false);
                setPlanError("");
              }}
              className="btn-icon"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {planError && (
            <p className="alert-danger">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {planError}
            </p>
          )}
        </div>
      )}

      {planKeys.length === 0 ? (
        <div className="empty-state">Todavía no hay planes creados.</div>
      ) : (
        <div className="space-y-3">
          {planKeys.map((planDays) => {
            const plan = plans[planDays];
            const dayNums = Object.keys(plan)
              .map(Number)
              .sort((a, b) => a - b);
            const isExpanded = expandedPlan === planDays;

            return (
              <div key={planDays} className="card overflow-hidden">
                <div className="flex items-center justify-between p-4 gap-2">
                  <button
                    onClick={() => setExpandedPlan(isExpanded ? null : planDays)}
                    className="flex items-center gap-3 flex-1 text-left min-w-0 cursor-pointer"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-ink-soft shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" />
                    )}
                    <Calendar className="w-5 h-5 text-ink-muted shrink-0" />
                    <span className="min-w-0">
                      <span className="text-ink font-semibold">Plan de {planDays} días/semana</span>
                      <span className="text-ink-muted text-xs ml-2">
                        ({dayNums.length} días configurados)
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar el plan de ${planDays} días?`)) deletePlan(planDays);
                    }}
                    className="btn-icon-danger shrink-0"
                    title="Eliminar plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-line p-4 space-y-3 bg-canvas">
                    {dayNums.map((dayNum) => {
                      const day = plan[dayNum];
                      const key = `${planDays}-${dayNum}`;

                      return (
                        <DayAccordion
                          key={dayNum}
                          dayNum={dayNum}
                          day={day}
                          expanded={expandedDay === key}
                          onToggle={() => setExpandedDay(expandedDay === key ? null : key)}
                          onDelete={() => {
                            if (confirm(`¿Eliminar el día ${dayNum}?`))
                              deleteDayFromPlan(planDays, dayNum);
                          }}
                        >
                          {day.exercises.length === 0 && (
                            <p className="text-xs text-ink-muted text-center py-3">
                              No hay ejercicios en este día.
                            </p>
                          )}

                          {day.exercises.map((ex) =>
                            editingExercise?.planDays === planDays &&
                            editingExercise?.dayNum === dayNum &&
                            editingExercise?.id === ex.id ? (
                              <ExerciseEditor
                                key={ex.id}
                                form={editForm}
                                setForm={setEditForm}
                                onSubmit={saveEditExercise}
                                onCancel={() => {
                                  setEditingExercise(null);
                                  setEditForm({});
                                }}
                                submitLabel="Guardar"
                              />
                            ) : (
                              <ExerciseRow
                                key={ex.id}
                                exercise={ex}
                                onEdit={() => {
                                  setEditingExercise({ planDays, dayNum, id: ex.id });
                                  setEditForm({ ...ex });
                                }}
                                onDelete={() => {
                                  if (confirm(`¿Eliminar "${ex.name}"?`))
                                    deleteExercise(planDays, dayNum, ex.id);
                                }}
                              />
                            )
                          )}

                          {addingExerciseTo?.planDays === planDays &&
                          addingExerciseTo?.dayNum === dayNum ? (
                            <ExerciseEditor
                              form={newExForm}
                              setForm={setNewExForm}
                              onSubmit={handleAddExercise}
                              onCancel={() => {
                                setAddingExerciseTo(null);
                                setNewExForm({ ...emptyExForm });
                              }}
                            />
                          ) : (
                            <DashedButton
                              onClick={() => setAddingExerciseTo({ planDays, dayNum })}
                              label="Agregar ejercicio"
                            />
                          )}
                        </DayAccordion>
                      );
                    })}

                    {addingDayToPlan === planDays ? (
                      <DayForm
                        title={newDayTitle}
                        focus={newDayFocus}
                        setTitle={setNewDayTitle}
                        setFocus={setNewDayFocus}
                        onSubmit={() => handleAddDay(planDays)}
                        onCancel={() => {
                          setAddingDayToPlan(null);
                          setNewDayTitle("");
                          setNewDayFocus("");
                        }}
                      />
                    ) : (
                      <DashedButton
                        onClick={() => setAddingDayToPlan(planDays)}
                        label="Agregar día"
                      />
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

// ── Pestaña: cobranzas ───────────────────────────────────────────────────────

function StatCard({ label, value, tone = "ink" }) {
  const toneClass = { ink: "text-ink", ok: "text-ok", warn: "text-warn" }[tone];
  return (
    <div className="card p-4">
      <p className="text-ink-muted text-xs mb-1">{label}</p>
      <p className={`text-xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function BillingTab() {
  const { users, gym, getCurrentMonth, adminToggleMonthly } = useApp();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const currentMonth = getCurrentMonth();

  // Se vuelve a pedir el resumen cada vez que se marca o desmarca una cuota.
  const paidSignature = users.map((u) => `${u.id}:${u.monthlyPaidMonth}`).join("|");

  useEffect(() => {
    let cancelled = false;
    api
      .paymentSummary()
      .then((data) => !cancelled && setSummary(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [paidSignature]);

  const pending = users.filter((u) => u.monthlyPaidMonth !== currentMonth);
  const currency = gym?.currency ?? "ARS";

  return (
    <div className="space-y-5">
      <h3 className="section-title flex items-center gap-2">
        <Wallet className="w-5 h-5 text-ink-soft" />
        Cobranzas de {currentMonth}
      </h3>

      {error && (
        <p className="alert-danger">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Recaudado" value={money(summary?.revenue, currency)} tone="ok" />
        <StatCard label="Socios" value={summary?.memberCount ?? users.length} />
        <StatCard label="Al día" value={summary?.paidCount ?? 0} />
        <StatCard
          label="Pendientes"
          value={summary?.unpaidCount ?? pending.length}
          tone="warn"
        />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-ink mb-2">
          Cuotas pendientes ({pending.length})
        </h4>
        {pending.length === 0 ? (
          <p className="text-ink-soft text-sm py-4">Todos los socios están al día.</p>
        ) : (
          <div className="space-y-2">
            {pending.map((user) => (
              <div key={user.id} className="card p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="avatar w-9 h-9 text-xs">{user.avatar}</div>
                  <div className="min-w-0">
                    <p className="text-ink text-sm font-medium truncate">{user.name}</p>
                    <p className="text-ink-muted text-xs">@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => adminToggleMonthly(user.id)}
                  className="btn-primary btn-sm shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Registrar pago
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {summary?.byMonth?.length > 1 && (
        <div>
          <h4 className="text-sm font-semibold text-ink mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-ink-soft" />
            Historial mensual
          </h4>
          <div className="card divide-y divide-line">
            {summary.byMonth.map((row) => (
              <div key={row.month} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-ink-soft font-mono">{row.month}</span>
                <span className="text-sm font-medium text-ink">{money(row.total, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pestaña: configuración ───────────────────────────────────────────────────

function SettingsTab() {
  const { gym, updateGym } = useApp();
  const [form, setForm] = useState({
    name: gym?.name ?? "",
    whatsapp: gym?.whatsapp ?? "",
    monthlyPrice: String(gym?.pricing?.monthly ?? 0),
    proPrice: String(gym?.pricing?.pro ?? 0),
  });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const result = await updateGym({
      name: form.name,
      whatsapp: form.whatsapp,
      monthlyPrice: Number(form.monthlyPrice),
      proPrice: Number(form.proPrice),
    });
    setSaving(false);
    setStatus(
      result.success
        ? { ok: true, message: "Cambios guardados." }
        : { ok: false, message: result.error }
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-lg">
      <h3 className="section-title flex items-center gap-2">
        <Settings className="w-5 h-5 text-ink-soft" />
        Configuración del gimnasio
      </h3>

      <div>
        <label className="label">Nombre del gimnasio</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input"
        />
      </div>

      <div>
        <label className="label">WhatsApp de contacto</label>
        <input
          value={form.whatsapp}
          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          placeholder="Ej: 3329534029"
          className="input"
        />
        <p className="hint">Tus socios lo usan para coordinar el pago de la cuota.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Cuota mensual</label>
          <input
            type="number"
            min="0"
            value={form.monthlyPrice}
            onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label">Suscripción Pro</label>
          <input
            type="number"
            min="0"
            value={form.proPrice}
            onChange={(e) => setForm({ ...form, proPrice: e.target.value })}
            className="input"
          />
        </div>
      </div>

      <div className="card p-3">
        <p className="text-ink-muted text-xs mb-1">Identificador de tu gimnasio</p>
        <p className="text-ink font-mono text-sm">{gym?.slug}</p>
      </div>

      {status && (
        <p className={status.ok ? "alert-ok" : "alert-danger"}>
          {status.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {status.message}
        </p>
      )}

      <button type="submit" disabled={saving} className="btn-primary">
        <Save className="w-4 h-4" />
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

// ── Panel principal ──────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { logout, gym } = useApp();
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProgressUser, setSelectedProgressUser] = useState(null);

  const showTabs = !selectedUser && !selectedProgressUser;

  return (
    <div className="min-h-screen">
      <header className="app-header">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-ink font-semibold text-sm leading-tight truncate">
                {gym?.name ?? "KineFix"}
              </h1>
              <p className="text-ink-muted text-xs">Panel de administración</p>
            </div>
          </div>
          <button onClick={logout} className="btn-ghost btn-sm shrink-0">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {showTabs && (
          <div className="flex gap-1 flex-wrap">
            <TabButton
              active={activeTab === "users"}
              icon={Users}
              label="Socios"
              onClick={() => setActiveTab("users")}
            />
            <TabButton
              active={activeTab === "billing"}
              icon={Wallet}
              label="Cobranzas"
              onClick={() => setActiveTab("billing")}
            />
            <TabButton
              active={activeTab === "plans"}
              icon={ClipboardList}
              label="Planes"
              onClick={() => setActiveTab("plans")}
            />
            <TabButton
              active={activeTab === "settings"}
              icon={Settings}
              label="Configuración"
              onClick={() => setActiveTab("settings")}
            />
          </div>
        )}

        <div className="card p-5">
          {selectedUser ? (
            <CustomPlanEditor user={selectedUser} onBack={() => setSelectedUser(null)} />
          ) : selectedProgressUser ? (
            <UserProgressView
              user={selectedProgressUser}
              onBack={() => setSelectedProgressUser(null)}
            />
          ) : activeTab === "users" ? (
            <UsersTab
              onSelectUser={setSelectedUser}
              onSelectProgress={setSelectedProgressUser}
            />
          ) : activeTab === "billing" ? (
            <BillingTab />
          ) : activeTab === "settings" ? (
            <SettingsTab />
          ) : (
            <PlansTab />
          )}
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-8 text-center">
        <p className="text-xs text-ink-muted">© 2026 KineFix</p>
      </footer>
    </div>
  );
}
