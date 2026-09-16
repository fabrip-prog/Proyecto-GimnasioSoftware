import { useCallback, useEffect, useState } from "react";
import { BellRing, MessageCircle, RefreshCw } from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../Toasts";

/**
 * Los recordatorios de cuota se envían desde el WhatsApp del propio gimnasio:
 * el servidor arma el texto y acá sólo se abre la conversación, sin necesidad
 * de contratar un servicio de mensajería.
 */
export default function RemindersPanel() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [sent, setSent] = useState(() => new Set());

  const load = useCallback(async () => {
    try {
      setData(await api.reminders());
    } catch (err) {
      toast.error(err.message);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  function remind(member) {
    const phone = (member.whatsapp ?? "").replace(/\D/g, "");
    if (!phone) {
      toast.error(
        `${member.name} no tiene WhatsApp cargado. Agregalo desde la ficha del socio.`
      );
      return;
    }

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(member.message)}`,
      "_blank"
    );
    setSent((prev) => new Set([...prev, member.id]));
  }

  const members = data?.members ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-ink flex items-center gap-2">
          <BellRing className="w-4 h-4 text-ink-soft" />
          Recordatorios de cuota ({members.length})
        </h4>
        <button onClick={load} className="btn-ghost btn-sm">
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar
        </button>
      </div>

      {data === null ? (
        <p className="text-sm text-ink-muted py-3">Cargando…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-ink-soft py-3">
          No hay cuotas pendientes este mes. Nada que recordar.
        </p>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="card p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="avatar w-9 h-9 text-xs">{member.avatar}</div>
                <div className="min-w-0">
                  <p className="text-ink text-sm font-medium truncate">{member.name}</p>
                  <p className="text-ink-muted text-xs">
                    {member.whatsapp ? member.whatsapp : "Sin WhatsApp cargado"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => remind(member)}
                className={sent.has(member.id) ? "btn-secondary btn-sm shrink-0" : "btn-primary btn-sm shrink-0"}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {sent.has(member.id) ? "Enviado" : "Recordar"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
