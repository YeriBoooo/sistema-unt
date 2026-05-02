'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiFetch } from '@/lib/api/client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, BookOpen, UserCheck, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Asesor {
  id: number;
  usuario: {
    nombres: string;
    apellidos: string;
  };
  especialidad: string;
}

export default function NuevaTesisPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAsesores, setIsLoadingAsesores] = useState(true);
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    titulo: '',
    resumen: '',
    asesor_principal_id: '',
  });

  useEffect(() => {
    const fetchAsesores = async () => {
      try {
        const data = await apiFetch<any>('/asesores/disponibles');
        setAsesores(data?.data || data || []);
      } catch (err) {
        console.error('Error cargando asesores:', err);
      } finally {
        setIsLoadingAsesores(false);
      }
    };
    fetchAsesores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.asesor_principal_id) {
      setError('Debes seleccionar un asesor principal');
      setIsLoading(false);
      return;
    }

    try {
      await apiFetch('/tesis', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          asesor_principal_id: parseInt(formData.asesor_principal_id)
        }),
      });
      toast.success('Tesis registrada correctamente');
      router.push('/tesis');
    } catch (err: any) {
      const errorMsg = err.message || 'Error al registrar la tesis';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/tesis"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                Nuevo proyecto
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Registrar tesis</h1>
            <p className="text-xs text-gray-500 mt-0.5">Completa el formulario para registrar tu proyecto</p>
          </div>
        </div>

        {/* Formulario */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Título de la tesis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Desarrollo de un sistema de gestión de prácticas..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Resumen
            </label>
            <textarea
              value={formData.resumen}
              onChange={(e) => setFormData({ ...formData, resumen: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Breve descripción de tu proyecto de tesis..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Asesor principal <span className="text-red-500">*</span>
            </label>
            {isLoadingAsesores ? (
              <div className="flex items-center gap-2 py-2 text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Cargando asesores...</span>
              </div>
            ) : (
              <select
                value={formData.asesor_principal_id}
                onChange={(e) => setFormData({ ...formData, asesor_principal_id: e.target.value })}
                className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecciona un asesor</option>
                {asesores.map((asesor) => (
                  <option key={asesor.id} value={asesor.id}>
                    {asesor.usuario?.nombres} {asesor.usuario?.apellidos} {asesor.especialidad && `- ${asesor.especialidad}`}
                  </option>
                ))}
              </select>
            )}
            <p className="text-[10px] text-gray-400 mt-1">El asesor guiará tu proyecto de tesis</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/tesis"
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isLoading ? 'Registrando...' : 'Registrar tesis'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}