'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '../layouts/Sidebar';
import { Header } from '../layouts/Header';

const publicRoutes = ['/login', '/register'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 AuthGuard - isLoading:', isLoading);
    console.log('🔍 AuthGuard - user:', user);
    console.log('🔍 AuthGuard - pathname:', pathname);
    
    if (!isLoading && !user && !publicRoutes.includes(pathname)) {
      console.log('🔍 Redirigiendo a login...');
      router.push('/login');
    }
    if (!isLoading && user && publicRoutes.includes(pathname)) {
      console.log('🔍 Redirigiendo a dashboard...');
      router.push('/dashboard');
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Si está en ruta pública, solo mostrar children sin sidebar
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Si está autenticado, mostrar con sidebar y header
  if (user) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Fallback: solo children (no debería llegar aquí)
  return <>{children}</>;
}