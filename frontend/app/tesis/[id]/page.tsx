'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { 
  FileText, 
  User, 
  Calendar, 
  Users,
  ArrowLeft,
  BookOpen,
  Eye,
  Upload,
  X,
  Download,
  Save,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Edit,
  Trash2,
  MessageSquare,
  FileCheck
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';

interface Avance {
  id: number;
  tipo: string;
  descripcion: string;
  fecha_entrega: string;
  estado: string;
  observaciones?: string;
  archivo_url?: string;
}

interface Acta {
  id: number;
  fecha: string;
  lugar: string;
  nota_final: number;
  archivo_acta_pdf: string;
}

interface TesisDetalle {
  id: number;
  titulo: string;
  resumen: string;
  estado: string;
  fecha_inicio: string;
  fecha_sustentacion?: string;
  acta?: Acta;
  estudiante: {
    id: number;
    usuario: {
      nombres: string;
      apellidos: string;
      email: string;
    };
    codigo_universitario: string;
  };
  asesor_principal: {
    id: number;
    usuario: {
      nombres: string;
      apellidos: string;
      email: string;
    };
    especialidad: string;
  };
  jurados: Array<{
    id: number;
    rol: string;
    asesor: {
      usuario: {
        nombres: string;
        apellidos: string;
      };
    };
  }>;
  avances: Avance[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const getEstadoConfig = (estado: string) => {
  switch (estado) {
    case 'propuesta':
      return { label: 'Propuesta', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock, progress: 25 };
    case 'desarrollo':
      return { label: 'En desarrollo', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: TrendingUp, progress: 50 };
    case 'sustentacion':
      return { label: 'Sustentación', color: 'bg-purple-50 text-purple-700 border-purple-100', icon: GraduationCap, progress: 75 };
    case 'culminado':
      return { label: 'Culminado', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle, progress: 100 };
    default:
      return { label: estado, color: 'bg-gray-50 text-gray-600 border-gray-100', icon: FileText, progress: 0 };
  }
};

const getAvanceEstadoConfig = (estado: string) => {
  switch (estado) {
    case 'aprobado':
      return { label: 'Aprobado', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle };
    case 'revisado':
      return { label: 'Revisado', color: 'bg-blue-50 text-blue-700', icon: Eye };
    case 'observado':
      return { label: 'Observado', color: 'bg-amber-50 text-amber-700', icon: AlertCircle };
    default:
      return { label: 'Entregado', color: 'bg-gray-50 text-gray-600', icon: FileText };
  }
};

export default function DetalleTesisPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [avanceSeleccionado, setAvanceSeleccionado] = useState<Avance | null>(null);
  const [observacion, setObservacion] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarFormularioAvance, setMostrarFormularioAvance] = useState(false);
  const [nuevoAvance, setNuevoAvance] = useState({ tipo: 'capitulo', descripcion: '', archivo: null as File | null });
  const [subiendo, setSubiendo] = useState(false);
  const [mostrarModalActa, setMostrarModalActa] = useState(false);
  const [formActa, setFormActa] = useState({
    fecha: '',
    lugar: '',
    nota_final: '',
    archivo: null as File | null,
  });
  const [subiendoActa, setSubiendoActa] = useState(false);

