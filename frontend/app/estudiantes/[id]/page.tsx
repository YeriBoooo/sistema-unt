'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Phone, GraduationCap, Building2, Calendar, Edit } from 'lucide-react';

interface Estudiante {
  id: number;
  codigo_universitario: string;
  ciclo: string;
  created_at: string;
  usuario: {
    nombres: string;
    apellidos: string;
    email: string;
    dni: string;
    telefono: string;
  };
  escuela: {
    nombre: string;
  };
}

export default function DetalleEstudiantePage() {
  const { id } = useParams();
  const { user } = useAuth();

  const userRole = user?.roles?.[0] || '';
  const isAdmin = userRole === 'admin';
  const isSecretaria = userRole === 'secretaria';

  const { data: response, isLoading } = useQuery({
    queryKey: ['estudiante', id],
    queryFn: () => apiFetch<any>(`/estudiantes/${id}`),
  });

  const estudiante: Estudiante = response?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!estudiante) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Estudiante no encontrado</p>
        <Link href="/estudiantes" className="text-blue-600 mt-2 inline-block">Volver</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <Link href="/estudiantes" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Volver a estudiantes
        </Link>
        {/* ✅ Solo admin ve botón editar */}
        {isAdmin && (
          <Link href={`/estudiantes/${id}/editar`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            <Edit className="h-4 w-4" />
            Editar estudiante
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {estudiante.usuario?.nombres} {estudiante.usuario?.apellidos}
              </h1>
              <p className="text-sm text-gray-500">{estudiante.codigo_universitario}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm text-gray-700">{estudiante.usuario?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Teléfono</p>
                <p className="text-sm text-gray-700">{estudiante.usuario?.telefono || 'No registrado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Ciclo</p>
                <p className="text-sm text-gray-700">{estudiante.ciclo || 'No registrado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Escuela</p>
                <p className="text-sm text-gray-700">{estudiante.escuela?.nombre || 'No asignada'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">DNI</p>
                <p className="text-sm text-gray-700">{estudiante.usuario?.dni}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}