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
  AlertCircle,
  TrendingUp,
  Award,
  MapPin,
  ChevronRight,
  Sparkles,
  Users
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
    case 'aceptado': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'postulado': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'rechazado': return 'bg-red-50 text-red-700 border-red-200';
    case 'en_curso': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'finalizado': return 'bg-gray-100 text-gray-600 border-gray-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getEstadoIcon = (estado: string) => {
  switch (estado) {
    case 'aceptado': return <CheckCircle className="h-3.5 w-3.5" />;
    case 'rechazado': return <XCircle className="h-3.5 w-3.5" />;
    case 'en_curso': return <Clock className="h-3.5 w-3.5" />;
    default: return <AlertCircle className="h-3.5 w-3.5" />;
  }
};

const getEstadoTexto = (estado: string) => {
  switch (estado) {
    case 'aceptado': return 'Aceptado';
    case 'postulado': return 'En revisión';
    case 'rechazado': return 'Rechazado';
    case 'en_curso': return 'En curso';
    case 'finalizado': return 'Finalizado';
    default: return estado;
  }
};

const getModalidadColor = (modalidad: string) => {
  switch (modalidad) {
    case 'remota': return 'bg-emerald-50 text-emerald-700';
    case 'hibrida': return 'bg-purple-50 text-purple-700';
    default: return 'bg-blue-50 text-blue-700';
  }
};

const getModalidadTexto = (modalidad: string) => {
  switch (modalidad) {
    case 'remota': return 'Remota';
    case 'hibrida': return 'Híbrida';
    default: return 'Presencial';
  }
};

export default function MisPostulacionesPage() {
  const { data: postulaciones, isLoading, error } = useQuery({
    queryKey: ['mis-postulaciones'],
    queryFn: async () => {
      const response = await apiFetch<any>('/ofertas/mis-postulaciones');
      console.log('Respuesta del backend:', response);
      if (Array.isArray(response)) {
        return response;
      }
      if (response?.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-gray-200 border-t-[#E8A735] rounded-full mx-auto"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-400 mt-4"
          >
            Cargando tus postulaciones...
          </motion.p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error cargando postulaciones:', error);
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50/50 rounded-2xl p-8 text-center border border-red-100"
        >
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-red-600 font-medium">Error al cargar las postulaciones</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </motion.div>
      </div>
    );
  }

  const postulacionesArray = Array.isArray(postulaciones) ? postulaciones : [];

  if (postulacionesArray.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-600">No has postulado a ninguna práctica</h2>
          <p className="text-gray-400 mt-2">Explora las oportunidades disponibles y comienza tu carrera profesional</p>
          <Link 
            href="/practicas" 
            className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition shadow-lg"
          >
            Ver ofertas disponibles
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* MISMO ESTILO QUE PORTAL DE PRÁCTICAS: max-w-7xl mx-auto px-4 */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header mejorado */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-[#E8A735] animate-pulse" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#E8A735]">
              Seguimiento de prácticas
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#0A1C2E] to-[#2a3c4e] bg-clip-text text-transparent tracking-tight">
                Mis postulaciones
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Seguimiento y evolución de tus prácticas preprofesionales
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#E8A735]" />
              <span>{postulacionesArray.length} postulación{postulacionesArray.length !== 1 ? 'es' : ''}</span>
            </div>
          </div>
        </div>

        {/* Grid de postulaciones - altura reducida */}
        <div className="space-y-3">
          {postulacionesArray.map((postulacion: Postulacion, idx: number) => (
            <motion.div
              key={postulacion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -1 }}
              className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Barra decorativa lateral */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0A1C2E] to-[#E8A735] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="p-3.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Título */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-gray-800 group-hover:text-[#0A1C2E] transition-colors">
                        {postulacion.oferta?.titulo || 'Sin título'}
                      </h2>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${getModalidadColor(postulacion.oferta?.modalidad || '')}`}>
                        <MapPin className="h-2.5 w-2.5" />
                        {getModalidadTexto(postulacion.oferta?.modalidad || '')}
                      </span>
                    </div>
                    
                    {/* Empresa */}
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3 w-3" />
                      {postulacion.oferta?.empresa?.razon_social || 'Empresa no especificada'}
                    </p>
                    
                    {/* Detalles */}
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[10px] text-gray-400">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        Postulado: {new Date(postulacion.fecha_postulacion).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Badge de estado */}
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium border ${getEstadoColor(postulacion.estado)}`}>
                    {getEstadoIcon(postulacion.estado)}
                    {getEstadoTexto(postulacion.estado)}
                  </div>
                </div>

                {/* Progreso para postulaciones aceptadas/en curso - compacto */}
                {postulacion.seguimiento && (postulacion.estado === 'aceptado' || postulacion.estado === 'en_curso') && (
                  <div className="mt-2 pt-1.5 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-2.5 w-2.5 text-blue-500" />
                        <span className="font-medium text-gray-600">Progreso de horas</span>
                      </div>
                      <span className="font-semibold text-gray-700 text-[10px]">
                        {postulacion.seguimiento.horas_cumplidas} / {postulacion.seguimiento.horas_totales} hrs
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <motion.div 
                        className="bg-gradient-to-r from-[#0A1C2E] to-[#E8A735] h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(postulacion.seguimiento.horas_cumplidas / postulacion.seguimiento.horas_totales) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                    
                    {postulacion.seguimiento.evaluacion !== 'pendiente' && (
                      <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-50">
                        <Award className="h-2.5 w-2.5 text-gray-500" />
                        Evaluación: 
                        <span className={postulacion.seguimiento.evaluacion === 'aprobado' ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {postulacion.seguimiento.evaluacion === 'aprobado' ? 'Aprobado' : 'Desaprobado'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Acciones */}
                <div className="mt-2 pt-1 flex items-center justify-end">
                  <Link
                    href={`/practicas/${postulacion.oferta?.id}`}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-[#0A1C2E] transition-colors group/link"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Ver oferta</span>
                    <ChevronRight className="h-2.5 w-2.5 transition-transform group-hover/link:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Estadísticas resumidas al final */}
        {postulacionesArray.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide">Aceptadas</p>
                  <p className="text-base font-bold text-gray-800">
                    {postulacionesArray.filter((p: Postulacion) => p.estado === 'aceptado').length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide">En curso</p>
                  <p className="text-base font-bold text-gray-800">
                    {postulacionesArray.filter((p: Postulacion) => p.estado === 'en_curso').length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide">En revisión</p>
                  <p className="text-base font-bold text-gray-800">
                    {postulacionesArray.filter((p: Postulacion) => p.estado === 'postulado').length}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}