import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  FileText,
  DollarSign,
  Database,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface KPI {
  total: number;
  count: number;
}

interface ProductAlert {
  id: number;
  code: string;
  name: string;
  stock: number;
  color: string;
}

interface SaleSummary {
  id: number;
  sale_number: string;
  date: string;
  client_name_snapshot: string;
  total: number;
  balance: number;
  status: string;
}

interface QuoteSummary {
  id: number;
  quotation_number: string;
  date: string;
  client_name_snapshot: string;
  total: number;
  status: string;
}

interface ChartItem {
  date: string;
  label: string;
  total: number;
}

interface ColorStock {
  color: string;
  stock: number;
}

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [salesToday, setSalesToday] = useState<KPI>({ total: 0, count: 0 });
  const [salesMonth, setSalesMonth] = useState<KPI>({ total: 0, count: 0 });
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<ProductAlert[]>([]);
  const [recentSales, setRecentSales] = useState<SaleSummary[]>([]);
  const [recentQuotations, setRecentQuotations] = useState<QuoteSummary[]>([]);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [colorStockData, setColorStockData] = useState<ColorStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/dashboard');
        const data = res.data;
        
        setSalesToday(data.sales_today);
        setSalesMonth(data.sales_month);
        setLowStockCount(data.low_stock.count);
        setLowStockProducts(data.low_stock.products);
        setRecentSales(data.recent_sales);
        setRecentQuotations(data.recent_quotations);
        setChartData(data.chart_sales);
        setColorStockData(data.stock_by_color);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-indigo-600 border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Panel de Control</h1>
        <p className="text-xs text-slate-500">Resumen y estado actual de la empresa</p>
      </div>

      {/* Quick Actions Panel */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Acciones Rápidas</h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {hasPermission('create-purchases') && (
            <button 
              onClick={() => navigate('/purchases?open=true')}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 px-4 text-xs font-semibold text-white transition active:scale-95 cursor-pointer shadow-sm hover:shadow"
            >
              <Plus size={16} />
              Registrar Compra (Ingresar Stock)
            </button>
          )}
          {hasPermission('create-quotations') && (
            <button 
              onClick={() => navigate('/quotations?open=true')}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-3 px-4 text-xs font-semibold text-white transition active:scale-95 cursor-pointer shadow-sm hover:shadow"
            >
              <Plus size={16} />
              Crear Cotización (Proforma)
            </button>
          )}
          {hasPermission('create-sales') && (
            <button 
              onClick={() => navigate('/sales?open=true')}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 px-4 text-xs font-semibold text-white transition active:scale-95 cursor-pointer shadow-sm hover:shadow"
            >
              <Plus size={16} />
              Registrar Venta Directa
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* KPI 1: Sales Today */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ventas del Día</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                Bs. {salesToday.total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <DollarSign size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
              {salesToday.count}
            </span>
            <span>ventas registradas hoy</span>
          </div>
        </div>

        {/* KPI 2: Sales This Month */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ventas del Mes</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                Bs. {salesMonth.total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
              {salesMonth.count}
            </span>
            <span>ventas este mes</span>
          </div>
        </div>

        {/* KPI 3: Low Stock Alarms */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Bajo (&lt;100m)</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {lowStockCount} Productos
              </h3>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
              lowStockCount > 0 
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-450 animate-pulse' 
                : 'bg-slate-50 dark:bg-slate-950 text-slate-400'
            }`}>
              <AlertTriangle size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            {lowStockCount > 0 ? (
              <span className="text-amber-600 dark:text-amber-450 font-medium">Acción recomendada: reponer stock</span>
            ) : (
              <span className="text-slate-400">Todos los niveles estables</span>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart 1: Sales Trend */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Tendencia de Ventas (Últimos 7 Días)</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: '#334155', 
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                  formatter={(value) => [`Bs. ${value}`, 'Total Ventas']}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Color Stock distribution */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Database size={16} className="text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Stock por Color (Metros)</h3>
          </div>
          <div className="h-64">
            {colorStockData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-500 text-xs">
                Sin datos de stock
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={colorStockData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="color" stroke="#94a3b8" fontSize={10} tickLine={false} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderColor: '#334155', 
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                    formatter={(value) => [`${value} m`, 'Existencia']}
                  />
                  <Bar dataKey="stock" radius={[0, 4, 4, 0]}>
                    {colorStockData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Recent Sales List */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Últimas Ventas</h3>
            </div>
            <a href="/sales" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
              Ver todas <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3 font-semibold">Número</th>
                  <th className="pb-3 font-semibold">Cliente</th>
                  <th className="pb-3 font-semibold text-right">Total</th>
                  <th className="pb-3 font-semibold text-right">Saldo</th>
                  <th className="pb-3 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-slate-100/50 dark:border-slate-800/30 text-slate-700 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-3 font-mono font-medium text-slate-900 dark:text-slate-100">{sale.sale_number}</td>
                    <td className="py-3 font-medium">{sale.client_name_snapshot}</td>
                    <td className="py-3 text-right font-semibold">Bs. {sale.total.toFixed(2)}</td>
                    <td className="py-3 text-right">Bs. {sale.balance.toFixed(2)}</td>
                    <td className="py-3 text-center">
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold ${
                        sale.status === 'paid'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600'
                          : 'bg-red-50 dark:bg-red-950/50 text-red-600'
                      }`}>
                        {sale.status === 'paid' ? 'Pagado' : 'Saldo Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentSales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">Sin ventas recientes</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Quotations List */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Últimas Cotizaciones</h3>
            </div>
            <a href="/quotations" className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1">
              Ver todas <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3 font-semibold">Número</th>
                  <th className="pb-3 font-semibold">Cliente</th>
                  <th className="pb-3 font-semibold text-right">Total</th>
                  <th className="pb-3 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotations.map((quote) => (
                  <tr key={quote.id} className="border-b border-slate-100/50 dark:border-slate-800/30 text-slate-700 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-3 font-mono font-medium text-slate-900 dark:text-slate-100">{quote.quotation_number}</td>
                    <td className="py-3 font-medium">{quote.client_name_snapshot}</td>
                    <td className="py-3 text-right font-semibold">Bs. {quote.total.toFixed(2)}</td>
                    <td className="py-3 text-center">
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold ${
                        quote.status === 'converted'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600'
                          : quote.status === 'approved'
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600'
                          : quote.status === 'rejected'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600'
                      }`}>
                        {quote.status === 'converted' ? 'Vendida' : 
                         quote.status === 'approved' ? 'Aprobada' :
                         quote.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentQuotations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">Sin cotizaciones recientes</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Low Stock Warning List */}
      {lowStockProducts.length > 0 && (
        <div className="rounded-2xl border border-amber-550/20 bg-amber-500/5 p-6 border-dashed">
          <div className="mb-3 flex items-center gap-2 text-amber-500">
            <AlertTriangle size={18} />
            <h4 className="text-sm font-semibold">Alerta de Existencias Bajas</h4>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs shadow-sm">
                <p className="font-mono text-[10px] text-slate-400">{p.code}</p>
                <h5 className="mt-1 font-semibold text-slate-900 dark:text-slate-100 truncate">{p.name}</h5>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Stock Actual:</span>
                  <span className="font-bold text-red-500">{p.stock.toFixed(2)} m</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
