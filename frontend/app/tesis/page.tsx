'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Calendar, User, ChevronRight, Briefcase } from 'lucide-react';

export default function TesisPage() {
  const { user } = useAuth();
  const isEstudiante = user?.roles?.includes('estudiante');

  // Si es estudiante, usa /tesis/mis-tesis
  const url = isEstudiante ? '/tesis/mis-tesis' : '/tesis';

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['tesis', url],
    queryFn: () => apiFetch<any>(url),
  });

  // ✅ CORREGIDO: Extraer el array correctamente
  let tesis: any[] = [];
  
  if (Array.isArray(response)) {
    tesis = response;
  } else if (response?.data && Array.isArray(response.data)) {
    tesis = response.data;
  } else if (response?.data && response?.data?.data && Array.isArray(response.data.data)) {
    tesis = response.data.data;
  } else if (response?.data?.data && Array.isArray(response.data.data)) {
    tesis = response.data.data;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    console.error('Error cargando tesis:', error);
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
          <p className="text-red-600">Error al cargar las tesis</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm text-red-600 hover:text-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (tesis.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Tesis</h1>
            <p className="text-sm text-gray-500 mt-1">Gestiona tus proyectos de tesis</p>
          </div>
          {isEstudiante && (
            <Link href="/tesis/nueva" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              + Nueva tesis
            </Link>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tienes tesis registradas</p>
          {isEstudiante && (
            <Link href="/tesis/nueva" className="inline-block mt-3 text-blue-600 hover:text-blue-700 text-sm">
              Crear nueva tesis
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Tesis</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus proyectos de tesis</p>
        </div>
        {isEstudiante && (
          <Link href="/tesis/nueva" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            + Nueva tesis
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {tesis.map((item: any, idx: number) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <Link href={`/tesis/${item.id}`} className="block p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-800 line-clamp-1">
                    {item.titulo}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Inicio: {item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString() : 'No registrada'}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Asesor: {item.asesor_principal?.usuario?.nombres} {item.asesor_principal?.usuario?.apellidos}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                      item.estado === 'desarrollo' ? 'bg-blue-100 text-blue-700' :
                      item.estado === 'propuesta' ? 'bg-yellow-100 text-yellow-700' :
                      item.estado === 'sustentacion' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.estado === 'desarrollo' ? 'En desarrollo' :
                       item.estado === 'propuesta' ? 'Propuesta' :
                       item.estado === 'sustentacion' ? 'Sustentación' : 'Culminado'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}