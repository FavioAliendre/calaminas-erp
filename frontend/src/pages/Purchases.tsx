import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Trash2, X, AlertCircle, FileText } from 'lucide-react';

interface Product {
  id: number;
  code: string;
  name: string;
  meters_per_ton: number;
}

interface PurchaseDetail {
  id: number;
  product: {
    code: string;
    name: string;
  };
  tons: number;
  unit_cost: number;
  total_cost: number;
  meters_added: number;
}

interface Purchase {
  id: number;
  purchase_date: string;
  provider_name: string;
  invoice_number: string;
  observation: string;
  total_cost: number;
  details: PurchaseDetail[];
}

interface ItemRow {
  product_id: string;
  tons: string;
  unit_cost: string;
}

const Purchases: React.FC = () => {
  const { hasPermission } = useAuth();
  const location = useLocation();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Registration Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [providerName, setProviderName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [observation, setObservation] = useState('');
  const [items, setItems] = useState<ItemRow[]>([{ product_id: '', tons: '', unit_cost: '' }]);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/purchases', {
        params: { provider: search || undefined, page, per_page: 10 }
      });
      setPurchases(res.data.data);
      setTotalPages(res.data.meta?.last_page || 1);
    } catch (err) {
      console.error("Error fetching purchases", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products', { params: { all: true } });
      setProducts(res.data.data);
    } catch (err) {
      console.error("Error fetching products list", err);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [search, page]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const openRegisterModal = () => {
    setProviderName('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setInvoiceNumber('');
    setObservation('');
    setItems([{ product_id: '', tons: '', unit_cost: '' }]);
    setError(null);
    setModalOpen(true);
  };

  useEffect(() => {
    if (location.search.includes('open=true')) {
      openRegisterModal();
    }
  }, [location.search]);

  const addItemRow = () => {
    setItems([...items, { product_id: '', tons: '', unit_cost: '' }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length === 1) return;
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof ItemRow, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateRowTotal = (row: ItemRow) => {
    const tons = parseFloat(row.tons) || 0;
    const cost = parseFloat(row.unit_cost) || 0;
    return tons * cost;
  };

  const calculateRowMeters = (row: ItemRow) => {
    if (!row.product_id) return 0;
    const product = products.find(p => p.id === parseInt(row.product_id));
    if (!product) return 0;
    const tons = parseFloat(row.tons) || 0;
    return tons * product.meters_per_ton;
  };

  const calculatePurchaseTotal = () => {
    return items.reduce((acc, row) => acc + calculateRowTotal(row), 0);
  };

  const onSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!providerName || !purchaseDate) {
      setError('Por favor complete la fecha y el nombre del proveedor.');
      return;
    }

    const invalidItem = items.some(item => !item.product_id || !item.tons || !item.unit_cost);
    if (invalidItem) {
      setError('Por favor complete todos los campos de los productos agregados.');
      return;
    }

    const payload = {
      purchase_date: purchaseDate,
      provider_name: providerName,
      invoice_number: invoiceNumber || null,
      observation: observation || null,
      items: items.map(item => ({
        product_id: parseInt(item.product_id),
        tons: parseFloat(item.tons),
        unit_cost: parseFloat(item.unit_cost),
      }))
    };

    try {
      await api.post('/purchases', payload);
      setModalOpen(false);
      fetchPurchases();
      alert('Compra registrada y stock actualizado en metros de forma correcta.');
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error al guardar. Revise los datos.');
      }
    }
  };

  const openDetailModal = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Compras</h1>
          <p className="text-xs text-slate-500">Historial de adquisiciones de materia prima (en Toneladas)</p>
        </div>

        {hasPermission('create-purchases') && (
          <button
            onClick={openRegisterModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            Registrar Adquisición
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre de proveedor..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Proveedor</th>
                <th className="p-4 font-semibold">Factura / Nota Nro.</th>
                <th className="p-4 font-semibold">Items</th>
                <th className="p-4 font-semibold text-right">Costo Total</th>
                <th className="p-4 font-semibold text-center">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-indigo-600 border-slate-200 dark:border-slate-850" />
                      Cargando compras...
                    </div>
                  </td>
                </tr>
              ) : purchases.map((purchase) => (
                <tr key={purchase.id} className="border-b border-slate-100/50 dark:border-slate-800/30 text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="p-4 font-medium">{new Date(purchase.purchase_date).toLocaleDateString('es-BO')}</td>
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">{purchase.provider_name}</td>
                  <td className="p-4 font-mono">{purchase.invoice_number || <span className="text-slate-400">S/N</span>}</td>
                  <td className="p-4">{purchase.details.length} productos</td>
                  <td className="p-4 text-right font-bold text-slate-900 dark:text-white">Bs. {purchase.total_cost.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => openDetailModal(purchase)}
                      className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 px-3 py-1.5 font-semibold transition active:scale-95 cursor-pointer"
                    >
                      Ver Productos
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && purchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No se encontraron registros de compras
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

      {/* Registration Modal Wizard */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-4">
              <h3 className="text-md font-bold text-slate-900 dark:text-white">
                Registrar Nueva Compra (Internar Calaminas)
              </h3>
              <button
                type="button"
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

            <form onSubmit={onSubmitPurchase} className="mt-4 space-y-5">
              {/* Header Info */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Fecha de Adquisición *</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white outline-none focus:border-indigo-500 focus:ring-1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500">Proveedor *</label>
                  <input
                    type="text"
                    required
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    placeholder="ej. Aceros Bol SRL"
                    className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500">Factura / Nota Nro.</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="ej. FAC-10928"
                    className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500">Observación</label>
                <input
                  type="text"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Detalles adicionales sobre el lote..."
                  className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1"
                />
              </div>

              {/* Items Section */}
              <div className="border-t border-slate-150 dark:border-slate-850 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Detalle del Lote</h4>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="flex items-center gap-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 text-xs font-semibold transition active:scale-95 cursor-pointer"
                  >
                    <Plus size={14} />
                    Añadir Fila
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((row, index) => {
                    const rowMeters = calculateRowMeters(row);
                    const rowCost = calculateRowTotal(row);
                    return (
                      <div key={index} className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:flex-row sm:items-end">
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-[10px] font-semibold text-slate-400">Producto *</label>
                          <select
                            required
                            value={row.product_id}
                            onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent py-1.5 px-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
                          >
                            <option value="">Seleccione Calamina...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full sm:w-28">
                          <label className="block text-[10px] font-semibold text-slate-400">Toneladas *</label>
                          <input
                            type="number"
                            step="0.001"
                            required
                            value={row.tons}
                            onChange={(e) => handleItemChange(index, 'tons', e.target.value)}
                            placeholder="0.000"
                            className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent py-1.5 px-2 text-xs text-slate-950 dark:text-white outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="w-full sm:w-32">
                          <label className="block text-[10px] font-semibold text-slate-400">Costo/TON (Bs.) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={row.unit_cost}
                            onChange={(e) => handleItemChange(index, 'unit_cost', e.target.value)}
                            placeholder="Bs. 0.00"
                            className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent py-1.5 px-2 text-xs text-slate-950 dark:text-white outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Conversions Output View */}
                        <div className="flex-1 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg text-[10px] text-slate-500 flex flex-col gap-1 border border-slate-100 dark:border-slate-800">
                          <div>Equivalente: <span className="font-bold text-emerald-600">{rowMeters.toFixed(2)} m</span></div>
                          <div>Subtotal Costo: <span className="font-bold text-slate-900 dark:text-slate-100">Bs. {rowCost.toFixed(2)}</span></div>
                        </div>

                        <button
                          type="button"
                          disabled={items.length === 1}
                          onClick={() => removeItemRow(index)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 disabled:opacity-30 cursor-pointer self-start sm:self-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Summary Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-150 dark:border-slate-855 pt-4 bg-slate-50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <span className="text-xs text-slate-500 font-medium">Resumen del registro</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Costo Total: Bs. {calculatePurchaseTotal().toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </span>
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
                  Confirmar Adquisición
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailModalOpen && selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <FileText size={18} className="text-indigo-600" />
                <h3 className="text-md font-bold">Detalle de Compra</h3>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Purchase Meta */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-xs border-b border-slate-100 dark:border-slate-800/60 pb-4">
              <div>
                <p className="text-slate-400">Proveedor:</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedPurchase.provider_name}</p>
              </div>
              <div>
                <p className="text-slate-400">Fecha de Registro:</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{new Date(selectedPurchase.purchase_date).toLocaleDateString('es-BO')}</p>
              </div>
              <div>
                <p className="text-slate-400">Factura / Nota Nro:</p>
                <p className="font-semibold font-mono text-slate-900 dark:text-slate-100">{selectedPurchase.invoice_number || 'S/N'}</p>
              </div>
              <div>
                <p className="text-slate-400">Costo Total:</p>
                <p className="font-bold text-indigo-600 dark:text-indigo-400">Bs. {selectedPurchase.total_cost.toFixed(2)}</p>
              </div>
              {selectedPurchase.observation && (
                <div className="sm:col-span-2">
                  <p className="text-slate-400">Observación:</p>
                  <p className="text-slate-700 dark:text-slate-350">{selectedPurchase.observation}</p>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase">Productos Ingresados</h4>
              <div className="overflow-hidden rounded-xl border border-slate-150 dark:border-slate-800 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 font-semibold">
                      <th className="p-3">Código</th>
                      <th className="p-3">Nombre</th>
                      <th className="p-3 text-center">Tons</th>
                      <th className="p-3 text-right">M Añadidos</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchase.details.map((detail) => (
                      <tr key={detail.id} className="border-b border-slate-100/50 dark:border-slate-800/40 text-slate-700 dark:text-slate-300">
                        <td className="p-3 font-mono text-slate-900 dark:text-white">{detail.product.code}</td>
                        <td className="p-3">{detail.product.name}</td>
                        <td className="p-3 text-center font-medium">{detail.tons.toFixed(3)}</td>
                        <td className="p-3 text-right font-bold text-emerald-600">+{detail.meters_added.toFixed(2)} m</td>
                        <td className="p-3 text-right font-medium">Bs. {detail.total_cost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-6 border-t border-slate-150 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition active:scale-95"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
