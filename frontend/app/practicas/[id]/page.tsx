'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  MapPin,
  XCircle,
  Clock,
  ArrowLeft,
  Send,
  TrendingUp,
  FileText,
  Upload,
  AlertCircle,
  Sparkles,
  Award,
  Users,
  CheckCircle,
  Loader2,
  Pencil,
  UserCheck
} from 'lucide-react';

interface OfertaDetalle {
  id: number;
  titulo: string;
  descripcion: string;
  requisitos: string;
  modalidad: string;
  vacantes: number;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
  empresa?: {
    id: number;
    razon_social: string;
    ruc: string;
    direccion: string;
    telefono: string;
    email_contacto: string;
  };
}

interface PostulacionInfo {
  id: number;
  estado: string;
  fecha_postulacion: string;
  seguimiento?: {
    id: number;
    horas_cumplidas: number;
    horas_totales: number;
    evaluacion: string;
    informe_estudiante?: string;
    informe_asesor?: string;
  };
}

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
  asesor_academico_id?: number;
}

interface Asesor {
  id: number;
  usuario: {
    nombres: string;
    apellidos: string;
    email: string;
  };
  especialidad: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const getModalidadTexto = (modalidad: string) => {
  switch (modalidad) {
    case 'remota': return 'Remota';
    case 'hibrida': return 'Híbrida';
    default: return 'Presencial';
  }
};

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'postulado': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'aceptado': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'en_curso': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'rechazado': return 'bg-red-100 text-red-700 border-red-200';
    case 'finalizado': return 'bg-gray-100 text-gray-700 border-gray-200';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function DetalleOfertaPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [horas, setHoras] = useState('');
  const [informe, setInforme] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [asesorSeleccionado, setAsesorSeleccionado] = useState<number | null>(null);
  const [postulacionesData, setPostulacionesData] = useState<Postulacion[]>([]);

  const canEdit = user?.roles?.includes('admin') || 
                  user?.roles?.includes('coordinador') || 
                  user?.roles?.includes('empresa');

  const canAssignAsesor = user?.roles?.includes('admin') || user?.roles?.includes('coordinador');

  // ✅ Cargar lista de asesores - SIN ERROR DE TYPESCRIPT
  const { data: asesoresData } = useQuery({
    queryKey: ['asesores'],
    queryFn: () => apiFetch<any>('/asesores'),
    enabled: canAssignAsesor,
  });

  // ✅ Normalización segura de asesores (sin subrayado)
  const asesores: Asesor[] = (() => {
    const raw = asesoresData as any;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    if (raw?.data?.data && Array.isArray(raw.data.data)) return raw.data.data;
    return [];
  })();

