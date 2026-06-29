import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Package, Lock, Mail, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor complete todos los campos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      window.location.href = '/';
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.data && err.response.data.errors) {
        setError(Object.values(err.response.data.errors)[0] as string);
      } else {
        setError('Ocurrió un error al iniciar sesión. Inténtelo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center bg-slate-950 px-4">
      {/* Premium background mesh gradients */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

      {/* Login Card */}
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/30">
            <Package size={24} />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">Bienvenido de nuevo</h1>
          <p className="mt-1.5 text-xs text-slate-400">
            Inicia sesión para administrar el inventario de calaminas
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-red-950/40 border border-red-500/20 p-3.5 text-xs text-red-400">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Error:</span> {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300">Correo Electrónico</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="ejemplo@calaminas.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">Contraseña</label>
              <a
                href="#recuperar"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Para demostración, use la cuenta admin@calaminas.com / admin123");
                }}
                className="text-[10px] font-semibold text-indigo-400 hover:underline"
              >
                ¿Olvidó su contraseña?
              </a>
            </div>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-white border-white/20" />
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-800/80 pt-6 text-center text-[10px] text-slate-500">
          <span>Credenciales Demo: <br /></span>
          <span className="font-mono text-slate-400">admin@calaminas.com / admin123</span>
          <br />
          <span className="font-mono text-slate-400">vendedor@calaminas.com / vendedor123</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
