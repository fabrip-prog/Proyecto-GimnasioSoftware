import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Base de diálogo: cierra con Escape, devuelve el foco al elemento que lo
 * abrió y lo mantiene adentro mientras está abierto. El `confirm()` nativo del
 * navegador no hacía nada de esto y encima se ve como un cartel de sistema.
 */
export function Modal({ title, onClose, children, size = "max-w-md", labelledBy }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;

    const panel = panelRef.current;
    const focusable = panel?.querySelector(
      'input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panel) return;

      const items = [
        ...panel.querySelectorAll(
          'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        ),
      ];
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`modal-panel ${size}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-5 gap-3">
            <h2 id={labelledBy} className="section-title">
              {title}
            </h2>
            <button onClick={onClose} className="btn-icon" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ── Confirmación ────────────────────────────────────────────────────────────

const ConfirmContext = createContext(null);

/**
 * Reemplazo de `window.confirm` que devuelve una promesa, para poder escribir
 * `if (await confirm({...}))` igual que antes pero con un diálogo propio.
 */
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((options) => {
    setRequest(typeof options === "string" ? { message: options } : options);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = useCallback((result) => {
    resolver.current?.(result);
    resolver.current = null;
    setRequest(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && (
        <Modal
          onClose={() => settle(false)}
          labelledBy="confirm-title"
          size="max-w-sm"
        >
          <div className="flex gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                request.danger ? "bg-danger-soft text-danger" : "bg-brand-soft text-brand"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 id="confirm-title" className="section-title">
                {request.title ?? "¿Confirmás la acción?"}
              </h2>
              {request.message && (
                <p className="text-sm text-ink-soft mt-1.5">{request.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-6">
            <button onClick={() => settle(false)} className="btn-secondary">
              {request.cancelLabel ?? "Cancelar"}
            </button>
            <button
              onClick={() => settle(true)}
              className={request.danger ? "btn-danger" : "btn-primary"}
            >
              {request.confirmLabel ?? "Confirmar"}
            </button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
