'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft, Save, Loader2, Mail, Phone } from 'lucide-react';

interface Empresa {
  id: number;
  ruc: string;
  razon_social: string;
  direccion: string;
  telefono: string;
  email_contacto: string;
  representante: string;
  convenio_activo: boolean;
}

export default function EditarEmpresaPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    ruc: '',
    razon_social: '',
    direccion: '',
    telefono: '',
    email_contacto: '',
    representante: '',
    convenio_activo: false,
  });

  // ✅ Verificar permisos (solo admin puede editar)
  const userRole = user?.roles?.[0] || '';
  const canEdit = userRole === 'admin';

  // ✅ Redirigir si no tiene permisos
  useEffect(() => {
    if (!canEdit && user) {
      router.push('/empresas');
    }
  }, [canEdit, user, router]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['empresa', id],
    queryFn: () => apiFetch<any>(`/empresas/${id}`),
  });

  const empresa: Empresa | undefined = response?.data;

  useEffect(() => {
    if (empresa && !formData.ruc) {
      setFormData({
        ruc: empresa.ruc || '',
        razon_social: empresa.razon_social || '',
        direccion: empresa.direccion || '',
        telefono: empresa.telefono || '',
        email_contacto: empresa.email_contacto || '',
        representante: empresa.representante || '',
        convenio_activo: empresa.convenio_activo || false,
      });
    }
  }, [empresa]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiFetch(`/empresas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      alert('✅ Empresa actualizada correctamente');
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      router.push('/empresas');
    },
    onError: (error: any) => {
      alert('❌ Error al actualizar: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Empresa no encontrada</p>
        <Link href="/empresas" className="text-blue-600 mt-2 inline-block">Volver a empresas</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/empresas" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Volver a empresas
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-green-600" />
            <h1 className="text-xl font-semibold text-gray-800">Editar empresa</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">Actualiza los datos de la empresa</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RUC *</label>
              <input
                type="text"
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social *</label>
              <input
                type="text"
                value={formData.razon_social}
                onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de contacto</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email_contacto}
                  onChange={(e) => setFormData({ ...formData, email_contacto: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Representante</label>
            <input
              type="text"
              value={formData.representante}
              onChange={(e) => setFormData({ ...formData, representante: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.convenio_activo}
                onChange={(e) => setFormData({ ...formData, convenio_activo: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Convenio activo</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/empresas"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}