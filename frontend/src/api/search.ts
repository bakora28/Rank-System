import { api } from './client';
import type { SearchResults } from '@/types';

export async function globalSearch(q: string) {
  const { data } = await api.get<SearchResults>('/search', { params: { q } });
  return data;
}
