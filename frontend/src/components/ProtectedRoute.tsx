import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  permission?: string;
  role?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ permission, role }) => {
  const { user, loading, hasPermission, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-indigo-500 border-slate-800"></div>
          <p className="text-slate-400 font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <AccessDeniedScreen />;
  }

  if (role && !hasRole(role)) {
    return <AccessDeniedScreen />;
  }

  return <Outlet />;
};

const AccessDeniedScreen = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 rounded-full bg-red-950/50 p-4 text-red-500 border border-red-500/20">
        <ShieldAlert size={48} className="animate-pulse" />
      </div>
      <h1 className="text-2xl font-bold text-slate-100">Acceso Restringido</h1>
      <p className="mt-2 max-w-md text-slate-400">
        No tienes permisos suficientes para acceder a este módulo. Ponte en contacto con el administrador del sistema si crees que esto es un error.
      </p>
      <button
        onClick={() => window.location.href = '/'}
        className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
      >
        Volver al Inicio
      </button>
    </div>
  );
};

export default ProtectedRoute;
