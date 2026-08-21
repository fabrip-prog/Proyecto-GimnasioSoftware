import { useState } from "react";
import {
  Eye,
  EyeOff,
  Dumbbell,
  Zap,
  UserCheck,
  UserPlus,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const QUICK_ACCOUNTS = [
  { username: "user2dias", password: "1234", label: "Martín López — 2 días/semana" },
  { username: "user3dias", password: "1234", label: "Lucía Fernández — 3 días/semana" },
  { username: "user5dias", password: "1234", label: "Diego Ramírez — 5 días/semana" },
  { username: "admin", password: "admin123", label: "🛡️ Administrador (Panel de gestión)" },
];

export default function LoginPage() {
  const { login, register, availablePlanDays } = useApp();
  const [view, setView] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Register fields
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPlanDays, setRegPlanDays] = useState(availablePlanDays[0] || 2);
  const [showRegPassword, setShowRegPassword] = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const result = login(username, password);
      if (!result.success) {
        setError("Usuario o contraseña incorrectos. Inténtalo de nuevo.");
      }
      setLoading(false);
    }, 500);
  }

  function handleRegister(e) {
    e.preventDefault();
    setError("");
    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (regPassword.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = register(regName.trim(), regUsername.trim(), regPassword, regPlanDays);
      if (result.success) {
        setUsername(result.user.username);
        setPassword(regPassword);
        setView("login");
        setError("");
        setRegName("");
        setRegUsername("");
        setRegPassword("");
        // Auto-login the new user
        login(result.user.username, regPassword);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 500);
  }

  function quickFill(u) {
    setUsername(u.username);
    setPassword(u.password);
    setError("");
  }

  function switchToRegister() {
    setView("register");
    setError("");
  }

  function switchToLogin() {
    setView("login");
    setError("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 mb-4 shadow-lg shadow-emerald-500/25">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            FitPulse <span className="text-emerald-400">Pro</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Tu plataforma de entrenamiento inteligente
          </p>
        </div>

        {/* ─── Login View ─── */}
        {view === "login" && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/30">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Iniciar Sesión</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  placeholder="Ingresa tu usuario"
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Ingresa tu contraseña"
                    className="w-full px-4 py-3 pr-12 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Accediendo…
                  </span>
                ) : (
                  "Acceder"
                )}
              </button>
            </form>

            {/* Register link */}
            <button
              onClick={switchToRegister}
              className="w-full mt-4 py-2.5 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              ¿No tenés cuenta? Registrate aquí
            </button>

            {/* Quick Access */}
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                Acceso rápido (cuentas de prueba)
              </p>
              <div className="space-y-2">
                {QUICK_ACCOUNTS.map((u) => (
                  <button
                    key={u.username}
                    type="button"
                    onClick={() => quickFill(u)}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 rounded-lg text-sm text-slate-300 hover:text-white transition-all group"
                  >
                    <span className="truncate">{u.label}</span>
                    <span className="text-xs text-emerald-400/70 group-hover:text-emerald-400 font-mono shrink-0 ml-2">
                      {u.username}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Register View ─── */}
        {view === "register" && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/30">
            <button
              onClick={switchToLogin}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al login
            </button>

            <div className="flex items-center gap-2 mb-6">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Crear Cuenta</h2>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => { setRegName(e.target.value); setError(""); }}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => { setRegUsername(e.target.value.toLowerCase().replace(/\s/g, "")); setError(""); }}
                  placeholder="Ej: juanperez"
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => { setRegPassword(e.target.value); setError(""); }}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full px-4 py-3 pr-12 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Plan de entrenamiento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availablePlanDays.sort((a, b) => a - b).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setRegPlanDays(d)}
                      className={`py-3 px-2 rounded-xl border text-center transition-all ${
                        regPlanDays === d
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                          : "bg-slate-800/50 border-slate-700/30 text-slate-400 hover:border-slate-600/50"
                      }`}
                    >
                      <span className="text-lg font-bold block">{d}</span>
                      <span className="text-xs">días/sem</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !regName || !regUsername || !regPassword}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creando cuenta…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Crear Cuenta y Acceder
                  </span>
                )}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 FitPulse Pro. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
