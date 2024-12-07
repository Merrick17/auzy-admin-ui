import { atom } from 'jotai';
import { Appointment } from '../types/api';

export const appointmentsAtom = atom<Appointment[]>([]);
export const selectedAppointmentAtom = atom<Appointment | null>(null); 