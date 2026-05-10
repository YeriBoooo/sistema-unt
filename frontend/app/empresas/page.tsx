'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

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

export default function EmpresasPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const userRole = user?.roles?.[0] || '';
  const isAdmin = userRole === 'admin';
  const isSecretaria = userRole === 'secretaria';
  
  const canCreate = isAdmin;
  const canEdit = isAdmin;
  const canDelete = isAdmin;

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => apiFetch<any>('/empresas'),
  });

  let empresas: Empresa[] = [];
  
  if (Array.isArray(response)) {
    empresas = response;
  } else if (response?.data && Array.isArray(response.data)) {
    empresas = response.data;
  } else if (response?.data?.data && Array.isArray(response.data.data)) {
    empresas = response.data.data;
  }

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.ruc?.includes(searchTerm) ||
    empresa.representante?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number, nombre: string) => {
    if (!canDelete) return;
    if (!confirm(`¿Estás seguro de eliminar la empresa "${nombre}"?`)) return;
    
    try {
      await apiFetch(`/empresas/${id}`, { method: 'DELETE' });
      toast.success('✅ Empresa eliminada correctamente');
      refetch();
    } catch (error: any) {
      toast.error('❌ Error al eliminar: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 sm:px-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Empresas</h1>
              <p className="text-sm text-gray-500 mt-1">Gestión de empresas convenio</p>
            </div>
            {canCreate && (
              <Link
                href="/empresas/nueva"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nueva empresa
              </Link>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por empresa, RUC o representante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">RUC</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Razón Social</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Contacto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Representante</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Convenio</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmpresas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No hay empresas registradas
                    </td>
                  </tr>
                ) : (
                  filteredEmpresas.map((empresa) => (
                    <tr key={empresa.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {empresa.ruc}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {empresa.razon_social}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {empresa.telefono || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <Mail className="h-2.5 w-2.5" />
                          {empresa.email_contacto || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {empresa.representante || 'No especificado'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          empresa.convenio_activo 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          <FileText className="h-2.5 w-2.5" />
                          {empresa.convenio_activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* ✅ Verificar que el id existe antes de crear el Link */}
                          {empresa.id && (
                            <Link href={`/empresas/${empresa.id}`} className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg" title="Ver detalles">
                              <Eye className="h-4 w-4" />
                            </Link>
                          )}
                          {canEdit && empresa.id && (
                            <Link href={`/empresas/${empresa.id}/editar`} className="p-1 text-green-600 hover:bg-green-50 rounded-lg" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Link>
                          )}
                          {canDelete && (
                            <button 
                              onClick={() => handleDelete(empresa.id, empresa.razon_social)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg" 
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}