import { api } from './client';
import type { Paginated, PurchaseRequestItem, PurchaseStatus } from '@/types';

export interface RequestFilters {
  status?: PurchaseStatus | '';
  teacher_id?: number;
  category_id?: number;
  q?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export async function listPurchaseRequests(filters: RequestFilters = {}) {
  const { data } = await api.get<Paginated<PurchaseRequestItem>>('/purchase-requests', { params: filters });
  return data;
}

export async function markBookBought(bookId: number) {
  const { data } = await api.post<{ data: PurchaseRequestItem }>('/purchase-requests', { book_id: bookId });
  return data.data;
}

export async function reviewPurchaseRequest(id: number, status: 'approved' | 'rejected', note?: string) {
  const { data } = await api.patch<{ data: PurchaseRequestItem }>(`/purchase-requests/${id}`, { status, note });
  return data.data;
}
