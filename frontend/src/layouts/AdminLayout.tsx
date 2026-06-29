import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Database,
  FileText,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, permission: null },
    { name: 'Clientes', path: '/clients', icon: Users, permission: 'view-clients' },
    { name: 'Productos', path: '/products', icon: Package, permission: 'view-products' },
    { name: 'Compras', path: '/purchases', icon: ShoppingBag, permission: 'view-purchases' },
    { name: 'Inventario (Kardex)', path: '/inventory', icon: Database, permission: 'view-inventory' },
    { name: 'Cotizaciones', path: '/quotations', icon: FileText, permission: 'view-quotations' },
    { name: 'Ventas', path: '/sales', icon: TrendingUp, permission: 'view-sales' },
  ];

  const filteredMenu = menuItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/40 dark:border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
              <Package size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Calaminas ERP
            </span>
          </div>
          <button
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-950 dark:hover:text-white'
                }`}
                onClick={() => {
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'} />
                <span>{item.name}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-200/40 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3 rounded-xl p-3 bg-white dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/30">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <UserIcon size={18} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                {user?.name}
              </p>
              <p className="truncate text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                {user?.roles[0] || 'Vendedor'}
              </p>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md px-6">
          <div className="flex items-center gap-4">
            <button
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="hidden text-sm font-semibold text-slate-400 dark:text-slate-500 sm:block">
              Sistema de Control de Ventas e Inventario
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all active:scale-95"
              title="Cambiar tema"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/10 text-red-600 px-4 py-2.5 text-xs font-semibold transition-all active:scale-95"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </header>

        {/* Dynamic Pages viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/30 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
