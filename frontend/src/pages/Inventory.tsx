import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface Product {
  id: number;
  code: string;
  name: string;
  stock: number;
}

interface InventoryMovement {
  id: number;
  product: {
    code: string;
    name: string;
  };
  type: 'purchase' | 'sale' | 'adjustment_in' | 'adjustment_out' | 'revert';
  quantity: number;
  reference_type: string;
  reference_id: number;
  prev_stock: number;
  new_stock: number;
  observation: string;
  created_at: string;
}

interface AdjustmentFormData {
  product_id: string;
  type: 'adjustment_in' | 'adjustment_out';
  quantity: number;
  observation: string;
}

const Inventory: React.FC = () => {
  const { hasPermission } = useAuth();
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<AdjustmentFormData>({
    defaultValues: {
      type: 'adjustment_in',
    }
  });

  const selectedProductId = watch('product_id');
  const selectedProductObj = products.find(p => p.id === parseInt(selectedProductId));

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/movements', {
        params: {
          product_id: productFilter || undefined,
          type: typeFilter || undefined,
          page,
          per_page: 10
        }
      });
      setMovements(res.data.data);
      setTotalPages(res.data.meta?.last_page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products', { params: { all: true } });
      setProducts(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [productFilter, typeFilter, page]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAdjustmentModal = () => {
    reset({
      product_id: '',
      type: 'adjustment_in',
      quantity: 0,
      observation: '',
    });
    setError(null);
    setModalOpen(true);
  };

  const onSubmitAdjustment = async (data: AdjustmentFormData) => {
    setError(null);
    try {
      await api.post('/inventory/adjustments', {
        product_id: parseInt(data.product_id),
        type: data.type,
        quantity: parseFloat(data.quantity.toString()),
        observation: data.observation,
      });
      setModalOpen(false);
      fetchMovements();
      fetchProducts();
      alert('Ajuste de inventario guardado correctamente.');
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error. Verifique la cantidad y el stock disponible.');
      }
    }
  };

  const translateType = (type: string) => {
    switch (type) {
      case 'purchase': return { label: 'Compra', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' };
      case 'sale': return { label: 'Venta', color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40' };
      case 'adjustment_in': return { label: 'Ajuste Entrada', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40' };
      case 'adjustment_out': return { label: 'Ajuste Salida', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40' };
      case 'revert': return { label: 'Reversión', color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40' };
      default: return { label: type, color: 'bg-slate-100 text-slate-600' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Inventario (Kardex)</h1>
          <p className="text-xs text-slate-500">Historial completo de entradas, salidas y ajustes de stock en metros</p>
        </div>

        {hasPermission('adjust-inventory') && (
          <button
            onClick={openAdjustmentModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            Realizar Ajuste Manual
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-4 shadow-sm sm:flex-row sm:items-center">
        {/* Product selector filter */}
        <div className="flex-1">
          <select
            value={productFilter}
            onChange={(e) => {
              setProductFilter(e.target.value);
              setPage(1);
            }}
            className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent py-2.5 px-3 text-xs text-slate-700 dark:text-slate-350 outline-none focus:border-indigo-500"
          >
            <option value="">Filtrar por todos los productos...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
            ))}
          </select>
        </div>

        {/* Type Selector Filter */}
        <div className="w-full sm:w-48">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent py-2.5 px-3 text-xs text-slate-700 dark:text-slate-350 outline-none focus:border-indigo-500"
          >
            <option value="">Todos los movimientos</option>
            <option value="purchase">Compras</option>
            <option value="sale">Ventas</option>
            <option value="adjustment_in">Ajustes Entrada</option>
            <option value="adjustment_out">Ajustes Salida</option>
          </select>
        </div>
      </div>

      {/* Main Kardex Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4 font-semibold">Fecha / Hora</th>
                <th className="p-4 font-semibold">Producto</th>
                <th className="p-4 font-semibold text-center">Tipo</th>
                <th className="p-4 font-semibold text-right">Cant. Movimiento</th>
                <th className="p-4 font-semibold text-right">Stock Anterior</th>
                <th className="p-4 font-semibold text-right">Stock Nuevo</th>
                <th className="p-4 font-semibold">Motivo / Documento</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-indigo-600 border-slate-200 dark:border-slate-850" />
                      Cargando Kardex...
                    </div>
                  </td>
                </tr>
              ) : movements.map((m) => {
                const translated = translateType(m.type);
                const isAddition = m.type === 'purchase' || m.type === 'adjustment_in';
                return (
                  <tr key={m.id} className="border-b border-slate-100/50 dark:border-slate-800/30 text-slate-700 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="p-4 font-medium text-slate-400">
                      {new Date(m.created_at).toLocaleString('es-BO')}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-900 dark:text-white">{m.product.name}</span><br />
                      <span className="font-mono text-[9px] text-slate-400">{m.product.code}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block rounded px-2 py-0.5 font-bold text-[10px] ${translated.color}`}>
                        {translated.label}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-bold ${isAddition ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isAddition ? '+' : '-'}{m.quantity.toFixed(2)} m
                    </td>
                    <td className="p-4 text-right text-slate-400">{m.prev_stock.toFixed(2)} m</td>
                    <td className="p-4 text-right font-medium text-slate-900 dark:text-white">{m.new_stock.toFixed(2)} m</td>
                    <td className="p-4 max-w-xs truncate" title={m.observation}>
                      {m.observation}
                    </td>
                  </tr>
                );
              })}
              {!loading && movements.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No se encontraron registros en el Kardex
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-150 dark:border-slate-800/60 p-4">
            <span className="text-[11px] text-slate-500">Página {page} de {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-880 transition disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-880 transition disabled:opacity-40 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Adjustment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-4">
              <h3 className="text-md font-bold text-slate-900 dark:text-white">
                Registrar Ajuste Manual de Inventario
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-red-950/30 border border-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmitAdjustment)} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Seleccionar Producto *</label>
                <select
                  required
                  {...register('product_id', { required: 'Debe seleccionar un producto.' })}
                  className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Seleccione Calamina...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
                {selectedProductObj && (
                  <p className="mt-1 text-[10px] text-slate-400">
                    Stock actual del producto seleccionado: <span className="font-bold text-indigo-600">{selectedProductObj.stock.toFixed(2)} m</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500">Tipo de Ajuste *</label>
                <div className="mt-1.5 flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      value="adjustment_in"
                      {...register('type')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Ingreso Manual (Entrada)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      value="adjustment_out"
                      {...register('type')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Salida Manual (Merma/Ajuste)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500">Cantidad (en Metros) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  {...register('quantity', { required: 'La cantidad es obligatoria.', min: { value: 0.01, message: 'La cantidad debe ser mayor a cero.' } })}
                  placeholder="ej. 25.50"
                  className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                {errors.quantity && <p className="mt-1 text-[10px] text-red-500">{errors.quantity.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500">Motivo del Ajuste (Obligatorio) *</label>
                <input
                  type="text"
                  required
                  {...register('observation', { required: 'Debe justificar el motivo del ajuste para la auditoría.' })}
                  placeholder="ej. Regularización de inventario físico, Mermas de corte, Calamina dañada..."
                  className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                {errors.observation && <p className="mt-1 text-[10px] text-red-500">{errors.observation.message}</p>}
              </div>

              <div className="flex justify-end gap-2.5 border-t border-slate-150 dark:border-slate-850 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-95 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition"
                >
                  Guardar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
