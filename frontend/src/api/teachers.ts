import { api } from './client';
import type { Paginated, Teacher } from '@/types';

export async function listTeachers(params: { q?: string; is_active?: boolean; page?: number } = {}) {
  const { data } = await api.get<Paginated<Teacher>>('/teachers', { params });
  return data;
}

export async function createTeacher(payload: { name: string; email: string; password: string }) {
  const { data } = await api.post<Teacher>('/teachers', payload);
  return data;
}

export async function updateTeacher(id: number, payload: { name: string; email: string; is_active?: boolean }) {
  const { data } = await api.put<Teacher>(`/teachers/${id}`, payload);
  return data;
}

export async function deleteTeacher(id: number) {
  await api.delete(`/teachers/${id}`);
}
