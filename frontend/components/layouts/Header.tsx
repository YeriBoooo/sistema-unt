'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Bell, Search, User, Sparkles, LogOut, Settings, Calendar, Clock, HelpCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Interfaz para el tipo de rol
interface Rol {
  nombre: string;
  id?: number;
  descripcion?: string;
}

export function Header() {
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const pathname = usePathname();

  // Función corregida para obtener el rol (sin errores de TypeScript)
  const getUserRole = () => {
    const firstRole = user?.roles?.[0] as Rol | string | undefined;
    if (!firstRole) return '';
    if (typeof firstRole === 'string') return firstRole;
    return firstRole.nombre || '';
  };

  const userRole = getUserRole();
  const userInitial = user?.nombres?.charAt(0) || 'U';

  const getPageName = () => {
    const path = pathname.split('/').filter(Boolean);
    if (path.length === 0) return 'Dashboard';
    return path[0].charAt(0).toUpperCase() + path[0].slice(1);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const fechaActual = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [searchOpen]);

  return (
    <header className="bg-[#0A1C2E] border-b border-[#1E3A5F] sticky top-0 z-30 shadow-lg">
      
      {/* Modal de búsqueda en móvil */}
      {searchOpen && (
        <div className="fixed inset-0 bg-[#0A1C2E] z-50 p-4 md:hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Buscar</h2>
            <button onClick={() => setSearchOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar prácticas, tesis..."
              className="w-full py-2.5 pl-9 pr-3 text-sm bg-white/5 border border-[#1E3A5F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-white placeholder:text-gray-500"
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-500 mt-3">Busca por título, estudiante, asesor...</p>
        </div>
      )}

      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          
          {/* Lado izquierdo - Breadcrumb y bienvenida */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1">
              <Link href="/dashboard" className="hover:text-[#3B82F6] transition-colors">
                Inicio
              </Link>
              <span>/</span>
              <span className="text-white font-medium">{getPageName()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#1E3A5F] flex items-center justify-center shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-[#3B82F6]" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 leading-tight">Bienvenido de vuelta</p>
                <p className="text-sm sm:text-base font-semibold text-white leading-tight -mt-0.5">
                  {user?.nombres} {user?.apellidos}
                </p>
              </div>
            </div>
          </div>

          {/* Buscador desktop */}
          <div className="hidden md:block flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar prácticas, tesis..."
                className="w-72 lg:w-80 py-2 pl-9 pr-3 text-sm bg-white/5 border border-[#1E3A5F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-white placeholder:text-gray-500 transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 bg-white/10 px-1 py-0.5 rounded hidden lg:block">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Botón de búsqueda móvil */}
          <button 
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Lado derecho - Acciones */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            
            {/* Fecha y hora */}
            <div className="hidden lg:flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-[#1E3A5F]">
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs text-gray-400 capitalize">{fechaActual}</span>
              <div className="w-px h-3 bg-[#1E3A5F]" />
              <Clock className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs text-gray-400 font-mono">{currentTime}</span>
            </div>

            <div className="h-6 w-px bg-[#1E3A5F] mx-1 hidden lg:block" />

            {/* Ayuda */}
            <button className="hidden sm:flex items-center gap-1 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <HelpCircle className="h-4 w-4" />
              <span className="text-xs">Ayuda</span>
            </button>

            {/* Notificaciones */}
            <button className="relative p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-[#3B82F6] ring-1 ring-[#0A1C2E]" />
            </button>

            {/* Perfil usuario */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/10 transition-colors">
                <div className="h-8 w-8 rounded-full bg-[#3B82F6] flex items-center justify-center shadow-sm">
                  <span className="text-xs font-medium text-white">{userInitial}</span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-white leading-tight">
                    {user?.nombres} {user?.apellidos?.charAt(0)}.
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight -mt-0.5 capitalize">
                    {userRole || 'Estudiante'}
                  </p>
                </div>
              </button>

              {/* Menú desplegable */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#0A1C2E] rounded-xl shadow-lg border border-[#1E3A5F] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="p-3 border-b border-[#1E3A5F]">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.nombres} {user?.apellidos}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                  <div className="mt-1">
                    <span className="inline-block text-[9px] px-2 py-0.5 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] capitalize">
                      {userRole || 'Estudiante'}
                    </span>
                  </div>
                </div>
                <div className="p-1">
                  <Link
                    href="/perfil"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <User className="h-3.5 w-3.5" />
                    Mi perfil
                  </Link>
                  <Link
                    href="/configuracion"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Configuración
                  </Link>
                  <div className="border-t border-[#1E3A5F] my-1" />
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra decorativa azul */}
      <div className="h-0.5 bg-gradient-to-r from-[#3B82F6] via-[#2563EB] to-transparent" />
    </header>
  );
}