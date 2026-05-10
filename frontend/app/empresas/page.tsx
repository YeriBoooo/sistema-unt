'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { ArrowLeft, Building2, Phone, Mail, MapPin, FileText, Edit } from 'lucide-react';

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

export default function DetalleEmpresaPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const userRole = user?.roles?.[0] || '';
  const isAdmin = userRole === 'admin';

  const { data: response, isLoading } = useQuery({
    queryKey: ['empresa', id],
    queryFn: () => apiFetch<any>(`/empresas/${id}`),
  });

  const empresa: Empresa = response?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Empresa no encontrada</p>
        <Link href="/empresas" className="text-blue-600 mt-2 inline-block">Volver a empresas</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <Link href="/empresas" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Volver a empresas
        </Link>
        {isAdmin && (
          <Link href={`/empresas/${id}/editar`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            <Edit className="h-4 w-4" />
            Editar empresa
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">{empresa.razon_social}</h1>
              <p className="text-sm text-gray-500">RUC: {empresa.ruc}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Dirección</p>
                <p className="text-sm text-gray-700">{empresa.direccion || 'No registrada'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Teléfono</p>
                <p className="text-sm text-gray-700">{empresa.telefono || 'No registrado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Email de contacto</p>
                <p className="text-sm text-gray-700">{empresa.email_contacto || 'No registrado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Convenio</p>
                <p className={`text-sm font-medium ${empresa.convenio_activo ? 'text-green-600' : 'text-red-600'}`}>
                  {empresa.convenio_activo ? 'Activo' : 'Inactivo'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Representante</p>
                <p className="text-sm text-gray-700">{empresa.representante || 'No especificado'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}