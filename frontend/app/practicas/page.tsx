'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiFetch } from '@/lib/api/client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  Users,
  ChevronRight,
  Search,
  Sparkles,
  Filter
} from 'lucide-react';
import { useState } from 'react';

interface Oferta {
  id: number;
  titulo: string;
  descripcion: string;
  requisitos: string;
  modalidad: string;
  vacantes: number;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
  empresa: {
    razon_social: string;
    ruc: string;
  };
}

// ✅ CORREGIDO - ease simplificado para evitar error de TypeScript
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const getModalidadColor = (modalidad: string) => {
  switch (modalidad) {
    case 'remota':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'hibrida':
      return 'bg-purple-50 text-purple-700 border-purple-100';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-100';
  }
};

const getModalidadIcon = (modalidad: string) => {
  switch (modalidad) {
    case 'remota':
      return '🏠';
    case 'hibrida':
      return '🌐';
    default:
      return '🏢';
  }
};

const getModalidadTexto = (modalidad: string) => {
  switch (modalidad) {
    case 'remota':
      return 'Remota';
    case 'hibrida':
      return 'Híbrida';
    default:
      return 'Presencial';
  }
};

export default function OfertasPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalidadFilter, setModalidadFilter] = useState('');

  const { data: ofertasList, isLoading } = useQuery({
    queryKey: ['ofertas'],
    queryFn: () => apiFetch<any>('/ofertas?estado=abierta'),
  });

  const ofertas = ofertasList?.data?.data || ofertasList?.data || [];

  const filteredOfertas = ofertas.filter((oferta: Oferta) => {
    const matchesSearch = oferta.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          oferta.empresa.razon_social.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModalidad = !modalidadFilter || oferta.modalidad === modalidadFilter;
    return matchesSearch && matchesModalidad;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 border-3 border-[#0A1C2E]/10 rounded-full" />
            <div className="absolute inset-0 border-3 border-[#E8A735] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-gray-400 mt-3 font-medium">Cargando oportunidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-[#E8A735] animate-pulse" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#E8A735]">
              Portal de prácticas
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#0A1C2E] to-[#2a3c4e] bg-clip-text text-transparent tracking-tight">
                Prácticas preprofesionales
              </h1>
              <p className="text-gray-500 mt-2 max-w-2xl">
                Encuentra las mejores oportunidades para tu desarrollo profesional
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#E8A735]" />
              <span>{filteredOfertas.length} oportunidades disponibles</span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-1.5">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por título o empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8A735] focus:border-transparent transition-all"
                />
              </div>
              <div className="relative sm:w-56">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={modalidadFilter}
                  onChange={(e) => setModalidadFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8A735] focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Todas las modalidades</option>
                  <option value="presencial">Presencial</option>
                  <option value="remota">Remota</option>
                  <option value="hibrida">Híbrida</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de ofertas */}
        {filteredOfertas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-gray-300" strokeWidth={1.2} />
            </div>
            <p className="text-gray-400 font-medium">No hay ofertas disponibles</p>
            <p className="text-sm text-gray-300 mt-1">Pronto se publicarán nuevas oportunidades</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOfertas.map((oferta: Oferta, idx: number) => (
              <motion.div
                key={oferta.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Badge de modalidad */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border ${getModalidadColor(oferta.modalidad)}`}>
                    <span>{getModalidadIcon(oferta.modalidad)}</span>
                    {getModalidadTexto(oferta.modalidad)}
                  </span>
                </div>

                {/* Contenido */}
                <div className="p-5">
                  {/* Empresa */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#0A1C2E]/5 to-[#0A1C2E]/10 rounded-xl flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-[#0A1C2E]" strokeWidth={1.5} />
                    </div>
                    <p className="text-xs font-medium text-gray-500 truncate">
                      {oferta.empresa.razon_social}
                    </p>
                  </div>

                  {/* Título */}
                  <h3 className="text-base font-semibold text-gray-800 line-clamp-1 mb-2 group-hover:text-[#0A1C2E] transition-colors">
                    {oferta.titulo}
                  </h3>

                  {/* Detalles */}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(oferta.fecha_inicio).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {oferta.vacantes} {oferta.vacantes === 1 ? 'vacante' : 'vacantes'}
                    </span>
                  </div>

                  {/* Descripción */}
                  <p className="text-xs text-gray-500 line-clamp-2 mt-3 leading-relaxed">
                    {oferta.descripcion}
                  </p>

                  {/* Link de acción */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Link
                      href={`/practicas/${oferta.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#0A1C2E] hover:text-[#E8A735] transition-colors group/link"
                    >
                      <span>Ver detalles</span>
                      <ChevronRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
                    </Link>
                  </div>
                </div>

                {/* Barra decorativa inferior */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0A1C2E] to-[#E8A735] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}