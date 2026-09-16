import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Search, Undo2, UserCheck } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { api } from "../../api/client";
import { useToast } from "../Toasts";

export default function AttendanceTab() {
  const { users } = useApp();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      setData(await api.attendanceToday());
    } catch (err) {
      toast.error(err.message);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const presentIds = new Set(data?.present.map((p) => p.userId) ?? []);

  async function toggle(user) {
    setBusy(user.id);
    try {
      if (presentIds.has(user.id)) {
        await api.undoCheckIn(user.id);
      } else {
        await api.checkIn(user.id);
        toast.success(`Entrada registrada: ${user.name}`);
      }
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  const busiest = data?.last30?.slice(0, 7) ?? [];
  const peak = Math.max(1, ...busiest.map((d) => d.total));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="section-title flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-ink-soft" />
          Asistencia de hoy
        </h3>
        <span className="chip-ok">
          <CheckCircle2 className="w-3 h-3" />
          {presentIds.size} {presentIds.size === 1 ? "presente" : "presentes"}
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar socio para registrar la entrada…"
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
            const present = presentIds.has(user.id);
            const entry = data?.present.find((p) => p.userId === user.id);
            const time = entry
              ? new Date(entry.checkedInAt).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;

            return (
              <div
                key={user.id}
                className={`card p-3 flex items-center justify-between gap-3 ${
                  present ? "bg-ok-soft border-ok-line" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="avatar w-9 h-9 text-xs">{user.avatar}</div>
                  <div className="min-w-0">
                    <p className="text-ink text-sm font-medium truncate">{user.name}</p>
                    <p className="text-ink-muted text-xs">
                      {present ? `Entrada ${time}` : `@${user.username}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(user)}
                  disabled={busy === user.id}
                  className={present ? "btn-secondary btn-sm shrink-0" : "btn-primary btn-sm shrink-0"}
                >
                  {present ? (
                    <>
                      <Undo2 className="w-3.5 h-3.5" />
                      Deshacer
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Registrar entrada
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {busiest.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-ink mb-2">Últimos días con actividad</h4>
          <div className="card p-4 space-y-2">
            {busiest.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-xs text-ink-muted font-mono w-24 shrink-0">{day.date}</span>
                <div className="flex-1 h-2 bg-sunken rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full"
                    style={{ width: `${(day.total / peak) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-ink-soft w-8 text-right shrink-0">{day.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
