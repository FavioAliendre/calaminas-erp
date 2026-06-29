import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface Client {
  id: number;
  name: string;
  nit_ci: string;
  phone: string;
  address: string;
  email: string;
}

interface ClientFormData {
  name: string;
  nit_ci: string;
  phone: string;
  address: string;
  email: string;
}

const Clients: React.FC = () => {
  const { hasPermission } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ClientFormData>();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clients', {
        params: { search, page, per_page: 10 }
      });
      setClients(res.data.data);
      setTotalPages(res.data.meta?.last_page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchClients();
    }, 300); // Debounce search requests

    return () => clearTimeout(delayDebounce);
  }, [search, page]);

  const openCreateModal = () => {
    setSelectedClient(null);
    reset({
      name: '',
      nit_ci: '',
      phone: '',
      address: '',
      email: '',
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setValue('name', client.name);
    setValue('nit_ci', client.nit_ci);
    setValue('phone', client.phone || '');
    setValue('address', client.address || '');
    setValue('email', client.email || '');
    setError(null);
    setModalOpen(true);
  };

  const onSubmitForm = async (data: ClientFormData) => {
    setError(null);
    try {
      if (selectedClient) {
        // Edit Client
        await api.put(`/clients/${selectedClient.id}`, data);
      } else {
        // Create Client
        await api.post('/clients', data);
      }
      setModalOpen(false);
      fetchClients();
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
    if (window.confirm(`¿Está seguro de que desea eliminar al cliente "${name}"?`)) {
      try {
        await api.delete(`/clients/${id}`);
        fetchClients();
      } catch (err) {
        console.error(err);
        alert('No se pudo eliminar al cliente.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Clientes</h1>
          <p className="text-xs text-slate-500">Gestión de cartera de clientes de la empresa</p>
        </div>

        {hasPermission('create-clients') && (
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            Registrar Cliente
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
            placeholder="Buscar por nombre, NIT/CI, teléfono o correo..."
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
                <th className="p-4 font-semibold">Razón Social / Nombre</th>
                <th className="p-4 font-semibold">NIT / CI</th>
                <th className="p-4 font-semibold">Teléfono</th>
                <th className="p-4 font-semibold">Dirección</th>
                <th className="p-4 font-semibold">Correo</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-indigo-600 border-slate-200 dark:border-slate-850" />
                      Cargando clientes...
                    </div>
                  </td>
                </tr>
              ) : clients.map((client) => (
                <tr key={client.id} className="border-b border-slate-100/50 dark:border-slate-800/30 text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">{client.name}</td>
                  <td className="p-4 font-mono font-medium">{client.nit_ci}</td>
                  <td className="p-4">{client.phone || <span className="text-slate-400">-</span>}</td>
                  <td className="p-4 truncate max-w-xs">{client.address || <span className="text-slate-400">-</span>}</td>
                  <td className="p-4">{client.email || <span className="text-slate-400">-</span>}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {hasPermission('edit-clients') && (
                        <button
                          onClick={() => openEditModal(client)}
                          title="Editar"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {hasPermission('delete-clients') && (
                        <button
                          onClick={() => handleDelete(client.id, client.name)}
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
              {!loading && clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No se encontraron clientes registrados
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
                {selectedClient ? 'Modificar Cliente' : 'Registrar Nuevo Cliente'}
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
              <div>
                <label className="block text-xs font-semibold text-slate-500">Nombre o Razón Social *</label>
                <input
                  type="text"
                  required
                  {...register('name', { required: 'Este campo es obligatorio.' })}
                  placeholder="ej. Constructora Altiplano S.R.L."
                  className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                {errors.name && <p className="mt-1 text-[10px] text-red-500">{errors.name.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">NIT / CI *</label>
                  <input
                    type="text"
                    required
                    {...register('nit_ci', { required: 'Este campo es obligatorio.' })}
                    placeholder="ej. 1020304021"
                    className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  {errors.nit_ci && <p className="mt-1 text-[10px] text-red-500">{errors.nit_ci.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500">Teléfono</label>
                  <input
                    type="text"
                    {...register('phone')}
                    placeholder="ej. 71234567"
                    className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500">Dirección</label>
                <input
                  type="text"
                  {...register('address')}
                  placeholder="ej. Av. Blanco Galindo Km 5, Cochabamba"
                  className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500">Correo Electrónico</label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="ej. contacto@altiplano.com"
                  className="mt-1 block w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
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

export default Clients;
