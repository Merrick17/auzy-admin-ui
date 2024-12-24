import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface Tag {
  _id: string;
  name: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TagsResponse {
  success: boolean;
  data: {
    items: Tag[];
    meta: {
      totalItems: number;
      itemsPerPage: string;
      totalPages: number;
      currentPage: string;
    };
  };
  message: string;
}

export const useTags = (page = 1, limit = 10) => {
  return useQuery<TagsResponse>({
    queryKey: ['tags', page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tags?page=${page}&limit=${limit}`);
      return data;
    },
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagData: { name: string }) => {
      const { data } = await apiClient.post('/tags', tagData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...tagData }: Partial<Tag> & { id: string }) => {
      const { data } = await apiClient.put(`/tags/${id}`, tagData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/tags/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useTagsByType = (type: string) => {
  return useQuery({
    queryKey: ['tags', 'type', type],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tags?type=${type}`);
      return data.data.items || [];
    },
  });
}; 