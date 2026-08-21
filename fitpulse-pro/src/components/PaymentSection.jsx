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
  const { currentUser, pricing, payMonthly, payPro, isMonthlyPaid } = useApp();
  const [showPayModal, setShowPayModal] = useState(null); // "monthly" | "pro" | null
  const [processing, setProcessing] = useState(false);
  const [justPaid, setJustPaid] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const monthlyPaid = isMonthlyPaid(currentUser.id);
  const proActive = currentUser.proActive;

  function handlePay(type) {
    setProcessing(true);
    setTimeout(() => {
      if (type === "monthly") {
        payMonthly(currentUser.id);
      } else {
        payPro(currentUser.id);
      }
      setProcessing(false);
      setShowPayModal(null);
      setJustPaid(type);
      setTimeout(() => setJustPaid(null), 3000);
    }, 1500);
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
                onClick={() => setShowPayModal("monthly")}
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
                onClick={() => setShowPayModal("pro")}
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

      {/* Payment modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {showPayModal === "monthly" ? (
                  <>
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    Pagar Cuota Mensual
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5 text-violet-400" />
                    Suscripción Pro
                  </>
                )}
              </h3>
              <button
                onClick={() => setShowPayModal(null)}
                className="p-1 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-800/60 border border-slate-700/30 rounded-xl mb-5">
              <p className="text-sm text-slate-400 mb-1">
                {showPayModal === "monthly"
                  ? "Membresía del gimnasio — " + currentMonth
                  : "Acceso a tu plan personalizado del coach"}
              </p>
              <p className="text-3xl font-bold text-white">
                {formatPrice(
                  showPayModal === "monthly" ? pricing.monthly : pricing.pro
                )}
              </p>
            </div>

            {/* Mock card form */}
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Número de tarjeta</label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-800/80 border border-slate-600/40 rounded-lg">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-400 font-mono">•••• •••• •••• 4242</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Vencimiento</label>
                  <div className="px-3 py-2.5 bg-slate-800/80 border border-slate-600/40 rounded-lg">
                    <span className="text-sm text-slate-400 font-mono">12/28</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">CVV</label>
                  <div className="px-3 py-2.5 bg-slate-800/80 border border-slate-600/40 rounded-lg">
                    <span className="text-sm text-slate-400 font-mono">•••</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 text-center">
                Demo — No se realizan cargos reales
              </p>
            </div>

            <button
              onClick={() => handlePay(showPayModal)}
              disabled={processing}
              className={`w-full py-3 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 ${
                showPayModal === "monthly"
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-emerald-500/20"
                  : "bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-violet-500/20"
              }`}
            >
              {processing ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Procesando pago…
                </>
              ) : (
                <>
                  Confirmar Pago
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
