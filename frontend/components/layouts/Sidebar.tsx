'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Building2,
  FileBarChart,
  LogOut,
  GraduationCap,
  Menu,
  HelpCircle,
  Send,
  BookOpen,
  ClipboardList,
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Interfaz para el tipo de rol
interface Rol {
  nombre: string;
  id?: number;
  descripcion?: string;
}

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'coordinador', 'asesor', 'estudiante', 'empresa'] },
  { href: '/practicas', label: 'Prácticas', icon: Briefcase, roles: ['admin', 'coordinador', 'asesor', 'estudiante', 'empresa'] },
  { href: '/practicas/mis-postulaciones', label: 'Mis postulaciones', icon: Send, roles: ['estudiante'] },
  // ✅ CORREGIDO: Para estudiantes va a /tesis
  { href: '/tesis', label: 'Tesis', icon: BookOpen, roles: ['estudiante'] },
  // ✅ Para admin, coordinador, asesor: Tesis general
  { href: '/tesis', label: 'Tesis', icon: FileText, roles: ['admin', 'coordinador', 'asesor'] },
  { href: '/seguimiento', label: 'Seguimiento', icon: ClipboardList, roles: ['asesor', 'admin'] },
  { href: '/estudiantes', label: 'Estudiantes', icon: Users, roles: ['admin', 'coordinador'] },
  { href: '/empresas', label: 'Empresas', icon: Building2, roles: ['admin', 'coordinador'] },
  { href: '/reportes', label: 'Reportes', icon: FileBarChart, roles: ['admin', 'coordinador'] },
  { href: '/postulaciones', label: 'Postulaciones', icon: ClipboardList, roles: ['admin', 'coordinador'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState('');

  // useEffect corregido para obtener el rol (sin errores de TypeScript)
  useEffect(() => {
    const firstRole = user?.roles?.[0] as Rol | string | undefined;
    if (firstRole) {
      if (typeof firstRole === 'string') {
        setUserRole(firstRole);
      } else {
        setUserRole(firstRole.nombre || '');
      }
    }
  }, [user]);

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(userRole));
  
  const isActive = (href: string) => {
    if (href === '/tesis/mi-tesis') {
      return pathname === '/tesis/mi-tesis' || pathname.startsWith('/tesis/mi-tesis');
    }
    if (href === '/practicas/mis-postulaciones') {
      return pathname === '/practicas/mis-postulaciones' || pathname.startsWith('/practicas/mis-postulaciones');
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-[72px]' : 'w-[280px]'
      } bg-[#0A1C2E] flex flex-col transition-all duration-300 ease-out relative shrink-0 h-screen`}
    >
      {/* Header con ícono hamburguesa y logo juntos */}
      <div className={`pt-6 pb-5 ${isCollapsed ? 'px-3' : 'px-4'} border-b border-white/10`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8A735]"
            aria-label="Menú"
          >
            <Menu className="h-5 w-5 text-white" strokeWidth={1.5} />
          </button>

          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-[#E8A735] rounded-lg flex items-center justify-center shadow-sm">
                <GraduationCap className="h-4 w-4 text-[#0A1C2E]" strokeWidth={1.8} />
              </div>
              <div className="leading-tight">
                <h1 className="text-sm font-semibold text-white tracking-tight">Sistema UNT</h1>
                <p className="text-[10px] text-white/40 -mt-0.5">prácticas y tesis</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-4 h-px bg-white/10" />

      <nav className="flex-1 px-3 pt-5 space-y-1">
        {!isCollapsed && (
          <div className="px-2 pb-3">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Navegación</p>
          </div>
        )}
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
                ${isCollapsed ? 'justify-center' : ''}
                ${
                  active
                    ? 'bg-[#E8A735]/10 text-white'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition-all ${
                  active ? 'text-[#E8A735]' : 'text-white/40 group-hover:text-white/80'
                }`}
                strokeWidth={1.5}
              />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              {active && !isCollapsed && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E8A735]" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pb-5 space-y-2">
        <button
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
            text-white/40 hover:text-white hover:bg-white/5
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'Ayuda' : undefined}
        >
          <HelpCircle className="h-5 w-5" strokeWidth={1.5} />
          {!isCollapsed && <span className="text-sm font-medium">Ayuda</span>}
        </button>

        <div className="mx-2 h-px bg-white/10" />

        <div className={`${isCollapsed ? 'text-center' : 'px-2'} py-3 rounded-xl bg-white/5`}>
          {!isCollapsed && (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">
                {user?.nombres} {user?.apellidos}
              </p>
              <p className="text-[11px] text-white/40 truncate">{user?.email}</p>
              <span className="inline-block text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#E8A735]/20 text-[#E8A735] mt-1">
                {userRole === 'estudiante' ? 'Estudiante' : 
                 userRole === 'asesor' ? 'Asesor' :
                 userRole === 'admin' ? 'Administrador' :
                 userRole === 'coordinador' ? 'Coordinador' :
                 userRole === 'empresa' ? 'Empresa' : userRole || 'Usuario'}
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center">
              <div className="h-10 w-10 rounded-full bg-[#E8A735] flex items-center justify-center shadow-md">
                <span className="text-[#0A1C2E] font-bold text-base">
                  {user?.nombres?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => logout()}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
            text-white/40 hover:text-red-400 hover:bg-red-500/10
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut className="h-5 w-5" strokeWidth={1.5} />
          {!isCollapsed && <span className="text-sm font-medium">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}