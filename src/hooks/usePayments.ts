import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  paymentMethod: string;
  customerName: string;
}

export const usePayments = () => {
  return useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data } = await apiClient.get('/payments/all');
      console.log("Data",data)
      return data; // Assuming the API returns an array of payments
    },
  });
}; 