import { api } from './client';
import type { Subject, WhatsappAccount } from '@/types';

export async function listWhatsappAccounts() {
  const { data } = await api.get<{ data: WhatsappAccount[] }>('/whatsapp/accounts');
  return data.data;
}

export async function createWhatsappAccount(payload: { label: string; api_url: string; instance_id: string; access_token: string }) {
  const { data } = await api.post<{ data: WhatsappAccount; qrcode: Record<string, unknown> | null }>('/whatsapp/accounts', payload);
  return data;
}

export async function fetchWhatsappQrCode(id: number) {
  const { data } = await api.get<{ qrcode: Record<string, unknown> | null }>(`/whatsapp/accounts/${id}/qrcode`);
  return data.qrcode;
}

export async function updateWhatsappAccount(
  id: number,
  payload: { label?: string; api_url?: string; instance_id?: string; access_token?: string; is_active?: boolean }
) {
  const { data } = await api.put<{ data: WhatsappAccount }>(`/whatsapp/accounts/${id}`, payload);
  return data.data;
}

export async function deleteWhatsappAccount(id: number) {
  await api.delete(`/whatsapp/accounts/${id}`);
}

export type WhatsappAudience = 'all' | 'subject' | 'manual';

export interface WhatsappSendPayload {
  account_id: number;
  message: string;
  audience: WhatsappAudience;
  subject?: Subject;
  teacher_ids?: number[];
}

export interface WhatsappSendResult {
  sent: number;
  failed: number;
  skipped_no_phone: number;
  failed_names: string[];
}

export async function sendWhatsappBroadcast(payload: WhatsappSendPayload) {
  const { data } = await api.post<WhatsappSendResult>('/whatsapp/send', payload);
  return data;
}
