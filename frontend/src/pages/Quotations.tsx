import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, FileText, Check, X, ArrowRight, Trash2, AlertCircle, Eye, Download } from 'lucide-react';

interface Product {
  id: number;
  code: string;
  name: string;
  stock: number;
}

interface Client {
  id: number;
  name: string;
}

interface QuotationDetail {
  id: number;
  product: {
    code: string;
    name: string;
  };
  length: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Quotation {
  id: number;
  quotation_number: string;
  date: string;
  client_id: number;
  client_name_snapshot: string;
  observations: string;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  total: number;
  details: QuotationDetail[];
}

interface QuoteItemRow {
  product_id: string;
  length: string;
  quantity: string;
  unit_price: string;
}

const Quotations: React.FC = () => {
  const { hasPermission } = useAuth();
  const location = useLocation();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [clientSnapshotName, setClientSnapshotName] = useState('');
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [observations, setObservations] = useState('');
  const [items, setItems] = useState<QuoteItemRow[]>([{ product_id: '', length: '', quantity: '', unit_price: '' }]);
  const [error, setError] = useState<string | null>(null);

  // Conversion Dialog States
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [targetQuote, setTargetQuote] = useState<Quotation | null>(null);
  const [advancePayment, setAdvancePayment] = useState('0');

  // Detail Dialog States
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const downloadPdf = async (id: number, filename: string) => {
    setDownloadingId(id);
    try {
      const res = await api.get(`/quotations/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading PDF", err);
      alert('No se pudo generar el PDF de la Cotización.');
    } finally {
      setDownloadingId(null);
    }
  };

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/quotations', {
        params: { search: search || undefined, status: statusFilter || undefined, page, per_page: 10 }
      });
      setQuotations(res.data.data);
      setTotalPages(res.data.meta?.last_page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectOptions = async () => {
    try {
      const clientsRes = await api.get('/clients', { params: { per_page: 100 } });
      const productsRes = await api.get('/products', { params: { all: true } });
      setClients(clientsRes.data.data);
      setProducts(productsRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchSelectOptions();
  }, []);

  const openCreateModal = () => {
    setSelectedClient('');
    setClientSnapshotName('');
    setQuoteDate(new Date().toISOString().split('T')[0]);
    setObservations('');
    setItems([{ product_id: '', length: '', quantity: '', unit_price: '' }]);
    setError(null);
    setModalOpen(true);
  };

  useEffect(() => {
    if (location.search.includes('open=true')) {
      openCreateModal();
    }
  }, [location.search]);

  const addItemRow = () => {
    setItems([...items, { product_id: '', length: '', quantity: '', unit_price: '' }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length === 1) return;
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof QuoteItemRow, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateRowTotal = (row: QuoteItemRow) => {
    const length = parseFloat(row.length) || 0;
    const qty = parseFloat(row.quantity) || 0;
    const price = parseFloat(row.unit_price) || 0;
    return length * qty * price;
  };

  const calculateQuoteTotal = () => {
    return items.reduce((acc, row) => acc + calculateRowTotal(row), 0);
  };

  const handleClientSelectChange = (clientIdStr: string) => {
    setSelectedClient(clientIdStr);
    if (clientIdStr) {
      const client = clients.find(c => c.id === parseInt(clientIdStr));
      if (client) {
        setClientSnapshotName(client.name);
      }
    } else {
      setClientSnapshotName('');
    }
  };

  const onSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clientSnapshotName || !quoteDate) {
      setError('Por favor complete la fecha y la razón social del cliente.');
      return;
    }

    const invalidItem = items.some(item => !item.product_id || !item.length || !item.quantity || !item.unit_price);
    if (invalidItem) {
      setError('Por favor complete todos los datos de los productos cotizados.');
      return;
    }

    const payload = {
      date: quoteDate,
      client_id: selectedClient ? parseInt(selectedClient) : null,
      client_name_snapshot: clientSnapshotName,
      observations: observations || null,
      items: items.map(item => ({
        product_id: parseInt(item.product_id),
        length: parseFloat(item.length),
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
      }))
    };

    try {
      await api.post('/quotations', payload);
      setModalOpen(false);
      fetchQuotations();
      alert('Cotización registrada de forma correcta.');
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error. Verifique la información ingresada.');
      }
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/quotations/${id}/status`, { status });
      fetchQuotations();
      alert('Estado de cotización actualizado correctamente.');
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar el estado.');
    }
  };

  const openConvertModal = (quote: Quotation) => {
    setTargetQuote(quote);
    setAdvancePayment('0');
    setError(null);
    setConvertModalOpen(true);
  };

  const executeConversion = async () => {
    if (!targetQuote) return;
    setError(null);

    try {
      await api.post(`/quotations/${targetQuote.id}/convert`, {
        advance_payment: parseFloat(advancePayment) || 0
      });
      setConvertModalOpen(false);
      fetchQuotations();
      alert('Cotización convertida a venta exitosamente. El inventario ha sido descontado.');
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.data && err.response.data.errors) {
        setError(Object.values(err.response.data.errors)[0] as string);
      } else {
        setError('Error al convertir. Verifique si cuenta con suficiente stock disponible.');
      }
    }
  };

