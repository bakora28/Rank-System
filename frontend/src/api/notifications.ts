import { api } from './client';
import type { AppNotification, Subject } from '@/types';

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

export async function broadcastNotification(payload: { message: string; subject?: Subject | null }) {
  const { data } = await api.post<{ sent_to: number }>('/notifications/broadcast', payload);
  return data;
}
