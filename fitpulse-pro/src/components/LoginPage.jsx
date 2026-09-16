import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Dumbbell,
  Eye,
  EyeOff,
  UserCheck,
  UserPlus,
  Zap,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";

const DEMO_ACCOUNTS = [
  { username: "admin", password: "admin1234", label: "🛡️ Administrador (Panel de gestión)" },
  { username: "user2dias", password: "demo1234", label: "Martín López — 2 días/semana" },
  { username: "user3dias", password: "demo1234", label: "Lucía Fernández — 3 días/semana" },
  { username: "user5dias", password: "demo1234", label: "Diego Ramírez — 5 días/semana" },
];

const inputClass =
  "w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all";

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </div>
  );
}

function Spinner({ label }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label}
    </span>
  );
}

const submitClass =
  "w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/20";

export default function LoginPage() {
  const { login, register, registerGym } = useApp();

  const [view, setView] = useState("login");
  const [gyms, setGyms] = useState([]);
  const [gymSlug, setGymSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [gymForm, setGymForm] = useState({
    gymName: "",
    ownerName: "",
    username: "",
    password: "",
    whatsapp: "",
    monthlyPrice: "15000",
    proPrice: "8000",
  });
  const [showGymPassword, setShowGymPassword] = useState(false);

  useEffect(() => {
    api
      .listGyms()
      .then(({ gyms: list }) => {
        setGyms(list);
        setGymSlug((current) => current || list[0]?.slug || "");
      })
      .catch(() => setError("No se pudo conectar con el servidor."));
  }, []);

  function switchView(next) {
    setView(next);
    setError("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(gymSlug, username.trim(), password);
    if (!result.success) setError(result.error);
    setLoading(false);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (!gymSlug) return setError("Elegí tu gimnasio.");
    if (!regName.trim() || !regUsername.trim() || !regPassword) {
      return setError("Todos los campos son obligatorios.");
    }
    if (regPassword.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres.");
    }

    setLoading(true);
    const result = await register(gymSlug, regName.trim(), regUsername.trim(), regPassword);
    if (!result.success) setError(result.error);
    setLoading(false);
  }

  async function handleGymRegister(e) {
    e.preventDefault();
    setError("");

    if (!gymForm.gymName.trim() || !gymForm.ownerName.trim() || !gymForm.username.trim()) {
      return setError("Completá el nombre del gimnasio, el responsable y el usuario.");
    }
    if (gymForm.password.length < 8) {
      return setError("La contraseña de administrador debe tener al menos 8 caracteres.");
    }

    setLoading(true);
    const result = await registerGym({
      ...gymForm,
      monthlyPrice: Number(gymForm.monthlyPrice) || 0,
      proPrice: Number(gymForm.proPrice) || 0,
    });
    if (!result.success) setError(result.error);
    setLoading(false);
  }

  function quickFill(account) {
    setUsername(account.username);
    setPassword(account.password);
    setError("");
  }

  const gymSelector = (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">Gimnasio</label>
      {gyms.length === 0 ? (
        <p className="text-sm text-slate-500 px-4 py-3 bg-slate-800/50 border border-slate-700/40 rounded-xl">
          Todavía no hay gimnasios registrados en esta instalación.
        </p>
      ) : (
        <select
          value={gymSlug}
          onChange={(e) => {
            setGymSlug(e.target.value);
            setError("");
          }}
          className={inputClass}
        >
          {gyms.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a] relative overflow-hidden py-10">
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 mb-4 shadow-lg shadow-emerald-500/25">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">KineFix</h1>
          <p className="text-slate-400 mt-1 text-sm">Tu plataforma de entrenamiento inteligente</p>
        </div>

        {view === "login" && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/30">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Iniciar Sesión</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {gymSelector}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="Ingresa tu usuario"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Ingresa tu contraseña"
                    className={`${inputClass} pr-12`}
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

              <ErrorBanner message={error} />

              <button
                type="submit"
                disabled={loading || !gymSlug || !username || !password}
                className={submitClass}
              >
                {loading ? <Spinner label="Accediendo…" /> : "Acceder"}
              </button>
            </form>

            <button
              onClick={() => switchView("register")}
              className="w-full mt-4 py-2.5 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              ¿No tenés cuenta? Registrate aquí
            </button>

            <button
              onClick={() => switchView("gym")}
              className="w-full py-2.5 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <Building2 className="w-4 h-4" />
              Registrá tu gimnasio
            </button>

            {gymSlug === "demo" && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  Acceso rápido (cuentas de prueba)
                </p>
                <div className="space-y-2">
                  {DEMO_ACCOUNTS.map((account) => (
                    <button
                      key={account.username}
                      type="button"
                      onClick={() => quickFill(account)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 rounded-lg text-sm text-slate-300 hover:text-white transition-all group"
                    >
                      <span className="truncate">{account.label}</span>
                      <span className="text-xs text-emerald-400/70 group-hover:text-emerald-400 font-mono shrink-0 ml-2">
                        {account.username}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === "register" && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/30">
            <button
              onClick={() => switchView("login")}
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
              {gymSelector}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    setError("");
                  }}
                  placeholder="Ej: Juan Pérez"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => {
                    setRegUsername(e.target.value.toLowerCase().replace(/\s/g, ""));
                    setError("");
                  }}
                  placeholder="Ej: juanperez"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Mínimo 6 caracteres"
                    className={`${inputClass} pr-12`}
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

              <ErrorBanner message={error} />

              <button
                type="submit"
                disabled={loading || !regName || !regUsername || !regPassword}
                className={submitClass}
              >
                {loading ? (
                  <Spinner label="Creando cuenta…" />
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

        {view === "gym" && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/30">
            <button
              onClick={() => switchView("login")}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al login
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Registrá tu gimnasio</h2>
            </div>
            <p className="text-slate-400 text-xs mb-6">
              Creás tu espacio propio con tus socios, tus rutinas y tus cuotas. Arrancás con los
              planes de 2, 3 y 5 días ya cargados.
            </p>

            <form onSubmit={handleGymRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre del gimnasio
                </label>
                <input
                  type="text"
                  value={gymForm.gymName}
                  onChange={(e) => {
                    setGymForm({ ...gymForm, gymName: e.target.value });
                    setError("");
                  }}
                  placeholder="Ej: Olimpo Fitness"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Responsable
                </label>
                <input
                  type="text"
                  value={gymForm.ownerName}
                  onChange={(e) => {
                    setGymForm({ ...gymForm, ownerName: e.target.value });
                    setError("");
                  }}
                  placeholder="Ej: Ana Gómez"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Usuario de administrador
                </label>
                <input
                  type="text"
                  value={gymForm.username}
                  onChange={(e) => {
                    setGymForm({
                      ...gymForm,
                      username: e.target.value.toLowerCase().replace(/\s/g, ""),
                    });
                    setError("");
                  }}
                  placeholder="Ej: anagomez"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showGymPassword ? "text" : "password"}
                    value={gymForm.password}
                    onChange={(e) => {
                      setGymForm({ ...gymForm, password: e.target.value });
                      setError("");
                    }}
                    placeholder="Mínimo 8 caracteres"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowGymPassword(!showGymPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showGymPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  WhatsApp de contacto
                </label>
                <input
                  type="text"
                  value={gymForm.whatsapp}
                  onChange={(e) => setGymForm({ ...gymForm, whatsapp: e.target.value })}
                  placeholder="Ej: 3329534029"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cuota mensual
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={gymForm.monthlyPrice}
                    onChange={(e) => setGymForm({ ...gymForm, monthlyPrice: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Plan Pro
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={gymForm.proPrice}
                    onChange={(e) => setGymForm({ ...gymForm, proPrice: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <ErrorBanner message={error} />

              <button type="submit" disabled={loading} className={submitClass}>
                {loading ? (
                  <Spinner label="Creando gimnasio…" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Crear gimnasio
                  </span>
                )}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 KineFix. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
