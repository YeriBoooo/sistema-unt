import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  roles: string[];
  estudiante?: any;
  asesor?: any;
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || `Error ${response.status}`);
  }

  return data;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const response = await apiFetch<any>('/auth/me');
        // El usuario está en response.data
        return response?.data || null;
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiFetch<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      console.log('🔍 Respuesta login:', response);
      // ✅ CORREGIDO: el usuario está en response.data.user
      return response?.data?.user || response?.data;
    },
    onSuccess: (userData) => {
      console.log('✅ userData recibido:', userData);
      if (userData) {
        queryClient.setQueryData(['me'], userData);
        router.push('/dashboard');
      }
    },
    onError: (error: Error) => {
      console.error('❌ Login error:', error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiFetch('/auth/logout', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
      router.push('/login');
    },
  });

  return {
    user,
    isLoading: isUserLoading,
    isLoginLoading: loginMutation.isPending,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isAuthenticated: !!user,
  };
}