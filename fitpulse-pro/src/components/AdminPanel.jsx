import { useEffect, useState } from "react";
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
  UserPlus,
  Search,
  Crown,
  CheckCircle2,
  XCircle,
  UserCog,
  ArrowLeft,
  Settings,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";

const money = (amount, currency = "ARS") =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

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
      <input
        value={form.mediaUrl || ""}
        onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
        placeholder="URL de Foto/Video/GIF"
        className={`w-full px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 ${colors.ring}`}
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
      <input value={form.mediaUrl || ""} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} placeholder="URL de Foto/Video/GIF"
        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 text-slate-400 hover:text-white text-xs rounded-lg transition-colors">Cancelar</button>
        <button onClick={onSave} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors">
          <Save className="w-3 h-3" />Guardar
        </button>
      </div>
    </div>
  );
}

const emptyExForm = { name: "", muscle: "", sets: 3, reps: "10", rest: "60s", instructions: "", mediaUrl: "" };


// ── User Progress View ───────────────────────────────────────────────────────

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Progreso de {user.name}
            </h2>
            {sessions && <p className="text-slate-500 text-xs">{dates.length} sesiones registradas</p>}
          </div>
        </div>
      </div>

      {error && <p className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">{error}</p>}

      {sessions === null ? (
        <div className="text-center py-10 text-slate-500 text-sm">Cargando progreso…</div>
      ) : dates.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm">Este usuario aún no ha registrado progresos.</div>
      ) : (
        <div className="space-y-4">
          {dates.map(date => (
            <div key={date} className="p-4 bg-slate-800/40 border border-slate-700/30 rounded-xl">
              <h4 className="text-emerald-400 font-semibold mb-2 capitalize">{formatDate(date)}</h4>
              <div className="space-y-2">
                {sessions[date].map((entry) => (
                  <div key={entry.exercise_id} className="flex justify-between items-center gap-3 text-sm p-2 bg-slate-900/50 rounded">
                    <span className="text-slate-300 truncate">{entry.exercise_name || entry.exercise_id}</span>
                    <span className="text-cyan-400 font-medium shrink-0">{entry.weight} kg × {entry.reps} reps</span>
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

// ── New Member Modal ─────────────────────────────────────────────────────────

const emptyMemberForm = { name: "", username: "", password: "", planDays: "", coach: "", coachTitle: "" };

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

  const field = "w-full px-3 py-2 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />Nuevo socio
          </h2>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Nombre completo</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Juan Pérez" className={field} />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Usuario</label>
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") })} placeholder="Ej: juanperez" className={field} />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Contraseña provisoria</label>
          <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" className={field} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Plan</label>
            <select value={form.planDays} onChange={(e) => setForm({ ...form, planDays: e.target.value })} className={field}>
              <option value="">Sin plan</option>
              {availablePlanDays.sort((a, b) => a - b).map((d) => (
                <option key={d} value={d}>{d} días/semana</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Coach</label>
            <input value={form.coach} onChange={(e) => setForm({ ...form, coach: e.target.value })} placeholder="Opcional" className={field} />
          </div>
        </div>

        {error && <p className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">{error}</p>}

        <button type="submit" disabled={saving} className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
          {saving ? "Creando…" : "Crear socio"}
        </button>
      </form>
    </div>
  );
}

// ── Edit Member Modal ────────────────────────────────────────────────────────

function EditMemberModal({ user, onClose }) {
  const { updateUser, availablePlanDays } = useApp();
  const [form, setForm] = useState({
    name: user.name,
    planDays: user.planDays == null ? "" : String(user.planDays),
    coach: user.coach ?? "",
    coachTitle: user.coachTitle ?? "",
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
      coachTitle: form.coachTitle,
      ...(form.password ? { password: form.password } : {}),
    });
    setSaving(false);

    if (result.success) onClose();
    else setError(result.error);
  }

  const field = "w-full px-3 py-2 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-emerald-400" />Editar socio
          </h2>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <p className="text-slate-500 text-xs">@{user.username}</p>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Nombre completo</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Plan</label>
            <select value={form.planDays} onChange={(e) => setForm({ ...form, planDays: e.target.value })} className={field}>
              <option value="">Sin plan</option>
              {availablePlanDays.sort((a, b) => a - b).map((d) => (
                <option key={d} value={d}>{d} días/semana</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Coach</label>
            <input value={form.coach} onChange={(e) => setForm({ ...form, coach: e.target.value })} placeholder="Opcional" className={field} />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Restablecer contraseña</label>
          <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Dejala vacía para no cambiarla" className={field} />
        </div>

        {error && <p className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">{error}</p>}

        <button type="submit" disabled={saving} className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

// ── Users Tab ────────────────────────────────────────────────────────────────

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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          Usuarios Registrados ({users.length})
        </h3>
        <button
          onClick={() => setShowNewMember(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/25 transition-all"
        >
          <UserPlus className="w-4 h-4" />Nuevo Socio
        </button>
      </div>

      {showNewMember && <NewMemberModal onClose={() => setShowNewMember(false)} />}
      {editingMember && <EditMemberModal user={editingMember} onClose={() => setEditingMember(null)} />}

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
                    <button
                      onClick={() => setEditingMember(user)}
                      className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                      title="Editar socio / restablecer contraseña"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {/* Custom plan button */}
                    <button
                      onClick={() => onSelectUser(user)}
                      className="p-2 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
                      title="Gestionar plan personalizado"
                    >
                      <UserCog className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectProgress(user)}
                      className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                      title="Ver progreso del usuario"
                    >
                      <ClipboardList className="w-4 h-4" />
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
      mediaUrl: newExForm.mediaUrl ? newExForm.mediaUrl.trim() : "",
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
  const [planError, setPlanError] = useState("");

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
      mediaUrl: newExForm.mediaUrl ? newExForm.mediaUrl.trim() : "",
    });
    setAddingExerciseTo(null);
    setNewExForm({ ...emptyExForm });
  }

  async function handleCreatePlan() {
    const days = parseInt(newPlanDays);
    if (isNaN(days) || days < 1 || days > 7) return;
    const result = await createPlan(days, {});
    if (result.success) { setShowNewPlan(false); setNewPlanDays(""); setExpandedPlan(days); setPlanError(""); }
    else setPlanError(result.error);
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
            <button onClick={() => { setShowNewPlan(false); setPlanError(""); }} className="p-2 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          {planError && <p className="text-red-400 text-xs">{planError}</p>}
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

// ── Billing Tab ──────────────────────────────────────────────────────────────

function BillingTab() {
  const { users, gym, getCurrentMonth, adminToggleMonthly } = useApp();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const currentMonth = getCurrentMonth();

  // Re-read the summary whenever a due gets marked or cleared.
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
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Wallet className="w-5 h-5 text-emerald-400" />
        Cobranzas de {currentMonth}
      </h3>

      {error && <p className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-800/40 border border-slate-700/30 rounded-xl">
          <p className="text-slate-500 text-xs mb-1">Recaudado</p>
          <p className="text-emerald-400 text-xl font-bold">{money(summary?.revenue, currency)}</p>
        </div>
        <div className="p-4 bg-slate-800/40 border border-slate-700/30 rounded-xl">
          <p className="text-slate-500 text-xs mb-1">Socios</p>
          <p className="text-white text-xl font-bold">{summary?.memberCount ?? users.length}</p>
        </div>
        <div className="p-4 bg-slate-800/40 border border-slate-700/30 rounded-xl">
          <p className="text-slate-500 text-xs mb-1">Al día</p>
          <p className="text-cyan-400 text-xl font-bold">{summary?.paidCount ?? 0}</p>
        </div>
        <div className="p-4 bg-slate-800/40 border border-slate-700/30 rounded-xl">
          <p className="text-slate-500 text-xs mb-1">Pendientes</p>
          <p className="text-amber-400 text-xl font-bold">{summary?.unpaidCount ?? pending.length}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />Cuotas pendientes ({pending.length})
        </h4>
        {pending.length === 0 ? (
          <p className="text-slate-500 text-sm py-4">Todos los socios están al día. 🎉</p>
        ) : (
          <div className="space-y-2">
            {pending.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {user.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{user.name}</p>
                    <p className="text-slate-500 text-xs">@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => adminToggleMonthly(user.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium hover:bg-emerald-500/25 transition-all shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />Registrar pago
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {summary?.byMonth?.length > 1 && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />Historial mensual
          </h4>
          <div className="space-y-1.5">
            {summary.byMonth.map((row) => (
              <div key={row.month} className="flex items-center justify-between px-3 py-2 bg-slate-800/30 rounded-lg text-sm">
                <span className="text-slate-400 font-mono text-xs">{row.month}</span>
                <span className="text-emerald-400 font-medium">{money(row.total, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Settings Tab ─────────────────────────────────────────────────────────────

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
    setStatus(result.success ? { ok: true, message: "Cambios guardados." } : { ok: false, message: result.error });
  }

  const field = "w-full px-3 py-2 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40";

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-lg">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Settings className="w-5 h-5 text-emerald-400" />Configuración del gimnasio
      </h3>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Nombre del gimnasio</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">WhatsApp de contacto</label>
        <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="Ej: 3329534029" className={field} />
        <p className="text-slate-600 text-xs mt-1">Los socios usan este número para coordinar pagos desde su panel.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Cuota mensual</label>
          <input type="number" min="0" value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })} className={field} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Suscripción Pro</label>
          <input type="number" min="0" value={form.proPrice} onChange={(e) => setForm({ ...form, proPrice: e.target.value })} className={field} />
        </div>
      </div>

      <div className="p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl">
        <p className="text-slate-500 text-xs mb-1">Identificador para tus socios</p>
        <p className="text-cyan-400 font-mono text-sm">{gym?.slug}</p>
      </div>

      {status && (
        <p className={`px-3 py-2 rounded-lg text-xs border ${status.ok ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
          {status.message}
        </p>
      )}

      <button type="submit" disabled={saving} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
        <Save className="w-4 h-4" />{saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

// ── Main Admin Panel ─────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { logout, gym } = useApp();
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProgressUser, setSelectedProgressUser] = useState(null);

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3 hidden sm:block">
              <h1 className="text-white font-bold text-lg leading-none">Admin Panel</h1>
              <p className="text-slate-400 text-xs">{gym?.name ?? "KineFix"} · Gestión</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-sm">
            <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {!selectedUser && !selectedProgressUser && (
          <div className="flex gap-2 flex-wrap">
            <TabButton active={activeTab === "users"} icon={Users} label="Usuarios" onClick={() => setActiveTab("users")} />
            <TabButton active={activeTab === "billing"} icon={Wallet} label="Cobranzas" onClick={() => setActiveTab("billing")} />
            <TabButton active={activeTab === "plans"} icon={ClipboardList} label="Planes Compartidos" onClick={() => setActiveTab("plans")} />
            <TabButton active={activeTab === "settings"} icon={Settings} label="Configuración" onClick={() => setActiveTab("settings")} />
          </div>
        )}

        <div className="bg-slate-900/50 border border-slate-700/30 rounded-2xl p-5">
          {selectedUser ? (
            <CustomPlanEditor user={selectedUser} onBack={() => setSelectedUser(null)} />
          ) : selectedProgressUser ? (
            <UserProgressView user={selectedProgressUser} onBack={() => setSelectedProgressUser(null)} />
          ) : activeTab === "users" ? (
            <UsersTab onSelectUser={setSelectedUser} onSelectProgress={setSelectedProgressUser} />
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
        <p className="text-xs text-slate-600">© 2026 KineFix · Panel Admin</p>
      </footer>
    </div>
  );
}
