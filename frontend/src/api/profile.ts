import { api } from './client';
import type { User } from '@/types';

export async function updateProfile(payload: { name: string; email: string; phone: string | null }) {
  const { data } = await api.put<{ data: User }>('/profile', payload);
  return data.data;
}

export async function updatePassword(payload: { current_password: string; password: string; password_confirmation: string }) {
  await api.put('/profile/password', payload);
}

export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append('avatar', file);
  const { data } = await api.post<{ data: User }>('/profile/avatar', form);
  return data.data;
}