  const userRole = user?.roles?.[0] || '';
  const esAsesor = userRole === 'asesor';
  const esEstudiante = userRole === 'estudiante';
  const esAdmin = userRole === 'admin' || userRole === 'coordinador';

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['tesis', id],
    queryFn: () => apiFetch<any>(`/tesis/${id}`),
  });

  const tesis: TesisDetalle | undefined = response?.data?.data || response?.data || response;

  // ✅ Calcular progreso basado en avances aprobados
  const totalAvances = tesis?.avances?.length || 0;
  const avancesAprobados = tesis?.avances?.filter(a => a.estado === 'aprobado').length || 0;
  const progresoAvances = totalAvances > 0 ? (avancesAprobados / totalAvances) * 100 : 0;

  // ✅ Estado de la tesis con progreso
  const estadoConfig = tesis ? getEstadoConfig(tesis.estado) : { label: '', color: '', icon: FileText, progress: 0 };
  const EstadoIcon = estadoConfig.icon;

  const revisarAvanceMutation = useMutation({
    mutationFn: async ({ avanceId, estado, observaciones }: { avanceId: number; estado: string; observaciones?: string }) => {
      return apiFetch(`/tesis/avances/${avanceId}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado, observaciones }),
      });
    },
    onSuccess: () => {
      toast.success('✅ Avance revisado correctamente');
      setMostrarModal(false);
      setAvanceSeleccionado(null);
      setObservacion('');
      refetch();
    },
    onError: (error: any) => {
      toast.error('❌ Error al revisar: ' + error.message);
    },
  });

  const registrarActaMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch(`${API_URL}/tesis/${id}/acta`, {
        method: 'POST',
        credentials: 'include',
        body: data,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      toast.success('✅ Acta registrada correctamente');
      setMostrarModalActa(false);
      setFormActa({ fecha: '', lugar: '', nota_final: '', archivo: null });
      refetch();
    },
    onError: (error: any) => {
      toast.error('❌ Error al registrar acta: ' + error.message);
    },
  });

  const abrirModalRevisar = (avance: Avance) => {
    setAvanceSeleccionado(avance);
    setObservacion(avance.observaciones || '');
    setMostrarModal(true);
  };

  const handleRevisar = (estado: string) => {
    if (avanceSeleccionado) {
      revisarAvanceMutation.mutate({
        avanceId: avanceSeleccionado.id,
        estado,
        observaciones: observacion || undefined,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNuevoAvance({ ...nuevoAvance, archivo: e.target.files[0] });
    }
  };

  const enviarAvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoAvance.descripcion) {
      toast.error('Por favor ingresa una descripción');
      return;
    }
    
    setSubiendo(true);
    const formData = new FormData();
    formData.append('descripcion', nuevoAvance.descripcion);
    formData.append('tipo', nuevoAvance.tipo);
    if (nuevoAvance.archivo) formData.append('file', nuevoAvance.archivo);

    try {
      const res = await fetch(`${API_URL}/tesis/${id}/avances/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (res.ok) {
        toast.success('✅ Avance subido exitosamente');
        setMostrarFormularioAvance(false);
        setNuevoAvance({ tipo: 'capitulo', descripcion: '', archivo: null });
        refetch();
      } else {
        const error = await res.json();
        toast.error('❌ Error: ' + error.message);
      }
    } catch (error) {
      toast.error('❌ Error al subir el avance');
    } finally {
      setSubiendo(false);
    }
  };

  const handleDownload = (archivoUrl: string) => {
    window.open(`${API_URL}/uploads/avances/${archivoUrl.split('/').pop()}`, '_blank');
  };

  const handleRegistrarActa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formActa.fecha) {
      toast.error('La fecha es obligatoria');
      return;
    }
    
    setSubiendoActa(true);
    const formData = new FormData();
    formData.append('fecha', formActa.fecha);
    formData.append('lugar', formActa.lugar);
    formData.append('nota_final', formActa.nota_final);
    if (formActa.archivo) formData.append('file', formActa.archivo);
    
    registrarActaMutation.mutate(formData);
    setSubiendoActa(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400 mt-4">Cargando tesis...</p>
        </div>
      </div>
    );
  }

  if (!tesis) {
    return (
      <div className="min-h-[60vh] bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-300" />
          </div>
          <h2 className="text-xl font-medium text-gray-700">Tesis no encontrada</h2>
          <p className="text-sm text-gray-400 mt-1">El proyecto que buscas no está disponible</p>
          <Link href="/tesis" className="inline-block mt-6 px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition">
            Volver a tesis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <Link 
          href="/tesis" 
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver a tesis</span>
        </Link>

        {/* Modales */}
        <AnimatePresence>
          {mostrarModal && avanceSeleccionado && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setMostrarModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Revisar avance</h3>
                  <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium capitalize">{avanceSeleccionado.tipo}:</span> {avanceSeleccionado.descripcion}
                </p>
                {avanceSeleccionado.archivo_url && (
                  <button
                    onClick={() => handleDownload(avanceSeleccionado.archivo_url!)}
                    className="mb-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" /> Descargar archivo
                  </button>
                )}
                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Escribe aquí tus observaciones..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 mb-4"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => handleRevisar('aprobado')} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                    ✅ Aprobar
                  </button>
                  <button onClick={() => handleRevisar('observado')} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                    ⚠️ Observar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {mostrarModalActa && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setMostrarModalActa(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Registrar acta</h3>
                  <button onClick={() => setMostrarModalActa(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleRegistrarActa} className="space-y-4">
                  <input
                    type="date"
                    value={formActa.fecha}
                    onChange={(e) => setFormActa({ ...formActa, fecha: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                    required
                  />
                  <input
                    type="text"
                    value={formActa.lugar}
                    onChange={(e) => setFormActa({ ...formActa, lugar: e.target.value })}
                    placeholder="Lugar de sustentación"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="20"
                    value={formActa.nota_final}
                    onChange={(e) => setFormActa({ ...formActa, nota_final: e.target.value })}
                    placeholder="Nota final (0-20)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFormActa({ ...formActa, archivo: e.target.files?.[0] || null })}
                    className="w-full text-sm"
                  />
                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setMostrarModalActa(false)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                      Cancelar
                    </button>
                    <button type="submit" disabled={subiendoActa} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 flex items-center gap-2">
                      {subiendoActa ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Guardar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenido principal */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold text-gray-800">{tesis.titulo}</h1>
                  <p className="text-sm text-gray-400 mt-1">TES-{String(tesis.id).padStart(3, '0')}</p>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${estadoConfig.color} border`}>
                  <EstadoIcon className="h-3 w-3" />
                  {estadoConfig.label}
                </div>
              </div>
            </div>

            {/* ✅ BARRA DE PROGRESO GENERAL */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold text-gray-700 uppercase">Progreso general de la tesis</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{Math.round(progresoAvances)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${progresoAvances}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                <span>Propuesta</span>
                <span>Desarrollo</span>
                <span>Sustentación</span>
                <span>Culminado</span>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {avancesAprobados} de {totalAvances} avances aprobados
              </p>
            </div>

            {/* Info General */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400">Fecha de inicio</p>
                  <p className="text-sm text-gray-700">{tesis.fecha_inicio ? new Date(tesis.fecha_inicio).toLocaleDateString() : 'No registrada'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileCheck className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400">Avances</p>
                  <p className="text-sm font-medium text-gray-700">{avancesAprobados}/{totalAvances} aprobados</p>
                </div>
              </div>
            </div>

            {/* Estudiante */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-gray-400" />
                <h2 className="text-xs font-semibold text-gray-500 uppercase">Estudiante</h2>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-800">{tesis.estudiante?.usuario?.nombres} {tesis.estudiante?.usuario?.apellidos}</p>
                <p className="text-xs text-gray-400 mt-0.5">{tesis.estudiante?.codigo_universitario} · {tesis.estudiante?.usuario?.email}</p>
              </div>
            </div>

            {/* Asesor Principal */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-gray-400" />
                <h2 className="text-xs font-semibold text-gray-500 uppercase">Asesor Principal</h2>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-800">{tesis.asesor_principal?.usuario?.nombres} {tesis.asesor_principal?.usuario?.apellidos}</p>
                <p className="text-xs text-gray-400 mt-0.5">{tesis.asesor_principal?.especialidad}</p>
              </div>
            </div>

            {/* Jurados */}
            {tesis.jurados && tesis.jurados.length > 0 && (
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-4 w-4 text-gray-400" />
                  <h2 className="text-xs font-semibold text-gray-500 uppercase">Jurado</h2>
                </div>
                <div className="space-y-2">
                  {tesis.jurados.map((jurado) => (
                    <div key={jurado.id} className="bg-gray-50 rounded-xl p-3">
                      <p className="font-medium text-gray-800">{jurado.asesor?.usuario?.nombres} {jurado.asesor?.usuario?.apellidos}</p>
                      <p className="text-xs text-gray-400 capitalize">{jurado.rol}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen */}
            {tesis.resumen && (
              <div className="p-6 border-b border-gray-100">
                <p className="text-gray-600 leading-relaxed">{tesis.resumen}</p>
              </div>
            )}

            {/* Acta - visible para admin y asesor */}
            {(esAdmin || esAsesor) && (
              <div className="p-6 border-b border-gray-100 bg-purple-50/30">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <h2 className="text-xs font-semibold text-gray-600 uppercase">Acta de sustentación</h2>
                  </div>
                  {esAdmin && !tesis.acta && (
                    <button onClick={() => setMostrarModalActa(true)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700">
                      <Upload className="h-3 w-3" /> Registrar acta
                    </button>
                  )}
                </div>
                {tesis.acta ? (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><p className="text-xs text-gray-400">Fecha</p><p className="text-sm text-gray-700">{new Date(tesis.acta.fecha).toLocaleDateString()}</p></div>
                    <div><p className="text-xs text-gray-400">Lugar</p><p className="text-sm text-gray-700">{tesis.acta.lugar || 'No especificado'}</p></div>
                    <div><p className="text-xs text-gray-400">Nota final</p><p className="text-lg font-bold text-purple-600">{tesis.acta.nota_final || '-'}</p></div>
                    {tesis.acta.archivo_acta_pdf && (
                      <div><p className="text-xs text-gray-400">Acta</p><a href={`${API_URL}${tesis.acta.archivo_acta_pdf}`} target="_blank" className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"><Download className="h-3 w-3" /> Descargar</a></div>
                    )}
                    {esAdmin && <button onClick={() => setMostrarModalActa(true)} className="text-xs text-purple-600 hover:text-purple-700">Editar</button>}
                  </div>
                ) : (
                  <div className="mt-4 text-center py-6"><FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-400">No hay acta registrada</p></div>
                )}
              </div>
            )}

            {/* Avances */}
            <div className="p-6">
              <div className="flex justify-between items-center flex-wrap gap-3 mb-5">
                <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-gray-400" /><h2 className="text-xs font-semibold text-gray-500 uppercase">Avances</h2></div>
                
                {/* ✅ BOTÓN SUBIR AVANCE - solo para estudiante */}
                {esEstudiante && (
                  <button onClick={() => setMostrarFormularioAvance(!mostrarFormularioAvance)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg hover:bg-gray-900 transition-colors">
                    <Upload className="h-3 w-3" /> Subir avance
                  </button>
                )}
              </div>

              {mostrarFormularioAvance && (
                <div className="bg-gray-50 rounded-xl p-5 mb-5">
                  <form onSubmit={enviarAvance} className="space-y-3">
                    <select value={nuevoAvance.tipo} onChange={(e) => setNuevoAvance({ ...nuevoAvance, tipo: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                      <option value="capitulo">Capítulo</option>
                      <option value="articulo">Artículo</option>
                      <option value="informe">Informe</option>
                    </select>
                    <textarea value={nuevoAvance.descripcion} onChange={(e) => setNuevoAvance({ ...nuevoAvance, descripcion: e.target.value })} placeholder="Descripción del avance" rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg" required />
                    <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} className="w-full text-sm" />
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setMostrarFormularioAvance(false)} className="px-3 py-1.5 bg-gray-200 rounded-lg">Cancelar</button>
                      <button type="submit" disabled={subiendo} className="px-3 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900">{subiendo ? 'Subiendo...' : 'Subir'}</button>
                    </div>
                  </form>
                </div>
              )}

              {tesis.avances && tesis.avances.length > 0 ? (
                <div className="space-y-3">
                  {tesis.avances.map((avance) => {
                    const avanceConfig = getAvanceEstadoConfig(avance.estado);
                    const AvanceIcon = avanceConfig.icon;
                    return (
                      <div key={avance.id} className="bg-gray-50 rounded-xl p-4 transition-all hover:shadow-md">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <AvanceIcon className={`h-4 w-4 ${avance.estado === 'aprobado' ? 'text-emerald-500' : avance.estado === 'observado' ? 'text-amber-500' : 'text-gray-400'}`} />
                            <span className="text-sm font-medium text-gray-800 capitalize">{avance.tipo}</span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${avanceConfig.color}`}>{avanceConfig.label}</span>
                          </div>
                          
                          {/* ✅ BOTÓN REVISAR AVANCE - solo para asesor */}
                          {esAsesor && avance.estado !== 'aprobado' && (
                            <button onClick={() => abrirModalRevisar(avance)} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors">
                              <Eye className="h-3 w-3" /> Revisar
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{avance.descripcion}</p>
                        <p className="text-xs text-gray-400 mt-2">Entregado: {new Date(avance.fecha_entrega).toLocaleDateString()}</p>
                        {avance.archivo_url && (
                          <button onClick={() => handleDownload(avance.archivo_url!)} className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            <Download className="h-3 w-3" /> Descargar archivo
                          </button>
                        )}
                        {avance.observaciones && (
                          <div className="mt-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-700 flex items-start gap-1">
                            <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{avance.observaciones}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8"><FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-400">No hay avances registrados</p></div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}