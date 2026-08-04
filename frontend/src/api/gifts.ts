import { api } from './client';
import type { Gift, GiftAward, GiftCriteriaType, GiftPeriod, Paginated } from '@/types';

export async function listGifts() {
  const { data } = await api.get<{ data: Gift[] }>('/gifts');
  return data.data;
}

export async function listWinners(page = 1) {
  const { data } = await api.get<Paginated<GiftAward>>('/gifts/winners', { params: { page } });
  return data;
}

export interface GiftPayload {
  name: string;
  description?: string;
  criteria_type: GiftCriteriaType;
  period: GiftPeriod;
  is_active?: boolean;
  image?: File | null;
}

function toFormData(payload: GiftPayload, method?: 'PUT') {
  const form = new FormData();
  form.append('name', payload.name);
  form.append('description', payload.description ?? '');
  form.append('criteria_type', payload.criteria_type);
  form.append('period', payload.period);
  form.append('is_active', payload.is_active === false ? '0' : '1');
  if (payload.image) form.append('image', payload.image);
  if (method) form.append('_method', method);
  return form;
}

export async function createGift(payload: GiftPayload) {
  const { data } = await api.post<{ data: Gift }>('/gifts', toFormData(payload));
  return data.data;
}

export async function updateGift(id: number, payload: GiftPayload) {
  const { data } = await api.post<{ data: Gift }>(`/gifts/${id}`, toFormData(payload, 'PUT'));
  return data.data;
}

export async function deleteGift(id: number) {
  await api.delete(`/gifts/${id}`);
}

export async function awardGift(giftId: number, userId: number) {
  const { data } = await api.post<{ data: GiftAward }>(`/gifts/${giftId}/award`, { user_id: userId });
  return data.data;
}
