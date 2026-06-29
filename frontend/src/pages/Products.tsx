import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  color: string;
  thickness: number;
  purchase_unit: string;
  sale_unit: string;
  meters_per_ton: number;
  stock: number;
}

interface ProductFormData {
  code: string;
  name: string;
  description: string;
  color: string;
  thickness: number;
  purchase_unit: string;
  sale_unit: string;
  meters_per_ton: number;
}

const Products: React.FC = () => {
  const { hasPermission } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductFormData>();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: { 
          search, 
          color: colorFilter || undefined, 
          low_stock: lowStockFilter ? true : undefined,
          page, 
          per_page: 10 
        }
      });
      setProducts(res.data.data);
      setTotalPages(res.data.meta?.last_page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, colorFilter, lowStockFilter, page]);

  const openCreateModal = () => {
    setSelectedProduct(null);
    reset({
      code: '',
      name: '',
      description: '',
      color: 'Zinc/Plateado',
      thickness: 0.35,
      purchase_unit: 'TON',
      sale_unit: 'M',
      meters_per_ton: 512.80,
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setValue('code', product.code);
    setValue('name', product.name);
    setValue('description', product.description || '');
    setValue('color', product.color || '');
    setValue('thickness', product.thickness);
    setValue('purchase_unit', product.purchase_unit);
    setValue('sale_unit', product.sale_unit);
    setValue('meters_per_ton', product.meters_per_ton);
    setError(null);
    setModalOpen(true);
  };

  const onSubmitForm = async (data: ProductFormData) => {
    setError(null);
    try {
      if (selectedProduct) {
        await api.put(`/products/${selectedProduct.id}`, data);
      } else {
        await api.post('/products', data);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error. Inténtelo de nuevo.');
      }
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el producto "${name}"?`)) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error(err);
        alert('No se pudo eliminar el producto.');
      }
    }
  };

  // List of unique colors from our seeded list + potential entries
  const colorOptions = ['Zinc/Plateado', 'Rojo', 'Azul', 'Verde', 'Gris'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Productos (Calaminas)</h1>
          <p className="text-xs text-slate-500">Catálogo de calaminas y equivalencias de conversión</p>
        </div>

        {hasPermission('create-products') && (
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            Crear Producto
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Buscar por código, nombre o color..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Color Selector */}
          <select
            value={colorFilter}
            onChange={(e) => {
              setColorFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent py-2.5 px-3 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Todos los colores</option>
            {colorOptions.map(color => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>

          {/* Low Stock checkbox */}
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 px-3 text-xs text-slate-700 dark:text-slate-300 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockFilter}
              onChange={(e) => {
                setLowStockFilter(e.target.checked);
                setPage(1);
              }}
              className="rounded text-indigo-600 focus:ring-indigo-550 h-4 w-4"
            />
            <span>Stock Bajo (&lt;100m)</span>
          </label>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4 font-semibold">Código</th>
                <th className="p-4 font-semibold">Nombre</th>
                <th className="p-4 font-semibold">Color</th>
                <th className="p-4 font-semibold text-center">Espesor</th>
                <th className="p-4 font-semibold text-center">Compra / Venta</th>
                <th className="p-4 font-semibold text-right">Equivalencia (1 TON)</th>
                <th className="p-4 font-semibold text-right">Stock Actual</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-indigo-600 border-slate-200 dark:border-slate-850" />
                      Cargando productos...
                    </div>
                  </td>
                </tr>
              ) : products.map((product) => (
                <tr key={product.id} className="border-b border-slate-100/50 dark:border-slate-800/30 text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="p-4 font-mono font-semibold text-slate-900 dark:text-white">{product.code}</td>
                  <td className="p-4 font-semibold">{product.name}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 rounded-full border border-slate-300 dark:border-slate-700 ${
                        product.color === 'Rojo' ? 'bg-red-500' :
                        product.color === 'Azul' ? 'bg-blue-500' :
                        product.color === 'Verde' ? 'bg-emerald-500' :
                        product.color === 'Gris' ? 'bg-gray-400' : 'bg-slate-300 dark:bg-slate-600'
                      }`} />
                      {product.color}
                    </span>
                  </td>
                  <td className="p-4 text-center font-medium">{product.thickness.toFixed(3)} mm</td>
                  <td className="p-4 text-center">
                    <span className="rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 px-1.5 py-0.5 font-bold">{product.purchase_unit}</span>
                    <span className="mx-1 text-slate-400">&rarr;</span>
                    <span className="rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 px-1.5 py-0.5 font-bold">{product.sale_unit}</span>
                  </td>
                  <td className="p-4 text-right font-medium text-slate-900 dark:text-slate-150">
                    {product.meters_per_ton.toFixed(2)} m
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-bold text-[13px] ${
                      product.stock < 100 
                        ? 'text-red-500 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10' 
                        : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {product.stock.toFixed(2)} m
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {hasPermission('edit-products') && (
                        <button
                          onClick={() => openEditModal(product)}
                          title="Editar"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {hasPermission('delete-products') && (
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          title="Eliminar"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No se encontraron productos registrados
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
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-4">
              <h3 className="text-md font-bold text-slate-900 dark:text-white">
                {selectedProduct ? 'Modificar Producto' : 'Crear Nuevo Producto'}
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

            <form onSubmit={handleSubmit(onSubmitForm)} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Código Único *</label>
                  <input
                    type="text"
                    required
                    {...register('code', { required: 'Este campo es obligatorio.' })}
                    placeholder="ej. CAL-GALV-035"
                    className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  {errors.code && <p className="mt-1 text-[10px] text-red-500">{errors.code.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500">Nombre Comercial *</label>
                  <input
                    type="text"
                    required
                    {...register('name', { required: 'Este campo es obligatorio.' })}
                    placeholder="ej. Calamina Galvanizada C-28"
                    className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  {errors.name && <p className="mt-1 text-[10px] text-red-500">{errors.name.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500">Descripción</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Detalles sobre la calamina..."
                  className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Color *</label>
                  <input
                    type="text"
                    required
                    {...register('color', { required: 'Este campo es obligatorio.' })}
                    placeholder="ej. Zinc/Plateado"
                    className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500">Espesor (mm) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    {...register('thickness', { required: 'Este campo es obligatorio.', valueAsNumber: true })}
                    placeholder="ej. 0.350"
                    className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Unidades Compra / Venta *</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      required
                      {...register('purchase_unit')}
                      placeholder="TON"
                      className="block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white outline-none focus:border-indigo-500 focus:ring-1"
                    />
                    <span className="text-slate-400 text-xs">&rarr;</span>
                    <input
                      type="text"
                      required
                      {...register('sale_unit')}
                      placeholder="M"
                      className="block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white outline-none focus:border-indigo-500 focus:ring-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500">Metros por Tonelada *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    {...register('meters_per_ton', { required: 'Este campo es obligatorio.', valueAsNumber: true })}
                    placeholder="ej. 512.80"
                    className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {selectedProduct && (
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                  <span className="font-semibold">Nota:</span> El stock actual (<span className="font-bold text-indigo-600">{selectedProduct.stock.toFixed(2)} m</span>) no puede editarse directamente para evitar desajustes en el Kardex. Utilice los módulos de Compras o Ajustes de Inventario.
                </div>
              )}

              <div className="flex justify-end gap-2.5 border-t border-slate-150 dark:border-slate-855 pt-4 mt-6">
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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
