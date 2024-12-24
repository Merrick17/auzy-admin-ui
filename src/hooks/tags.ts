import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { ApiResponse } from '@/types';

interface Tag {
  id: string;
  name: string;
  type: 'specialty' | 'language' | 'service' | 'general';
  description?: string;
  isActive: boolean;
}

interface CreateTagDto {
  name: string;
  type: Tag['type'];
  description?: string;
  isActive?: boolean;
}

interface UpdateTagDto extends Partial<CreateTagDto> {}

export const useTags = (type: string) => {
  return useQuery({
    queryKey: ['tags', type],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tags?type=${type}`);
      return data.data || [];
    }
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagData: CreateTagDto) => {
      const { data } = await apiClient.post<ApiResponse<Tag>>('/tags', tagData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...tagData }: UpdateTagDto & { id: string }) => {
      const { data } = await apiClient.put<ApiResponse<Tag>>(`/tags/${id}`, tagData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}; 