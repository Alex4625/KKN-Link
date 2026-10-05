// src/App.tsx — Router utama dan guard autentikasi
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authApi } from './lib/api';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import { ToastProvider } from './components/Toast';

/** Guard: cek sesi valid, arahkan ke /login jika tidak */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="w-10 h-10 rounded-full border-2 border-sky-500/20 border-t-sky-400 animate-spin" />
            <div className="absolute inset-0 rounded-full bg-sky-500/10 blur-sm pointer-events-none" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-surface-200 font-mono">
            Memuat KKN Hub...
          </span>
        </div>
      </div>
    );
  }

  if (isError || !data?.success) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <HomePage />
            </AuthGuard>
          }
        />
        <Route
          path="/kategori"
          element={
            <AuthGuard>
              <CategoriesPage />
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
