'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ArrowLeft, Save, Loader2, Mail, Phone, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

interface Estudiante {
  id: number;
  usuario_id: number;
  codigo_universitario: string;
  ciclo: string;
  usuario: {
    nombres: string;
    apellidos: string;
    email: string;
    dni: string;
    telefono: string;
  };
  escuela: {
    id: number;
    nombre: string;
  };
}

export default function EditarEstudiantePage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    dni: '',
    telefono: '',
    codigo_universitario: '',
    ciclo: '',
  });
  const [initialLoaded, setInitialLoaded] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ['estudiante', id],
    queryFn: () => apiFetch<any>(`/estudiantes/${id}`),
  });

  const estudiante: Estudiante | undefined = response?.data;

  // ✅ CORREGIDO: Cargar datos cuando estén disponibles (sin condición que bloquee)
  useEffect(() => {
    if (estudiante && !initialLoaded) {
      setFormData({
        nombres: estudiante.usuario?.nombres || '',
        apellidos: estudiante.usuario?.apellidos || '',
        email: estudiante.usuario?.email || '',
        dni: estudiante.usuario?.dni || '',
        telefono: estudiante.usuario?.telefono || '',
        codigo_universitario: estudiante.codigo_universitario || '',
        ciclo: estudiante.ciclo || '',
      });
      setInitialLoaded(true);
    }
  }, [estudiante, initialLoaded]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      // ✅ Enviar en el formato que espera el backend
      const payload = {
        codigo_universitario: data.codigo_universitario,
        ciclo: data.ciclo,
        usuario: {
          nombres: data.nombres,
          apellidos: data.apellidos,
          email: data.email,
          dni: data.dni,
          telefono: data.telefono,
        },
      };
      return apiFetch(`/estudiantes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success('✅ Estudiante actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      queryClient.invalidateQueries({ queryKey: ['estudiante', id] });
      router.push('/estudiantes');
    },
    onError: (error: any) => {
      toast.error('❌ Error al actualizar: ' + (error.message || 'Intenta nuevamente'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
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
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-800">Editar estudiante</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">Actualiza los datos del estudiante</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
              <input
                type="text"
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
              <input
                type="text"
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
              <input
                type="text"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código universitario *</label>
              <input
                type="text"
                value={formData.codigo_universitario}
                onChange={(e) => setFormData({ ...formData, codigo_universitario: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.ciclo}
                  onChange={(e) => setFormData({ ...formData, ciclo: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: IX"
                />
              </div>
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
              disabled={updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}