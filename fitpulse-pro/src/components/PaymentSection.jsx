import { useState } from "react";
import { CheckCircle2, Crown, Calendar, Receipt, Lock, MessageCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function PaymentSection() {
  const { currentUser, pricing, isMonthlyPaid, gym } = useApp();
  const [showHistory, setShowHistory] = useState(false);

  const monthlyPaid = isMonthlyPaid(currentUser.id);
  const proActive = currentUser.proActive;

  const formatPrice = (n) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: gym?.currency ?? "ARS",
      minimumFractionDigits: 0,
    }).format(n ?? 0);

  function handleWhatsApp(type) {
    const text =
      type === "monthly"
        ? `Hola! Soy ${currentUser.name} (${currentUser.username}). Quiero coordinar el pago de mi cuota mensual del gimnasio.`
        : `Hola! Soy ${currentUser.name} (${currentUser.username}). Quiero activar la suscripción Pro.`;

    const phone = (gym?.whatsapp ?? "").replace(/\D/g, "");
    if (!phone) {
      alert("El gimnasio todavía no cargó un número de WhatsApp de contacto.");
      return;
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  }

  const currentMonth = new Date().toLocaleString("es-AR", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Cuota mensual */}
        <div className="card p-4">
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-ink-muted" />
              <span className="text-sm font-medium text-ink">Cuota mensual</span>
            </div>
            {monthlyPaid ? (
              <span className="chip-ok">
                <CheckCircle2 className="w-3 h-3" />
                Al día
              </span>
            ) : (
              <span className="chip-warn">Pendiente</span>
            )}
          </div>

          <p className="text-xs text-ink-muted capitalize">{currentMonth}</p>

          {monthlyPaid ? (
            <p className="text-sm text-ink-soft mt-2">Pagada el {currentUser.monthlyPaidDate}</p>
          ) : (
            <div className="flex items-center justify-between mt-3 gap-2">
              <span className="text-lg font-semibold text-ink">{formatPrice(pricing.monthly)}</span>
              <button onClick={() => handleWhatsApp("monthly")} className="btn-primary btn-sm">
                <MessageCircle className="w-3.5 h-3.5" />
                Coordinar pago
              </button>
            </div>
          )}
        </div>

        {/* Suscripción Pro */}
        <div className="card p-4">
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-ink-muted" />
              <span className="text-sm font-medium text-ink">Suscripción Pro</span>
            </div>
            {proActive ? (
              <span className="chip-pro">
                <Crown className="w-3 h-3" />
                Activa
              </span>
            ) : (
              <span className="chip-neutral">
                <Lock className="w-3 h-3" />
                Inactiva
              </span>
            )}
          </div>

          <p className="text-xs text-ink-muted">Plan personalizado del coach</p>

          {proActive ? (
            <p className="text-sm text-ink-soft mt-2">Activa desde {currentUser.proPaidDate}</p>
          ) : (
            <div className="flex items-center justify-between mt-3 gap-2">
              <span className="text-lg font-semibold text-ink">{formatPrice(pricing.pro)}</span>
              <button onClick={() => handleWhatsApp("pro")} className="btn-secondary btn-sm">
                <MessageCircle className="w-3.5 h-3.5" />
                Consultar
              </button>
            </div>
          )}
        </div>
      </div>

      {currentUser.paymentHistory?.length > 0 && (
        <div>
          <button onClick={() => setShowHistory(!showHistory)} className="btn-ghost btn-sm -ml-3">
            <Receipt className="w-3.5 h-3.5" />
            {showHistory ? "Ocultar" : "Ver"} historial de pagos (
            {currentUser.paymentHistory.length})
          </button>

          {showHistory && (
            <div className="mt-2 card divide-y divide-line">
              {currentUser.paymentHistory.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {p.type === "monthly" ? (
                      <Calendar className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                    ) : (
                      <Crown className="w-3.5 h-3.5 text-pro shrink-0" />
                    )}
                    <span className="text-sm text-ink truncate">{p.label}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-ink-muted">{p.date}</span>
                    <span className="text-sm font-medium text-ink">{formatPrice(p.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
