import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, History } from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../Toasts";

const ACTION_LABELS = {
  "socio.alta": "dio de alta a",
  "socio.baja": "dio de baja a",
  "socio.reactivacion": "reactivó a",
  "socio.eliminacion": "eliminó definitivamente a",
  "cuota.registrada": "registró la cuota de",
  "cuota.anulada": "anuló la cuota de",
  "pago.monthly": "cobró la cuota de",
  "pago.pro": "cobró el plan Pro de",
  "contrasena.restablecida": "restableció la contraseña de",
  "gimnasio.configuracion": "cambió la configuración del gimnasio",
};

export default function AuditTab() {
  const toast = useToast();
  const [entries, setEntries] = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .auditLog()
      .then(({ entries: list }) => !cancelled && setEntries(list))
      .catch((err) => !cancelled && toast.error(err.message));
    return () => {
      cancelled = true;
    };
  }, [toast]);

  async function download(which, filename) {
    setDownloading(which);
    try {
      await api.downloadExport(which, filename);
      toast.success("Archivo descargado.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloading(null);
    }
  }

  const stamp = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="section-title flex items-center gap-2 mb-1">
          <FileSpreadsheet className="w-5 h-5 text-ink-soft" />
          Exportar datos
        </h3>
        <p className="text-sm text-ink-soft mb-3">
          Archivos CSV listos para abrir en Excel o pasarle al contador.
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => download("socios", `socios-${stamp}.csv`)}
            disabled={downloading === "socios"}
            className="btn-secondary btn-sm"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading === "socios" ? "Descargando…" : "Socios"}
          </button>
          <button
            onClick={() => download("pagos", `pagos-${stamp}.csv`)}
            disabled={downloading === "pagos"}
            className="btn-secondary btn-sm"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading === "pagos" ? "Descargando…" : "Pagos"}
          </button>
        </div>
      </div>

      <div>
        <h3 className="section-title flex items-center gap-2 mb-1">
          <History className="w-5 h-5 text-ink-soft" />
          Registro de actividad
        </h3>
        <p className="text-sm text-ink-soft mb-3">
          Quién hizo cada movimiento de plata o de datos, por si hay que revisar algo.
        </p>

        {entries === null ? (
          <p className="text-sm text-ink-muted py-3">Cargando…</p>
        ) : entries.length === 0 ? (
          <div className="empty-state">Todavía no hay movimientos registrados.</div>
        ) : (
          <div className="card divide-y divide-line">
            {entries.map((entry, i) => (
              <div key={i} className="px-4 py-2.5 flex items-baseline justify-between gap-3">
                <p className="text-sm text-ink-soft min-w-0">
                  <span className="font-medium text-ink">{entry.actor_name}</span>{" "}
                  {ACTION_LABELS[entry.action] ?? entry.action}
                  {entry.target_name && (
                    <span className="font-medium text-ink"> {entry.target_name}</span>
                  )}
                  {entry.detail && <span className="text-ink-muted"> · {entry.detail}</span>}
                </p>
                <span className="text-xs text-ink-muted shrink-0">
                  {new Date(entry.created_at).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
