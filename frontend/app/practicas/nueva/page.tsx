'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiFetch } from '@/lib/api/client';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Briefcase, 
  Building2, 
  Calendar, 
  Users, 
  MapPin, 
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function NuevaOfertaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    requisitos: '',
    modalidad: 'presencial',
    vacantes: 1,
    fecha_inicio: '',
    fecha_fin: '',
  });

  // Verificar permisos
  const canCreate = user?.roles?.includes('admin') || 
                    user?.roles?.includes('coordinador') || 
                    user?.roles?.includes('empresa');

  if (!canCreate) {
    router.push('/practicas');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiFetch('/ofertas', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      toast.success('✅ Oferta creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['ofertas'] });
      router.push('/practicas');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la oferta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/practicas" 
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver a prácticas
          </Link>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-[#E8A735] animate-pulse" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#E8A735]">
              Publicar oferta
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#0A1C2E] to-[#2a3c4e] bg-clip-text text-transparent tracking-tight">
            Nueva oferta de práctica
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Completa los datos para publicar una nueva oportunidad
          </p>
        </div>

        {/* Formulario */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
        >
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
              placeholder="Ej: Estudiante de 7mo ciclo, conocimientos en React, disponibilidad 20h/semana..."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8A735] focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Grid 2 columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Modalidad */}
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

            {/* Vacantes */}
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
            <Link
              href="/practicas"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-center"
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
                  Publicando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Publicar oferta
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}