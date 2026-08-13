import { api } from './client';
import type { FullRanksResponse, RanksResponse, Subject } from '@/types';

export type Period = 'day' | 'month' | 'year' | 'all';

export async function fetchTop10(period: Period) {
  const { data } = await api.get<RanksResponse>('/ranks', { params: { period, scope: 'top10' } });
  return data;
}

export async function fetchFullRanks(period: Period, q = '', page = 1, subject?: Subject) {
  const { data } = await api.get<FullRanksResponse>('/ranks', {
    params: { period, scope: 'full', q: q || undefined, page, subject },
  });
  return data;
}

export interface ActivityPoint {
  date: string;
  label: string;
  count: number;
}

export async function fetchActivity(days = 7) {
  const { data } = await api.get<{ data: ActivityPoint[] }>('/ranks/activity', { params: { days } });
  return data.data;
}
