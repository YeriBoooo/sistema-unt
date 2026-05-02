'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  User, 
  ChevronRight, 
  Plus,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle2,
  GraduationCap,
  Layers,
  Sparkles,
  ArrowRight,
  Search,
  LayoutGrid,
  List,
  Star
} from 'lucide-react';
import { useState } from 'react';

const getEstadoConfig = (estado: string) => {
  switch (estado) {
    case 'desarrollo':
      return { 
        label: 'En desarrollo', 
        color: 'from-blue-500 to-blue-600', 
        bg: 'bg-blue-50', 
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: TrendingUp,
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
      };
    case 'propuesta':
      return { 
        label: 'Propuesta', 
        color: 'from-amber-500 to-amber-600', 
        bg: 'bg-amber-50', 
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: Clock,
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
      };
    case 'sustentacion':
      return { 
        label: 'Sustentación', 
        color: 'from-purple-500 to-purple-600', 
        bg: 'bg-purple-50', 
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: GraduationCap,
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
      };
    case 'culminado':
      return { 
        label: 'Culminado', 
        color: 'from-emerald-500 to-emerald-600', 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: CheckCircle2,
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      };
    default:
      return { 
        label: 'Registrada', 
        color: 'from-gray-500 to-gray-600', 
        bg: 'bg-gray-50', 
        text: 'text-gray-600',
        border: 'border-gray-200',
        icon: FileText,
        gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
      };
  }
};

