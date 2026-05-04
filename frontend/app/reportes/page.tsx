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
  Loader2,
  TrendingUp,
  GraduationCap,
  Handshake
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-red-600" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header profesional */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0A1C2E] to-[#2a3c4e] bg-clip-text text-transparent">
                Reportes del Sistema
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Generación de reportes operacionales y de gestión
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{user?.nombres} {user?.apellidos}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.roles?.[0]}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Sección de filtros */}
        <section className="mb-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-[#E8A735]" />
              <h2 className="text-base font-semibold text-gray-800">Filtros de fecha</h2>
              <span className="text-xs text-gray-400 ml-2">(opcional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A735] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8A735] focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => { setFechaInicio(''); setFechaFin(''); }}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de reportes - 3 tipos */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 Reportes disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Reporte de prácticas */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Prácticas preprofesionales</h3>
                </div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Reporte detallado de todas las prácticas preprofesionales, incluyendo:
                  estudiantes, empresas, horas cumplidas, modalidad y estado actual.
                </p>
                <ul className="text-xs text-gray-500 mb-4 space-y-1">
                  <li>• Datos del estudiante y empresa</li>
                  <li>• Horas cumplidas / totales</li>
                  <li>• Evaluación final (aprobado/desaprobado)</li>
                  <li>• Fechas de inicio y fin</li>
                </ul>
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
            </div>

            {/* Reporte de tesis */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Proyectos de tesis</h3>
                </div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Reporte completo de todos los proyectos de tesis, incluyendo:
                  estudiantes, asesores, jurados, avances y estado actual.
                </p>
                <ul className="text-xs text-gray-500 mb-4 space-y-1">
                  <li>• Datos del estudiante y asesor</li>
                  <li>• Estado: propuesta/desarrollo/sustentación/culminado</li>
                  <li>• Avances entregados y aprobados</li>
                  <li>• Acta de sustentación y nota final</li>
                </ul>
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
            </div>

            {/* Reporte de convenios */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Handshake className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Convenios institucionales</h3>
                </div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Reporte de todos los convenios con empresas, incluyendo:
                  vigencia, tipo de convenio y datos de contacto.
                </p>
                <ul className="text-xs text-gray-500 mb-4 space-y-1">
                  <li>• Datos de la empresa (RUC, razón social)</li>
                  <li>• Fechas de vigencia del convenio</li>
                  <li>• Tipo: marco o específico</li>
                  <li>• Representante y contacto</li>
                </ul>
                <button
                  onClick={() => generarReporte('convenios')}
                  disabled={generando !== null}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
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
          </div>
        </section>

        {/* Recomendaciones */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              📋 Recomendaciones para el uso de reportes
            </h3>
            <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
              <li>Utiliza los filtros de fecha para acotar los reportes a períodos específicos.</li>
              <li>Los reportes se generan en formato PDF y se descargan automáticamente.</li>
              <li>Para reportes muy extensos, considera filtrar por rangos de fecha más pequeños.</li>
              <li>Los reportes de prácticas incluyen horas cumplidas y evaluación final de cada estudiante.</li>
              <li>Los reportes de tesis muestran el estado actual y el progreso de avances.</li>
            </ul>
          </div>
        </section>

      </main>

      {/* Footer profesional */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-center sm:text-left">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Sistema UNT - Gestión de Prácticas Preprofesionales y Tesis
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Universidad Nacional de Trujillo - Escuela de Ingeniería de Sistemas
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">Reportes generados en tiempo real</span>
              <span className="text-xs text-gray-400">v1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}