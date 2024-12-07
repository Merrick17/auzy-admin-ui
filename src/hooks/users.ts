import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { User, ApiResponse } from '@/types';

export const useUsers = () => {
  return useQuery<ApiResponse<User[]>>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users');
      return data;
    }
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const { data: responseData } = await apiClient.post('/users', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: FormData }>({
    mutationFn: async ({ id, data }) => {
      const { data: responseData } = await apiClient.patch(`/users/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};