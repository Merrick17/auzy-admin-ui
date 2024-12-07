import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  appointmentsByStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  recentAppointments: Array<{
    id: string;
    patientId: {
      firstName: string;
      lastName: string;
      profilePicture: string;
    };
    doctorId: {
      firstName: string;
      lastName: string;
    };
    appointmentDate: string;
    status: string;
  }>;
  topDoctors: Array<{
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
    specialities: string[];
    rating: number;
    reviewsCount: number;
  }>;
}

export const useAppStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users/statistics/dashboard');
      console.log("App STat",data); 
      return data.data;
    }
  });
};

interface DoctorStats {
  totalAppointments: number;
  appointmentsByStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  appointmentsTrend: Array<{
    date: string;
    count: number;
  }>;
  averageRating: number;
  totalPatients: number;
}

export const useDoctorStats = (doctorId: string) => {
  return useQuery<DoctorStats>({
    queryKey: ['doctor-stats', doctorId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/users/statistics/doctor/${doctorId}`);
      return data;
    },
    enabled: !!doctorId
  });
};
