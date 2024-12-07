import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { User } from '@/types';

export const useDoctors = (speciality?: string) => {
  return useQuery<User[]>({
    queryKey: ['doctors', speciality],
    queryFn: async () => {
      const { data } = await apiClient.get('/users/doctors', {
        params: { speciality },
      });
      return data.data;
    },
  });
};

export const useDoctor = (id: string) => {
  return useQuery<User>({
    queryKey: ['doctors', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/users/doctors/${id}`);
      return data.data;
    },
  });
};

export const useUpdateDoctorRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rating }: { id: string; rating: number }) => {
      const { data } = await apiClient.put(`/users/doctors/${id}/rating`, { rating });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctors', variables.id] });
    },
  });
}; 