'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  GraduationCap,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
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
    nombre: string;
  };
}

export default function EstudiantesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['estudiantes'],
    queryFn: () => apiFetch<any>('/estudiantes'),
  });

  // ✅ Extraer el array correctamente
  let estudiantes: Estudiante[] = [];
  
  if (Array.isArray(response)) {
    estudiantes = response;
  } else if (response?.data && Array.isArray(response.data)) {
    estudiantes = response.data;
  } else if (response?.data?.data && Array.isArray(response.data.data)) {
    estudiantes = response.data.data;
  }

  // ✅ Filtrar por búsqueda
  const filteredEstudiantes = estudiantes.filter(estudiante =>
    estudiante.usuario?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estudiante.usuario?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estudiante.codigo_universitario?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Paginación
  const totalPages = Math.ceil(filteredEstudiantes.length / itemsPerPage);
  const paginatedEstudiantes = filteredEstudiantes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ✅ Eliminar estudiante
  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${nombre}?`)) return;
    
    try {
      await apiFetch(`/estudiantes/${id}`, { method: 'DELETE' });
      toast.success('✅ Estudiante eliminado correctamente');
      refetch();
    } catch (error: any) {
      toast.error('❌ Error al eliminar: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Estudiantes</h1>
              <p className="text-sm text-gray-500 mt-1">Gestión de estudiantes universitarios</p>
            </div>
            <Link
              href="/estudiantes/nuevo"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nuevo estudiante
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o código..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre completo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Escuela</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ciclo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedEstudiantes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No hay estudiantes registrados
                    </td>
                  </tr>
                ) : (
                  paginatedEstudiantes.map((estudiante) => (
                    <tr key={estudiante.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {estudiante.codigo_universitario}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {estudiante.usuario?.nombres?.charAt(0)}{estudiante.usuario?.apellidos?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {estudiante.usuario?.nombres} {estudiante.usuario?.apellidos}
                            </p>
                            <p className="text-xs text-gray-500">DNI: {estudiante.usuario?.dni}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {estudiante.usuario?.email}
                        </div>
                        {estudiante.usuario?.telefono && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <Phone className="h-2.5 w-2.5" />
                            {estudiante.usuario?.telefono}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {estudiante.escuela?.nombre || 'No asignada'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          <GraduationCap className="h-2.5 w-2.5" />
                          {estudiante.ciclo || 'No registrado'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/estudiantes/${estudiante.id}`}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/estudiantes/${estudiante.id}/editar`}
                            className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(estudiante.id, `${estudiante.usuario?.nombres} ${estudiante.usuario?.apellidos}`)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}