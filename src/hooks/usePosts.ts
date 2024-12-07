import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Post, CreatePostDto } from '@/types';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export const usePosts = () => {
    return useQuery<Post[]>({
        queryKey: ['posts'],
        queryFn: async () => {
            const { data } = await apiClient.get('/posts');
            if (!data.success) {
                throw new Error(data.message);
            }
            return data.data;
        },
    });
};

export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });
            
            if (!response.ok) {
                throw new Error('Failed to create post');
            }
            
            return response.json();
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

export const useUpdatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            const { data } = await apiClient.patch(`/posts/${id}`, formData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });
}; 