import { api } from './client';
import type { Paginated, Subject, Teacher } from '@/types';

export async function listTeachers(params: { q?: string; is_active?: boolean; subject?: Subject; page?: number } = {}) {
  const { data } = await api.get<Paginated<Teacher>>('/teachers', { params });
  return data;
}

export async function createTeacher(payload: { name: string; email: string; phone?: string | null; subject: Subject; password: string }) {
  const { data } = await api.post<Teacher>('/teachers', payload);
  return data;
}

export async function updateTeacher(id: number, payload: { name: string; email: string; phone?: string | null; subject?: Subject; is_active?: boolean }) {
  const { data } = await api.put<Teacher>(`/teachers/${id}`, payload);
  return data;
}

export async function deleteTeacher(id: number) {
  await api.delete(`/teachers/${id}`);
}

export async function exportTeachers() {
  const { data } = await api.get('/teachers/export', { responseType: 'blob' });
  return data as Blob;
}