  const openDetailModal = (quote: Quotation) => {
    setSelectedQuote(quote);
    setDetailModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'converted':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40';
      case 'approved':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/40';
      case 'rejected':
        return 'bg-slate-100 text-slate-500 dark:bg-slate-800';
      default:
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'converted': return 'Vendida';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      default: return 'Pendiente';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Cotizaciones</h1>
          <p className="text-xs text-slate-500">Administración de proformas de calaminas para clientes</p>
        </div>

        {hasPermission('create-quotations') && (
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            Crear Cotización
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
            placeholder="Buscar por nro de cotización o cliente..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-indigo-500"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent py-2.5 px-3 text-xs text-slate-700 dark:text-slate-350 outline-none focus:border-indigo-500"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
            <option value="converted">Convertidas a Venta</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4 font-semibold">Número</th>
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold text-right">Total</th>
                <th className="p-4 font-semibold text-center">Estado</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-indigo-600 border-slate-200 dark:border-slate-850" />
                      Cargando cotizaciones...
                    </div>
                  </td>
                </tr>
              ) : quotations.map((quote) => (
                <tr key={quote.id} className="border-b border-slate-100/50 dark:border-slate-800/30 text-slate-700 dark:text-slate-355 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{quote.quotation_number}</td>
                  <td className="p-4">{new Date(quote.date).toLocaleDateString('es-BO')}</td>
                  <td className="p-4 font-semibold">{quote.client_name_snapshot}</td>
                  <td className="p-4 text-right font-bold text-slate-900 dark:text-white">Bs. {quote.total.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block rounded px-2.5 py-0.5 font-bold text-[10px] ${getStatusBadge(quote.status)}`}>
                      {getStatusLabel(quote.status)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openDetailModal(quote)}
                        title="Ver detalle"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 cursor-pointer"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        disabled={downloadingId === quote.id}
                        onClick={() => downloadPdf(quote.id, `cotizacion_${quote.quotation_number}.pdf`)}
                        title="Imprimir / Descargar PDF"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 disabled:opacity-40 cursor-pointer"
                      >
                        {downloadingId === quote.id ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-indigo-600 border-slate-200" />
                        ) : (
                          <Download size={14} />
                        )}
                      </button>

                      {quote.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(quote.id, 'approved')}
                            title="Aprobar"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 cursor-pointer"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(quote.id, 'rejected')}
                            title="Rechazar"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}

                      {quote.status === 'approved' && hasPermission('convert-quotations') && (
                        <button
                          onClick={() => openConvertModal(quote)}
                          title="Convertir a Venta"
                          className="flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 px-2 py-1 font-bold tracking-tight text-[10px] transition active:scale-95 cursor-pointer"
                        >
                          Venta <ArrowRight size={10} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && quotations.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No se encontraron cotizaciones registradas
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

      {/* Creation Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-4">
              <h3 className="text-md font-bold text-slate-900 dark:text-white">
                Crear Nueva Cotización
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

            <form onSubmit={onSubmitQuote} className="mt-4 space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={quoteDate}
                    onChange={(e) => setQuoteDate(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500">Seleccionar Cliente (Existente)</label>
                  <select
                    value={selectedClient}
                    onChange={(e) => handleClientSelectChange(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 focus:ring-1"
                  >
                    <option value="">Cliente eventual / Nuevo...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500">Razón Social / Nombre Snapshot *</label>
                  <input
                    type="text"
                    required
                    value={clientSnapshotName}
                    onChange={(e) => setClientSnapshotName(e.target.value)}
                    placeholder="ej. Constructora Alfa o Juan Perez"
                    className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500">Observación</label>
                <input
                  type="text"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Detalles sobre validez, formas de entrega..."
                  className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Items Detail Grid */}
              <div className="border-t border-slate-150 dark:border-slate-850 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Calaminas Cotizadas</h4>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="flex items-center gap-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 text-xs font-semibold transition active:scale-95 cursor-pointer"
                  >
                    <Plus size={14} />
                    Añadir Calamina
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((row, index) => {
                    const rowSubtotal = calculateRowTotal(row);
                    const selectedProd = products.find(p => p.id === parseInt(row.product_id));
                    const totalMeters = (parseFloat(row.length) || 0) * (parseFloat(row.quantity) || 0);

                    return (
                      <div key={index} className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:flex-row sm:items-end">
                        <div className="flex-1 min-w-[180px]">
                          <label className="block text-[10px] font-semibold text-slate-400">Producto *</label>
                          <select
                            required
                            value={row.product_id}
                            onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent py-1.5 px-2 text-xs text-slate-700 dark:text-slate-350 outline-none"
                          >
                            <option value="">Seleccione Calamina...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full sm:w-24">
                          <label className="block text-[10px] font-semibold text-slate-400">Largo (m) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={row.length}
                            onChange={(e) => handleItemChange(index, 'length', e.target.value)}
                            placeholder="m"
                            className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent py-1.5 px-2 text-xs text-slate-950 dark:text-white outline-none"
                          />
                        </div>

                        <div className="w-full sm:w-24">
                          <label className="block text-[10px] font-semibold text-slate-400">Cantidad (Pzs) *</label>
                          <input
                            type="number"
                            required
                            value={row.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            placeholder="Pzs"
                            className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent py-1.5 px-2 text-xs text-slate-950 dark:text-white outline-none"
                          />
                        </div>

                        <div className="w-full sm:w-28">
                          <label className="block text-[10px] font-semibold text-slate-400">Precio/Metro (Bs.) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={row.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                            placeholder="Bs."
                            className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent py-1.5 px-2 text-xs text-slate-950 dark:text-white outline-none"
                          />
                        </div>

                        {/* Conversions Output View */}
                        <div className="flex-1 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg text-[10px] text-slate-500 flex flex-col gap-0.5 border border-slate-100 dark:border-slate-800">
                          <div>Total Metros: <span className="font-bold text-slate-700 dark:text-slate-300">{totalMeters.toFixed(2)} m</span></div>
                          {selectedProd && (
                            <div className="text-[9px]">Stock disponible: <span className={selectedProd.stock < totalMeters ? 'text-red-500 font-bold' : 'text-emerald-600'}>{selectedProd.stock.toFixed(2)} m</span></div>
                          )}
                          <div>Subtotal: <span className="font-bold text-slate-900 dark:text-slate-100">Bs. {rowSubtotal.toFixed(2)}</span></div>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-150 dark:border-slate-850 pt-4 bg-slate-50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <span className="text-xs text-slate-500 font-medium">Cálculo de Proforma</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Total Cotizado: Bs. {calculateQuoteTotal().toLocaleString('es-BO', { minimumFractionDigits: 2 })}
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
                  Registrar Cotización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to Sale Modal */}
      {convertModalOpen && targetQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-4">
              <h3 className="text-md font-bold text-slate-900 dark:text-white">
                Convertir Cotización a Venta
              </h3>
              <button
                onClick={() => setConvertModalOpen(false)}
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

            <div className="mt-4 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-800 text-xs space-y-2">
                <div>Documento Origen: <span className="font-mono font-bold text-slate-900 dark:text-white">{targetQuote.quotation_number}</span></div>
                <div>Cliente: <span className="font-bold text-slate-900 dark:text-white">{targetQuote.client_name_snapshot}</span></div>
                <div>Total a Facturar: <span className="font-bold text-indigo-600">Bs. {targetQuote.total.toFixed(2)}</span></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500">Monto de Anticipo (Opcional)</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-xs">Bs.</span>
                  <input
                    type="number"
                    step="0.01"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(e.target.value)}
                    placeholder="0.00"
                    className="block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2.5 pl-8 pr-4 text-xs text-slate-950 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Si el anticipo es menor al total, se guardará como cuenta por cobrar (Saldo). Si es igual o mayor, la venta se marcará como pagada.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 border-t border-slate-150 dark:border-slate-850 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setConvertModalOpen(false)}
                  className="rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-95 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={executeConversion}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition"
                >
                  Registrar Venta Directa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {detailModalOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <FileText size={18} className="text-indigo-600" />
                <h3 className="text-md font-bold">Detalle de Cotización</h3>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Meta data */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-xs border-b border-slate-100 dark:border-slate-800/60 pb-4">
              <div>
                <p className="text-slate-400">Número proforma:</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedQuote.quotation_number}</p>
              </div>
              <div>
                <p className="text-slate-400">Fecha:</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{new Date(selectedQuote.date).toLocaleDateString('es-BO')}</p>
              </div>
              <div>
                <p className="text-slate-400">Cliente:</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedQuote.client_name_snapshot}</p>
              </div>
              <div>
                <p className="text-slate-400">Monto Presupuesto:</p>
                <p className="font-bold text-indigo-600 dark:text-indigo-400">Bs. {selectedQuote.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-400">Estado de Cotización:</p>
                <span className={`inline-block rounded px-2.5 py-0.5 font-bold text-[10px] mt-1 ${getStatusBadge(selectedQuote.status)}`}>
                  {getStatusLabel(selectedQuote.status)}
                </span>
              </div>
              {selectedQuote.observations && (
                <div className="sm:col-span-2">
                  <p className="text-slate-400">Observación:</p>
                  <p className="text-slate-700 dark:text-slate-350">{selectedQuote.observations}</p>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase">Productos Cotizados</h4>
              <div className="overflow-hidden rounded-xl border border-slate-150 dark:border-slate-800 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 font-semibold">
                      <th className="p-3">Código</th>
                      <th className="p-3">Nombre</th>
                      <th className="p-3 text-center">Largo (m)</th>
                      <th className="p-3 text-center">Cantidad (Pzs)</th>
                      <th className="p-3 text-right">Precio/m</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuote.details.map((detail) => (
                      <tr key={detail.id} className="border-b border-slate-100/50 dark:border-slate-800/40 text-slate-700 dark:text-slate-300">
                        <td className="p-3 font-mono text-slate-900 dark:text-white">{detail.product.code}</td>
                        <td className="p-3">{detail.product.name}</td>
                        <td className="p-3 text-center">{detail.length.toFixed(2)} m</td>
                        <td className="p-3 text-center">{detail.quantity}</td>
                        <td className="p-3 text-right">Bs. {detail.unit_price.toFixed(2)}</td>
                        <td className="p-3 text-right font-medium">Bs. {detail.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 mt-6 border-t border-slate-150 dark:border-slate-850">
              <button
                disabled={downloadingId === selectedQuote.id}
                onClick={() => downloadPdf(selectedQuote.id, `cotizacion_${selectedQuote.quotation_number}.pdf`)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
              >
                {downloadingId === selectedQuote.id ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-indigo-600 border-slate-200" />
                ) : (
                  <Download size={14} />
                )}
                Imprimir Cotización
              </button>
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

export default Quotations;
