import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { CreatePostDto, Post } from '@/types';

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: CreatePostDto) => {
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('description', postData.description);
      formData.append('content', postData.content);
      
      if (postData.image) {
        formData.append('image', postData.image);
      }
      
      if (postData.additionalImages) {
        postData.additionalImages.forEach((image) => {
          formData.append('additionalImages', image);
        });
      }
      
      if (postData.tags) {
        postData.tags.forEach((tag) => {
          formData.append('tags', tag);
        });
      }

      const { data } = await apiClient.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const usePosts = () => {
  return useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/posts');
      return data.data;
    },
  });
};

export const usePost = (id: string) => {
  return useQuery<Post>({
    queryKey: ['posts', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/posts/${id}`);
      return data.data;
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const { data } = await apiClient.patch(`/posts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/posts/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}; 