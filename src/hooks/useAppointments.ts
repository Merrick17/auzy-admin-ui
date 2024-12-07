import { useAtom } from 'jotai';
import { appointmentsAtom, selectedAppointmentAtom } from '../atoms/appointments';
import axios from 'axios';

export const useAppointments = () => {
  const [appointments, setAppointments] = useAtom(appointmentsAtom);
  const [selectedAppointment, setSelectedAppointment] = useAtom(selectedAppointmentAtom);

  const fetchMyAppointments = async () => {
    const response = await axios.get('/appointments');
    setAppointments(response.data);
  };

  const createAppointment = async (appointmentData: any) => {
    const response = await axios.post('/appointments', appointmentData);
    setAppointments([...appointments, response.data]);
    return response.data;
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    const response = await axios.patch(`/appointments/${id}/status`, { status });
    setAppointments(appointments.map(apt => apt.id === id ? response.data : apt));
    return response.data;
  };

  return {
    appointments,
    selectedAppointment,
    fetchMyAppointments,
    createAppointment,
    updateAppointmentStatus,
    setSelectedAppointment,
  };
}; 