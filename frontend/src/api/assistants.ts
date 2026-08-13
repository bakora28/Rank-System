import { api } from './client';
import type { Assistant, Paginated, Permission } from '@/types';

export async function listAssistants(params: { q?: string; page?: number } = {}) {
  const { data } = await api.get<Paginated<Assistant>>('/assistants', { params });
  return data;
}

export async function createAssistant(payload: {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
  permissions: Permission[];
}) {
  const { data } = await api.post<{ data: Assistant }>('/assistants', payload);
  return data.data;
}

export async function updateAssistant(id: number, payload: { name: string; email: string; phone?: string | null; is_active?: boolean }) {
  const { data } = await api.put<{ data: Assistant }>(`/assistants/${id}`, payload);
  return data.data;
}

export async function updateAssistantPermissions(id: number, permissions: Permission[]) {
  const { data } = await api.put<{ data: Assistant }>(`/assistants/${id}/permissions`, { permissions });
  return data.data;
}

export async function deleteAssistant(id: number) {
  await api.delete(`/assistants/${id}`);
}
