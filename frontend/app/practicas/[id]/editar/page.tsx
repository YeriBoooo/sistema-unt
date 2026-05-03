'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiFetch } from '@/lib/api/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Briefcase, 
  Building2, 
  Calendar, 
  Users, 
  MapPin, 
  Save,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export default function EditarOfertaPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    requisitos: '',
    modalidad: 'presencial',
    vacantes: 1,
    fecha_inicio: '',
    fecha_fin: '',
    empresa_id: 1,
  });

  // Cargar datos de la oferta
  const { data: ofertaData, isLoading } = useQuery({
    queryKey: ['oferta', id],
    queryFn: () => apiFetch<any>(`/ofertas/${id}`),
    enabled: !!id,
  });

  const oferta = ofertaData?.data || ofertaData;

  // Cargar lista de empresas para el selector
  const { data: empresasData } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => apiFetch<any>('/empresas'),
    enabled: !!(user?.roles?.includes('admin') || user?.roles?.includes('coordinador')),
  });

  // Normalización segura de empresas
  const empresas = (() => {
    const raw = empresasData as any;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    if (raw?.data?.data && Array.isArray(raw.data.data)) return raw.data.data;
    return [];
  })();

  // Cargar datos al formulario
  useEffect(() => {
    if (oferta) {
      setFormData({
        titulo: oferta.titulo || '',
        descripcion: oferta.descripcion || '',
        requisitos: oferta.requisitos || '',
        modalidad: oferta.modalidad || 'presencial',
        vacantes: oferta.vacantes || 1,
        fecha_inicio: oferta.fecha_inicio ? new Date(oferta.fecha_inicio).toISOString().split('T')[0] : '',
        fecha_fin: oferta.fecha_fin ? new Date(oferta.fecha_fin).toISOString().split('T')[0] : '',
        empresa_id: oferta.empresa_id || 1,
      });
    }
  }, [oferta]);

  const canEdit = user?.roles?.includes('admin') || 
                  user?.roles?.includes('coordinador') || 
                  user?.roles?.includes('empresa');

  if (!canEdit) {
    router.push('/practicas');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Función para formatear fechas a ISO string
  const formatDateToISO = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validaciones básicas
    if (!formData.titulo.trim()) {
      toast.error('El título es obligatorio');
      setIsSubmitting(false);
      return;
    }

    if (!formData.descripcion.trim()) {
      toast.error('La descripción es obligatoria');
      setIsSubmitting(false);
      return;
    }

    if (!formData.fecha_inicio || !formData.fecha_fin) {
      toast.error('Las fechas de inicio y fin son obligatorias');
      setIsSubmitting(false);
      return;
    }

    // Convertir datos para enviar
    const dataToSend = {
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim(),
      requisitos: formData.requisitos?.trim() || null,
      modalidad: formData.modalidad,
      vacantes: Number(formData.vacantes),
      empresa_id: Number(formData.empresa_id),
      fecha_inicio: formatDateToISO(formData.fecha_inicio),
      fecha_fin: formatDateToISO(formData.fecha_fin),
    };

    try {
      const response = await apiFetch(`/ofertas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dataToSend),
      });
      
      toast.success('✅ Oferta actualizada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['ofertas'] });
      queryClient.invalidateQueries({ queryKey: ['oferta', id] });
      router.push(`/practicas/${id}`);
    } catch (error: any) {
      console.error('Error al actualizar:', error);
      toast.error(error.message || 'Error al actualizar la oferta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta oferta? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiFetch(`/ofertas/${id}`, { method: 'DELETE' });
      toast.success('✅ Oferta eliminada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['ofertas'] });
      router.push('/practicas');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la oferta');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#E8A735] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400 mt-3">Cargando oferta...</p>
        </div>
      </div>
    );
  }

  if (!oferta) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Oferta no encontrada</p>
        <Link href="/practicas" className="mt-4 inline-block text-[#E8A735] hover:underline">
          Volver a prácticas
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={`/practicas/${id}`} 
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver a la oferta
          </Link>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-[#E8A735] animate-pulse" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#E8A735]">
              Editar oferta
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#0A1C2E] to-[#2a3c4e] bg-clip-text text-transparent tracking-tight">
            Editar práctica
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Modifica los datos de la oferta de práctica
          </p>
        </div>

        {/* Formulario */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
        >
          {/* Empresa (solo admin/coordinador) */}
          {(user?.roles?.includes('admin') || user?.roles?.includes('coordinador')) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="empresa_id"
                  value={formData.empresa_id}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8A735] appearance-none cursor-pointer bg-white"
                >
                  {empresas.length === 0 ? (
                    <option value="">Cargando empresas...</option>
                  ) : (
                    empresas.map((emp: any) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.razon_social}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título de la práctica *
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                placeholder="Ej: Practicante de Desarrollo de Software"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8A735] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe las actividades y responsabilidades del puesto..."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8A735] focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Requisitos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requisitos
            </label>
            <textarea
              name="requisitos"
              value={formData.requisitos}
              onChange={handleChange}
              rows={3}
              placeholder="Ej: Estudiante de 7mo ciclo, conocimientos en React..."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8A735] focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Grid 2 columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modalidad *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="modalidad"
                  value={formData.modalidad}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8A735] appearance-none cursor-pointer bg-white"
                >
                  <option value="presencial">Presencial</option>
                  <option value="remota">Remota</option>
                  <option value="hibrida">Híbrida</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vacantes *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="vacantes"
                  value={formData.vacantes}
                  onChange={handleChange}
                  required
                  min="1"
                  max="50"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8A735] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de inicio *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8A735] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de fin *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8A735] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Eliminar
            </button>
            
            <div className="flex-1" />
            
            <Link
              href={`/practicas/${id}`}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </Link>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#0A1C2E] to-[#1E3A5F] rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}