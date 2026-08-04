import { api } from './client';
import type { AppNotification } from '@/types';

export async function fetchNotifications() {
  const { data } = await api.get<{ data: AppNotification[]; unread_count: number }>('/notifications');
  return data;
}

export async function markNotificationRead(id: string) {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await api.post('/notifications/read-all');
}
