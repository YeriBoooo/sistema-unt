'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  AlertCircle
} from 'lucide-react';

interface Postulacion {
  id: number;
  estado: string;
  fecha_postulacion: string;
  oferta: {
    id: number;
    titulo: string;
    modalidad: string;
    empresa: {
      razon_social: string;
    };
  };
  seguimiento?: {
    horas_cumplidas: number;
    horas_totales: number;
    evaluacion: string;
  };
}

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

const getEstadoIcon = (estado: string) => {
  switch (estado) {
    case 'aceptado': return <CheckCircle className="h-4 w-4" />;
    case 'rechazado': return <XCircle className="h-4 w-4" />;
    case 'en_curso': return <Clock className="h-4 w-4" />;
    default: return <AlertCircle className="h-4 w-4" />;
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

export default function MisPostulacionesPage() {
  // Consulta directa sin useAuth para asegurar que se ejecute
  const { data: postulaciones, isLoading, error } = useQuery({
    queryKey: ['mis-postulaciones'],
    queryFn: async () => {
      const response = await apiFetch<any>('/ofertas/mis-postulaciones');
      console.log('Respuesta del backend:', response);
      // Si la respuesta es un array, devuélvelo directamente
      if (Array.isArray(response)) {
        return response;
      }
      // Si viene envuelto en data.data
      if (response?.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      // Si viene envuelto en data
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    console.error('Error cargando postulaciones:', error);
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
          <p className="text-red-600">Error al cargar las postulaciones</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm text-red-600 hover:text-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const postulacionesArray = Array.isArray(postulaciones) ? postulaciones : [];

  if (postulacionesArray.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Mis postulaciones</h1>
          <p className="text-sm text-gray-500 mt-1">Seguimiento de tus prácticas preprofesionales</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No has postulado a ninguna práctica aún</p>
          <Link href="/practicas" className="inline-block mt-3 text-blue-600 hover:text-blue-700 text-sm">
            Ver ofertas disponibles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Mis postulaciones</h1>
        <p className="text-sm text-gray-500 mt-1">Seguimiento de tus prácticas preprofesionales</p>
      </div>

      <div className="space-y-4">
        {postulacionesArray.map((postulacion: Postulacion, idx: number) => (
          <motion.div
            key={postulacion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-800">
                    {postulacion.oferta?.titulo || 'Sin título'}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {postulacion.oferta?.empresa?.razon_social || 'Empresa no especificada'}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoColor(postulacion.estado)}`}>
                  {getEstadoIcon(postulacion.estado)}
                  {getEstadoTexto(postulacion.estado)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Postulación: {new Date(postulacion.fecha_postulacion).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Briefcase className="h-4 w-4" />
                  <span>Modalidad: {postulacion.oferta?.modalidad === 'remota' ? 'Remota' : 
                                   postulacion.oferta?.modalidad === 'hibrida' ? 'Híbrida' : 'Presencial'}</span>
                </div>
              </div>

              {postulacion.seguimiento && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Horas cumplidas:</span>
                    <span className="font-medium text-gray-700">
                      {postulacion.seguimiento.horas_cumplidas} / {postulacion.seguimiento.horas_totales} horas
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(postulacion.seguimiento.horas_cumplidas / postulacion.seguimiento.horas_totales) * 100}%` }}
                    />
                  </div>
                  {postulacion.seguimiento.evaluacion !== 'pendiente' && (
                    <p className="text-xs mt-2 text-gray-500">
                      Evaluación: <span className={postulacion.seguimiento.evaluacion === 'aprobado' ? 'text-green-600' : 'text-red-600'}>
                        {postulacion.seguimiento.evaluacion === 'aprobado' ? 'Aprobado' : 'Desaprobado'}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Link
                  href={`/practicas/${postulacion.oferta?.id}`}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Ver oferta
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}