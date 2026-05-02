'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
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
  Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

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
  
  // Estados para acta
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

  const revisarAvanceMutation = useMutation({
    mutationFn: async ({ avanceId, estado, observaciones }: { avanceId: number; estado: string; observaciones?: string }) => {
      return apiFetch(`/tesis/avances/${avanceId}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado, observaciones }),
      });
    },
    onSuccess: () => {
      alert('✅ Avance revisado correctamente');
      setMostrarModal(false);
      setAvanceSeleccionado(null);
      setObservacion('');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['tesis', id] });
    },
    onError: (error: any) => {
      alert('❌ Error al revisar: ' + error.message);
    },
  });

  // Mutación para registrar acta
  const registrarActaMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch(`${API_URL}/tesis/${id}/acta`, {
        method: 'POST',
        credentials: 'include',
        body: data,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al registrar acta');
      }
      return res.json();
    },
    onSuccess: () => {
      alert('✅ Acta registrada correctamente');
      setMostrarModalActa(false);
      setFormActa({ fecha: '', lugar: '', nota_final: '', archivo: null });
      refetch();
    },
    onError: (error: any) => {
      alert('❌ Error al registrar acta: ' + error.message);
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
      alert('Por favor ingresa una descripción');
      return;
    }
    
    setSubiendo(true);
    const formData = new FormData();
    formData.append('descripcion', nuevoAvance.descripcion);
    formData.append('tipo', nuevoAvance.tipo);
    if (nuevoAvance.archivo) {
      formData.append('file', nuevoAvance.archivo);
    }

    try {
      const res = await fetch(`${API_URL}/tesis/${id}/avances/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (res.ok) {
        alert('✅ Avance subido exitosamente');
        setMostrarFormularioAvance(false);
        setNuevoAvance({ tipo: 'capitulo', descripcion: '', archivo: null });
        refetch();
      } else {
        const error = await res.json();
        alert('❌ Error: ' + error.message);
      }
    } catch (error) {
      alert('❌ Error al subir el avance');
    } finally {
      setSubiendo(false);
    }
  };

  const handleRegistrarActa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formActa.fecha) {
      alert('La fecha es obligatoria');
      return;
    }
    
    setSubiendoActa(true);
    const formData = new FormData();
    formData.append('fecha', formActa.fecha);
    formData.append('lugar', formActa.lugar);
    formData.append('nota_final', formActa.nota_final);
    if (formActa.archivo) {
      formData.append('file', formActa.archivo);
    }
    
    registrarActaMutation.mutate(formData);
    setSubiendoActa(false);
  };

  const handleDownload = (archivoUrl: string) => {
    const filename = archivoUrl.split('/').pop();
    const fullUrl = `${API_URL}/uploads/avances/${filename}`;
    window.open(fullUrl, '_blank');
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'propuesta': return 'bg-yellow-100 text-yellow-700';
      case 'desarrollo': return 'bg-blue-100 text-blue-700';
      case 'sustentacion': return 'bg-purple-100 text-purple-700';
      case 'culminado': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'propuesta': return 'Propuesta';
      case 'desarrollo': return 'En desarrollo';
      case 'sustentacion': return 'Sustentación';
      case 'culminado': return 'Culminado';
      default: return estado;
    }
  };

  const getAvanceEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobado': return 'bg-green-100 text-green-700';
      case 'revisado': return 'bg-blue-100 text-blue-700';
      case 'observado': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAvanceEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'aprobado': return '✅ Aprobado';
      case 'revisado': return '📝 Revisado';
      case 'observado': return '⚠️ Observado';
      default: return '📄 Entregado';
    }
  };

  const getFileExtension = (url: string) => {
    return url?.split('.').pop()?.toUpperCase() || '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tesis) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No se encontró la tesis</p>
        <Link href="/tesis" className="text-blue-600 mt-2 inline-block">
          Volver a tesis
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link 
        href="/tesis" 
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a tesis
      </Link>

      {/* Modal de revisión de avance */}
      {mostrarModal && avanceSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Revisar avance</h3>
              <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-medium">{avanceSeleccionado.tipo}:</span> {avanceSeleccionado.descripcion}
            </p>
            {avanceSeleccionado.archivo_url && (
              <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                <button
                  onClick={() => handleDownload(avanceSeleccionado.archivo_url!)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Descargar archivo adjunto ({getFileExtension(avanceSeleccionado.archivo_url)})
                </button>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
              <textarea
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Escribe aquí tus observaciones..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => handleRevisar('aprobado')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                ✅ Aprobar
              </button>
              <button
                onClick={() => handleRevisar('observado')}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                ⚠️ Observar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para registrar acta */}
      {mostrarModalActa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Registrar acta de sustentación</h3>
              <button onClick={() => setMostrarModalActa(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRegistrarActa} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de sustentación *</label>
                <input
                  type="date"
                  value={formActa.fecha}
                  onChange={(e) => setFormActa({ ...formActa, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
                <input
                  type="text"
                  value={formActa.lugar}
                  onChange={(e) => setFormActa({ ...formActa, lugar: e.target.value })}
                  placeholder="Ej: Auditorio de la Facultad"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nota final (0-20)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={formActa.nota_final}
                  onChange={(e) => setFormActa({ ...formActa, nota_final: e.target.value })}
                  placeholder="Ej: 15.5"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acta PDF (opcional)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFormActa({ ...formActa, archivo: e.target.files?.[0] || null })}
                  className="w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalActa(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={subiendoActa}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {subiendoActa ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Guardar acta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">{tesis.titulo}</h1>
                <p className="text-sm text-gray-500 mt-1">Código: TES-{tesis.id}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(tesis.estado)}`}>
                {getEstadoTexto(tesis.estado)}
              </span>
            </div>
          </div>

          {/* Info General */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Fecha de inicio</p>
                <p className="text-sm text-gray-700">
                  {tesis.fecha_inicio ? new Date(tesis.fecha_inicio).toLocaleDateString() : 'No registrada'}
                </p>
              </div>
            </div>
          </div>

          {/* Estudiante */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Estudiante
            </h2>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800">
                {tesis.estudiante?.usuario?.nombres} {tesis.estudiante?.usuario?.apellidos}
              </p>
              <p className="text-xs text-gray-500">
                Código: {tesis.estudiante?.codigo_universitario} | {tesis.estudiante?.usuario?.email}
              </p>
            </div>
          </div>

          {/* Asesor Principal */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Asesor Principal
            </h2>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800">
                {tesis.asesor_principal?.usuario?.nombres} {tesis.asesor_principal?.usuario?.apellidos}
              </p>
              <p className="text-xs text-gray-500">{tesis.asesor_principal?.especialidad}</p>
            </div>
          </div>

          {/* Jurados */}
          {tesis.jurados && tesis.jurados.length > 0 && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Jurado
              </h2>
              <div className="space-y-2">
                {tesis.jurados.map((jurado) => (
                  <div key={jurado.id} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-800">
                      {jurado.asesor?.usuario?.nombres} {jurado.asesor?.usuario?.apellidos}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{jurado.rol}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumen */}
          {tesis.resumen && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Resumen</h2>
              <p className="text-sm text-gray-600">{tesis.resumen}</p>
            </div>
          )}

          {/* ACTA DE SUSTENTACIÓN - SOLO PARA ADMIN/COORDINADOR */}
          {esAdmin && (
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50/30 to-pink-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-800">Acta de sustentación</h2>
                </div>
                {!tesis.acta && (
                  <button
                    onClick={() => setMostrarModalActa(true)}
                    className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 flex items-center gap-1"
                  >
                    <Upload className="h-3 w-3" />
                    Registrar acta
                  </button>
                )}
              </div>

              {tesis.acta ? (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Fecha de sustentación</p>
                      <p className="text-gray-700">{new Date(tesis.acta.fecha).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Lugar</p>
                      <p className="text-gray-700">{tesis.acta.lugar || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Nota final</p>
                      <p className="text-lg font-bold text-purple-600">{tesis.acta.nota_final || '-'}</p>
                    </div>
                    {tesis.acta.archivo_acta_pdf && (
                      <div>
                        <p className="text-xs text-gray-400">Acta PDF</p>
                        <a 
                          href={`${API_URL}${tesis.acta.archivo_acta_pdf}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Descargar acta
                        </a>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setMostrarModalActa(true)}
                    className="text-xs text-purple-600 hover:text-purple-700"
                  >
                    Editar acta
                  </button>
                </div>
              ) : (
                <div className="mt-4 text-center text-gray-500 py-4">
                  <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No hay acta de sustentación registrada</p>
                </div>
              )}
            </div>
          )}

          {/* Avances */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Avances
              </h2>
              {esEstudiante && (
                <button
                  onClick={() => setMostrarFormularioAvance(!mostrarFormularioAvance)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 flex items-center gap-1"
                >
                  <Upload className="h-3 w-3" />
                  Subir avance
                </button>
              )}
            </div>

            {/* Formulario para subir nuevo avance */}
            {mostrarFormularioAvance && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <form onSubmit={enviarAvance} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={nuevoAvance.tipo}
                      onChange={(e) => setNuevoAvance({ ...nuevoAvance, tipo: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="capitulo">Capítulo</option>
                      <option value="articulo">Artículo</option>
                      <option value="informe">Informe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      value={nuevoAvance.descripcion}
                      onChange={(e) => setNuevoAvance({ ...nuevoAvance, descripcion: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe el contenido de tu avance..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Archivo adjunto (PDF, Word)</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      className="w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-400 mt-1">Máximo 5MB. Formatos: PDF, DOC, DOCX, TXT</p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setMostrarFormularioAvance(false)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={subiendo}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {subiendo ? 'Subiendo...' : 'Subir avance'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lista de avances */}
            {tesis.avances && tesis.avances.length > 0 ? (
              <div className="space-y-3">
                {tesis.avances.map((avance) => (
                  <div key={avance.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800 capitalize">{avance.tipo}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getAvanceEstadoColor(avance.estado)}`}>
                          {getAvanceEstadoTexto(avance.estado)}
                        </span>
                      </div>
                      
                      {esAsesor && avance.estado !== 'aprobado' && (
                        <button
                          onClick={() => abrirModalRevisar(avance)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600"
                        >
                          <Eye className="h-3 w-3" />
                          Revisar
                        </button>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600">{avance.descripcion}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Entregado: {new Date(avance.fecha_entrega).toLocaleDateString()}
                    </p>
                    
                    {avance.archivo_url && (
                      <div className="mt-2">
                        <button
                          onClick={() => handleDownload(avance.archivo_url!)}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Descargar archivo adjunto ({getFileExtension(avance.archivo_url)})
                        </button>
                      </div>
                    )}
                    
                    {avance.observaciones && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                        <p className="text-xs text-yellow-700">
                          <span className="font-medium">Observación del asesor:</span> {avance.observaciones}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No hay avances registrados</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}