import { atom } from 'jotai';
import { Notification } from '../types/api';

export const notificationsAtom = atom<Notification[]>([]);
export const unreadNotificationsCountAtom = atom(
  (get) => get(notificationsAtom).filter((n) => !n.read).length
); 