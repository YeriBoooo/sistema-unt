'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  Users, 
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Send,
  FileText,
  Upload,
  TrendingUp
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
  seguimiento?: {
    horas_cumplidas: number;
    horas_totales: number;
    evaluacion: string;
    informe_estudiante?: string;
  };
}

export default function DetalleOfertaPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [horas, setHoras] = useState('');
  const [informe, setInforme] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['oferta', id],
    queryFn: () => apiFetch<any>(`/ofertas/${id}`),
  });

  const oferta: OfertaDetalle | undefined = response?.data?.data || response?.data || response;

  // Obtener información de postulación del estudiante
  const { data: postulacionResponse } = useQuery({
    queryKey: ['postulacion', id],
    queryFn: () => apiFetch<any>(`/ofertas/${id}/mi-postulacion`),
    enabled: !!user?.roles?.includes('estudiante'),
  });

  const postulacion: PostulacionInfo | undefined = postulacionResponse?.data?.data || postulacionResponse?.data || postulacionResponse;

  const puedePostular = user?.roles?.includes('estudiante') && oferta?.estado === 'abierta' && !postulacion;
  const estaAceptado = postulacion?.estado === 'aceptado' || postulacion?.estado === 'en_curso';
  const horasProgreso = postulacion?.seguimiento 
    ? (postulacion.seguimiento.horas_cumplidas / postulacion.seguimiento.horas_totales) * 100 
    : 0;

  // Mutación para postular
  const postularMutation = useMutation({
    mutationFn: async () => {
      return apiFetch(`/ofertas/${id}/postular`, { method: 'POST' });
    },
    onSuccess: () => {
      alert('✅ Postulación exitosa!');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['ofertas'] });
      queryClient.invalidateQueries({ queryKey: ['mis-postulaciones'] });
    },
    onError: (error: any) => {
      alert(error.message || 'Error al postular. Ya tienes una postulación activa.');
    },
  });

  // Mutación para registrar horas
  const registrarHorasMutation = useMutation({
    mutationFn: async (data: { horas_cumplidas: number; informe: string }) => {
      return apiFetch(`/seguimiento/registrar-horas/${postulacion?.id}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      alert('✅ Horas registradas correctamente!');
      setHoras('');
      setInforme('');
      setMostrarFormulario(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['postulacion', id] });
    },
    onError: (error: any) => {
      alert(error.message || 'Error al registrar horas');
    },
  });

  const handlePostular = () => {
    if (confirm('¿Estás seguro de que quieres postular a esta práctica?')) {
      postularMutation.mutate();
    }
  };

  const handleRegistrarHoras = (e: React.FormEvent) => {
    e.preventDefault();
    if (!horas || parseInt(horas) <= 0) {
      alert('Ingresa un número válido de horas');
      return;
    }
    registrarHorasMutation.mutate({ horas_cumplidas: parseInt(horas), informe });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!oferta) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No se encontró la oferta</p>
        <Link href="/practicas" className="text-blue-600 mt-2 inline-block">Volver a prácticas</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href="/practicas" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Volver a prácticas
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Info de la oferta */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">{oferta.titulo}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{oferta.empresa?.razon_social || 'Empresa no especificada'}</span>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${oferta.estado === 'abierta' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {oferta.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Periodo</p>
                <p className="text-sm text-gray-700">{new Date(oferta.fecha_inicio).toLocaleDateString()} - {new Date(oferta.fecha_fin).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Modalidad</p>
                <p className="text-sm text-gray-700 capitalize">{oferta.modalidad === 'remota' ? 'Remota' : oferta.modalidad === 'hibrida' ? 'Híbrida' : 'Presencial'}</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h2>
            <p className="text-sm text-gray-600">{oferta.descripcion}</p>
          </div>

          {oferta.requisitos && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Requisitos</h2>
              <p className="text-sm text-gray-600">{oferta.requisitos}</p>
            </div>
          )}
        </div>

        {/* SECCIÓN PARA ESTUDIANTE ACEPTADO - REGISTRO DE HORAS */}
        {estaAceptado && postulacion?.seguimiento && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-800">Mi progreso en la práctica</h2>
              </div>
              
              {/* Barra de progreso */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Horas cumplidas</span>
                  <span>{postulacion.seguimiento.horas_cumplidas} / {postulacion.seguimiento.horas_totales} horas</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${horasProgreso}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(horasProgreso)}% completado</p>
              </div>
            </div>

            {/* Formulario para registrar horas */}
            <div className="p-6">
              <button
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Upload className="h-4 w-4" />
                {mostrarFormulario ? 'Cancelar' : '+ Registrar horas cumplidas'}
              </button>

              {mostrarFormulario && (
                <form onSubmit={handleRegistrarHoras} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horas cumplidas</label>
                    <input
                      type="number"
                      value={horas}
                      onChange={(e) => setHoras(e.target.value)}
                      placeholder="Ej: 10"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="1"
                      max={postulacion.seguimiento.horas_totales - postulacion.seguimiento.horas_cumplidas}
                    />
                    <p className="text-xs text-gray-400 mt-1">Máximo: {postulacion.seguimiento.horas_totales - postulacion.seguimiento.horas_cumplidas} horas restantes</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Informe (opcional)</label>
                    <textarea
                      value={informe}
                      onChange={(e) => setInforme(e.target.value)}
                      placeholder="Describe las actividades realizadas..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={registrarHorasMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {registrarHorasMutation.isPending ? 'Registrando...' : 'Guardar horas'}
                  </button>
                </form>
              )}

              {/* Evaluación */}
              {postulacion.seguimiento.evaluacion !== 'pendiente' && (
                <div className="mt-4 p-3 rounded-lg bg-gray-50">
                  <p className="text-sm">
                    <span className="font-medium">Evaluación final:</span>{' '}
                    <span className={postulacion.seguimiento.evaluacion === 'aprobado' ? 'text-green-600' : 'text-red-600'}>
                      {postulacion.seguimiento.evaluacion === 'aprobado' ? '✅ Aprobado' : '❌ Desaprobado'}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botón de Postulación */}
        {puedePostular && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <button
              onClick={handlePostular}
              disabled={postularMutation.isPending}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {postularMutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Procesando...</>
              ) : (
                <><Send className="h-4 w-4" /> Postular a esta práctica</>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">Al postular, un asesor académico será asignado para tu seguimiento.</p>
          </div>
        )}

        {/* Mensaje si ya postuló pero no está aceptado */}
        {postulacion && !estaAceptado && postulacion.estado !== 'rechazado' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <Clock className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-yellow-700">Tu postulación está en revisión. En breve recibirás respuesta.</p>
            <p className="text-xs text-yellow-600 mt-1">Estado actual: {postulacion.estado === 'postulado' ? 'Postulado' : postulacion.estado}</p>
          </div>
        )}

        {/* Mensaje si fue rechazado */}
        {postulacion?.estado === 'rechazado' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <XCircle className="h-5 w-5 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-red-700">Tu postulación fue rechazada. Puedes postular a otras ofertas.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}