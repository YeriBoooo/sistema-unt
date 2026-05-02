'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiDownload } from '@/lib/api/client';
import { 
  FileText, 
  Download, 
  Calendar,
  Building2,
  Briefcase,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function ReportesPage() {
  const { user } = useAuth();
  const [generando, setGenerando] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const generarReporte = async (tipo: string) => {
    setGenerando(tipo);
    try {
      const filtros: any = {};
      if (fechaInicio) filtros.fecha_inicio = { gte: new Date(fechaInicio) };
      if (fechaFin) filtros.fecha_fin = { lte: new Date(fechaFin) };

      const blob = await apiDownload(`/reportes/${tipo}`, {
        method: 'POST',
        body: JSON.stringify(filtros),
        headers: { 'Content-Type': 'application/json' },
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar el reporte');
    } finally {
      setGenerando(null);
    }
  };

  if (!user?.roles?.includes('admin') && !user?.roles?.includes('coordinador')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-gray-500">No tienes permisos para acceder a esta página</p>
          <Link href="/dashboard" className="text-blue-600 mt-2 inline-block">
            Volver al dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 sm:px-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Reportes</h1>
          <p className="text-sm text-gray-500 mt-1">Generación de reportes operacionales y de gestión</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            Filtros de fecha
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tarjetas de reportes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Reporte de prácticas */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Reporte de prácticas</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Genera un reporte con todas las prácticas preprofesionales, incluyendo estudiantes, empresas y horas cumplidas.
            </p>
            <button
              onClick={() => generarReporte('practicas')}
              disabled={generando !== null}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {generando === 'practicas' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {generando === 'practicas' ? 'Generando...' : 'Descargar PDF'}
            </button>
          </div>

          {/* Reporte de tesis */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Reporte de tesis</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Genera un reporte con todas las tesis registradas, incluyendo estudiantes, asesores y estado actual.
            </p>
            <button
              onClick={() => generarReporte('tesis')}
              disabled={generando !== null}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {generando === 'tesis' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {generando === 'tesis' ? 'Generando...' : 'Descargar PDF'}
            </button>
          </div>

          {/* Reporte de convenios */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Building2 className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Reporte de convenios</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Genera un reporte con todos los convenios activos e inactivos con empresas colaboradoras.
            </p>
            <button
              onClick={() => generarReporte('convenios')}
              disabled={generando !== null}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
            >
              {generando === 'convenios' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {generando === 'convenios' ? 'Generando...' : 'Descargar PDF'}
            </button>
          </div>
        </div>

        {/* Nota */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-700">
            📄 Los reportes se generan en formato PDF. Puedes filtrar por rango de fechas para obtener información específica.
          </p>
        </div>
      </div>
    </div>
  );
}