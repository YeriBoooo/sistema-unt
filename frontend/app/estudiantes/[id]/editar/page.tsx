'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EditarEstudiantePage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos
  useEffect(() => {
    fetch(`/api/estudiantes/${id}`)
      .then(r => r.json())
      .then(data => {
        setNombres(data.data?.usuario?.nombres || '');
        setApellidos(data.data?.usuario?.apellidos || '');
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/estudiantes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: { nombres, apellidos } })
    });
    if (res.ok) {
      toast.success('✅ Actualizado');
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      router.push('/estudiantes');
    } else {
      toast.error('Error');
    }
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <Link href="/estudiantes" className="text-blue-600">← Volver</Link>
      <form onSubmit={handleSubmit} className="mt-4">
        <h1 className="text-xl font-bold mb-4">Editar Estudiante</h1>
        <input value={nombres} onChange={e => setNombres(e.target.value)} className="border p-2 w-full mb-2" placeholder="Nombres" />
        <input value={apellidos} onChange={e => setApellidos(e.target.value)} className="border p-2 w-full mb-2" placeholder="Apellidos" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
      </form>
    </div>
  );
}