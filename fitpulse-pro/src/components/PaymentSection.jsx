import { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Crown,
  Calendar,
  Receipt,
  Sparkles,
  Lock,
  X,
  ArrowRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";

function formatPrice(n) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function PaymentSection() {
  const { currentUser, pricing, isMonthlyPaid } = useApp();
  const [justPaid, setJustPaid] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const monthlyPaid = isMonthlyPaid(currentUser.id);
  const proActive = currentUser.proActive;

  function handleWhatsApp(type) {
    const text = type === "monthly" 
      ? `Hola! Soy ${currentUser.name} (${currentUser.username}). Quiero coordinar el pago de mi cuota mensual del gimnasio.` 
      : `Hola! Soy ${currentUser.name} (${currentUser.username}). Quiero activar la suscripción Pro.`;
    const url = `https://wa.me/3329534029?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  const currentMonth = new Date().toLocaleString("es-AR", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* Success notification */}
      {justPaid && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-xl rounded-xl shadow-2xl animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm text-emerald-300 font-medium">
            {justPaid === "monthly"
              ? "¡Cuota mensual pagada exitosamente!"
              : "¡Suscripción Pro activada exitosamente!"}
          </span>
        </div>
      )}

      {/* Payment cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Monthly card */}
        <div
          className={`relative p-4 rounded-xl border transition-all ${
            monthlyPaid
              ? "bg-emerald-500/5 border-emerald-500/25"
              : "bg-amber-500/5 border-amber-500/30"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-white">Cuota Mensual</span>
            </div>
            {monthlyPaid ? (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Al día
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded-full border border-amber-500/20">
                Pendiente
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 mb-1 capitalize">{currentMonth}</p>

          {monthlyPaid ? (
            <p className="text-xs text-slate-500">
              Pagado el {currentUser.monthlyPaidDate}
            </p>
          ) : (
            <div className="flex items-center justify-between mt-3">
              <span className="text-lg font-bold text-white">
                {formatPrice(pricing.monthly)}
              </span>
              <button
                onClick={() => handleWhatsApp("monthly")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Pagar
              </button>
            </div>
          )}
        </div>

        {/* Pro subscription card */}
        <div
          className={`relative p-4 rounded-xl border transition-all ${
            proActive
              ? "bg-violet-500/5 border-violet-500/25"
              : "bg-slate-800/40 border-slate-700/30"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white">Suscripción Pro</span>
            </div>
            {proActive ? (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-violet-500/15 text-violet-400 rounded-full border border-violet-500/20">
                <Sparkles className="w-3 h-3" />
                Activa
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded-full border border-slate-600/20">
                <Lock className="w-3 h-3" />
                Inactiva
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 mb-1">Plan personalizado del coach</p>

          {proActive ? (
            <p className="text-xs text-slate-500">
              Activa desde {currentUser.proPaidDate}
            </p>
          ) : (
            <div className="flex items-center justify-between mt-3">
              <span className="text-lg font-bold text-white">
                {formatPrice(pricing.pro)}
              </span>
              <button
                onClick={() => handleWhatsApp("pro")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-medium rounded-lg hover:from-violet-600 hover:to-fuchsia-600 transition-all"
              >
                <Crown className="w-3.5 h-3.5" />
                Suscribirse
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment history toggle */}
      {currentUser.paymentHistory && currentUser.paymentHistory.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            {showHistory ? "Ocultar" : "Ver"} historial de pagos ({currentUser.paymentHistory.length})
          </button>

          {showHistory && (
            <div className="mt-2 space-y-1.5">
              {currentUser.paymentHistory.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2 bg-slate-800/30 border border-slate-700/20 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {p.type === "monthly" ? (
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Crown className="w-3.5 h-3.5 text-violet-500" />
                    )}
                    <span className="text-xs text-slate-300">{p.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{p.date}</span>
                    <span className="text-xs font-medium text-white">
                      {formatPrice(p.amount)}
                    </span>
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
