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
  MapPin
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

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const getModalidadColor = (modalidad: string) => {
  switch (modalidad) {
    case 'remota': return 'bg-green-100 text-green-700';
    case 'hibrida': return 'bg-purple-100 text-purple-700';
    default: return 'bg-blue-100 text-blue-700';
  }
};

const getModalidadIcon = (modalidad: string) => {
  switch (modalidad) {
    case 'remota': return '🏠';
    case 'hibrida': return '🌐';
    default: return '🏢';
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

  // ✅ CORREGIDO: Extrae correctamente el array de ofertas
  const ofertas = ofertasList?.data?.data || ofertasList?.data || [];

  const filteredOfertas = ofertas.filter((oferta: Oferta) => {
    const matchesSearch = oferta.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          oferta.empresa.razon_social.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModalidad = !modalidadFilter || oferta.modalidad === modalidadFilter;
    return matchesSearch && matchesModalidad;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 sm:px-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
              Oportunidades laborales
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Prácticas preprofesionales</h1>
          <p className="text-xs text-gray-500 mt-1">Encuentra las mejores oportunidades para tu desarrollo profesional</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título o empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={modalidadFilter}
            onChange={(e) => setModalidadFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las modalidades</option>
            <option value="presencial">Presencial</option>
            <option value="remota">Remota</option>
            <option value="hibrida">Híbrida</option>
          </select>
        </div>

        {/* Grid de ofertas */}
        {filteredOfertas.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" strokeWidth={1.2} />
            <p className="text-sm text-gray-400">No hay ofertas disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOfertas.map((oferta: Oferta, idx: number) => (
              <motion.div
                key={oferta.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{oferta.titulo}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3" />
                        {oferta.empresa.razon_social}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full ${getModalidadColor(oferta.modalidad)}`}>
                      <span>{getModalidadIcon(oferta.modalidad)}</span>
                      {oferta.modalidad === 'remota' ? 'Remota' : oferta.modalidad === 'hibrida' ? 'Híbrida' : 'Presencial'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(oferta.fecha_inicio).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {oferta.vacantes} vacantes
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 line-clamp-2 mt-2">{oferta.descripcion}</p>
                  
                  <Link
                    href={`/practicas/${oferta.id}`}
                    className="inline-flex items-center gap-1 mt-3 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Ver detalles
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}