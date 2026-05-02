'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { useState } from 'react';
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserCheck
} from 'lucide-react';

interface Postulacion {
  id: number;
  estado: string;
  fecha_postulacion: string;
  estudiante: {
    id: number;
    usuario: {
      nombres: string;
      apellidos: string;
      email: string;
    };
    codigo_universitario: string;
  };
  oferta: {
    id: number;
    titulo: string;
    modalidad: string;
    empresa: {
      razon_social: string;
    };
  };
}

export default function GestionPostulacionesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState('todos');

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['postulaciones', filtro],
    queryFn: () => {
      let url = '/postulaciones';
      if (filtro !== 'todos') {
        url += `?estado=${filtro}`;
      }
      return apiFetch<any>(url);
    },
    // ✅ CORREGIDO: Tipo explícito para el parámetro 'r'
    enabled: !!user?.roles?.some((r: string) => r === 'admin' || r === 'coordinador'),
  });

  // ✅ CORREGIDO: extraer el array correctamente (response?.data?.data)
  const postulaciones: Postulacion[] = response?.data?.data || response?.data || [];

  const cambiarEstadoMutation = useMutation({
    mutationFn: async ({ postulacionId, estado }: { postulacionId: number; estado: string }) => {
      return apiFetch(`/ofertas/postulaciones/${postulacionId}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
    },
    onSuccess: () => {
      alert('✅ Estado actualizado correctamente');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['postulaciones'] });
    },
    onError: (error: any) => {
      alert('❌ Error al actualizar: ' + error.message);
    },
  });

  const handleCambiarEstado = (postulacionId: number, nuevoEstado: string) => {
    const mensaje = nuevoEstado === 'aceptado' 
      ? '¿Aceptar esta postulación?' 
      : '¿Rechazar esta postulación?';
    if (confirm(mensaje)) {
      cambiarEstadoMutation.mutate({ postulacionId, estado: nuevoEstado });
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aceptado': return 'bg-green-100 text-green-700';
      case 'postulado': return 'bg-yellow-100 text-yellow-700';
      case 'rechazado': return 'bg-red-100 text-red-700';
      case 'en_curso': return 'bg-blue-100 text-blue-700';
      case 'finalizado': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'aceptado': return 'Aceptado';
      case 'postulado': return 'Postulado';
      case 'rechazado': return 'Rechazado';
      case 'en_curso': return 'En curso';
      case 'finalizado': return 'Finalizado';
      default: return estado;
    }
  };

  // ✅ CORREGIDO: Tipo explícito para el parámetro 'r'
  if (!user?.roles?.some((r: string) => r === 'admin' || r === 'coordinador')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">No tienes permisos para acceder a esta página</p>
          <Link href="/dashboard" className="text-blue-600 mt-2 inline-block">Volver al dashboard</Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-semibold text-gray-800">Gestión de postulaciones</h1>
          <p className="text-sm text-gray-500 mt-1">Revisa y gestiona las postulaciones de estudiantes</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFiltro('todos')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filtro === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltro('postulado')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filtro === 'postulado' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFiltro('aceptado')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filtro === 'aceptado' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Aceptados
          </button>
          <button
            onClick={() => setFiltro('rechazado')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filtro === 'rechazado' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rechazados
          </button>
        </div>

        {/* Lista de postulaciones */}
        <div className="space-y-4">
          {postulaciones.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay postulaciones registradas</p>
            </div>
          ) : (
            postulaciones.map((postulacion) => (
              <div key={postulacion.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-800">
                        {postulacion.oferta?.titulo || 'Sin título'}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {postulacion.oferta?.empresa?.razon_social || 'Empresa'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(postulacion.fecha_postulacion).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoColor(postulacion.estado)}`}>
                      {getEstadoTexto(postulacion.estado)}
                    </span>
                  </div>

                  {/* Estudiante */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-600">Estudiante</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-800">
                        {postulacion.estudiante?.usuario?.nombres} {postulacion.estudiante?.usuario?.apellidos}
                      </p>
                      <p className="text-xs text-gray-500">
                        Código: {postulacion.estudiante?.codigo_universitario} | {postulacion.estudiante?.usuario?.email}
                      </p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-4 flex justify-end gap-2">
                    <Link
                      href={`/practicas/${postulacion.oferta?.id}`}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver oferta
                    </Link>
                    
                    {postulacion.estado === 'postulado' && (
                      <>
                        <button
                          onClick={() => handleCambiarEstado(postulacion.id, 'aceptado')}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                        >
                          ✅ Aceptar
                        </button>
                        <button
                          onClick={() => handleCambiarEstado(postulacion.id, 'rechazado')}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                        >
                          ❌ Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}