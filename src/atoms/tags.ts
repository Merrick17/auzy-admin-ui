import { atom } from 'jotai';
import { Tag } from '@/hooks/useTags';

interface TagsState {
  items: Tag[];
  isLoading: boolean;
  error: Error | null;
}

export const tagsAtom = atom<TagsState>({
  items: [],
  isLoading: false,
  error: null,
}); 