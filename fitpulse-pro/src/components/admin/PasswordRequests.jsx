import { useCallback, useEffect, useState } from "react";
import { Copy, KeyRound, MessageCircle, X } from "lucide-react";
import { api } from "../../api/client";
import { useApp } from "../../context/AppContext";
import { useToast } from "../Toasts";

/**
 * Pedidos de "olvidé mi contraseña". Como el sistema no manda correo, el dueño
 * genera una clave temporal y se la pasa al socio por WhatsApp.
 */
export default function PasswordRequests({ onCountChange }) {
  const { users } = useApp();
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [issued, setIssued] = useState(null);

  const load = useCallback(async () => {
    try {
      const { requests: list } = await api.passwordRequests();
      setRequests(list);
      onCountChange?.(list.length);
    } catch {
      // El panel puede seguir funcionando sin esta sección.
    }
  }, [onCountChange]);

  useEffect(() => {
    load();
  }, [load]);

  async function resolve(request) {
    try {
      const result = await api.resolvePasswordRequest(request.id);
      setIssued({ ...result, name: request.name, userId: request.userId });
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function dismiss(request) {
    try {
      await api.dismissPasswordRequest(request.id);
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function copy(text) {
    navigator.clipboard
      ?.writeText(text)
      .then(() => toast.success("Contraseña copiada."))
      .catch(() => toast.error("No se pudo copiar. Anotala a mano."));
  }

  function sendByWhatsApp() {
    const member = users.find((u) => u.id === issued.userId);
    const phone = (member?.whatsapp ?? "").replace(/\D/g, "");
    const text = `Hola ${issued.name.split(" ")[0]}! Tu nueva contraseña provisoria es: ${issued.password} — Podés cambiarla desde "Mi perfil".`;

    if (!phone) {
      copy(text);
      toast.error("El socio no tiene WhatsApp cargado. Se copió el mensaje al portapapeles.");
      return;
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  }

  if (requests.length === 0 && !issued) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-ink flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-ink-soft" />
        Pedidos de contraseña ({requests.length})
      </h4>

      {issued && (
        <div className="alert-ok flex-col items-stretch gap-3">
          <div>
            <p className="font-semibold">Contraseña provisoria para {issued.name}</p>
            <p className="text-2xl font-mono mt-2 tracking-wide">{issued.password}</p>
            <p className="text-xs mt-1 opacity-90">{issued.message}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={sendByWhatsApp} className="btn-primary btn-sm">
              <MessageCircle className="w-3.5 h-3.5" />
              Enviar por WhatsApp
            </button>
            <button onClick={() => copy(issued.password)} className="btn-secondary btn-sm">
              <Copy className="w-3.5 h-3.5" />
              Copiar
            </button>
            <button onClick={() => setIssued(null)} className="btn-ghost btn-sm">
              Listo
            </button>
          </div>
        </div>
      )}

      {requests.map((request) => (
        <div key={request.id} className="card p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-ink text-sm font-medium truncate">{request.name}</p>
            <p className="text-ink-muted text-xs">
              @{request.username} · pedido el{" "}
              {new Date(request.createdAt).toLocaleDateString("es-AR")}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => resolve(request)} className="btn-primary btn-sm">
              <KeyRound className="w-3.5 h-3.5" />
              Generar clave
            </button>
            <button
              onClick={() => dismiss(request)}
              className="btn-icon"
              title="Descartar el pedido"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
