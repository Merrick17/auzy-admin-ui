import apiClient from '@/lib/api-client';
import { Appointment, CreateAppointmentDto } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useAppointments = () => {
  return useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data } = await apiClient.get('/appointments');
      return data.data;
    },
  });
};

export const useMyAppointments = () => {
  return useQuery<Appointment[]>({
    queryKey: ['my-appointments'],
    queryFn: async () => {
      const { data } = await apiClient.get('/appointments/my-appointments');
      return data.data;
    },
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation<Appointment, Error, CreateAppointmentDto>({
    mutationFn: async (appointmentData) => {
      const { data } = await apiClient.post('/appointments', appointmentData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
    },
  });
};

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Appointment, Error, { id: string; status: string }>({
    mutationFn: async ({ id, status }) => {
      const { data } = await apiClient.put(`/appointments/${id}/status`, { status });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
    },
  });
};