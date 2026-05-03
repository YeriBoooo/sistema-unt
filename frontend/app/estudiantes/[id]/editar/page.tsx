'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Mail, Phone, GraduationCap, School } from 'lucide-react';
import { toast } from 'sonner';

export default function EditarEstudiantePage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    dni: '',
    telefono: '',
    codigo_universitario: '',
    ciclo: '',
    escuela_id: 1,
  });

  // Cargar datos del estudiante
  const { data: response, isLoading } = useQuery({
    queryKey: ['estudiante', id],
    queryFn: () => apiFetch<any>(`/estudiantes/${id}`),
  });

  const estudiante = response?.data;

  useEffect(() => {
    if (estudiante) {
      setFormData({
        nombres: estudiante.usuario?.nombres || '',
        apellidos: estudiante.usuario?.apellidos || '',
        email: estudiante.usuario?.email || '',
        dni: estudiante.usuario?.dni || '',
        telefono: estudiante.usuario?.telefono || '',
        codigo_universitario: estudiante.codigo_universitario || '',
        ciclo: estudiante.ciclo || '',
        escuela_id: estudiante.escuela_id || 1,
      });
    }
  }, [estudiante]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        codigo_universitario: data.codigo_universitario,
        ciclo: data.ciclo,
        escuela_id: data.escuela_id,
        usuario: {
          nombres: data.nombres,
          apellidos: data.apellidos,
          email: data.email,
          dni: data.dni,
          telefono: data.telefono,
        },
      };
      
      console.log('📤 Enviando payload:', payload);
      
      return apiFetch(`/estudiantes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      console.log('✅ Respuesta:', data);
      toast.success('✅ Estudiante actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      queryClient.invalidateQueries({ queryKey: ['estudiante', id] });
      router.push('/estudiantes');
    },
    onError: (error: any) => {
      console.error('❌ Error:', error);
      toast.error('❌ Error al actualizar: ' + (error.message || 'Intenta nuevamente'));
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    updateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!estudiante) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Estudiante no encontrado</p>
        <Link href="/estudiantes" className="text-blue-600 mt-2 inline-block">Volver a estudiantes</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/estudiantes" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Volver a estudiantes
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <h1 className="text-xl font-semibold text-gray-800">Editar estudiante</h1>
          <p className="text-sm text-gray-500 mt-1">Actualiza los datos del estudiante</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código universitario *</label>
              <input
                type="text"
                name="codigo_universitario"
                value={formData.codigo_universitario}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="ciclo"
                  value={formData.ciclo}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: IX"
                />
              </div>
            </div>
          </div>

          {/* Escuela */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escuela *</label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                name="escuela_id"
                value={formData.escuela_id}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer bg-white"
              >
                <option value="1">Ingeniería de Sistemas</option>
                <option value="2">Ingeniería Industrial</option>
                <option value="3">Ingeniería Civil</option>
                <option value="4">Arquitectura</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/estudiantes"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}