import { atom } from 'jotai';
import { User } from '../types/api';

export const currentUserAtom = atom<User | null>(null);
export const authTokenAtom = atom<string | null>(null);
export const isLoadingAuthAtom = atom<boolean>(true); 