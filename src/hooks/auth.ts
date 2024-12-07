"use client"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { userAtom, isAuthenticatedAtom } from '@/store/atoms';
import apiClient from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { AuthResponse, RegisterDto } from '@/types';

export const useLogin = () => {
  const setUser = useSetAtom(userAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return data.data;
    },
    onSuccess: ({ token, user }) => {
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      queryClient.invalidateQueries();
      router.push('/dashboard');
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (userData: RegisterDto) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', userData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      router.push('/login');
    },
  });
};

export const useLogout = () => {
  const setUser = useSetAtom(userAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
  const queryClient = useQueryClient();
  const router = useRouter();

  return () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    queryClient.clear();
    router.push('/');
  };
}; 