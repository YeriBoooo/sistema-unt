'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiFetch } from '@/lib/api/client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Briefcase,
  FileText,
  Clock,
  Calendar,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Target,
  Sparkles,
  Users,
  Building2,
  CheckCircle,
  Clock as ClockIcon,
  Award,
  UserCheck,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  const getUserRole = () => {
    if (!user) return '';
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      const firstRole = user.roles[0];
      if (typeof firstRole === 'string') return firstRole;
      if (firstRole && typeof firstRole === 'object' && 'nombre' in firstRole) return firstRole.nombre;
    }
    return '';
  };
  
  const userRole = getUserRole();

  if (userRole === 'estudiante') {
    return <EstudianteDashboard />;
  }
  
  if (userRole === 'asesor') {
    return <AsesorDashboard />;
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return <AdminDashboard />;
}

// ============================================
// ========== DASHBOARD DEL ESTUDIANTE ==========
// ============================================
function EstudianteDashboard() {
  const { user } = useAuth();

  const { data: response, isLoading } = useQuery({
    queryKey: ['dashboard-estudiante'],
    queryFn: () => apiFetch<any>('/dashboard/estudiante'),
    enabled: !!user,
  });

  const stats = response?.data;
  const horasProgreso = stats?.horasPractica
    ? (stats.horasPractica.cumplidas / stats.horasPractica.totales) * 100
    : 0;

  const nombreCompleto = `${user?.nombres} ${user?.apellidos}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header con gradiente */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-[#E8A735] animate-pulse" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#E8A735]">
              Panel de control
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#0A1C2E] to-[#2a3c4e] bg-clip-text text-transparent tracking-tight">
                Bienvenido, {nombreCompleto.split(' ')[0]}
              </h1>
              <p className="text-gray-500 mt-2">
                Resumen de tu progreso académico
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#E8A735]" />
              <span>Estudiante</span>
            </div>
          </div>
        </div>

        {/* Grid de tarjetas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Tarjeta de Tesis - ocupa 2 columnas en desktop */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Proyecto de tesis</h2>
                </div>
                {stats?.tesisActiva ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{stats.tesisActiva.titulo}</h3>
                    <Link href={`/tesis/${stats.tesisActiva.id}`} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Continuar con tu tesis <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-gray-500">No has registrado tu proyecto de tesis aún</p>
                    <Link href="/tesis/nueva" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors">
                      <FileText className="h-4 w-4" /> Crear proyecto
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tarjeta de Horas */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Horas de práctica</h2>
              </div>
              <div className="relative inline-flex items-center justify-center my-4">
                <svg className="w-28 h-28 -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="#fed7aa" strokeWidth="6" fill="none" />
                  <circle cx="56" cy="56" r="48" stroke="#ea580c" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="301.59" strokeDashoffset={301.59 - (301.59 * horasProgreso) / 100} />
                </svg>
                <div className="absolute">
                  <span className="text-2xl font-bold text-gray-800">{Math.round(horasProgreso)}<span className="text-sm">%</span></span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {stats?.horasPractica?.cumplidas || 0} de {stats?.horasPractica?.totales || 300} horas completadas
              </p>
              <Link href="/practicas" className="inline-block mt-4 text-sm font-medium text-orange-600 hover:text-orange-700">
                Registrar horas →
              </Link>
            </div>
          </div>

          {/* Tarjeta de Postulación */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-yellow-100 rounded-xl">
                  <Briefcase className="h-5 w-5 text-yellow-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Postulación activa</h2>
              </div>
              {stats?.postulacionActiva ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{stats.postulacionActiva.oferta?.titulo}</h3>
                  <p className="text-sm text-gray-500">{stats.postulacionActiva.oferta?.empresa?.razon_social}</p>
                  <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    <CheckCircle className="h-3 w-3" /> Postulación activa
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-gray-500">No tienes una postulación activa</p>
                  <Link href="/practicas" className="inline-flex items-center gap-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                    Ver ofertas disponibles <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mensaje motivacional */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-gray-600">El éxito comienza con pequeños pasos. ¡Sigue avanzando!</span>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ========== DASHBOARD DEL ASESOR ==========
// ============================================
function AsesorDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: postulacionesData, isLoading: loadingPostulaciones, refetch } = useQuery({
    queryKey: ['asesor-postulaciones'],
    queryFn: () => apiFetch<any>('/ofertas/postulaciones/asesor'),
    enabled: !!user,
  });

  const { data: tesisData, isLoading: loadingTesis } = useQuery({
    queryKey: ['asesor-tesis'],
    queryFn: () => apiFetch<any>('/tesis'),
    enabled: !!user,
  });

  const postulaciones = postulacionesData?.data || [];
  const tesis = tesisData?.data || [];

  const nombreCompleto = `${user?.nombres} ${user?.apellidos}`;

  const evaluarMutation = useMutation({
    mutationFn: async ({ postulacionId, evaluacion }: { postulacionId: number; evaluacion: string }) => {
      return apiFetch(`/seguimiento/postulacion/${postulacionId}/evaluar`, {
        method: 'POST',
        body: JSON.stringify({ evaluacion }),
      });
    },
    onSuccess: () => {
      alert('✅ Práctica evaluada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['asesor-postulaciones'] });
      refetch();
    },
    onError: (error: any) => {
      alert('❌ Error al evaluar: ' + (error.message || 'Intenta nuevamente'));
    },
  });

  const finalizarMutation = useMutation({
    mutationFn: async (postulacionId: number) => {
      return apiFetch(`/seguimiento/postulacion/${postulacionId}/finalizar`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      alert('✅ Práctica finalizada correctamente');
      queryClient.invalidateQueries({ queryKey: ['asesor-postulaciones'] });
      refetch();
    },
    onError: (error: any) => {
      alert('❌ Error al finalizar: ' + (error.message || 'Intenta nuevamente'));
    },
  });

  const evaluarPractica = (postulacionId: number, evaluacion: string) => {
    if (confirm(`¿Estás seguro de que quieres ${evaluacion === 'aprobado' ? 'APROBAR' : 'DESAPROBAR'} esta práctica?`)) {
      evaluarMutation.mutate({ postulacionId, evaluacion });
    }
  };

  const finalizarPractica = (postulacionId: number) => {
    if (confirm('¿Estás seguro de que quieres FINALIZAR esta práctica?')) {
      finalizarMutation.mutate(postulacionId);
    }
  };

  if (loadingPostulaciones || loadingTesis) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header con gradiente */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-[#E8A735] animate-pulse" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#E8A735]">
              Panel del Asesor
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#0A1C2E] to-[#2a3c4e] bg-clip-text text-transparent tracking-tight">
                Bienvenido, {nombreCompleto.split(' ')[0]}
              </h1>
              <p className="text-gray-500 mt-2">
                Resumen de tus estudiantes asignados
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#E8A735]" />
              <span>Asesor</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{postulaciones.length}</p>
                <p className="text-sm text-gray-500">Estudiantes asignados</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{tesis.length}</p>
                <p className="text-sm text-gray-500">Tesis supervisadas</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{postulaciones.filter((p: any) => p.estado === 'en_curso').length}</p>
                <p className="text-sm text-gray-500">Prácticas en curso</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de estudiantes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-semibold text-gray-800">📋 Mis estudiantes asignados</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {postulaciones.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tienes estudiantes asignados aún</p>
              </div>
            ) : (
              postulaciones.map((postulacion: any) => {
                const seguimiento = postulacion.seguimiento || {};
                const horasCumplidas = seguimiento.horas_cumplidas || 0;
                const horasTotales = seguimiento.horas_totales || 300;
                const horasProgreso = (horasCumplidas / horasTotales) * 100;
                const horasCompletas = horasCumplidas >= horasTotales;
                const evaluacion = seguimiento.evaluacion || 'pendiente';
                
                return (
                  <div key={postulacion.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {postulacion.estudiante?.usuario?.nombres} {postulacion.estudiante?.usuario?.apellidos}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {postulacion.oferta?.titulo} - {postulacion.oferta?.empresa?.razon_social}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Código: {postulacion.estudiante?.codigo_universitario}
                        </p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        postulacion.estado === 'aceptado' ? 'bg-green-100 text-green-700' :
                        postulacion.estado === 'en_curso' ? 'bg-blue-100 text-blue-700' : 
                        postulacion.estado === 'finalizado' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {postulacion.estado === 'aceptado' ? 'Aceptado' : 
                         postulacion.estado === 'en_curso' ? 'En curso' :
                         postulacion.estado === 'finalizado' ? 'Finalizado' : 'Postulado'}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Horas cumplidas</span>
                        <span className="font-medium">{horasCumplidas} / {horasTotales} horas</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(horasProgreso, 100)}%` }} />
                      </div>
                    </div>

                    {evaluacion !== 'pendiente' && (
                      <div className="mb-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full ${
                          evaluacion === 'aprobado' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {evaluacion === 'aprobado' ? '✅ Aprobado' : '❌ Desaprobado'}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <Link href={`/practicas/${postulacion.oferta?.id}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Ver detalles →
                      </Link>
                      
                      {postulacion.estado === 'en_curso' && horasCompletas && evaluacion === 'pendiente' && (
                        <>
                          <button
                            onClick={() => evaluarPractica(postulacion.id, 'aprobado')}
                            className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                          >
                            ✅ Aprobar
                          </button>
                          <button
                            onClick={() => evaluarPractica(postulacion.id, 'desaprobado')}
                            className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                          >
                            ❌ Desaprobar
                          </button>
                        </>
                      )}
                      
                      {postulacion.estado === 'en_curso' && horasCompletas && evaluacion !== 'pendiente' && (
                        <button
                          onClick={() => finalizarPractica(postulacion.id)}
                          className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          🏁 Finalizar práctica
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">⚡ Acciones rápidas</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/seguimiento" className="px-4 py-2 bg-blue-50 text-blue-700 text-sm rounded-xl hover:bg-blue-100 transition-colors">
              Ver todos mis estudiantes
            </Link>
            <Link href="/tesis" className="px-4 py-2 bg-purple-50 text-purple-700 text-sm rounded-xl hover:bg-purple-100 transition-colors">
              Revisar tesis asignadas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ========== DASHBOARD DEL ADMIN ==========
// ============================================
function AdminDashboard() {
  const { user } = useAuth();

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiFetch<any>('/dashboard/stats'),
  });

  const stats = statsData?.data || statsData;
  const nombreCompleto = `${user?.nombres} ${user?.apellidos}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header con gradiente */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-[#E8A735] animate-pulse" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#E8A735]">
              Panel Administrativo
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#0A1C2E] to-[#2a3c4e] bg-clip-text text-transparent tracking-tight">
                Bienvenido, {nombreCompleto.split(' ')[0]}
              </h1>
              <p className="text-gray-500 mt-2">
                Métricas generales del sistema
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#E8A735]" />
              <span>Administrador</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stats?.estudiantesEnPractica || 0}</p>
                <p className="text-sm text-gray-500">Estudiantes en práctica</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stats?.tesisEnCurso || 0}</p>
                <p className="text-sm text-gray-500">Tesis en curso</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Building2 className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stats?.conveniosActivos || 0}</p>
                <p className="text-sm text-gray-500">Convenios activos</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stats?.ofertasAbiertas || 0}</p>
                <p className="text-sm text-gray-500">Ofertas abiertas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">🚀 Acciones rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/estudiantes" className="text-center p-3 bg-blue-50 rounded-xl text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
              Estudiantes
            </Link>
            <Link href="/empresas" className="text-center p-3 bg-green-50 rounded-xl text-sm font-medium text-green-700 hover:bg-green-100 transition-colors">
              Empresas
            </Link>
            <Link href="/practicas/nueva" className="text-center p-3 bg-purple-50 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors">
              Nueva oferta
            </Link>
            <Link href="/reportes" className="text-center p-3 bg-orange-50 rounded-xl text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors">
              Reportes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}