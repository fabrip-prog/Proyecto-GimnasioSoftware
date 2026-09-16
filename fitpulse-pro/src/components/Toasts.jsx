import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

const ToastContext = createContext(null);

let nextId = 1;

/**
 * Avisos efímeros. Existen porque antes las acciones que fallaban (marcar una
 * cuota, borrar un socio) no mostraban nada: el dueño creía que había guardado.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, tone = "error") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, tone }]);
    return id;
  }, []);

  const value = {
    error: useCallback((message) => push(message, "error"), [push]),
    success: useCallback((message) => push(message, "success"), [push]),
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[min(24rem,calc(100vw-2rem))]">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, toast.tone === "error" ? 7000 : 4000);
    return () => clearTimeout(timer);
  }, [onDismiss, toast.tone]);

  const isError = toast.tone === "error";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-2.5 px-4 py-3 rounded-lg border shadow-lg ${
        isError
          ? "bg-danger-soft border-danger-line text-danger"
          : "bg-ok-soft border-ok-line text-ok"
      }`}
    >
      {isError ? (
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      ) : (
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
      )}
      <p className="text-sm flex-1">{toast.message}</p>
      <button onClick={onDismiss} aria-label="Cerrar aviso" className="shrink-0 opacity-60 hover:opacity-100 cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
