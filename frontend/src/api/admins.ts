import { api } from './client';
import type { Paginated } from '@/types';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  is_active: boolean;
  is_self: boolean;
  created_at: string;
}

export async function listAdmins(params: { q?: string; page?: number } = {}) {
  const { data } = await api.get<Paginated<AdminUser>>('/admins', { params });
  return data;
}

export async function createAdmin(payload: { name: string; email: string; phone?: string | null; password: string }) {
  const { data } = await api.post<{ data: AdminUser }>('/admins', payload);
  return data.data;
}

export async function updateAdmin(id: number, payload: { name: string; email: string; phone?: string | null; is_active?: boolean }) {
  const { data } = await api.put<{ data: AdminUser }>(`/admins/${id}`, payload);
  return data.data;
}

export async function deleteAdmin(id: number) {
  await api.delete(`/admins/${id}`);
}