  // ✅ 1. Obtener detalles de la oferta
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['oferta', id],
    queryFn: () => apiFetch(`/ofertas/${id}`) as Promise<any>,
    enabled: !!id,
  });

  const oferta: OfertaDetalle | undefined = (response as any)?.data?.data || (response as any)?.data || response;

  // ✅ Obtener postulaciones de esta oferta
  const { data: postulacionesResponse, refetch: refetchPostulaciones } = useQuery({
    queryKey: ['postulaciones-oferta', id],
    queryFn: () => apiFetch<any>(`/ofertas/${id}/postulaciones`) as Promise<any>,
    enabled: canAssignAsesor && !!id,
  });

  useEffect(() => {
    if (postulacionesResponse) {
      const raw = postulacionesResponse as any;
      const data = raw?.data?.data || raw?.data || raw;
      setPostulacionesData(Array.isArray(data) ? data : []);
    }
  }, [postulacionesResponse]);

  // ✅ 2. Obtener postulación específica de esta oferta (para estudiantes)
  const { data: postulacionResponse, refetch: refetchPostulacion } = useQuery({
    queryKey: ['mi-postulacion', id],
    queryFn: () => apiFetch(`/ofertas/${id}/mi-postulacion`) as Promise<any>,
    enabled: !!user?.roles?.includes('estudiante') && !!id,
  });

  const postulacionData = (postulacionResponse as any)?.data?.data || (postulacionResponse as any)?.data;
  const postulacion: PostulacionInfo | undefined = postulacionData?.id ? postulacionData : undefined;

  // ✅ 3. Obtener todas las postulaciones del estudiante
  const { data: todasPostulaciones, isLoading: loadingPostulaciones } = useQuery({
    queryKey: ['mis-postulaciones-todas'],
    queryFn: async () => {
      const result = await apiFetch('/ofertas/mis-postulaciones');
      const responseData = result as any;
      const data = responseData?.data?.data || responseData?.data || responseData || [];
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user?.roles?.includes('estudiante'),
  });

  const tienePostulacionActiva = (todasPostulaciones || []).some(
    (p: any) => (p.estado === 'postulado' || p.estado === 'aceptado' || p.estado === 'en_curso') && p.id !== postulacion?.id
  );

  const puedePostular = user?.roles?.includes('estudiante') 
    && oferta?.estado === 'abierta' 
    && !postulacion 
    && !tienePostulacionActiva;
    
  const estaAceptado = postulacion?.estado === 'aceptado' || postulacion?.estado === 'en_curso';
  const estaPostulado = postulacion?.estado === 'postulado';
  const estaRechazado = postulacion?.estado === 'rechazado';
  
  const horasProgreso = postulacion?.seguimiento 
    ? (postulacion.seguimiento.horas_cumplidas / postulacion.seguimiento.horas_totales) * 100 
    : 0;
  
  const horasRestantes = postulacion?.seguimiento 
    ? postulacion.seguimiento.horas_totales - postulacion.seguimiento.horas_cumplidas 
    : 0;

  // ✅ Mutación para asignar asesor
  const asignarAsesorMutation = useMutation({
    mutationFn: async ({ postulacionId, asesorId }: { postulacionId: number; asesorId: number }) => {
      return apiFetch(`/ofertas/postulaciones/${postulacionId}/asesor`, {
        method: 'PATCH',
        body: JSON.stringify({ asesorId }),
      });
    },
    onSuccess: () => {
      toast.success('✅ Asesor asignado correctamente');
      refetchPostulaciones();
      setAsesorSeleccionado(null);
    },
    onError: (error: any) => {
      toast.error('❌ Error al asignar asesor: ' + error.message);
    },
  });

  const postularMutation = useMutation({
    mutationFn: async () => {
      return apiFetch(`/ofertas/${id}/postular`, { method: 'POST' });
    },
    onSuccess: () => {
      toast.success('✅ ¡Postulación exitosa!', {
        description: 'Un asesor será asignado pronto.',
      });
      refetchPostulacion();
      queryClient.invalidateQueries({ queryKey: ['mis-postulaciones-todas'] });
      queryClient.invalidateQueries({ queryKey: ['mis-postulaciones'] });
    },
    onError: (error: any) => {
      const msg = error.message || 'Error al postular. Ya tienes una postulación activa.';
      toast.error(msg);
    },
  });

  const registrarHorasMutation = useMutation({
    mutationFn: async (data: { horas_cumplidas: number; informe: string }) => {
      return apiFetch(`/seguimiento/postulacion/${postulacion?.id}/horas`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success('✅ Horas registradas correctamente');
      setHoras('');
      setInforme('');
      setMostrarFormulario(false);
      refetchPostulacion();
      queryClient.invalidateQueries({ queryKey: ['dashboard-estudiante'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al registrar horas');
    },
  });

  const handlePostular = () => {
    if (confirm('¿Estás seguro de que quieres postular a esta práctica?')) {
      postularMutation.mutate();
    }
  };

  const handleAsignarAsesor = (postulacionId: number) => {
    if (!asesorSeleccionado) {
      toast.error('Selecciona un asesor primero');
      return;
    }
    asignarAsesorMutation.mutate({ postulacionId, asesorId: asesorSeleccionado });
  };

  const handleRegistrarHoras = (e: React.FormEvent) => {
    e.preventDefault();
    const horasNum = parseInt(horas);
    if (isNaN(horasNum) || horasNum <= 0) {
      toast.error('Ingresa un número válido de horas');
      return;
    }
    if (horasNum > horasRestantes) {
      toast.error(`No puedes exceder las horas restantes (${horasRestantes} horas disponibles)`);
      return;
    }
    registrarHorasMutation.mutate({ horas_cumplidas: horasNum, informe });
  };

  if (isLoading || loadingPostulaciones) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
          <p className="text-sm text-gray-400 mt-4">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (!oferta) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-gray-300" />
          </div>
          <h2 className="text-xl font-medium text-gray-700">Oferta no encontrada</h2>
          <p className="text-sm text-gray-400 mt-1">La oportunidad que buscas no está disponible</p>
          <Link href="/practicas" className="inline-block mt-6 px-6 py-2 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-800 transition">
            Ver todas las prácticas
          </Link>
        </div>
      </div>
    );
  }

  const estadoPostulacion = postulacion?.estado;
  const EstadoIcon = estadoPostulacion === 'postulado' ? Clock : estadoPostulacion === 'aceptado' ? CheckCircle : XCircle;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        <div className="flex justify-between items-center mb-8">
          <Link 
            href="/practicas" 
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Volver a prácticas</span>
          </Link>
          
          {canEdit && (
            <Link href={`/practicas/${oferta.id}/editar`}>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                <Pencil className="h-4 w-4" />
                Editar oferta
              </button>
            </Link>
          )}
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-8"
        >
          {/* Hero Section */}
          <motion.div variants={fadeInUp} className="border-b border-gray-100 pb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">{oferta.empresa?.razon_social}</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    {oferta.estado === 'abierta' ? 'Activa' : 'Cerrada'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 tracking-tight">{oferta.titulo}</h1>
              </div>

              {estadoPostulacion && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getEstadoColor(estadoPostulacion)}`}>
                  <EstadoIcon className="h-3.5 w-3.5" />
                  {estadoPostulacion === 'postulado' ? 'En revisión' : 
                   estadoPostulacion === 'aceptado' ? 'Aceptado' :
                   estadoPostulacion === 'rechazado' ? 'Rechazado' :
                   estadoPostulacion === 'en_curso' ? 'En curso' : estadoPostulacion}
                </span>
              )}
            </div>
          </motion.div>

          {/* Info Grid */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-[10px] text-gray-400">Periodo</p>
                <p className="text-sm text-gray-700">
                  {new Date(oferta.fecha_inicio).toLocaleDateString()} - {new Date(oferta.fecha_fin).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-[10px] text-gray-400">Modalidad</p>
                <p className="text-sm text-gray-700 capitalize">{getModalidadTexto(oferta.modalidad)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <Users className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-[10px] text-gray-400">Vacantes</p>
                <p className="text-sm text-gray-700">{oferta.vacantes} puestos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <Sparkles className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-[10px] text-gray-400">Código</p>
                <p className="text-sm font-mono text-gray-700">UNT-{oferta.id}</p>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div variants={fadeInUp}>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-gray-400" />
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripción</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">{oferta.descripcion}</p>
          </motion.div>

          {/* Requirements */}
          {oferta.requisitos && (
            <motion.div variants={fadeInUp}>
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-gray-400" />
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Requisitos</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">{oferta.requisitos}</p>
            </motion.div>
          )}

          {/* Postulaciones (solo para admin/coordinador) */}
          {canAssignAsesor && postulacionesData.length > 0 && (
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <h2 className="text-xs font-semibold text-gray-600 uppercase">Postulaciones recibidas</h2>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {postulacionesData.map((post: Postulacion) => (
                  <div key={post.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-800">
                          {post.estudiante?.usuario?.nombres} {post.estudiante?.usuario?.apellidos}
                        </p>
                        <p className="text-xs text-gray-500">
                          {post.estudiante?.codigo_universitario} · {post.estudiante?.usuario?.email}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        post.estado === 'aceptado' ? 'bg-green-100 text-green-700' :
                        post.estado === 'en_curso' ? 'bg-blue-100 text-blue-700' :
                        post.estado === 'finalizado' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {post.estado === 'aceptado' ? 'Aceptado' :
                         post.estado === 'en_curso' ? 'En curso' :
                         post.estado === 'finalizado' ? 'Finalizado' : 'Postulado'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">Postulado: {new Date(post.fecha_postulacion).toLocaleDateString()}</p>
                    
                    {post.estado === 'aceptado' && !post.asesor_academico_id && (
                      <div className="mt-3 flex items-center gap-3">
                        <select
                          value={asesorSeleccionado || ''}
                          onChange={(e) => setAsesorSeleccionado(Number(e.target.value))}
                          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar asesor</option>
                          {asesores.map((asesor) => (
                            <option key={asesor.id} value={asesor.id}>
                              {asesor.usuario?.nombres} {asesor.usuario?.apellidos}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAsignarAsesor(post.id)}
                          disabled={asignarAsesorMutation.isPending}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                        >
                          <UserCheck className="h-3 w-3" />
                          Asignar asesor
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Progreso para estudiante aceptado */}
          {estaAceptado && postulacion?.seguimiento && (
            <motion.div variants={fadeInUp} className="bg-gray-50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Mi progreso</h2>
              </div>
              
              <div className="mb-5">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Horas cumplidas</span>
                  <span className="font-medium">{postulacion.seguimiento.horas_cumplidas} / {postulacion.seguimiento.horas_totales} hrs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${horasProgreso}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {Math.round(horasProgreso)}% completado · {horasRestantes} horas restantes
                </p>
              </div>

              <button
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Upload className="h-4 w-4" />
                {mostrarFormulario ? 'Cancelar' : '+ Registrar horas'}
              </button>

              {mostrarFormulario && (
                <form onSubmit={handleRegistrarHoras} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Horas a registrar</label>
                    <input
                      type="number"
                      value={horas}
                      onChange={(e) => setHoras(e.target.value)}
                      placeholder="Ej: 8"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                      required
                      min="1"
                      max={horasRestantes}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Máximo: {horasRestantes} horas</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Informe de actividades</label>
                    <textarea
                      value={informe}
                      onChange={(e) => setInforme(e.target.value)}
                      placeholder="Describe las actividades realizadas durante estas horas..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={registrarHorasMutation.isPending}
                    className="w-full bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-900 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {registrarHorasMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {registrarHorasMutation.isPending ? 'Registrando...' : 'Guardar horas'}
                  </button>
                </form>
              )}

              {postulacion.seguimiento.informe_estudiante && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Último informe:</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{postulacion.seguimiento.informe_estudiante}</p>
                </div>
              )}

              {postulacion.seguimiento.evaluacion !== 'pendiente' && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-xs font-medium text-gray-600">Evaluación:</span>{' '}
                  <span className={postulacion.seguimiento.evaluacion === 'aprobado' ? 'text-emerald-600' : 'text-red-600'}>
                    {postulacion.seguimiento.evaluacion === 'aprobado' ? 'Aprobado' : 'Desaprobado'}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {estaPostulado && (
            <motion.div variants={fadeInUp} className="bg-amber-50 rounded-xl p-5 text-center">
              <Clock className="h-6 w-6 text-amber-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-amber-800">Postulación en revisión</h3>
              <p className="text-xs text-amber-700">Tu postulación está siendo evaluada por el coordinador</p>
              <Link href="/practicas/mis-postulaciones" className="inline-block mt-2 text-xs text-amber-600 hover:text-amber-700">
                Ver mis postulaciones →
              </Link>
            </motion.div>
          )}

          {estaRechazado && (
            <motion.div variants={fadeInUp} className="bg-red-50 rounded-xl p-5 text-center">
              <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-red-800">Postulación no aceptada</h3>
              <p className="text-xs text-red-700">Puedes postular a otras ofertas</p>
              <Link href="/practicas" className="inline-block mt-2 text-xs text-red-600 hover:text-red-700">
                Ver más ofertas →
              </Link>
            </motion.div>
          )}

          {tienePostulacionActiva && !postulacion && (
            <motion.div variants={fadeInUp} className="bg-amber-50 rounded-xl p-5 text-center border border-amber-200">
              <AlertCircle className="h-6 w-6 text-amber-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-amber-800">No puedes postular a más ofertas</h3>
              <p className="text-xs text-amber-700">
                Ya tienes una postulación activa. Espera a que sea aceptada o rechazada antes de postular a otra oferta.
              </p>
              <Link href="/practicas/mis-postulaciones" className="inline-block mt-2 text-xs text-amber-600 hover:text-amber-700 font-medium">
                Ver mi postulación activa →
              </Link>
            </motion.div>
          )}

          {puedePostular && (
            <motion.div variants={fadeInUp}>
              <button
                onClick={handlePostular}
                disabled={postularMutation.isPending}
                className="w-full bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {postularMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</>
                ) : (
                  <><Send className="h-4 w-4" /> Postular ahora</>
                )}
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">Un asesor será asignado para tu seguimiento</p>
            </motion.div>
          )}

          {!user?.roles?.includes('estudiante') && user && (
            <motion.div variants={fadeInUp} className="bg-gray-50 rounded-xl p-5 text-center">
              <AlertCircle className="h-6 w-6 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Solo estudiantes pueden postular a prácticas</p>
              <Link href="/login" className="inline-block mt-2 text-sm text-gray-800 hover:text-gray-900">
                Iniciar sesión como estudiante
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}