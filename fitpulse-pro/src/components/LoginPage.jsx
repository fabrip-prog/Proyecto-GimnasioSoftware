import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Dumbbell,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";

const DEMO_ACCOUNTS = [
  { username: "admin", password: "admin1234", label: "Administrador", role: "Panel de gestión" },
  { username: "user2dias", password: "demo1234", label: "Martín López", role: "2 días/semana" },
  { username: "user3dias", password: "demo1234", label: "Lucía Fernández", role: "3 días/semana" },
  { username: "user5dias", password: "demo1234", label: "Diego Ramírez", role: "5 días/semana" },
];

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="alert-danger">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input pr-11"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-soft transition-colors"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function LoginPage() {
  const { login, register, registerGym } = useApp();

  const [view, setView] = useState("login");
  const [gyms, setGyms] = useState([]);
  const [gymSlug, setGymSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [resetUsername, setResetUsername] = useState("");
  const [resetResult, setResetResult] = useState(null);

  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [gymForm, setGymForm] = useState({
    gymName: "",
    ownerName: "",
    username: "",
    password: "",
    whatsapp: "",
    monthlyPrice: "15000",
    proPrice: "8000",
  });

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
    setResetResult(null);
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

  async function handlePasswordRequest(e) {
    e.preventDefault();
    setError("");

    if (!gymSlug || !resetUsername.trim()) {
      return setError("Elegí tu gimnasio y escribí tu usuario.");
    }

    setLoading(true);
    try {
      setResetResult(await api.requestPasswordReset(gymSlug, resetUsername.trim()));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const gymSelector = (
    <div>
      <label className="label">Gimnasio</label>
      {gyms.length === 0 ? (
        <p className="text-sm text-ink-muted px-3.5 py-2.5 bg-sunken border border-line rounded-lg">
          Todavía no hay gimnasios registrados.
        </p>
      ) : (
        <select
          value={gymSlug}
          onChange={(e) => {
            setGymSlug(e.target.value);
            setError("");
          }}
          className="input"
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand mb-4">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">KineFix</h1>
          <p className="text-ink-soft text-sm mt-1.5">Gestión de socios y entrenamiento</p>
        </div>

        {/* ─── Iniciar sesión ─── */}
        {view === "login" && (
          <div className="card p-6">
            <h2 className="section-title mb-5">Iniciar sesión</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              {gymSelector}

              <div>
                <label className="label">Usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="Tu nombre de usuario"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Contraseña</label>
                <PasswordInput
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Tu contraseña"
                />
              </div>

              <ErrorBanner message={error} />

              <button
                type="submit"
                disabled={loading || !gymSlug || !username || !password}
                className="btn-primary w-full"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Accediendo…" : "Acceder"}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-line space-y-2">
              <button onClick={() => switchView("reset")} className="btn-ghost w-full">
                <KeyRound className="w-4 h-4" />
                Olvidé mi contraseña
              </button>
              <button onClick={() => switchView("register")} className="btn-ghost w-full">
                <UserPlus className="w-4 h-4" />
                Crear cuenta de socio
              </button>
              <button onClick={() => switchView("gym")} className="btn-ghost w-full">
                <Building2 className="w-4 h-4" />
                Registrá tu gimnasio
              </button>
            </div>

            {gymSlug === "demo" && (
              <div className="mt-5 pt-5 border-t border-line">
                <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-3">
                  Cuentas de prueba
                </p>
                <div className="space-y-1.5">
                  {DEMO_ACCOUNTS.map((account) => (
                    <button
                      key={account.username}
                      type="button"
                      onClick={() => {
                        setUsername(account.username);
                        setPassword(account.password);
                        setError("");
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-line hover:border-line-strong hover:bg-sunken transition-colors text-left cursor-pointer"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm text-ink truncate">{account.label}</span>
                        <span className="block text-xs text-ink-muted">{account.role}</span>
                      </span>
                      <span className="text-xs font-mono text-ink-muted shrink-0 ml-2">
                        {account.username}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Alta de socio ─── */}
        {view === "register" && (
          <div className="card p-6">
            <button onClick={() => switchView("login")} className="btn-ghost btn-sm -ml-3 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>

            <h2 className="section-title mb-5">Crear cuenta</h2>

            <form onSubmit={handleRegister} className="space-y-4">
              {gymSelector}

              <div>
                <label className="label">Nombre completo</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    setError("");
                  }}
                  placeholder="Ej: Juan Pérez"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Nombre de usuario</label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => {
                    setRegUsername(e.target.value.toLowerCase().replace(/\s/g, ""));
                    setError("");
                  }}
                  placeholder="Ej: juanperez"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Contraseña</label>
                <PasswordInput
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <ErrorBanner message={error} />

              <button
                type="submit"
                disabled={loading || !regName || !regUsername || !regPassword}
                className="btn-primary w-full"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Creando cuenta…" : "Crear cuenta y acceder"}
              </button>
            </form>
          </div>
        )}

        {/* ─── Olvidé mi contraseña ─── */}
        {view === "reset" && (
          <div className="card p-6">
            <button onClick={() => switchView("login")} className="btn-ghost btn-sm -ml-3 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>

            <h2 className="section-title">Olvidé mi contraseña</h2>

            {resetResult ? (
              <div className="mt-4 space-y-4">
                <div className="alert-ok">
                  <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{resetResult.message}</span>
                </div>

                {resetResult.whatsapp && (
                  <button
                    onClick={() =>
                      window.open(
                        `https://wa.me/${resetResult.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Hola! Soy ${resetUsername} y necesito restablecer la contraseña de mi cuenta.`
                        )}`,
                        "_blank"
                      )
                    }
                    className="btn-primary w-full"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Avisar a {resetResult.gymName} por WhatsApp
                  </button>
                )}

                <button onClick={() => switchView("login")} className="btn-secondary w-full">
                  Volver al inicio de sesión
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-ink-soft mt-1.5 mb-5">
                  Dejale el pedido a tu gimnasio. Te van a generar una contraseña provisoria y te la
                  van a pasar.
                </p>

                <form onSubmit={handlePasswordRequest} className="space-y-4">
                  {gymSelector}

                  <div>
                    <label className="label">Tu nombre de usuario</label>
                    <input
                      type="text"
                      value={resetUsername}
                      onChange={(e) => {
                        setResetUsername(e.target.value.toLowerCase().replace(/\s/g, ""));
                        setError("");
                      }}
                      placeholder="Ej: juanperez"
                      className="input"
                    />
                  </div>

                  <ErrorBanner message={error} />

                  <button
                    type="submit"
                    disabled={loading || !gymSlug || !resetUsername}
                    className="btn-primary w-full"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? "Enviando…" : "Enviar pedido"}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* ─── Alta de gimnasio ─── */}
        {view === "gym" && (
          <div className="card p-6">
            <button onClick={() => switchView("login")} className="btn-ghost btn-sm -ml-3 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>

            <h2 className="section-title">Registrá tu gimnasio</h2>
            <p className="text-sm text-ink-soft mt-1.5 mb-5">
              Creás tu espacio propio con tus socios, tus rutinas y tus cuotas. Arrancás con los
              planes de 2, 3 y 5 días ya cargados.
            </p>

            <form onSubmit={handleGymRegister} className="space-y-4">
              <div>
                <label className="label">Nombre del gimnasio</label>
                <input
                  type="text"
                  value={gymForm.gymName}
                  onChange={(e) => {
                    setGymForm({ ...gymForm, gymName: e.target.value });
                    setError("");
                  }}
                  placeholder="Ej: Olimpo Fitness"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Responsable</label>
                <input
                  type="text"
                  value={gymForm.ownerName}
                  onChange={(e) => {
                    setGymForm({ ...gymForm, ownerName: e.target.value });
                    setError("");
                  }}
                  placeholder="Ej: Ana Gómez"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Usuario de administrador</label>
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
                  className="input"
                />
              </div>

              <div>
                <label className="label">Contraseña</label>
                <PasswordInput
                  value={gymForm.password}
                  onChange={(e) => {
                    setGymForm({ ...gymForm, password: e.target.value });
                    setError("");
                  }}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div>
                <label className="label">WhatsApp de contacto</label>
                <input
                  type="text"
                  value={gymForm.whatsapp}
                  onChange={(e) => setGymForm({ ...gymForm, whatsapp: e.target.value })}
                  placeholder="Ej: 3329534029"
                  className="input"
                />
                <p className="hint">Tus socios lo usan para coordinar el pago de la cuota.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Cuota mensual</label>
                  <input
                    type="number"
                    min="0"
                    value={gymForm.monthlyPrice}
                    onChange={(e) => setGymForm({ ...gymForm, monthlyPrice: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Plan Pro</label>
                  <input
                    type="number"
                    min="0"
                    value={gymForm.proPrice}
                    onChange={(e) => setGymForm({ ...gymForm, proPrice: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <ErrorBanner message={error} />

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Creando gimnasio…" : "Crear gimnasio"}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-ink-muted text-xs mt-6">© 2026 KineFix</p>
      </div>
    </div>
  );
}
