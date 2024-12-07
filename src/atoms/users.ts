import { atom } from 'jotai';
import { User } from '../types/api';

export const usersAtom = atom<User[]>([]);
export const selectedUserAtom = atom<User | null>(null);
export const doctorsAtom = atom<User[]>([]); 