import { User } from '@/types';
import { atom } from 'jotai';

// Auth atoms
export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom<boolean>(false);

// Users atoms
export const usersAtom = atom<User[]>([]);
export const selectedUserAtom = atom<User | null>(null);
export const doctorsAtom = atom<User[]>([]);
