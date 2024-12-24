"use client"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { userAtom, isAuthenticatedAtom } from '@/store/atoms';
import apiClient from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { AuthResponse, RegisterDto, LoginDto, ApiResponse } from '@/types';
import axios from 'axios';
export const useLogin = () => {
  const setUser = useSetAtom(userAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginDto) => {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
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

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
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