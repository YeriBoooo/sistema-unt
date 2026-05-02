'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiFetch } from '@/lib/api/client';
import Link from 'next/link';
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
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  
  // ✅ Esperar a que cargue el usuario antes de decidir qué mostrar
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  // ✅ Detectar el rol del usuario
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
  console.log('🔍 Rol detectado en dashboard:', userRole);

  // Mostrar dashboard según el rol
  if (userRole === 'estudiante') {
    return <EstudianteDashboard />;
  }
  
  if (userRole === 'asesor') {
    return <AsesorDashboard />;
  }
  
  // Si no hay usuario (no debería pasar), mostrar loading
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  // Admin o coordinador
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

  const saludo = new Date().getHours() < 12 ? 'Buenos días' : 
                 new Date().getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 sm:px-6">
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase text-blue-700">Panel de control</span>
          </div>
          <h1 className="text-xl font-normal text-gray-700">
            {saludo}, <span className="font-semibold text-blue-700">{user?.nombres}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Resumen de tu progreso académico</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-r from-blue-50/30 to-indigo-50/30 rounded-xl border border-blue-100/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100/60 rounded-lg">
                    <BookOpen className="h-4 w-4 text-blue-700" />
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700">PROYECTO DE TESIS</span>
                </div>
              </div>
              {stats?.tesisActiva ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-800">{stats.tesisActiva.titulo}</h3>
                  <Link href={`/tesis/${stats.tesisActiva.id}`} className="text-[10px] text-blue-600 mt-2 inline-block">Continuar →</Link>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">No has registrado tu tesis</p>
                  <Link href="/tesis/nueva" className="px-3 py-1.5 bg-blue-600 text-white text-[11px] rounded-lg">+ Crear proyecto</Link>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-gradient-to-r from-orange-50/30 to-amber-50/30 rounded-xl border border-orange-100/50 p-5 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-3">
                <div className="p-1.5 bg-orange-100/60 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-700" />
                </div>
                <span className="text-[11px] font-semibold text-orange-700">HORAS DE PRÁCTICA</span>
              </div>
              <div className="relative inline-flex items-center justify-center my-2">
                <svg className="w-20 h-20 -rotate-90">
                  <circle cx="40" cy="40" r="34" stroke="#fed7aa" strokeWidth="5" fill="none" />
                  <circle cx="40" cy="40" r="34" stroke="#ea580c" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="213.62" strokeDashoffset={213.62 - (213.62 * horasProgreso) / 100} />
                </svg>
                <div className="absolute">
                  <span className="text-base font-bold text-gray-700">{Math.round(horasProgreso)}<span className="text-[9px]">%</span></span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">{stats?.horasPractica?.cumplidas || 0} / {stats?.horasPractica?.totales || 300} hrs</p>
              <Link href="/practicas" className="inline-block mt-2 text-[11px] font-medium text-orange-700">Registrar horas →</Link>
            </div>
          </div>

          <div>
            <div className="bg-gradient-to-r from-yellow-50/30 to-amber-50/30 rounded-xl border border-yellow-100/50 p-5">
              <div className="flex items-center gap-1.5 mb-3">
                <div className="p-1.5 bg-yellow-100/60 rounded-lg">
                  <Briefcase className="h-4 w-4 text-yellow-700" />
                </div>
                <span className="text-[11px] font-semibold text-yellow-700">POSTULACIÓN</span>
              </div>
              {stats?.postulacionActiva ? (
                <div>
                  <p className="text-sm font-medium text-gray-800">{stats.postulacionActiva.oferta?.titulo}</p>
                  <p className="text-[10px] text-gray-500">{stats.postulacionActiva.oferta?.empresa?.razon_social}</p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Sin postulación</p>
                  <Link href="/practicas" className="text-[11px] text-yellow-700">Ver ofertas →</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-50/30 to-pink-50/30">
            <Sparkles className="h-3 w-3 text-purple-500" />
            <span className="text-[9px] text-gray-600">El éxito comienza con pequeños pasos</span>
            <Sparkles className="h-3 w-3 text-purple-500" />
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

  const saludo = new Date().getHours() < 12 ? 'Buenos días' : 
                 new Date().getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';

  // ✅ Mutation para evaluar práctica
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

  // ✅ Mutation para finalizar práctica
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
    if (confirm('¿Estás seguro de que quieres FINALIZAR esta práctica? El estudiante completará su proceso.')) {
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
      <div className="px-4 py-6 sm:px-6">
        
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-50/80 to-emerald-50/80">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase text-green-700">Panel del Asesor</span>
          </div>
          <h1 className="text-xl font-normal text-gray-700">
            {saludo}, <span className="font-semibold text-green-700">Dra. {user?.nombres} {user?.apellidos}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Resumen de tus estudiantes asignados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{postulaciones.length}</p>
                <p className="text-xs text-gray-500">Estudiantes asignados</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{tesis.length}</p>
                <p className="text-xs text-gray-500">Tesis supervisadas</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{postulaciones.filter((p: any) => p.estado === 'en_curso').length}</p>
                <p className="text-xs text-gray-500">Prácticas en curso</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">📋 Mis estudiantes asignados</h2>
          </div>
          <div className="divide-y">
            {postulaciones.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p>No tienes estudiantes asignados aún</p>
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
                  <div key={postulacion.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">
                          {postulacion.estudiante?.usuario?.nombres} {postulacion.estudiante?.usuario?.apellidos}
                        </p>
                        <p className="text-xs text-gray-500">
                          {postulacion.oferta?.titulo} - {postulacion.oferta?.empresa?.razon_social}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Código: {postulacion.estudiante?.codigo_universitario}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
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
                    
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Horas cumplidas</span>
                        <span>{horasCumplidas} / {horasTotales}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(horasProgreso, 100)}%` }} />
                      </div>
                    </div>

                    {evaluacion !== 'pendiente' && (
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          evaluacion === 'aprobado' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {evaluacion === 'aprobado' ? '✅ APROBADO' : '❌ DESAPROBADO'}
                        </span>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/practicas/${postulacion.oferta?.id}`} className="text-xs text-blue-600 hover:text-blue-700">
                        Ver detalles →
                      </Link>
                      
                      {postulacion.estado === 'en_curso' && horasCompletas && evaluacion === 'pendiente' && (
                        <>
                          <button
                            onClick={() => evaluarPractica(postulacion.id, 'aprobado')}
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                          >
                            ✅ Aprobar
                          </button>
                          <button
                            onClick={() => evaluarPractica(postulacion.id, 'desaprobado')}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                          >
                            ❌ Desaprobar
                          </button>
                        </>
                      )}
                      
                      {postulacion.estado === 'en_curso' && horasCompletas && evaluacion !== 'pendiente' && (
                        <button
                          onClick={() => finalizarPractica(postulacion.id)}
                          className="px-2 py-1 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600"
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

        <div className="mt-6 bg-white rounded-xl border p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">⚡ Acciones rápidas</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/seguimiento" className="px-4 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors">
              Ver todos mis estudiantes
            </Link>
            <Link href="/tesis" className="px-4 py-2 bg-purple-50 text-purple-700 text-sm rounded-lg hover:bg-purple-100 transition-colors">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 sm:px-6">
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-50/80 to-pink-50/80">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase text-purple-700">Panel Administrativo</span>
          </div>
          <h1 className="text-xl font-normal text-gray-700">
            Buenas, <span className="font-semibold text-purple-700">{user?.nombres} {user?.apellidos}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Métricas generales del sistema</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats?.estudiantesEnPractica || 0}</p>
                <p className="text-xs text-gray-500">Estudiantes en práctica</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats?.tesisEnCurso || 0}</p>
                <p className="text-xs text-gray-500">Tesis en curso</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Building2 className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats?.conveniosActivos || 0}</p>
                <p className="text-xs text-gray-500">Convenios activos</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats?.ofertasAbiertas || 0}</p>
                <p className="text-xs text-gray-500">Ofertas abiertas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">🚀 Acciones rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/estudiantes" className="text-center p-3 bg-blue-50 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors">
              Estudiantes
            </Link>
            <Link href="/empresas" className="text-center p-3 bg-green-50 rounded-lg text-sm text-green-700 hover:bg-green-100 transition-colors">
              Empresas
            </Link>
            <Link href="/practicas/nueva" className="text-center p-3 bg-purple-50 rounded-lg text-sm text-purple-700 hover:bg-purple-100 transition-colors">
              Nueva oferta
            </Link>
            <Link href="/reportes" className="text-center p-3 bg-orange-50 rounded-lg text-sm text-orange-700 hover:bg-orange-100 transition-colors">
              Reportes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}