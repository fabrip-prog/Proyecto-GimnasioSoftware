import { AppProvider, useApp } from "./context/AppContext";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";

function AppRouter() {
  const { currentUser, isAdmin } = useApp();

  if (isAdmin) return <AdminPanel />;
  if (currentUser) return <Dashboard />;
  return <LoginPage />;
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
