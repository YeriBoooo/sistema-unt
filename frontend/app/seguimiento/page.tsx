'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  Users,
  Eye,
  UserCheck,
  TrendingUp,
  Shield,
  ArrowLeft,
  AlertCircle,
  ChevronRight,
  Clock,
  CheckCircle2,
  Zap,
  BarChart3,
  Activity,
  Sparkles,
  Award,
  GraduationCap,
  Lock,
  Menu
} from 'lucide-react';
import { useState, useEffect } from 'react';

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
  seguimiento?: {
    horas_cumplidas: number;
    horas_totales: number;
    evaluacion: string;
  };
}

export default function SeguimientoPage() {
  const { user } = useAuth();

  const { data: response, isLoading } = useQuery({
    queryKey: ['postulaciones-asesor'],
    queryFn: () => apiFetch<any>('/ofertas/postulaciones/asesor'),
    enabled: !!user?.roles?.includes('asesor'),
  });

  const postulaciones: Postulacion[] = response?.data || [];
  const esAsesor = user?.roles?.includes('asesor');

  // Panel de acceso denegado - RESPONSIVO
  if (!esAsesor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero Section - Responsivo */}
        <div className="relative bg-gradient-to-r from-[#0A1C2E] to-[#1a2c3e] overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-[#E8A735]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-white/5 rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8A735]/10 border border-[#E8A735]/20 mb-4">
                  <Shield className="h-3 w-3 text-[#E8A735]" />
                  <span className="text-xs font-medium text-[#E8A735]">Acceso Restringido</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                  Área exclusiva para <br className="hidden sm:block" />
                  <span className="text-[#E8A735]">asesores académicos</span>
                </h1>
                <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto lg:mx-0">
                  Verifica tus credenciales o contacta al administrador del sistema.
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-[#E8A735]/10 rounded-2xl flex items-center justify-center border border-[#E8A735]/20">
                  <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-[#E8A735]" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>

        {/* Contenido principal - Responsivo */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  Esta sección está diseñada exclusivamente para que los 
                  <span className="font-semibold text-[#0A1C2E]"> asesores académicos</span> realicen el seguimiento 
                  de las prácticas preprofesionales de los estudiantes a su cargo.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-5 h-5 rounded-full bg-[#0A1C2E]/5 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#0A1C2E]">i</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Si eres asesor y consideras que esto es un error, comunícate con el administrador del sistema 
                  para verificar tus permisos de acceso.
                </p>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#0A1C2E] to-[#1a2c3e] text-white text-sm font-medium rounded-lg hover:from-[#1a2c3e] hover:to-[#2a3c4e] transition-all duration-300 shadow-sm w-full sm:w-auto justify-center sm:justify-start"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al panel principal
                <ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden sm:inline" />
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 px-4">
              Universidad Nacional de Trujillo — Sistema de Gestión de Prácticas y Tesis
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center px-4">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 mx-auto">
            <div className="absolute inset-0 border-3 border-[#0A1C2E]/10 rounded-full" />
            <div className="absolute inset-0 border-3 border-[#E8A735] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-gray-400 mt-3">Cargando panel de seguimiento...</p>
        </div>
      </div>
    );
  }

  const enCurso = postulaciones.filter(p => p.estado === 'en_curso').length;
  const pendientes = postulaciones.filter(p => p.estado === 'postulado').length;
  const horasTotales = postulaciones.reduce((acc, p) => acc + (p.seguimiento?.horas_cumplidas || 0), 0);
  const progresoGeneral = postulaciones.length > 0 
    ? (enCurso / postulaciones.length) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Header - Responsivo */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#E8A735]" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#E8A735]">
              Panel de Asesoría
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Seguimiento de prácticas</h1>
          <p className="text-sm text-gray-500 mt-1">Estudiantes asignados a tu supervisión académica</p>
        </div>

        {/* Tarjetas KPI - Grid responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Asignados</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{postulaciones.length}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${Math.min((postulaciones.length / 10) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">En curso</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{enCurso}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div className="bg-green-600 h-1 rounded-full" style={{ width: `${Math.min((enCurso / Math.max(postulaciones.length, 1)) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Pendientes</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{pendientes}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div className="bg-amber-600 h-1 rounded-full" style={{ width: `${Math.min((pendientes / Math.max(postulaciones.length, 1)) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Horas</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{horasTotales}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div className="bg-purple-600 h-1 rounded-full" style={{ width: `${Math.min((horasTotales / 1000) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progreso general - Responsivo */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#E8A735]" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Progreso general del semestre</span>
            </div>
            <span className="text-sm font-semibold text-[#E8A735]">{Math.round(progresoGeneral)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#0A1C2E] to-[#E8A735] h-2 rounded-full transition-all duration-700"
              style={{ width: `${progresoGeneral}%` }}
            />
          </div>
        </div>

        {/* Tabla de estudiantes - Responsiva con scroll horizontal en móvil */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[#E8A735]" />
                <h2 className="text-sm font-semibold text-gray-800">Estudiantes bajo tu supervisión</h2>
              </div>
              <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200 self-start sm:self-auto">
                {postulaciones.length} registros
              </span>
            </div>
          </div>

          {postulaciones.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No tienes estudiantes asignados</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Los estudiantes te serán asignados cuando postulen a prácticas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {postulaciones.map((postulacion) => {
                const horasProgreso = postulacion.seguimiento 
                  ? (postulacion.seguimiento.horas_cumplidas / postulacion.seguimiento.horas_totales) * 100 
                  : 0;
                
                const estadoLabel = {
                  aceptado: 'Aceptado',
                  en_curso: 'En curso',
                  postulado: 'Postulado',
                  finalizado: 'Finalizado'
                }[postulacion.estado] || postulacion.estado;

                const estadoColor = {
                  aceptado: 'bg-green-100 text-green-700',
                  en_curso: 'bg-blue-100 text-blue-700',
                  postulado: 'bg-yellow-100 text-yellow-700',
                  finalizado: 'bg-gray-100 text-gray-700'
                }[postulacion.estado] || 'bg-gray-100 text-gray-700';

                return (
                  <div key={postulacion.id} className="p-4 sm:p-5 hover:bg-gray-50/30 transition-colors">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Avatar - Centrado en móvil */}
                      <div className="flex-shrink-0 self-center sm:self-start">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#0A1C2E] to-[#1a2c3e] rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-xs sm:text-sm">
                            {postulacion.estudiante?.usuario?.nombres?.charAt(0)}
                            {postulacion.estudiante?.usuario?.apellidos?.charAt(0)}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="text-center sm:text-left">
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                              {postulacion.estudiante?.usuario?.nombres} {postulacion.estudiante?.usuario?.apellidos}
                            </h3>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-0.5">
                              <span className="text-[10px] sm:text-xs text-gray-500 font-mono">
                                {postulacion.estudiante?.codigo_universitario}
                              </span>
                              <span className="text-gray-300 hidden sm:inline">|</span>
                              <span className="text-[10px] sm:text-xs text-gray-500">
                                {postulacion.oferta?.titulo.length > 30 ? postulacion.oferta?.titulo.substring(0, 27) + '...' : postulacion.oferta?.titulo}
                              </span>
                            </div>
                          </div>
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded-lg text-[10px] sm:text-xs font-medium ${estadoColor} self-center sm:self-start`}>
                            {estadoLabel}
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mb-1">
                            <span>Horas cumplidas</span>
                            <span className="font-medium">{postulacion.seguimiento?.horas_cumplidas || 0} / {postulacion.seguimiento?.horas_totales || 300} hrs</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-[#0A1C2E] to-[#E8A735] h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(horasProgreso, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <Link
                            href={`/practicas/${postulacion.oferta?.id}`}
                            className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            Ver detalles
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Responsivo */}
        <div className="mt-6 text-center">
          <p className="text-[10px] sm:text-xs text-gray-400 px-4">
            Universidad Nacional de Trujillo — Sistema de Gestión de Prácticas y Tesis
          </p>
        </div>
      </div>
    </div>
  );
}