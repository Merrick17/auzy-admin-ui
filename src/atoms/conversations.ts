import { atom } from 'jotai';
import { Conversation, Message } from '../types/api';

export const conversationsAtom = atom<Conversation[]>([]);
export const selectedConversationAtom = atom<Conversation | null>(null);
export const messagesAtom = atom<Message[]>([]); 