// Componente de tarjeta de tesis
const TesisCard = ({ item, index }: { item: any; index: number }) => {
  const estadoConfig = getEstadoConfig(item.estado);
  const IconComponent = estadoConfig.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/tesis/${item.id}`} className="block">
        <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50/0 to-gray-50/0 group-hover:from-gray-50/30 group-hover:to-transparent transition-all duration-500" />
          
          <div className="relative p-6">
            <div className="flex items-start gap-5">
              <motion.div 
                className="hidden sm:flex w-12 h-12 rounded-xl items-center justify-center relative overflow-hidden"
                style={{ background: estadoConfig.gradient }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <IconComponent className="h-5 w-5 text-white relative z-10" />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors line-clamp-1">
                      {item.titulo}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${estadoConfig.bg} ${estadoConfig.text}`}>
                        <IconComponent className="h-3 w-3" />
                        {estadoConfig.label}
                      </div>
                      {item.destacado && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600 text-[10px] font-medium">
                          <Star className="h-2.5 w-2.5 fill-yellow-500" />
                          Destacado
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <motion.div 
                    className="text-gray-300 group-hover:text-gray-500 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 hover:text-gray-600 transition-colors">
                    <Calendar className="h-3.5 w-3.5" />
                    {item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    }) : 'Sin fecha'}
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-gray-600 transition-colors">
                    <User className="h-3.5 w-3.5" />
                    {item.asesor_principal?.usuario?.nombres || 'Sin asignar'}
                  </span>
                  {item.avances && item.avances.length > 0 && (
                    <span className="flex items-center gap-1.5 hover:text-gray-600 transition-colors">
                      <Layers className="h-3.5 w-3.5" />
                      <span className="font-medium text-gray-500">{item.avances.length}</span> avance{item.avances.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                {item.estado === 'desarrollo' && item.progreso && (
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Progreso</span>
                      <span className="font-medium text-gray-600">{item.progreso}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progreso}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Componente de estadística
const StatCard = ({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: any }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-xl bg-white p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <Icon className={`h-5 w-5 ${color}`} />
          <span className="text-2xl font-bold text-gray-800">{value}</span>
        </div>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 ${color.replace('text', 'bg')} w-0 group-hover:w-full transition-all duration-500`} />
    </motion.div>
  );
};

export default function TesisPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const isEstudiante = user?.roles?.includes('estudiante');
  const url = isEstudiante ? '/tesis/mis-tesis' : '/tesis';

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['tesis', url],
    queryFn: () => apiFetch(url) as Promise<any>,
  });

  // Normalización de datos
  let tesis: any[] = [];
  const responseData = response as any;
  
  if (Array.isArray(responseData)) {
    tesis = responseData;
  } else if (responseData?.data && Array.isArray(responseData.data)) {
    tesis = responseData.data;
  } else if (responseData?.data?.data && Array.isArray(responseData.data.data)) {
    tesis = responseData.data.data;
  } else if (responseData?.tesis && Array.isArray(responseData.tesis)) {
    tesis = responseData.tesis;
  }

  const filteredTesis = tesis.filter((item: any) => {
    const matchesSearch = item.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.asesor_principal?.usuario?.nombres?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || item.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  const stats = {
    total: tesis.length,
    desarrollo: tesis.filter((t: any) => t.estado === 'desarrollo').length,
    propuesta: tesis.filter((t: any) => t.estado === 'propuesta').length,
    sustentacion: tesis.filter((t: any) => t.estado === 'sustentacion').length,
    culminado: tesis.filter((t: any) => t.estado === 'culminado').length
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-gray-200 border-t-gray-800 rounded-full mx-auto"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-400 mt-4"
          >
            Cargando proyectos...
          </motion.p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50/50 rounded-2xl p-8 text-center border border-red-100"
        >
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-red-600 font-medium">Error al cargar las tesis</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </motion.div>
      </div>
    );
  }

  if (tesis.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-light text-gray-600">No hay tesis registradas</h2>
          <p className="text-gray-400 mt-2">
            {isEstudiante ? "Comienza tu proyecto de investigación" : "No hay proyectos en el sistema"}
          </p>
          {isEstudiante && (
            <Link 
              href="/tesis/nueva" 
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              Nueva tesis
            </Link>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* SOLO CAMBIÉ EL PADDING: de px-4 a px-2 */}
      <div className="max-w-6xl mx-auto px-2 py-8 sm:px-4 lg:px-6">
        
        {/* Header - SOLO CAMBIÉ EL TAMAÑO DE "Tesis" */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <motion.div 
                className="flex items-center gap-2 mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-900" />
                <span className="text-[11px] font-mono font-medium uppercase tracking-[0.2em] text-gray-400">
                  Investigación Académica
                </span>
              </motion.div>
              
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Tesis<span className="text-gray-300">.</span>
                <motion.span 
                  className="inline-block ml-3"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Sparkles className="h-7 w-7 text-gray-300 inline" />
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-sm text-gray-400 mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Gestión y seguimiento de proyectos de investigación
              </motion.p>
            </div>
            
            {isEstudiante && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Link 
                  href="/tesis/nueva" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl group"
                >
                  <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                  Nueva tesis
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <StatCard label="Total" value={stats.total} color="text-gray-600" icon={FileText} />
          <StatCard label="Desarrollo" value={stats.desarrollo} color="text-blue-600" icon={TrendingUp} />
          <StatCard label="Propuesta" value={stats.propuesta} color="text-amber-600" icon={Clock} />
          <StatCard label="Sustentación" value={stats.sustentacion} color="text-purple-600" icon={GraduationCap} />
          <StatCard label="Culminada" value={stats.culminado} color="text-emerald-600" icon={CheckCircle2} />
        </div>

        {/* Búsqueda y filtros */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título o asesor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
              >
                <option value="todos">Todos los estados</option>
                <option value="propuesta">Propuesta</option>
                <option value="desarrollo">Desarrollo</option>
                <option value="sustentacion">Sustentación</option>
                <option value="culminado">Culminado</option>
              </select>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 px-3 transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 px-3 transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lista de tesis */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode + filterEstado + searchTerm}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ staggerChildren: 0.08, delayChildren: 0.1 }}
            className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 gap-4" 
              : "space-y-3"
            }
          >
            {filteredTesis.map((item: any, idx: number) => (
              viewMode === 'grid' ? (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <Link href={`/tesis/${item.id}`} className="block h-full">
                    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 h-full p-5">
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-xl ${getEstadoConfig(item.estado).bg}`}>
                            {(() => {
                              const Icon = getEstadoConfig(item.estado).icon;
                              return <Icon className={`h-4 w-4 ${getEstadoConfig(item.estado).text}`} />;
                            })()}
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                          {item.titulo}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-auto pt-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.asesor_principal?.usuario?.nombres?.split(' ')[0] || 'Sin asesor'}
                          </span>
                          {item.avances && (
                            <span className="flex items-center gap-1">
                              <Layers className="h-3 w-3" />
                              {item.avances.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ) : (
                <TesisCard key={item.id} item={item} index={idx} />
              )
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredTesis.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-400">No se encontraron tesis con esos filtros</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}