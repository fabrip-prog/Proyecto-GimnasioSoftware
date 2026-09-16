import { AppProvider, useApp } from "./context/AppContext";
import { ToastProvider } from "./components/Toasts";
import { ConfirmProvider } from "./components/Dialog";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";

function AppRouter() {
  const { currentUser, isAdmin, booting } = useApp();

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-brand" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-ink-soft text-sm">Cargando tu gimnasio…</p>
        </div>
      </div>
    );
  }

  if (isAdmin) return <AdminPanel />;
  if (currentUser) return <Dashboard />;
  return <LoginPage />;
}

export default function App() {
  // ToastProvider envuelve a AppProvider porque el contexto avisa los errores
  // de la API con carteles.
  return (
    <ToastProvider>
      <AppProvider>
        <ConfirmProvider>
          <AppRouter />
        </ConfirmProvider>
      </AppProvider>
    </ToastProvider>
  );
}
