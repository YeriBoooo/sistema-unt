'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditarEstudiantePage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');

  // Cargar datos actuales
  const { data: response, isLoading } = useQuery({
    queryKey: ['estudiante', id],
    queryFn: () => apiFetch<any>(`/estudiantes/${id}`),
  });

  const estudiante = response?.data;

  useEffect(() => {
    if (estudiante) {
      setNombres(estudiante.usuario?.nombres || '');
      setApellidos(estudiante.usuario?.apellidos || '');
    }
  }, [estudiante]);

  // Mutación para actualizar
  const updateMutation = useMutation({
    mutationFn: async () => {
      return apiFetch(`/estudiantes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          usuario: {
            nombres: nombres,
            apellidos: apellidos,
          },
        }),
      });
    },
    onSuccess: () => {
      toast.success('✅ Estudiante actualizado');
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      router.push('/estudiantes');
    },
    onError: (error: any) => {
      toast.error('Error: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/estudiantes" className="text-blue-600 mb-4 inline-block">
        ← Volver
      </Link>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-bold mb-4">Editar estudiante</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nombres</label>
          <input
            type="text"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Apellidos</label>
          <input
            type="text"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}