import { api, ensureCsrfCookie } from './client';
import type { User } from '@/types';

export async function login(email: string, password: string, remember = false) {
  await ensureCsrfCookie();
  const { data } = await api.post<{ data: User }>('/login', { email, password, remember });
  return data.data;
}

export async function register(name: string, email: string, phone: string, password: string, password_confirmation: string) {
  await ensureCsrfCookie();
  const { data } = await api.post<{ data: User }>('/register', { name, email, phone, password, password_confirmation });
  return data.data;
}

export async function logout() {
  await api.post('/logout');
}

export async function fetchMe() {
  const { data } = await api.get<{ data: User }>('/me');
  return data.data;
}
